import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Clock, MapPin, Calendar, CheckCircle, XCircle, AlertCircle,
  Timer, Coffee, Download, Filter, ChevronLeft, ChevronRight,
  Loader2, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { employeeService, type AttendanceRecord } from '@/services/employeeService';

export function AttendancePage({ forcePersonal = false }: { forcePersonal?: boolean }) {
  const { user } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [serverStats, setServerStats] = useState<any>(null);

  const isAdmin = (user?.role === 'admin' || user?.role === 'manager' || user?.role === 'super_admin') && !forcePersonal;
  const isStaffRole = ['employee', 'therapist', 'receptionist', 'manager'].includes(user?.role || '');
  const showSelfControls = isStaffRole && !isAdmin;

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      let data;
      if (isAdmin) {
        data = await employeeService.getAttendance();
        setRecords(data);
      } else {
        const response = await employeeService.getMyAttendance();
        setRecords(response.records);
        setServerStats(response.stats);
      }
    } catch (error) {
      toast.error('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [user]);

  const getCoords = (): Promise<{ latitude: number, longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    });
  };

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      let coords;
      try {
        coords = await getCoords();
      } catch (e) {
        console.warn('Geolocation error:', e);
        // We still try to check-in, backend will enforce if bypass is false
      }
      await employeeService.checkIn(coords);
      toast.success('Checked in successfully');
      fetchAttendance();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to check in');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      let coords;
      try {
        coords = await getCoords();
      } catch (e) {
        console.warn('Geolocation error:', e);
      }
      await employeeService.checkOut(coords);
      toast.success('Checked out successfully');
      fetchAttendance();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to check out');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleBreak = async () => {
    try {
      setActionLoading(true);
      await employeeService.toggleBreak();
      toast.success('Break status updated');
      fetchAttendance();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to update break status');
    } finally {
      setActionLoading(false);
    }
  };

  const todayRecord = useMemo(() => {
    const todayLocal = new Date().toLocaleDateString('en-CA');
    const todayISO = new Date().toISOString().split('T')[0];

    return records.find(r => r.date === todayLocal || r.date === todayISO);
  }, [records]);

  const isCheckedInToday = !!todayRecord;
  const hasCheckedOutToday = !!todayRecord?.checkOutTime;
  const isOnBreak = !!todayRecord?.lastBreakStart;

  const getStatusBadge = (status: string, recordId?: number) => {
    const configs: Record<string, { color: string; icon: React.ComponentType<{ className?: string }> }> = {
      present: { color: 'bg-green-100 text-green-600', icon: CheckCircle },
      absent: { color: 'bg-red-100 text-red-600', icon: XCircle },
      late: { color: 'bg-yellow-100 text-yellow-600', icon: AlertCircle },
      half_day: { color: 'bg-orange-100 text-orange-600', icon: Clock },
      leave: { color: 'bg-blue-100 text-blue-600', icon: Coffee },
    };
    const config = configs[status] || configs.present;

    if (isAdmin && recordId) {
      return (
        <Select
          defaultValue={status}
          onValueChange={(newStatus) => handleStatusUpdate(recordId, newStatus)}
        >
          <SelectTrigger className={cn("h-8 border-0 shadow-none px-2 focus:ring-0 w-[120px] justify-start", config.color)}>
            <div className="flex items-center gap-1">
              <config.icon className="w-3 h-3" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent position="popper">
            {Object.keys(configs).map((s) => (
              <SelectItem key={s} value={s} className="capitalize text-xs font-medium">
                <div className="flex items-center gap-2">
                  {(() => {
                    const SIcon = configs[s].icon;
                    return <SIcon className="w-3 h-3 opacity-70" />;
                  })()}
                  {s.replace('_', ' ')}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    const Icon = config.icon;
    return (
      <Badge className={cn("border-0", config.color)}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      setActionLoading(true);
      await employeeService.updateAttendanceStatus(id, status);
      toast.success('Attendance status updated');
      fetchAttendance();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const stats = useMemo(() => {
    if (serverStats) return serverStats;
    return {
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      leave: records.filter(r => r.status === 'leave').length,
      avgHours: records.length > 0
        ? (records.reduce((acc, r) => {
          if (r.checkInTime && r.checkOutTime) {
            const duration = (new Date(r.checkOutTime).getTime() - new Date(r.checkInTime).getTime()) / (1000 * 60 * 60);
            return acc + duration - (r.breakMinutes || 0) / 60;
          }
          return acc;
        }, 0) / records.filter(r => r.checkInTime && r.checkOutTime).length || 0).toFixed(1)
        : '0'
    };
  }, [records, serverStats]);

  const weeklyChartData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return last7Days.map(dateStr => {
      const dayRecords = records.filter(r => r.date === dateStr);
      const dayName = days[new Date(dateStr).getDay()];
      return {
        day: dayName,
        present: dayRecords.filter(r => r.status === 'present' || r.status === 'late').length,
        absent: dayRecords.filter(r => r.status === 'absent').length,
        leave: dayRecords.filter(r => r.status === 'leave').length,
      };
    });
  }, [records]);

  const exportCSV = () => {
    let csv = 'Employee,Date,Check In,Check Out,Status,Hours\n';
    records.forEach(r => {
      const empName = r.employee?.user ? `${r.employee.user.firstName} ${r.employee.user.lastName}` : `Employee #${r.employeeId}`;
      const checkIn = r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString() : '-';
      const checkOut = r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString() : '-';
      const hours = r.checkInTime && r.checkOutTime
        ? ((new Date(r.checkOutTime).getTime() - new Date(r.checkInTime).getTime()) / (1000 * 60 * 60)).toFixed(1)
        : '0';
      csv += `"${empName}",${r.date},${checkIn},${checkOut},${r.status},${hours}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Attendance report exported');
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden pb-20 md:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="w-full">
          <h1 className="text-3xl font-display font-bold text-gray-800">
            {isAdmin ? 'Attendance Management' : 'My Attendance'}
          </h1>
          <p className="text-gray-500 mt-1 break-words w-full">
            {isAdmin ? 'Track and manage employee attendance' : 'Track your working hours and attendance history'}
          </p>
        </div>
        <div className="flex flex-col w-full sm:w-auto sm:flex-row sm:items-center gap-3 mt-4 sm:mt-0">
          <Button variant="outline" className="border-indigo-200 hover:bg-indigo-50 w-full sm:w-auto" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          {/* Self-attendance controls are visible if user has personal records or is a manager/employee */}
          {showSelfControls && (
            <div className="flex gap-2">
              {!isCheckedInToday ? (
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto shadow-md"
                  onClick={handleCheckIn}
                  disabled={actionLoading}
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Clock className="w-4 h-4 mr-2" />}
                  Check In
                </Button>
              ) : !hasCheckedOutToday ? (
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full sm:w-auto border-2 transition-all",
                      isOnBreak ? "border-orange-500 text-orange-600 bg-orange-50" : "border-indigo-200 text-indigo-600"
                    )}
                    onClick={handleToggleBreak}
                    disabled={actionLoading}
                  >
                    <Coffee className={cn("w-4 h-4 mr-2", isOnBreak && "animate-pulse")} />
                    {isOnBreak ? "End Break" : "Start Break"}
                  </Button>
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto shadow-md"
                    onClick={handleCheckOut}
                    disabled={actionLoading}
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Clock className="w-4 h-4 mr-2" />}
                    Check Out
                  </Button>
                </div>
              ) : (
                <Button disabled className="bg-gray-100 text-gray-400 border border-gray-200 w-full sm:w-auto">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Shift Completed
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: isAdmin ? 'Present Today' : 'Days Present',
            value: stats.present.toString(),
            icon: CheckCircle,
            color: 'green'
          },
          {
            label: 'Absent',
            value: stats.absent.toString(),
            icon: XCircle,
            color: 'red'
          },
          {
            label: isAdmin ? 'On Leave' : 'Leaves Taken',
            value: (stats.leaves ?? stats.leave ?? 0).toString(),
            icon: Coffee,
            color: 'blue'
          },
          {
            label: 'Avg. Hours',
            value: stats.avgHours,
            icon: Timer,
            color: 'indigo'
          },
        ].map((stat, index) => (
          <Card key={index} className="border-0 shadow-soft hover:shadow-md transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                </div>
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', `bg-${stat.color}-100`)}>
                  <stat.icon className={cn('w-5 h-5', `text-${stat.color}-600`)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="bg-white p-1 rounded-xl border border-gray-100 shadow-sm w-full max-w-md">
          <TabsTrigger value="daily" className="flex-1 rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">
            {isAdmin ? 'Daily Records' : 'My Logs'}
          </TabsTrigger>
          <TabsTrigger value="weekly" className="flex-1 rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">
            Weekly Report
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-6 mt-6">
          <Card className="border-0 shadow-soft overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                {isAdmin ? "Attendance Tracking" : "Attendance Log"}
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-indigo-600 hover:bg-indigo-50" onClick={fetchAttendance}>
                <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
                Refresh
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                  <p className="text-gray-500">Loading attendance data...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50/50">
                        <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Employee</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Date</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Check In</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Check Out</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Status</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm text-right">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {records.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-sm">
                                <span className="text-white font-bold text-xs">
                                  {record.employee?.user?.firstName?.[0] || record.employee?.firstName?.[0] || 'E'}
                                </span>
                              </div>
                              <div>
                                <p className="font-bold text-gray-800">
                                  {record.employee?.user ? `${record.employee.user.firstName} ${record.employee.user.lastName}` : (record.employee?.firstName ? `${record.employee.firstName} ${record.employee.lastName}` : `Employee #${record.employeeId}`)}
                                </p>
                                <p className="text-xs text-gray-500">{record.employee?.designation || 'Staff'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-600">
                            {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2 text-sm text-gray-800 font-medium">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                              {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2 text-sm text-gray-800 font-medium">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                              {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            {getStatusBadge(record.status, record.id)}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {record.checkInTime && record.checkOutTime
                                ? (((new Date(record.checkOutTime).getTime() - new Date(record.checkInTime).getTime()) / (1000 * 60 * 60)) - (record.breakMinutes || 0) / 60).toFixed(1)
                                : '0.0'
                              } hrs
                            </span>
                          </td>
                        </tr>
                      ))}
                      {records.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-20">
                            <AlertCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                            <p className="text-gray-400 font-medium">No attendance records found for this period.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-6 mt-6">
          <Card className="border-0 shadow-soft">
            <CardHeader className="border-b border-gray-50 pb-4">
              <CardTitle className="text-lg font-semibold">Weekly Attendance Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                    <Tooltip
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
                    <Bar dataKey="present" name="Present" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={24} />
                    <Bar dataKey="leave" name="On Leave" fill="#93c5fd" radius={[6, 6, 0, 0]} barSize={24} />
                    <Bar dataKey="absent" name="Absent" fill="#f87171" radius={[6, 6, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div >
  );
}

