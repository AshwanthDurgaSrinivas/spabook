import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Calendar, Users, DollarSign, Star, TrendingUp, TrendingDown,
  Clock, CheckCircle, XCircle, Activity, Plus, Loader2
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { analyticsService } from '@/services/analyticsService';
import { bookingService, type Booking } from '@/services/bookingService';
import { employeeService, type AttendanceRecord } from '@/services/employeeService';
import { notificationService, type Notification } from '@/services/notificationService';
import type { DashboardStats, RevenueData, ServicePerformance, EmployeePerformance } from '@/types';
import { Bell } from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<RevenueData[]>([]);
  const [services, setServices] = useState<ServicePerformance[]>([]);
  const [employees, setEmployees] = useState<EmployeePerformance[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [attendanceToday, setAttendanceToday] = useState<AttendanceRecord[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendanceStats, setAttendanceStats] = useState({ present: 0, absent: 0, leaves: 0, requiredHours: 9 });

  const isAdmin = ['admin', 'manager', 'receptionist', 'super_admin'].includes(user?.role || '');
  const isStaff = ['therapist', 'employee'].includes(user?.role || '');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await notificationService.getNotifications();
        setNotifications(data.slice(0, 5));
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };
    fetchNotifications();

    if (socket) {
      socket.on('new_notification', (notification: Notification) => {
        setNotifications(prev => [notification, ...prev.slice(0, 4)]);
      });
      return () => {
        socket.off('new_notification');
      };
    }
  }, [socket]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      if (isAdmin) {
        const today = new Date().toISOString().split('T')[0];
        const [dashData, serviceData, empData, bookingsData, attendanceData] = await Promise.all([
          analyticsService.getDashboardStats(),
          analyticsService.getServicePerformance(),
          analyticsService.getEmployeePerformance(),
          bookingService.getBookings(),
          employeeService.getAttendance(today)
        ]);
        setStats(dashData.stats);
        setRevenueTrend(dashData.revenueData);
        setServices(serviceData);
        setEmployees(empData);
        setRecentBookings(bookingsData.slice(0, 5));
        setAttendanceToday(attendanceData);
      } else {
        const [bookingsData, attendanceData] = await Promise.all([
          bookingService.getBookings(),
          employeeService.getMyAttendance()
        ]);
        setRecentBookings(bookingsData.slice(0, 5));
        setAttendanceStats((attendanceData as any).stats);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (recentBookings.length > 0) {
      const ongoing = recentBookings.find(b => b.status === 'confirmed' || b.status === 'in_progress');
      if (ongoing) setActiveBooking(ongoing);
    }
  }, [recentBookings]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!activeBooking) return;
    try {
      await bookingService.updateStatus(activeBooking.id, newStatus);
      setActiveBooking(prev => prev ? { ...prev, status: newStatus as any } : null);
      toast.success(`Appointment status updated to ${newStatus.replace('_', ' ').toUpperCase()}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading && !stats && recentBookings.length === 0) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-coral-500" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${(stats?.totalRevenue || 0).toLocaleString()}`,
      change: stats?.revenueChange || 0,
      icon: DollarSign,
      color: 'indigo',
      bgColor: 'bg-indigo-50',
      visible: isAdmin,
    },
    {
      title: 'Total Bookings',
      value: (stats?.totalBookings || recentBookings.length).toString(),
      change: stats?.bookingsChange || 0,
      icon: Calendar,
      color: 'blue',
      bgColor: 'bg-blue-50',
      visible: true,
    },
    {
      title: 'New Customers',
      value: (stats?.newCustomers || 0).toString(),
      change: stats?.customersChange || 0,
      icon: Users,
      color: 'green',
      bgColor: 'bg-green-50',
      visible: isAdmin,
    },
    {
      title: 'Staff On Duty',
      value: (attendanceToday.filter(a => a.status === 'present' || a.status === 'late').length).toString(),
      change: 0,
      icon: Clock,
      color: 'purple',
      bgColor: 'bg-purple-50',
      visible: isAdmin,
    },
    {
      title: 'Average Rating',
      value: (stats?.averageRating || 4.8).toString(),
      change: stats?.ratingChange || 0,
      icon: Star,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      visible: true,
    },
    {
      title: 'Present Days',
      value: attendanceStats.present.toString(),
      change: 0,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      visible: isStaff,
    },
    {
      title: 'Leave Days',
      value: attendanceStats.leaves.toString(),
      change: 0,
      icon: Calendar,
      color: 'blue',
      bgColor: 'bg-blue-50',
      visible: isStaff,
    },
    {
      title: 'Target Hours',
      value: `${attendanceStats.requiredHours}h`,
      change: 0,
      icon: Clock,
      color: 'indigo',
      bgColor: 'bg-indigo-50',
      visible: isStaff,
    },
  ].filter(c => c.visible);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.firstName}! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-coral-200 hover:bg-coral-50" onClick={fetchData}>
            <Loader2 className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button className="gradient-coral hover:opacity-90 text-white rounded-xl" asChild>
            <Link to="/admin/bookings">
              <Plus className="w-4 h-4 mr-2" />
              New Booking
            </Link>
          </Button>
        </div>
      </div>

      {/* Current Appointment for Therapist/Staff */}
      {isStaff && activeBooking && (
        <Card className="border-0 shadow-soft bg-gradient-to-br from-white to-coral-50/30 overflow-hidden relative">
          <CardHeader className="border-b border-gray-100/50 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-coral-500 animate-pulse" />
                Current Working Appointment
              </CardTitle>
              <Badge className={cn(
                "px-3 py-1 text-sm font-medium",
                activeBooking.status === 'in_progress' ? 'bg-blue-100 text-blue-700 animate-pulse' : 'bg-coral-100 text-coral-700'
              )}>
                {activeBooking.status.toUpperCase().replace('_', ' ')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-8 lg:items-center justify-between">
              <div className="flex items-start md:items-center gap-6">
                <Avatar className="w-20 h-20 border-4 border-white shadow-md">
                  <AvatarImage src={activeBooking.customer?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeBooking.customer?.firstName}`} />
                  <AvatarFallback className="bg-coral-100 text-coral-600 text-xl font-bold">
                    {activeBooking.customer?.firstName?.[0] || 'C'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {activeBooking.customer?.firstName} {activeBooking.customer?.lastName}
                  </h3>
                  <p className="text-lg text-coral-600 font-medium">{activeBooking.service?.name}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                      <Clock className="w-4 h-4 text-blue-500" />
                      {activeBooking.startTime}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                {activeBooking.status === 'confirmed' && (
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleStatusUpdate('in_progress')}>
                    Start Session
                  </Button>
                )}
                {activeBooking.status === 'in_progress' && (
                  <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleStatusUpdate('completed')}>
                    Complete Session
                  </Button>
                )}
                <Button variant="outline" className="text-red-600 border-red-100 hover:bg-red-50" onClick={() => handleStatusUpdate('cancelled')}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="hover-lift border-0 shadow-soft overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.change >= 0 ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
                    <span className={cn('text-sm font-medium', stat.change >= 0 ? 'text-green-500' : 'text-red-500')}>
                      {stat.change >= 0 ? '+' : ''}{stat.change}%
                    </span>
                  </div>
                </div>
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', stat.bgColor)}>
                  <stat.icon className={cn('w-6 h-6', `text-${stat.color}-500`)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Charts Section */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Trend - Spans 2 columns */}
          <Card className="lg:col-span-2 border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueTrend}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F08080" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#F08080" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickFormatter={d => new Date(d).toLocaleDateString()} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="#F08080" fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Today's Appointments - Spans 1 column */}
          <Card className="border-0 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Today's Appointments</CardTitle>
              <Link to="/admin/bookings" className="text-xs text-indigo-600 hover:underline">View All</Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentBookings.map(booking => (
                  <div key={booking.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{booking.customer?.firstName} {booking.customer?.lastName}</p>
                      <p className="text-xs text-gray-500">{booking.startTime} - {booking.service?.name}</p>
                    </div>
                    <Badge variant="secondary" className={cn(
                      booking.status === 'confirmed' && 'bg-blue-100 text-blue-600',
                      booking.status === 'in_progress' && 'bg-orange-100 text-orange-600',
                      booking.status === 'completed' && 'bg-green-100 text-green-600',
                    )}>
                      {booking.status}
                    </Badge>
                  </div>
                ))}
                {recentBookings.length === 0 && (
                  <div className="text-center py-10 text-gray-400 font-display">No bookings today</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Service Performance - Spans 1 column */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Service Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={services} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="serviceName" type="category" width={80} fontSize={10} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="totalBookings" fill="#F08080" radius={[0, 4, 4, 0]} barSize={25} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Staff Leaderboard - Spans 1 column */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Staff Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employees.slice(0, 4).map(emp => (
                  <div key={emp.employeeId} className="flex items-center gap-4">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-indigo-100 text-indigo-600 text-[10px] font-bold">
                        {emp.employeeName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-medium text-xs truncate max-w-[80px]">{emp.employeeName}</span>
                        <span className="text-[10px] text-gray-500 font-bold">${emp.totalRevenue.toLocaleString()}</span>
                      </div>
                      <Progress value={Math.min((emp.totalBookings / 50) * 100, 100)} className="h-1" />
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
                      <span className="text-[10px] font-bold">{emp.averageRating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Notifications - Spans 1 column */}
          <Card className="border-0 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-500" />
                Recent Notifications
              </CardTitle>
              <Link to="/admin/messages" className="text-xs text-indigo-600 hover:underline">View All</Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.slice(0, 4).map(notif => (
                  <div key={notif.id} className="flex gap-2 p-2 rounded-lg bg-gray-50/50 border border-gray-100/50">
                    <div className={cn(
                      'w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0',
                      notif.type === 'booking' && 'bg-blue-500',
                      notif.type === 'payment' && 'bg-green-500',
                      notif.type === 'system' && 'bg-purple-500',
                      notif.type === 'reminder' && 'bg-orange-500'
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{notif.title}</p>
                      <p className="text-[10px] text-gray-500 truncate">{notif.message}</p>
                    </div>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-xs">No recent alerts</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
