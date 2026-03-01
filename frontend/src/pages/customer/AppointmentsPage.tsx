import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Search, Filter, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { bookingService } from '@/services/bookingService';
import type { Booking } from '@/services/bookingService';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { settingsService } from '@/services/settingsService';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, isToday } from 'date-fns';

export function AppointmentsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    // Reschedule states
    const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(new Date());
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [weeklySchedule, setWeeklySchedule] = useState<any>(null);
    const [availabilityData, setAvailabilityData] = useState<any>(null);
    const [timeSlots, setTimeSlots] = useState<string[]>([]);

    // Cancellation states
    const [isCancelOpen, setIsCancelOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [cancelling, setCancelling] = useState(false);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const data = await bookingService.getBookings();
            setBookings(data);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
            toast.error('Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
        const fetchSettings = async () => {
            try {
                const settings = await settingsService.getPublicSettings();
                const scheduleVal = settings['weekly_schedule'];
                if (scheduleVal) {
                    setWeeklySchedule(typeof scheduleVal === 'string' ? JSON.parse(scheduleVal) : scheduleVal);
                }
            } catch (error) {
                console.error('Failed to fetch settings', error);
            }
        };
        fetchSettings();
    }, []);

    const parseDurationStr = (d: string | undefined): number => {
        if (!d) return 60;
        const lower = d.toLowerCase();
        const hrMatch = lower.match(/(\d+)\s*(hr|hour)/);
        const minMatch = lower.match(/(\d+)\s*(min)/);
        let total = 0;
        if (hrMatch) total += parseInt(hrMatch[1]) * 60;
        if (minMatch) total += parseInt(minMatch[1]);
        if (total > 0) return total;
        const val = parseInt(lower);
        if (!isNaN(val)) return lower.includes('hr') ? val * 60 : val;
        return 60;
    };

    const getSlotInfo = (time: string) => {
        if (!selectedBooking || !availabilityData) return { full: false, taken: 0, capacity: 1 };

        const itemDuration = selectedBooking.packageId
            ? parseDurationStr(selectedBooking.package?.duration)
            : (selectedBooking.service?.durationMinutes ?? 60);

        const [startH, startM] = time.split(':').map(Number);
        const startMins = startH * 60 + startM;
        const endMins = startMins + itemDuration;

        const cap = availabilityData.capacity ?? 1;

        let maxTaken = 0;
        for (let h = 0; h < 24; h++) {
            const slotStart = h * 60;
            const slotEnd = (h + 1) * 60;
            if (startMins < slotEnd && endMins > slotStart) {
                const slotKey = `${h.toString().padStart(2, '0')}:00`;
                const takenAtSlot = availabilityData.slotCounts?.[slotKey] ?? 0;
                maxTaken = Math.max(maxTaken, takenAtSlot);
            }
        }

        return { full: maxTaken >= cap || cap === 0, taken: maxTaken, capacity: cap };
    };

    const isSlotInPast = (time: string) => {
        if (!rescheduleDate) return false;
        if (!isToday(rescheduleDate)) return false;

        const [hours, minutes] = time.split(':').map(Number);
        const now = new Date();
        const slotTime = new Date(rescheduleDate);
        slotTime.setHours(hours, minutes, 0, 0);

        return slotTime < now;
    };

    useEffect(() => {
        if (!rescheduleDate || !weeklySchedule) return;
        const dayName = format(rescheduleDate, 'EEEE');
        const config = weeklySchedule[dayName];

        if (!config || String(config.isOpen) !== 'true') {
            setTimeSlots([]);
            return;
        }

        const slots = [];
        const current = parseInt(config.start.split(':')[0]);
        const end = parseInt(config.end.split(':')[0]);
        for (let i = current; i <= end; i++) {
            slots.push(`${i.toString().padStart(2, '0')}:00`);
        }
        setTimeSlots(slots);
    }, [rescheduleDate, weeklySchedule]);

    useEffect(() => {
        if (isRescheduleOpen && selectedBooking && rescheduleDate) {
            const fetchAvailability = async () => {
                setLoadingSlots(true);
                try {
                    const formattedDate = format(rescheduleDate, 'yyyy-MM-dd');
                    const data = await bookingService.getAvailability(
                        (selectedBooking.serviceId || selectedBooking.packageId) as number,
                        formattedDate,
                        !!selectedBooking.packageId
                    );
                    setAvailabilityData(data);
                } catch (error) {
                    toast.error('Failed to load availability');
                } finally {
                    setLoadingSlots(false);
                }
            };
            fetchAvailability();
        }
    }, [isRescheduleOpen, selectedBooking, rescheduleDate]);

    const handleRescheduleSubmit = async () => {
        if (!selectedBooking || !rescheduleDate || !selectedSlot) {
            toast.error("Please select a date and time slot");
            return;
        }

        try {
            const formattedDate = format(rescheduleDate, 'yyyy-MM-dd');
            await bookingService.requestReschedule(selectedBooking.id, formattedDate, selectedSlot);
            toast.success("Reschedule request sent for approval");
            setIsRescheduleOpen(false);
            fetchBookings();
        } catch (error) {
            toast.error("Failed to submit reschedule request");
        }
    };

    const handleCancelSubmit = async () => {
        if (!selectedBooking) return;
        setCancelling(true);
        try {
            await bookingService.requestCancellation(selectedBooking.id, cancelReason);
            toast.success("Cancellation request sent for approval");
            setIsCancelOpen(false);
            setCancelReason("");
            fetchBookings();
        } catch (error) {
            toast.error("Failed to submit cancellation request");
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-coral-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-800">My Appointments</h1>
                    <p className="text-gray-500 mt-1">View and manage your bookings</p>
                </div>
                <Button className="gradient-coral text-white shadow-lg" asChild>
                    <Link to="/customer/booking">
                        Book New Appointment
                    </Link>
                </Button>
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input placeholder="Search bookings..." className="pl-9 bg-white" />
                </div>
                <Button variant="outline" className="gap-2" onClick={() => toast.info('Filter options coming soon!')}>
                    <Filter className="w-4 h-4" /> Filter
                </Button>
            </div>

            <div className="grid gap-4">
                {bookings.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No appointments found</h3>
                        <p className="text-gray-500 mt-1">You haven't booked any appointments yet.</p>
                        <Button className="mt-4 gradient-coral text-white" asChild>
                            <Link to="/customer/booking">Book Now</Link>
                        </Button>
                    </div>
                ) : (
                    bookings.map((booking) => (
                        <Card key={booking.id} className="border-0 shadow-soft hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center flex-shrink-0 text-indigo-500">
                                        <Calendar className="w-8 h-8" />
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-lg text-gray-900">{booking.service?.name || 'Service'}</h3>
                                            <Badge className={cn(
                                                "capitalize",
                                                booking.status === 'confirmed' && "bg-green-100 text-green-700 hover:bg-green-200",
                                                booking.status === 'pending' && "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
                                                booking.status === 'cancelled' && "bg-red-100 text-red-700 hover:bg-red-200",
                                                booking.status === 'completed' && "bg-blue-100 text-blue-700 hover:bg-blue-200",
                                                booking.status === 'reschedule_requested' && "bg-purple-100 text-purple-700 hover:bg-purple-200",
                                                booking.status === 'cancellation_requested' && "bg-orange-100 text-orange-700 hover:bg-orange-200",
                                            )}>
                                                {booking.status.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                        <p className="text-gray-500">Booking ID: <span className="font-mono text-gray-700">#{booking.id.toString().padStart(6, '0')}</span></p>

                                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4 text-indigo-400" />
                                                {booking.bookingDate}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4 text-indigo-400" />
                                                {booking.startTime}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4 text-indigo-400" />
                                                Downtown Spa
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 w-full md:w-auto">
                                        {booking.status === 'confirmed' && (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 border-gray-200"
                                                    onClick={() => {
                                                        setSelectedBooking(booking);
                                                        setIsRescheduleOpen(true);
                                                    }}
                                                >
                                                    Reschedule
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    onClick={() => {
                                                        setSelectedBooking(booking);
                                                        setIsCancelOpen(true);
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                            </>
                                        )}
                                        {booking.status === 'completed' && (
                                            <Button variant="outline" className="flex-1 border-gray-200" onClick={() => toast.success('Redirecting to booking...')}>Book Again</Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Reschedule Dialog */}
            <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Request Reschedule</DialogTitle>
                        <DialogDescription>
                            Pick a new date and time for your {selectedBooking?.service?.name}.
                            Your request will be sent to the admin for approval.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="flex flex-col items-center">
                            <CalendarComponent
                                mode="single"
                                selected={rescheduleDate}
                                onSelect={setRescheduleDate}
                                className="rounded-md border shadow-sm"
                                disabled={(date) => date < new Date() || date.getDay() === 0} // example: disable past and Sundays
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-sm font-medium">Available Time Slots</label>
                            {loadingSlots ? (
                                <div className="flex items-center justify-center p-4">
                                    <Loader2 className="w-6 h-6 animate-spin text-coral-500" />
                                </div>
                            ) : timeSlots.length > 0 ? (
                                <div className="grid grid-cols-3 gap-2">
                                    {timeSlots.filter(time => !isSlotInPast(time)).map(slot => {
                                        const slotInfo = getSlotInfo(slot);
                                        const isDisabled = slotInfo.full;
                                        return (
                                            <div key={slot} className="flex flex-col items-center gap-1">
                                                <Button
                                                    key={slot}
                                                    variant={selectedSlot === slot ? "default" : "outline"}
                                                    className={cn(
                                                        "text-sm h-9 w-full",
                                                        selectedSlot === slot && "bg-coral-500 text-white hover:bg-coral-600",
                                                        isDisabled && "opacity-50 cursor-not-allowed"
                                                    )}
                                                    disabled={isDisabled}
                                                    onClick={() => setSelectedSlot(slot)}
                                                >
                                                    {slot}
                                                </Button>
                                                {slotInfo.full ? (
                                                    <span className="text-[10px] text-red-500 font-medium">Full</span>
                                                ) : slotInfo.capacity > 1 ? (
                                                    <span className="text-[10px] text-green-600 font-medium">
                                                        {slotInfo.capacity - slotInfo.taken} left
                                                    </span>
                                                ) : null}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : rescheduleDate ? (
                                <p className="text-sm text-red-500 text-center py-2">No available slots for this date.</p>
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-2">Please select a date first.</p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRescheduleOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-coral-500 text-white hover:bg-coral-600"
                            disabled={!selectedSlot}
                            onClick={handleRescheduleSubmit}
                        >
                            Submit Request
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancellation Dialog */}
            <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Request Cancellation</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel your appointment? Administrative approval is required.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Reason for Cancellation (Optional)</label>
                            <textarea
                                className="w-full min-h-[100px] p-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-coral-500/20"
                                placeholder="Please let us know why you need to cancel..."
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCancelOpen(false)}>Back</Button>
                        <Button
                            variant="destructive"
                            onClick={handleCancelSubmit}
                            disabled={cancelling}
                        >
                            {cancelling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Confirm Request
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
