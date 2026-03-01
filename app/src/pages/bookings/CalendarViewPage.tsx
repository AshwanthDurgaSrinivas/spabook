import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft, ChevronRight, Clock, Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useCallback } from 'react';
import { employeeService, type Employee } from '@/services/employeeService';
import { bookingService, type Booking } from '@/services/bookingService';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface CalendarEmployee {
  id: number;
  firstName: string;
  lastName: string;
  designation: string;
}

const timeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

export function CalendarViewPage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [employeesList, setEmployeesList] = useState<CalendarEmployee[]>([]);
  const [bookingsList, setBookingsList] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [empData, bookData] = await Promise.all([
        employeeService.getEmployees(),
        bookingService.getBookings()
      ]);

      // Only show therapists in the calendar assignment list
      const therapistsOnly = empData.filter(e => e.role === 'therapist');
      const finalEmpList = therapistsOnly.length > 0 ? therapistsOnly : empData;

      const mappedEmps: CalendarEmployee[] = finalEmpList.map(e => ({
        id: e.id,
        firstName: e.user?.firstName || e.firstName || 'Unknown',
        lastName: e.user?.lastName || e.lastName || 'Employee',
        designation: e.designation || 'Staff'
      }));

      if (['therapist', 'employee'].includes(user?.role || '')) {
        const userIdInt = parseInt(user?.id || '0');
        // Find employee record for this user
        const myEmp = empData.find(e => e.userId === userIdInt || e.user?.email === user?.email);
        if (myEmp) {
          setEmployeesList(mappedEmps.filter(e => e.id === myEmp.id));
        } else {
          setEmployeesList([]);
        }
      } else {
        setEmployeesList(mappedEmps);
      }

      setBookingsList(bookData);
    } catch (error) {
      console.error('Calendar data load error:', error);
      toast.error('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const displayedEmployees = employeesList;

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  // ... (formatDate stays same)
  const formatDate = () => {
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    } else if (viewMode === 'week') {
      const start = new Date(currentDate);
      start.setDate(start.getDate() - start.getDay());
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getBookingsForTimeSlot = (time: string, employeeId?: number) => {
    return bookingsList.filter(b => {
      const matchesTime = b.startTime.substring(0, 5) === time.substring(0, 5); // handle HH:mm vs HH:mm:ss
      const matchesEmployee = !employeeId || b.employeeId === employeeId;
      const matchesDate = b.bookingDate === currentDate.toISOString().split('T')[0];
      return matchesTime && matchesEmployee && matchesDate;
    });
  };

  const handleDayClick = (date: Date) => {
    setCurrentDate(date);
    setViewMode('day');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-800">Calendar</h1>
          <p className="text-gray-500 mt-1">View and manage your schedule</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="gradient-coral hover:opacity-90 text-white" asChild>
            <Link to="/admin/bookings/new">
              <Plus className="w-4 h-4 mr-2" />
              New Booking
            </Link>
          </Button>
        </div>
      </div>

      {/* Calendar Controls */}
      <Card className="border-0 shadow-soft">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center justify-between w-full md:w-auto gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
              <Button variant="ghost" size="icon" onClick={() => navigateDate('prev')} className="h-8 w-8 hover:bg-white hover:text-coral-600 hover:shadow-sm shrink-0 rounded-lg">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-sm sm:text-lg font-bold text-gray-800 text-center px-2 min-w-[140px] sm:min-w-[200px] leading-tight">
                {formatDate()}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => navigateDate('next')} className="h-8 w-8 hover:bg-white hover:text-coral-600 hover:shadow-sm shrink-0 rounded-lg">
                <ChevronRight className="w-4 h-4" />
              </Button>
              <div className="hidden sm:block h-6 w-px bg-gray-200 mx-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
                className="hidden sm:flex text-coral-600 hover:bg-coral-50 hover:text-coral-700 font-medium px-3"
              >
                Today
              </Button>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 no-scrollbar">
              <div className="flex sm:hidden w-full gap-2">
                {(['day', 'week', 'month'] as const).map((mode) => (
                  <Button
                    key={mode}
                    variant={viewMode === mode ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode(mode)}
                    className={cn(
                      "flex-1",
                      viewMode === mode ? 'gradient-coral text-white' : 'bg-white'
                    )}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Button>
                ))}
              </div>
              <div className="hidden sm:flex items-center gap-2">
                {(['day', 'week', 'month'] as const).map((mode) => (
                  <Button
                    key={mode}
                    variant={viewMode === mode ? 'default' : 'outline'}
                    onClick={() => setViewMode(mode)}
                    className={viewMode === mode ? 'gradient-coral text-white' : ''}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day View */}
      {viewMode === 'day' && (
        <Card className="border-0 shadow-soft relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-coral-500" />
            </div>
          )}
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div style={{ minWidth: displayedEmployees.length > 2 ? `${displayedEmployees.length * 200 + 80}px` : '100%' }}>
                {/* Header Row */}
                <div className="grid grid-cols-[80px_repeat(var(--cols),1fr)] border-b border-gray-200 bg-gray-50/50" style={{ '--cols': Math.max(1, displayedEmployees.length) } as any}>
                  <div className="p-4 font-semibold text-gray-500 sticky left-0 bg-white z-20 border-r border-gray-100 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">Time</div>
                  {displayedEmployees.map((employee) => (
                    <div key={employee.id} className="p-4 border-l border-gray-200">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full gradient-coral flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">
                            {employee.firstName[0]}{employee.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{employee.firstName}</p>
                          <p className="text-xs text-gray-500">{employee.designation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Time Slots */}
                {timeSlots.map((time) => (
                  <div key={time} className="grid grid-cols-[80px_repeat(var(--cols),1fr)] border-b border-gray-100" style={{ '--cols': displayedEmployees.length } as any}>
                    <div className="p-4 text-sm text-gray-500 font-medium sticky left-0 bg-white z-20 border-r border-gray-100 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">{time}</div>
                    {displayedEmployees.map((employee) => {
                      const slotBookings = getBookingsForTimeSlot(time, employee.id);
                      const hasBooking = slotBookings.length > 0;

                      return (
                        <div
                          key={employee.id}
                          className={cn(
                            'p-2 border-l border-gray-100 min-h-[80px] relative',
                            hasBooking ? 'bg-coral-50' : 'hover:bg-gray-50 cursor-pointer'
                          )}
                        >
                          {hasBooking && slotBookings.map((booking) => (
                            <div
                              key={booking.id}
                              className="p-2 rounded-lg bg-gradient-to-r from-coral-400 to-coral-500 text-white text-sm shadow-sm"
                            >
                              <p className="font-medium truncate">
                                {booking.customer?.firstName} {booking.customer?.lastName}
                              </p>
                              <p className="text-xs opacity-90">{booking.package ? `${booking.package.name} (Package)` : booking.service?.name}</p>
                              <div className="flex items-center gap-2 mt-1 text-xs opacity-75">
                                <Clock className="w-3 h-3" />
                                <span>{booking.package ? booking.package.duration : `${booking.service?.durationMinutes} min`}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Week View */}
      {viewMode === 'week' && (
        <Card className="border-0 shadow-soft">
          <CardContent className="p-6">
            <div className="overflow-x-auto pb-4">
              <div className="grid grid-cols-7 gap-4 min-w-[800px]">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
                  const date = new Date(currentDate);
                  date.setDate(date.getDate() - date.getDay() + index);
                  const dateString = date.toISOString().split('T')[0];
                  const isToday = date.toDateString() === new Date().toDateString();

                  // Filter bookings for this day
                  const dayBookings = bookingsList.filter(b => b.bookingDate === dateString);
                  const totalRevenue = dayBookings.reduce((sum, b) => {
                    const amount = b.totalAmount !== undefined ? b.totalAmount : b.totalPrice;
                    return sum + Number(amount || 0);
                  }, 0);

                  return (
                    <div key={day} className="text-center cursor-pointer group" onClick={() => handleDayClick(date)}>
                      <div className={cn(
                        'p-3 rounded-xl transition-all duration-300 group-hover:scale-105',
                        isToday ? 'gradient-coral text-white shadow-coral' : 'bg-gray-50 border border-transparent hover:bg-coral-50'
                      )}>
                        <p className="text-sm font-medium opacity-80">{day}</p>
                        <p className="text-2xl font-bold">{date.getDate()}</p>
                      </div>
                      <div className="mt-3 space-y-1.5 px-1">
                        <Badge variant="secondary" className={cn(
                          "w-full justify-center py-1 font-bold",
                          dayBookings.length > 0 ? "bg-coral-100 text-coral-600" : "bg-gray-100 text-gray-400"
                        )}>
                          {dayBookings.length} {dayBookings.length === 1 ? 'booking' : 'bookings'}
                        </Badge>
                        {dayBookings.length > 0 && (
                          <Badge variant="secondary" className="bg-green-100 text-green-600 w-full justify-center py-1 font-bold">
                            ${totalRevenue.toLocaleString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Month View */}
      {viewMode === 'month' && (
        <Card className="border-0 shadow-soft">
          <CardContent className="p-6">
            <div className="overflow-x-auto pb-4">
              <div className="grid grid-cols-7 gap-2 min-w-[700px]">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center py-3 font-bold text-gray-400 text-xs uppercase tracking-wider">
                    {day}
                  </div>
                ))}
                {(() => {
                  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
                  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
                  const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();

                  const cells = [];

                  // Previous Month Days
                  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthLastDay - i);
                    cells.push({ date, isCurrentMonth: false });
                  }

                  // Current Month Days
                  for (let i = 1; i <= daysInMonth; i++) {
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
                    cells.push({ date, isCurrentMonth: true });
                  }

                  // Next Month Days to fill 6 weeks (42 cells)
                  const remainingCells = 42 - cells.length;
                  for (let i = 1; i <= remainingCells; i++) {
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i);
                    cells.push({ date, isCurrentMonth: false });
                  }

                  return cells.map((cell, i) => {
                    const isToday = cell.date.toDateString() === new Date().toDateString();
                    const dateString = cell.date.toISOString().split('T')[0];
                    const dayBookings = bookingsList.filter(b => b.bookingDate === dateString);

                    return (
                      <div
                        key={i}
                        onClick={() => handleDayClick(cell.date)}
                        className={cn(
                          'aspect-square p-3 rounded-2xl border transition-all duration-200 group relative cursor-pointer',
                          cell.isCurrentMonth ? 'bg-white border-gray-100 hover:border-coral-200 hover:shadow-sm' : 'bg-gray-50/50 border-transparent opacity-40 hover:opacity-100',
                          isToday && 'ring-2 ring-coral-500 ring-offset-2 border-coral-200'
                        )}
                      >
                        <div className="flex justify-between items-start">
                          <p className={cn(
                            'text-sm font-bold',
                            cell.isCurrentMonth ? 'text-gray-700' : 'text-gray-400',
                            isToday && 'text-coral-600'
                          )}>
                            {cell.date.getDate()}
                          </p>
                          {dayBookings.length > 0 && cell.isCurrentMonth && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-coral-500 text-[10px] font-bold text-white shadow-sm animate-in zoom-in duration-300">
                              {dayBookings.length}
                            </span>
                          )}
                        </div>
                        {cell.isCurrentMonth && dayBookings.length > 0 && (
                          <div className="mt-2 space-y-1 overflow-hidden">
                            {dayBookings.slice(0, 2).map(b => (
                              <div key={b.id} className="text-[10px] truncate px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 font-medium">
                                {b.startTime?.substring(0, 5)} {b.customer?.firstName}
                              </div>
                            ))}
                            {dayBookings.length > 2 && (
                              <p className="text-[10px] text-gray-400 font-medium pl-1">+{dayBookings.length - 2} more</p>
                            )}
                            {(() => {
                              const totalRevenue = dayBookings.reduce((sum, b) => {
                                const amount = b.totalAmount !== undefined ? b.totalAmount : b.totalPrice;
                                return sum + Number(amount || 0);
                              }, 0);
                              return totalRevenue > 0 && (
                                <div className="mt-1 px-1.5 py-0.5 rounded bg-green-50 text-green-600 font-bold text-[9px] w-fit">
                                  ${totalRevenue.toLocaleString()}
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
