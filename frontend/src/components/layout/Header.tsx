import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Bell,
  Moon,
  Sun,
  User,
  Settings,
  LogOut,
  HelpCircle,
  MessageSquare,
  Menu,
  Clock,
  Coffee,
  Play
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { toast } from 'sonner';
import { employeeService } from '@/services/employeeService';
import { notificationService, type Notification } from '@/services/notificationService';

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isShiftComplete, setIsShiftComplete] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  const isStaff = ['employee', 'therapist', 'manager', 'receptionist', 'admin', 'super_admin'].includes(user?.role || '');

  const [isOnBreak, setIsOnBreak] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [lastBreakStart, setLastBreakStart] = useState<string | null>(null);
  const [accumulatedBreakMinutes, setAccumulatedBreakMinutes] = useState(0);
  const [displayTime, setDisplayTime] = useState("00:00:00");

  const getCoords = (): Promise<{ latitude: number, longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    });
  };

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAttendance = async () => {
    if (isOnBreak) {
      toast.error('Please end your break before checking out!');
      return;
    }
    try {
      if (isCheckedIn) {
        let coords;
        try {
          coords = await getCoords();
        } catch (e) {
          console.warn('Geolocation failed:', e);
          toast.info('Location access unavailable. Attempting check-out anyway...');
        }
        await employeeService.checkOut(coords);
        setIsCheckedIn(false);
        setIsShiftComplete(true);
        setCheckInTime(null);
        toast.success('Checked out successfully!');
      } else {
        let coords;
        try {
          coords = await getCoords();
        } catch (e: any) {
          console.warn('Geolocation failed:', e);
          if (e.code === 1) {
            toast.error('Location permission denied. Please allow GPS to check in.');
          } else {
            toast.error('Could not get your location. Please check your GPS settings.');
          }
          // We don't call checkIn if geolocation is required and failed
          // Unless geofenceBypass is handled server-side
        }

        const res = await employeeService.checkIn(coords);
        setIsCheckedIn(true);
        setCheckInTime(res.checkInTime);
        toast.success('Checked in successfully!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Attendance operation failed');
    }
  };

  const handleBreak = async () => {
    try {
      const res = await employeeService.toggleBreak();
      setIsOnBreak(!isOnBreak);
      setLastBreakStart(res.lastBreakStart || null);
      setAccumulatedBreakMinutes(res.breakMinutes || 0);
      toast.success(isOnBreak ? 'Break ended!' : 'Break started!');
    } catch (error) {
      toast.error('Failed to toggle break');
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await notificationService.getNotifications();
        setNotifications(data);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };

    fetchNotifications();

    if (socket) {
      socket.on('new_notification', (notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
        toast.info(notification.title, {
          description: notification.message
        });
      });

      return () => {
        socket.off('new_notification');
      };
    }
  }, [socket]);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('Failed to mark all as read', err);
      toast.error('Failed to mark notifications as read');
    }
  };

  const handleMarkOneRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  useEffect(() => {
    const fetchStatus = async () => {
      if (isStaff) {
        try {
          const status = await employeeService.getTodayStatus();
          if (status) {
            setIsCheckedIn(!!status.checkInTime && !status.checkOutTime);
            setIsShiftComplete(!!status.checkOutTime);
            setIsOnBreak(!!status.lastBreakStart);
            setCheckInTime(status.checkInTime);
            setLastBreakStart(status.lastBreakStart || null);
            setAccumulatedBreakMinutes(status.breakMinutes || 0);
          }
        } catch (error) {
          console.error("Failed to fetch today's status", error);
        }
      }
    };
    fetchStatus();
  }, [isStaff]);

  useEffect(() => {
    let interval: any;
    if (isCheckedIn && checkInTime) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        if (isOnBreak && lastBreakStart) {
          const breakStart = new Date(lastBreakStart).getTime();
          setDisplayTime(formatDuration(now - breakStart));
        } else {
          const startTime = new Date(checkInTime).getTime();
          // Shift time is (current time - start time) - already taken breaks
          const elapsed = now - startTime - (accumulatedBreakMinutes * 60000);
          setDisplayTime(formatDuration(Math.max(0, elapsed)));
        }
      }, 1000);
    } else {
      setDisplayTime("00:00:00");
    }
    return () => clearInterval(interval);
  }, [isCheckedIn, isOnBreak, checkInTime, lastBreakStart, accumulatedBreakMinutes]);

  return (
    <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-indigo-100 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4 md:hidden mr-4">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="rounded-xl">
          <Menu className="w-6 h-6 text-gray-600" />
        </Button>
      </div>
      {/* Search */}
      {/* Attendance & Breaks - Replaces Search Bar */}
      <div className="flex-1 flex items-center justify-center md:justify-start px-2 md:px-6">
        {isStaff && (
          <div className="flex items-center gap-2 md:gap-4 bg-gray-50/50 p-1.5 rounded-xl border border-gray-100/50 backdrop-blur-sm">
            {/* Clock In/Out */}
            <Button
              variant={isShiftComplete ? "ghost" : (isCheckedIn ? "outline" : "default")}
              size="sm"
              onClick={handleAttendance}
              disabled={isShiftComplete}
              className={cn(
                "rounded-lg font-bold transition-all shadow-sm h-9 md:h-10 text-xs md:text-sm whitespace-nowrap px-3 md:px-4",
                isShiftComplete
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : isCheckedIn
                    ? "border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                    : "bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-white hover:opacity-90 active:scale-95 hover:shadow-md"
              )}
            >
              <Clock className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">
                {isShiftComplete ? 'Shift Completed' : (isCheckedIn ? 'Check Out' : 'Check In')}
              </span>
            </Button>

            {/* Break Controls - Only visible when checked in */}
            {isCheckedIn && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="h-6 w-px bg-gray-200 hidden xs:block" />
                <Button
                  variant={isOnBreak ? "default" : "secondary"}
                  size="sm"
                  onClick={handleBreak}
                  className={cn(
                    "rounded-lg font-medium transition-all shadow-sm h-9 md:h-10 text-xs md:text-sm whitespace-nowrap px-3 md:px-4",
                    isOnBreak
                      ? "bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  {isOnBreak ? (
                    <>
                      <Play className="w-4 h-4 md:mr-2 fill-current" />
                      <span className="hidden md:inline">Resume Work</span>
                    </>
                  ) : (
                    <>
                      <Coffee className="w-4 h-4 md:mr-2" />
                      <span className="hidden md:inline">Take Break</span>
                    </>
                  )}
                </Button>

                {/* Status Indicator */}
                <div className="hidden lg:flex flex-col px-2">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                    {isOnBreak ? 'On Break' : 'Shift Time'}
                  </span>
                  <span className={cn(
                    "text-xs font-bold tabular-nums",
                    isOnBreak ? "text-amber-600" : "text-green-600"
                  )}>
                    {displayTime}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 md:gap-3">

        {/* Quick Actions */}
        {(user?.role === 'super_admin' || user?.role === 'manager' || user?.role === 'receptionist') && (
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-xl hover:bg-indigo-50 hover:text-indigo-600"
            asChild
          >
            <Link to="/admin/bookings/new">
              <span className="sr-only">New Booking</span>
              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center">
                <span className="text-white text-lg leading-none">+</span>
              </div>
            </Link>
          </Button>
        )}

        {/* Dark Mode Toggle - Hidden when checked in */}
        {!isCheckedIn && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-xl hover:bg-indigo-50 hover:text-indigo-600"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>
        )}

        {/* Notifications */}
        <DropdownMenu open={showNotifications} onOpenChange={(open) => {
          setShowNotifications(open);
        }}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-xl hover:bg-indigo-50 hover:text-indigo-600"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-[#4f46e5] to-[#8b5cf6] rounded-full flex items-center justify-center text-xs text-white font-medium animate-pulse">
                  {unreadNotifications}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-96 p-0">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-indigo-600 hover:text-indigo-700"
                onClick={handleMarkAllRead}
              >
                Mark all read
              </Button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleMarkOneRead(notification.id)}
                  className={cn(
                    'p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors',
                    !notification.isRead && 'bg-indigo-50/50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                      notification.type === 'booking' && 'bg-blue-500',
                      notification.type === 'payment' && 'bg-green-500',
                      notification.type === 'system' && 'bg-purple-500',
                      notification.type === 'reminder' && 'bg-orange-500'
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-800">{notification.title}</p>
                      <p className="text-sm text-gray-500 truncate">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                    )}
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>No new notifications</p>
                </div>
              )}
            </div>
            <div className="p-3 border-t border-gray-100 text-center">
              <Link to="/admin/notifications/all" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                View all notifications
              </Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Messages */}
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-xl hover:bg-indigo-50 hover:text-indigo-600"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
            3
          </span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-indigo-50">
              <img
                src={user?.avatar || 'https://ui-avatars.com/api/?name=User&background=4f46e5&color=fff'}
                alt={user?.firstName}
                className="w-9 h-9 rounded-full border-2 border-indigo-200"
              />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-800">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-indigo-600 font-medium">
                  {(user as any)?.membership?.plan?.name || user?.role}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/admin/settings" className="cursor-pointer">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin/settings" className="cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin/help" className="cursor-pointer">
                <HelpCircle className="w-4 h-4 mr-2" />
                Help & Support
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                if (window.confirm('Are you sure you want to logout?')) {
                  logout();
                  toast.success('Logged out successfully. Have a great day!');
                }
              }}
              className="cursor-pointer text-red-500 focus:text-red-500"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
