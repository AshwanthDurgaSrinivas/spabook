import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Search, Plus, Filter, MoreHorizontal, Calendar,
  Edit, Trash2, Eye, CheckCircle, MessageSquare, Printer,
  ChevronUp, ChevronDown, ArrowUpDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { bookingService, type Booking } from '@/services/bookingService';
import { useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

const bookingStatuses = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-500' },
  { value: 'completed', label: 'Completed', color: 'bg-green-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
  { value: 'reschedule_requested', label: 'Reschedule Req.', color: 'bg-purple-500' },
  { value: 'cancellation_requested', label: 'Cancellation Req.', color: 'bg-orange-500' },
];

export function BookingManagementPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bookingsList, setBookingsList] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Sorting state
  const [sortField, setSortField] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await bookingService.getBookings();
      setBookingsList(data);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    return sortDirection === 'asc' ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />;
  };

  const processedBookings = useMemo(() => {
    // 1. Filter
    const filtered = bookingsList.filter(booking => {
      if (user?.role === 'therapist') {
        if (booking.employeeId !== parseInt(user.id)) return false;
      }

      const customerName = `${booking.customer?.firstName || ''} ${booking.customer?.lastName || ''}`.toLowerCase();
      const matchesSearch =
        (booking.bookingNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        customerName.includes(searchQuery.toLowerCase()) ||
        (booking.customer?.email || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'cancellation_requested' ? (booking.status === 'cancellation_requested' || booking.status === 'cancelled') :
          booking.status === statusFilter);

      return matchesSearch && matchesStatus;
    });

    // 2. Sort
    return [...filtered].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'customer':
          aValue = `${a.customer?.firstName || ''} ${a.customer?.lastName || ''}`.toLowerCase();
          bValue = `${b.customer?.firstName || ''} ${b.customer?.lastName || ''}`.toLowerCase();
          break;
        case 'dateTime':
          aValue = `${a.bookingDate} ${a.startTime}`;
          bValue = `${b.bookingDate} ${b.startTime}`;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'service':
          aValue = (a.service?.name || a.package?.name || '').toLowerCase();
          bValue = (b.service?.name || b.package?.name || '').toLowerCase();
          break;
        default:
          aValue = (a as any)[sortField];
          bValue = (b as any)[sortField];
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [bookingsList, searchQuery, statusFilter, sortField, sortDirection, user]);

  const handleStatusUpdate = async (bookingId: number, newStatus: string) => {
    try {
      await bookingService.updateStatus(bookingId, newStatus);
      toast.success(`Booking status updated to ${newStatus}`);
      fetchBookings();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleRescheduleAction = async (bookingId: number, action: 'approve' | 'reject') => {
    try {
      await bookingService.handleReschedule(bookingId, action);
      toast.success(`Reschedule ${action === 'approve' ? 'approved' : 'rejected'}`);
      fetchBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to process reschedule');
    }
  };

  const handleCancellationAction = async (bookingId: number, action: 'approve' | 'reject') => {
    try {
      await bookingService.handleCancellation(bookingId, action);
      toast.success(`Cancellation ${action === 'approve' ? 'approved' : 'rejected'}`);
      fetchBookings();
    } catch (error) {
      toast.error('Failed to process cancellation');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = bookingStatuses.find(s => s.value === status);
    return (
      <Badge className={cn('text-white capitalize', statusConfig?.color || 'bg-gray-400')}>
        {statusConfig?.label || status.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-800">Booking Management</h1>
          <p className="text-gray-500 mt-1">Manage all your appointments and reservations</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-indigo-200 hover:bg-indigo-50" onClick={() => fetchBookings()}>
            <Printer className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-gradient-to-r from-[#4f46e5] to-[#8b5cf6] hover:opacity-90 text-white shadow-md shadow-indigo-500/20" asChild>
            <Link to="/admin/bookings/new">
              <Plus className="w-4 h-4 mr-2" />
              New Booking
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Bookings', value: bookingsList.length.toLocaleString(), color: 'text-indigo-600' },
          { label: 'Today', value: bookingsList.filter(b => b.bookingDate === new Date().toISOString().split('T')[0]).length.toString(), color: 'text-blue-500' },
          { label: 'Requests', value: bookingsList.filter(b => ['reschedule_requested', 'cancellation_requested'].includes(b.status)).length.toString(), color: 'text-purple-500' },
          { label: 'Revenue', value: `$${bookingsList.filter(b => b.status === 'completed').reduce((acc, b) => acc + Number(b.totalAmount ?? b.totalPrice ?? 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: 'text-green-500' },
        ].map((stat, index) => (
          <Card key={index} className="border-0 shadow-soft">
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <div className="flex items-end justify-between mt-1">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-soft overflow-hidden">
        <div className="p-4 sm:p-6">
          <Tabs defaultValue="all" onValueChange={setStatusFilter}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
                <TabsList className="bg-gray-100 inline-flex">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                  <TabsTrigger value="reschedule_requested">Reschedules</TabsTrigger>
                  <TabsTrigger value="cancellation_requested">Cancellations</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                </TabsList>
              </div>
              <div className="relative w-full lg:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search bookings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>

            <div className="mt-6">
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="whitespace-nowrap cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleSort('id')}
                      >
                        <div className="flex items-center">
                          Booking # {getSortIcon('id')}
                        </div>
                      </TableHead>
                      <TableHead
                        className="whitespace-nowrap cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleSort('customer')}
                      >
                        <div className="flex items-center">
                          Customer {getSortIcon('customer')}
                        </div>
                      </TableHead>
                      <TableHead
                        className="whitespace-nowrap cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleSort('dateTime')}
                      >
                        <div className="flex items-center">
                          Date & Time {getSortIcon('dateTime')}
                        </div>
                      </TableHead>
                      <TableHead
                        className="whitespace-nowrap cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleSort('service')}
                      >
                        <div className="flex items-center">
                          Services {getSortIcon('service')}
                        </div>
                      </TableHead>
                      <TableHead
                        className="whitespace-nowrap cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center">
                          Status {getSortIcon('status')}
                        </div>
                      </TableHead>
                      <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-20">
                          <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto" />
                          <p className="text-gray-500 mt-2">Loading bookings...</p>
                        </TableCell>
                      </TableRow>
                    ) : processedBookings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-20 text-gray-500">
                          No bookings found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      processedBookings.map((booking) => (
                        <TableRow key={booking.id} className="hover:bg-gray-50/80 transition-colors">
                          <TableCell>
                            <Link to={`/admin/bookings/${booking.id}`} className="font-semibold text-indigo-600 hover:text-indigo-700">
                              {booking.bookingNumber || `B-${booking.id.toString().padStart(4, '0')}`}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                                {booking.customer?.firstName?.[0] || 'C'}{booking.customer?.lastName?.[0] || ''}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800 leading-none">
                                  {booking.customer ? `${booking.customer.firstName} ${booking.customer.lastName}` : 'Guest'}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-indigo-400" />
                              <div className="leading-tight">
                                <p className="text-sm font-medium">{booking.bookingDate}</p>
                                <p className="text-xs text-gray-500">{booking.startTime}</p>
                                {booking.status === 'reschedule_requested' && (
                                  <div className="mt-1 p-1 bg-purple-50 rounded border border-purple-100">
                                    <p className="text-[10px] font-bold text-purple-600 uppercase">Proposed:</p>
                                    <p className="text-[10px] text-purple-700">{booking.rescheduleDate} at {booking.rescheduleTime}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm font-medium text-gray-700">
                              {booking.package ? (
                                <span className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                  {booking.package.name}
                                </span>
                              ) : booking.service?.name}
                            </p>
                          </TableCell>
                          <TableCell>{getStatusBadge(booking.status)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 rounded-full">
                                  <MoreHorizontal className="w-4 h-4 text-gray-500" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem asChild>
                                  <Link to={`/admin/bookings/${booking.id}`}>
                                    <Eye className="w-4 h-4 mr-2" /> View Details
                                  </Link>
                                </DropdownMenuItem>

                                {booking.status === 'reschedule_requested' && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleRescheduleAction(booking.id, 'approve')} className="text-green-600">
                                      <CheckCircle className="w-4 h-4 mr-2" /> Approve Reschedule
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleRescheduleAction(booking.id, 'reject')} className="text-red-600">
                                      <Trash2 className="w-4 h-4 mr-2" /> Reject Reschedule
                                    </DropdownMenuItem>
                                  </>
                                )}

                                {booking.status === 'cancellation_requested' && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleCancellationAction(booking.id, 'approve')} className="text-green-600">
                                      <CheckCircle className="w-4 h-4 mr-2" /> Approve Cancellation
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleCancellationAction(booking.id, 'reject')} className="text-red-600">
                                      <Trash2 className="w-4 h-4 mr-2" /> Reject Cancellation
                                    </DropdownMenuItem>
                                  </>
                                )}

                                {booking.status === 'confirmed' && (
                                  <DropdownMenuItem onClick={() => handleStatusUpdate(booking.id, 'completed')}>
                                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Mark Completed
                                  </DropdownMenuItem>
                                )}

                                <DropdownMenuItem onClick={() => handleStatusUpdate(booking.id, 'cancelled')} className="text-red-500">
                                  <Trash2 className="w-4 h-4 mr-2" /> Cancel Booking
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile view */}
              <div className="lg:hidden space-y-4">
                {processedBookings.map(booking => (
                  <Card key={booking.id} className="border-l-4 border-l-indigo-500">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold">{booking.bookingNumber || `B-${booking.id}`}</p>
                          <p className="text-sm text-gray-600">{booking.customer?.firstName} {booking.customer?.lastName}</p>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                      <div className="text-xs text-gray-500">
                        <p>{booking.bookingDate} at {booking.startTime}</p>
                        <p>{booking.package ? `${booking.package.name} (Package)` : booking.service?.name}</p>
                      </div>
                      <div className="flex gap-2 mt-2">
                        {booking.status === 'reschedule_requested' ? (
                          <>
                            <Button size="sm" variant="outline" className="flex-1 text-green-600" onClick={() => handleRescheduleAction(booking.id, 'approve')}>Approve</Button>
                            <Button size="sm" variant="outline" className="flex-1 text-red-600" onClick={() => handleRescheduleAction(booking.id, 'reject')}>Reject</Button>
                          </>
                        ) : booking.status === 'cancellation_requested' ? (
                          <>
                            <Button size="sm" variant="outline" className="flex-1 text-green-600" onClick={() => handleCancellationAction(booking.id, 'approve')}>Approve</Button>
                            <Button size="sm" variant="outline" className="flex-1 text-red-600" onClick={() => handleCancellationAction(booking.id, 'reject')}>Reject</Button>
                          </>
                        ) : (
                          <Button size="sm" variant="outline" className="w-full" asChild>
                            <Link to={`/admin/bookings/${booking.id}`}>Details</Link>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </Tabs>
        </div>
      </Card>
    </div>
  );
}
