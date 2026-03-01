import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, isToday } from 'date-fns';
import { Calendar as CalendarIcon, Clock, User, Sparkles, MapPin, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useEffect, useCallback, useMemo } from 'react';
import { bookingService } from '@/services/bookingService';
import { customerService, type Customer } from '@/services/customerService';
import { employeeService, type Employee } from '@/services/employeeService';
import { serviceService, type Service } from '@/services/serviceService';
import { roomService, type Room } from '@/services/roomService';
import { settingsService } from '@/services/settingsService';
import { Loader2 } from 'lucide-react';

export function NewBookingPage() {
    const navigate = useNavigate();
    const [date, setDate] = useState<Date>();
    const [isLoading, setIsLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);

    const [customersList, setCustomersList] = useState<Customer[]>([]);
    const [servicesList, setServicesList] = useState<Service[]>([]);
    const [employeesList, setEmployeesList] = useState<Employee[]>([]);
    const [roomsList, setRoomsList] = useState<Room[]>([]);

    const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
    const [selectedServiceId, setSelectedServiceId] = useState<string>("");
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
    const [selectedRoomId, setSelectedRoomId] = useState<string>("");
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [notes, setNotes] = useState<string>("");
    const [weeklySchedule, setWeeklySchedule] = useState<any>(null);
    const [timeSlots, setTimeSlots] = useState<string[]>([]);

    const isSlotInPast = (time: string) => {
        if (!date) return false;
        if (!isToday(date)) return false;

        const [hours, minutes] = time.split(':').map(Number);
        const now = new Date();
        const slotTime = new Date(date);
        slotTime.setHours(hours, minutes, 0, 0);

        return slotTime < now;
    };

    const fetchData = useCallback(async () => {
        try {
            setDataLoading(true);
            const [cData, sData, eData, rData, pubSettings] = await Promise.all([
                customerService.getCustomers(),
                serviceService.getServices(),
                employeeService.getEmployees(),
                roomService.getRooms(),
                settingsService.getPublicSettings()
            ]);
            setCustomersList(cData);
            setServicesList(sData);
            setEmployeesList(eData);
            setRoomsList(rData);

            const scheduleVal = pubSettings['weekly_schedule'];
            if (scheduleVal) {
                try {
                    setWeeklySchedule(typeof scheduleVal === 'string' ? JSON.parse(scheduleVal) : scheduleVal);
                } catch (e) {
                    console.error("Error parsing weekly_schedule in NewBookingPage");
                }
            }
        } catch (error) {
            toast.error('Failed to load form data');
        } finally {
            setDataLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (!date || !weeklySchedule) return;
        const dayName = format(date, 'EEEE');
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
    }, [date, weeklySchedule]);

    const selectedService = useMemo(() =>
        servicesList.find(s => s.id.toString() === selectedServiceId),
        [servicesList, selectedServiceId]);

    const calculateEndTime = (start: string, duration: number) => {
        const [hours, minutes] = start.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + duration;
        const endHours = Math.floor(totalMinutes / 60);
        const endMinutes = totalMinutes % 60;
        return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomerId || !selectedServiceId || !date || !selectedTime) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsLoading(true);
        try {
            const bookingDate = format(date, 'yyyy-MM-dd');
            const endTime = calculateEndTime(selectedTime, selectedService?.durationMinutes || 60);

            await bookingService.createBooking({
                customerId: parseInt(selectedCustomerId),
                serviceId: parseInt(selectedServiceId),
                employeeId: selectedEmployeeId ? parseInt(selectedEmployeeId) : undefined,
                roomId: selectedRoomId ? parseInt(selectedRoomId) : undefined,
                bookingDate,
                startTime: selectedTime,
                endTime,
                status: 'pending',
                totalPrice: selectedService?.basePrice || 0,
                notes
            });

            toast.success('Booking created successfully!', {
                description: 'The customer will receive a confirmation email shortly.',
            });
            navigate('/admin/bookings');
        } catch (error) {
            toast.error('Failed to create booking');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                    <ChevronLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-800">New Booking</h1>
                    <p className="text-gray-500">Create a new appointment for a customer</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Customer Selection */}
                    <Card className="md:col-span-2 border-0 shadow-soft">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <User className="w-5 h-5 text-coral-500" />
                                Customer Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="customer">Select Customer</Label>
                                    <Select
                                        value={selectedCustomerId}
                                        onValueChange={setSelectedCustomerId}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={dataLoading ? "Loading..." : "Search customers..."} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {customersList.map((c) => (
                                                <SelectItem key={c.id} value={c.id.toString()}>
                                                    {c.firstName} {c.lastName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-end pb-0.5">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full border-coral-200 text-coral-600 hover:bg-coral-50"
                                        onClick={() => navigate('/admin/customers/new')}
                                    >
                                        + New Customer
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notes">Special Requirements / Notes</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Any allergies, preferences, or specific requests..."
                                    className="min-h-[100px]"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Appointment Summary */}
                    <Card className="border-0 shadow-soft">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-coral-50 rounded-xl space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="font-medium">${Number(selectedService?.basePrice || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Tax (8.25%)</span>
                                    <span className="font-medium">${(Number(selectedService?.basePrice || 0) * 0.0825).toFixed(2)}</span>
                                </div>
                                <div className="border-t border-coral-100 pt-2 flex justify-between font-bold text-gray-800">
                                    <span>Total</span>
                                    <span>${(Number(selectedService?.basePrice || 0) * 1.0825).toFixed(2)}</span>
                                </div>
                            </div>
                            <Button
                                type="submit"
                                className="w-full gradient-coral text-white shadow-coral py-6"
                                disabled={isLoading || dataLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : 'Confirm Booking'}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Service & Staff */}
                    <Card className="md:col-span-3 border-0 shadow-soft">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-coral-500" />
                                Service & Provider
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label>Service</Label>
                                <Select
                                    value={selectedServiceId}
                                    onValueChange={setSelectedServiceId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={dataLoading ? "Loading..." : "Choose a service"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {servicesList.map((s) => (
                                            <SelectItem key={s.id} value={s.id.toString()}>
                                                {s.name} ({s.durationMinutes} min)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Provider</Label>
                                <Select
                                    value={selectedEmployeeId}
                                    onValueChange={setSelectedEmployeeId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={dataLoading ? "Loading..." : "Any available"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employeesList.map((e) => (
                                            <SelectItem key={e.id} value={e.id.toString()}>
                                                {e.user?.firstName || e.firstName} {e.user?.lastName || e.lastName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Location / Room</Label>
                                <Select
                                    value={selectedRoomId}
                                    onValueChange={setSelectedRoomId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={dataLoading ? "Loading..." : "Main Spa"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roomsList.map((r) => (
                                            <SelectItem key={r.id} value={r.id.toString()}>
                                                {r.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Date & Time */}
                    <Card className="md:col-span-3 border-0 shadow-soft">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <CalendarIcon className="w-5 h-5 text-coral-500" />
                                Schedule
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <Label>Select Date</Label>
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    className="rounded-md border shadow"
                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                    modifiers={{
                                        closed: (date) => {
                                            if (!weeklySchedule) return false;
                                            const dayName = format(date, 'EEEE');
                                            const config = weeklySchedule[dayName];
                                            return !!(config && String(config.isOpen) !== 'true');
                                        }
                                    }}
                                    modifiersClassNames={{
                                        closed: "opacity-40 text-muted-foreground bg-gray-50/50"
                                    }}
                                />
                            </div>
                            <div className="space-y-4">
                                <Label className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Available Time Slots
                                </Label>
                                {timeSlots.length === 0 && (
                                    <div className="py-8 px-4 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-gray-500 font-medium text-sm">Closed for the day</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-3 gap-2">
                                    {timeSlots.filter(time => !isSlotInPast(time)).map((time) => (
                                        <Button
                                            key={time}
                                            type="button"
                                            variant={selectedTime === time ? "default" : "outline"}
                                            onClick={() => setSelectedTime(time)}
                                            className={cn(
                                                "border-gray-200 hover:border-coral-300 hover:bg-coral-50 transition-all",
                                                selectedTime === time && "gradient-coral text-white border-transparent"
                                            )}
                                        >
                                            {time}
                                        </Button>
                                    ))}
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-sm text-gray-500">
                                        Selected: <span className="font-semibold text-gray-800">
                                            {date ? format(date, 'PPP') : 'No date selected'}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </div>
    );
}
