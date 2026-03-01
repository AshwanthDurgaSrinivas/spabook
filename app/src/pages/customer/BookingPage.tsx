
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { serviceService } from '@/services/serviceService';
import type { Service } from '@/services/serviceService';
import { bookingService } from '@/services/bookingService';
import { toast } from 'sonner';
import { Loader2, CheckCircle, Calendar as CalendarIcon, Clock, ChevronRight, ChevronLeft, DoorOpen, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isToday, addDays } from 'date-fns';
import { useRazorpay } from '@/hooks/useRazorpay';
import { authService } from '@/services/authService';
import { settingsService } from '@/services/settingsService';
import { membershipService, type CustomerMembership } from '@/services/membershipService';
import { taxService, type Tax } from '@/services/taxService';
import { packageService, type SpaPackage } from '@/services/packageService';
import { marketingService, type Coupon } from '@/services/marketingService';
import { loyaltyService, type CustomerLoyalty } from '@/services/loyaltyService';

export function BookingPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preSelectedServiceId = searchParams.get('serviceId') || searchParams.get('service');
    const preSelectedPackageId = searchParams.get('packageId') || searchParams.get('package');
    const { initPayment, loading: paymentLoading } = useRazorpay();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [services, setServices] = useState<Service[]>([]);
    const [existingBookings, setExistingBookings] = useState<any[]>([]); // customer's own bookings
    const [availabilityData, setAvailabilityData] = useState<{ capacity: number; slotCounts: Record<string, number>; blockedRooms?: number } | null>(null);
    const [assignedRoom, setAssignedRoom] = useState<{ id: number; name: string } | null>(null);
    const [activeMembership, setActiveMembership] = useState<CustomerMembership | null>(null);
    const [packages, setPackages] = useState<SpaPackage[]>([]);
    const [selectedPackageId, setSelectedPackageId] = useState<number | null>(
        preSelectedPackageId && !isNaN(parseInt(preSelectedPackageId))
            ? parseInt(preSelectedPackageId)
            : null
    );

    // Selection State
    const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
        preSelectedServiceId && !isNaN(parseInt(preSelectedServiceId))
            ? parseInt(preSelectedServiceId)
            : null
    );
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [paymentGateway, setPaymentGateway] = useState<string>('Razorpay');
    const [taxes, setTaxes] = useState<Tax[]>([]);
    const [currency, setCurrency] = useState<string>('USD');
    const [allowSameDay, setAllowSameDay] = useState(true);
    const [weeklySchedule, setWeeklySchedule] = useState<any>(null);
    const [timeSlots, setTimeSlots] = useState<string[]>([]);

    // Coupon State
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<{ discount: number; coupon: Coupon } | null>(null);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [couponError, setCouponError] = useState('');
    const [allowDiscountCombination, setAllowDiscountCombination] = useState(false);

    // Loyalty State
    const [customerLoyalty, setCustomerLoyalty] = useState<CustomerLoyalty | null>(null);
    const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
    const [loyaltyRedeemRatio, setLoyaltyRedeemRatio] = useState(0.1);
    const [loyaltyMinBill, setLoyaltyMinBill] = useState(50);
    const [allowCouponLoyaltyCombination, setAllowCouponLoyaltyCombination] = useState(true);
    const [payAtStoreEnabled, setPayAtStoreEnabled] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'online' | 'store'>('online');

    useEffect(() => {
        const fetchSettingsAndTaxes = async () => {
            try {
                const settings = await settingsService.getPublicSettings();
                const gateway = settings['default_payment_gateway'];
                if (gateway) setPaymentGateway(gateway);
                const curr = settings['currency'];
                if (curr) setCurrency(curr);

                const allowSameDaySetting = settings['allow_same_day_booking'];
                const canBookToday = String(allowSameDaySetting) === 'true';
                setAllowSameDay(canBookToday);

                const scheduleVal = settings['weekly_schedule'];
                if (scheduleVal) {
                    try {
                        setWeeklySchedule(typeof scheduleVal === 'string' ? JSON.parse(scheduleVal) : scheduleVal);
                    } catch (e) {
                        console.error("Error parsing weekly_schedule in BookingPage");
                    }
                }

                setAllowDiscountCombination(String(settings['allow_discount_combination']) === 'true');
                setAllowCouponLoyaltyCombination(String(settings['allow_coupon_loyalty_combination'] ?? 'true') === 'true');
                if (settings['loyalty_points_redeem_ratio']) setLoyaltyRedeemRatio(parseFloat(String(settings['loyalty_points_redeem_ratio'])));
                if (settings['loyalty_min_bill_redemption']) setLoyaltyMinBill(parseFloat(String(settings['loyalty_min_bill_redemption'])));
                setPayAtStoreEnabled(String(settings['allow_pay_at_venue'] ?? 'false') === 'true');

                if (!canBookToday && isToday(new Date())) {
                    setSelectedDate(prev => (prev && isToday(prev) ? addDays(new Date(), 1) : prev));
                }

                const activeTaxes = await taxService.getPublicTaxes();
                setTaxes(activeTaxes);

                // Fetch customer loyalty if logged in
                const user = authService.getCurrentUser();
                if (user) {
                    try {
                        const loyalty = await loyaltyService.getMyLoyalty();
                        setCustomerLoyalty(loyalty);
                    } catch (e) {
                        console.error("Failed to fetch loyalty points", e);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch settings/taxes', error);
            }
        };
        fetchSettingsAndTaxes();
    }, []);

    useEffect(() => {
        if (!selectedDate || !weeklySchedule) return;
        const dayName = format(selectedDate, 'EEEE'); // 'Monday', 'Tuesday', etc.
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
    }, [selectedDate, weeklySchedule]);

    // Fetch real capacity/slot-count data whenever service or date changes (step 2)
    useEffect(() => {
        if ((!selectedServiceId && !selectedPackageId) || !selectedDate) return;
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        bookingService.getAvailability(
            (selectedPackageId || selectedServiceId) as number,
            dateStr,
            !!selectedPackageId
        )
            .then(data => setAvailabilityData(data))
            .catch(() => setAvailabilityData(null)); // backend will enforce anyway
    }, [selectedServiceId, selectedPackageId, selectedDate]);

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

    // Compute slot availability using the real API data
    const getSlotInfo = (time: string) => {
        const itemDuration = selectedPackageId
            ? parseDurationStr(selectedPackage?.duration)
            : (selectedService?.durationMinutes ?? 60);

        const [startH, startM] = time.split(':').map(Number);
        const startMins = startH * 60 + startM;
        const endMins = startMins + itemDuration;

        const cap = availabilityData?.capacity ?? ((selectedItem as any)?.capacity ?? 1);

        // A slot is "full" if ANY hourly block it covers is already at capacity
        let maxTaken = 0;
        for (let h = 0; h < 24; h++) {
            const slotStart = h * 60;
            const slotEnd = (h + 1) * 60;
            // Does this hourly slot overlap with our proposed booking duration?
            if (startMins < slotEnd && endMins > slotStart) {
                const slotKey = `${h.toString().padStart(2, '0')}:00`;
                const takenAtSlot = availabilityData?.slotCounts?.[slotKey] ?? 0;
                maxTaken = Math.max(maxTaken, takenAtSlot);
            }
        }

        // Check if THIS customer already has one (from own bookings list)
        const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
        const currentUser = authService.getCurrentUser();
        const yourBooking = currentUser ? existingBookings.some(b =>
            (selectedPackageId ? b.packageId === selectedPackageId : b.serviceId === selectedServiceId) &&
            b.bookingDate === dateStr &&
            b.startTime === time &&
            !['cancelled', 'completed'].includes(b.status)
        ) : false;

        const dateBlocked = (availabilityData?.blockedRooms ?? 0) > 0 && cap === 0;
        return { full: maxTaken >= cap || cap === 0, yourBooking, taken: maxTaken, capacity: cap, dateBlocked };
    };

    const isSlotInPast = (time: string) => {
        if (!selectedDate) return false;
        if (!isToday(selectedDate)) return false;

        const [hours, minutes] = time.split(':').map(Number);
        const now = new Date();
        const slotTime = new Date(selectedDate);
        slotTime.setHours(hours, minutes, 0, 0);

        return slotTime < now;
    };

    // Load customer's own bookings for 'Already Booked' labelling
    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) return;
        bookingService.getBookings()
            .then(data => setExistingBookings(data))
            .catch(() => { }); // non-critical, backend will enforce anyway
    }, []);

    useEffect(() => {
        const fetchServicesAndPackages = async () => {
            try {
                const [serviceData, packageData] = await Promise.all([
                    serviceService.getServices(),
                    packageService.getPackages()
                ]);
                setServices(serviceData);
                setPackages(packageData);

                // If service ID passed in URL, validate it exists
                if (preSelectedServiceId) {
                    const id = parseInt(preSelectedServiceId);
                    if (serviceData.some(s => s.id === id)) {
                        setSelectedServiceId(id);
                        setSelectedPackageId(null);
                        setStep(2);
                    }
                } else if (preSelectedPackageId) {
                    const id = parseInt(preSelectedPackageId);
                    if (packageData.some(p => p.id === id)) {
                        setSelectedPackageId(id);
                        setSelectedServiceId(null);
                        setStep(2);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch services/packages', error);
                toast.error('Failed to load options');
            } finally {
                setLoading(false);
            }
        };
        fetchServicesAndPackages();
    }, [preSelectedServiceId, searchParams]);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) return;

        membershipService.getMyMembership()
            .then(data => {
                if (data && data.status === 'active') {
                    setActiveMembership(data);
                }
            })
            .catch(() => { });
    }, []);

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setIsApplyingCoupon(true);
        setCouponError('');
        try {
            const base = parseFloat(String((selectedItem as any)?.price ?? (selectedItem as any)?.basePrice ?? 0));
            const response = await marketingService.validateCoupon(couponCode, base);
            if (response.valid) {
                setAppliedCoupon({ discount: response.discount, coupon: response.coupon });
                setCouponCode('');
                toast.success('Coupon applied successfully!');
            }
        } catch (error: any) {
            setCouponError(error.response?.data?.message || 'Invalid coupon');
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const handleNext = async () => {
        if (step === 3) {
            // Submit Booking
            if ((!selectedServiceId && !selectedPackageId) || !selectedDate || !selectedTime) {
                toast.error('Missing booking details');
                return;
            }

            const currentUser = authService.getCurrentUser();
            if (!currentUser) {
                toast.error('Please login to continue');
                navigate('/login');
                return;
            }

            // ── Frontend duplicate guard ──────────────────────────────────────
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const duplicate = existingBookings.find(b =>
                (selectedPackageId ? b.packageId === selectedPackageId : b.serviceId === selectedServiceId) &&
                b.bookingDate === dateStr &&
                b.startTime === selectedTime &&
                !['cancelled', 'completed'].includes(b.status)
            );
            if (duplicate) {
                toast.error(`You already have a booking for this ${selectedPackageId ? 'package' : 'service'} at the selected date and time.`);
                return;
            }
            // ─────────────────────────────────────────────────────────────────

            setSubmitting(true);
            try {
                const finalPaymentMethod = paymentMethod; // Capture current state early

                // 1. Create the booking — the backend auto-assigns a room
                const result = await bookingService.createBooking({
                    serviceId: selectedServiceId,
                    packageId: selectedPackageId,
                    bookingDate: format(selectedDate, 'yyyy-MM-dd'),
                    startTime: selectedTime,
                    couponCode: appliedCoupon?.coupon.code,
                    useLoyaltyPoints: useLoyaltyPoints,
                    paymentMethod: finalPaymentMethod
                }) as any;

                const booking = result.booking || result;

                // Capture assigned room info if the backend returned it
                if (booking.roomId) {
                    // Fetch room name via the rooms API for display
                    try {
                        const { default: api } = await import('@/lib/api');
                        const roomRes = await api.get(`/rooms/${booking.roomId}`);
                        setAssignedRoom({ id: roomRes.data.id, name: roomRes.data.name });
                    } catch { /* non-critical */ }
                }

                // 2. Process Payment based on method
                if (finalPaymentMethod === 'store') {
                    toast.success('Booking successful! Please pay at the store.');
                    setStep(4);
                    return; // Stop further execution
                }

                // Initialize Online Payment
                const selectedItem = selectedPackageId
                    ? packages.find(p => p.id === selectedPackageId)
                    : services.find(s => s.id === selectedServiceId);

                if (!selectedItem) throw new Error('Selection not found');

                if (paymentGateway === 'Razorpay') {
                    toast.info('Initializing secure payment gateway...');
                    const success = await initPayment({
                        id: booking.id,
                        amount: parseFloat(String(booking.totalAmount || booking.totalPrice || (selectedPackageId ? (selectedItem as any).price : (selectedItem as any).basePrice))),
                        customerName: `${currentUser.firstName} ${currentUser.lastName}`,
                        customerEmail: currentUser.email,
                        currency: currency,
                        type: 'booking'
                    });

                    if (success) {
                        setStep(4);
                        toast.success('Booking confirmed successfully!');
                    } else {
                        // Payment failed or was cancelled by user
                        try {
                            await bookingService.updateStatus(booking.id, 'cancelled');
                            toast.error('Payment cancelled. The booking has been removed.');
                        } catch (cancelError) {
                            console.error('Failed to auto-cancel booking', cancelError);
                            toast.error('Payment was not completed. Your booking is pending payment.');
                        }
                        navigate('/customer/appointments');
                    }
                } else {
                    // Fallback for other gateways
                    toast.success('Booking request sent! Please complete payment at the venue.');
                    setStep(4);
                }
            } catch (error: any) {
                console.error('Booking failed', error);
                const backendError = error.response?.data;
                const message = backendError?.message || 'Failed to create booking. Please try again.';

                let details = '';
                if (backendError?.details) {
                    if (Array.isArray(backendError.details)) {
                        details = `: ${backendError.details.join(', ')}`;
                    } else if (typeof backendError.details === 'string') {
                        details = `: ${backendError.details}`;
                    } else {
                        details = `: ${JSON.stringify(backendError.details)}`;
                    }
                }

                const stack = backendError?.error ? ` (${backendError.error})` : '';

                toast.error(`${message}${details}${stack}`);

                // If duplicate detected by backend, go back to time selection
                if (error.response?.status === 409) {
                    setStep(2);
                }
            } finally {
                setSubmitting(false);
            }
        } else {
            // Validation
            if (step === 1 && !selectedServiceId && !selectedPackageId) {
                toast.error('Please select a service or package');
                return;
            }
            if (step === 2 && (!selectedDate || !selectedTime)) {
                toast.error('Please select date and time');
                return;
            }
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const selectedService = services.find(s => s.id === selectedServiceId);
    const selectedPackage = packages.find(p => p.id === selectedPackageId);
    const selectedItem = selectedPackage || selectedService;

    if (loading) {
        return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Book Appointment</h1>
                <p className="text-gray-500 mt-2">Schedule your next relaxation session</p>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-4 mt-6">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center">
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center font-medium transition-colors",
                                step >= s ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"
                            )}>
                                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                            </div>
                            {s < 3 && <div className={cn("w-12 h-1 bg-gray-200 ml-4", step > s && "bg-indigo-600")} />}
                        </div>
                    ))}
                </div>
                <div className="flex justify-between w-64 mx-auto mt-2 text-xs text-gray-500 font-medium">
                    <span>Service</span>
                    <span>Date & Time</span>
                    <span>Confirm</span>
                </div>
            </div>

            <Card className="border-0 shadow-lg overflow-hidden">
                <CardContent className="p-0">
                    {step === 4 ? (
                        <div className="p-12 text-center space-y-6">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Booking Confirmed!</h2>
                            <p className="text-gray-500 max-w-md mx-auto">
                                Your appointment for <strong>{selectedItem?.name}</strong> has been successfully booked for <strong>{selectedDate && format(selectedDate, 'MMM dd, yyyy')}</strong> at <strong>{selectedTime}</strong>.
                            </p>
                            <div className="flex justify-center gap-4 mt-8">
                                <Button variant="outline" onClick={() => navigate('/customer/appointments')}>View My Bookings</Button>
                                <Button onClick={() => {
                                    setStep(1);
                                    setSelectedServiceId(null);
                                    setSelectedDate(new Date());
                                    setSelectedTime(null);
                                }}>Book Another</Button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 md:p-8">
                            {step === 1 && (
                                <div className="space-y-4">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">Select a Service or Package</h2>

                                    {packages.length > 0 && (
                                        <div className="space-y-3 mb-8">
                                            <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Special Packages</h3>
                                            <div className="grid gap-3">
                                                {packages.filter(p => p.isActive).map((pkg) => (
                                                    <div
                                                        key={`pkg-${pkg.id}`}
                                                        onClick={() => {
                                                            setSelectedPackageId(pkg.id);
                                                            setSelectedServiceId(null);
                                                        }}
                                                        className={cn(
                                                            "p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md flex items-center justify-between group",
                                                            selectedPackageId === pkg.id
                                                                ? "border-indigo-600 bg-indigo-50"
                                                                : "border-gray-100 hover:border-indigo-200 bg-white"
                                                        )}
                                                    >
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                                                                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">PACKAGE</span>
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{pkg.description}</p>
                                                            <p className="text-sm text-indigo-600 font-medium mt-1">{pkg.duration}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="font-bold text-gray-900 text-lg">${pkg.price}</span>
                                                            {pkg.originalPrice && (
                                                                <p className="text-xs text-gray-400 line-through">${pkg.originalPrice}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Individual Services</h3>
                                        <div className="grid gap-3">
                                            {services.map((service) => (
                                                <div
                                                    key={service.id}
                                                    onClick={() => {
                                                        setSelectedServiceId(service.id);
                                                        setSelectedPackageId(null);
                                                    }}
                                                    className={cn(
                                                        "p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md flex items-center justify-between",
                                                        selectedServiceId === service.id
                                                            ? "border-indigo-600 bg-indigo-50"
                                                            : "border-gray-100 hover:border-indigo-200 bg-white"
                                                    )}
                                                >
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">{service.name}</h3>
                                                        <p className="text-sm text-gray-500">{service.durationMinutes} mins</p>
                                                    </div>
                                                    <span className="font-bold text-gray-900">${service.basePrice}</span>
                                                </div>
                                            ))}
                                            {services.length === 0 && packages.length === 0 && (
                                                <p className="text-center text-gray-500 py-8">No services available.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">Choose Date & Time</h2>
                                    <div className="flex flex-col md:flex-row gap-8">
                                        <div className="flex-1">
                                            <Calendar
                                                mode="single"
                                                selected={selectedDate}
                                                onSelect={setSelectedDate}
                                                className="rounded-md border mx-auto"
                                                disabled={(date) => {
                                                    const today = new Date(new Date().setHours(0, 0, 0, 0));
                                                    if (!allowSameDay && date <= today) return true;
                                                    return date < today;
                                                }}
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
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                                                <Clock className="w-4 h-4" /> Available Slots
                                            </h3>
                                            {/* Blocked-date banner */}
                                            {availabilityData?.blockedRooms && availabilityData.capacity === 0 && (
                                                <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                                                    <span className="text-base">🚫</span>
                                                    <span><strong>Unavailable:</strong> This date is blocked. Please select a different date.</span>
                                                </div>
                                            )}
                                            {timeSlots.length === 0 && (
                                                <div className="py-8 px-4 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                    <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                                    <p className="text-gray-500 font-medium">Closed for the day</p>
                                                    <p className="text-xs text-gray-400 mt-1">Please select another date</p>
                                                </div>
                                            )}
                                            <div className="grid grid-cols-3 gap-2">
                                                {timeSlots.filter(time => !isSlotInPast(time)).map((time) => {
                                                    const slotInfo = getSlotInfo(time);
                                                    const isDisabled = slotInfo.full || slotInfo.yourBooking;
                                                    return (
                                                        <div key={time} className="flex flex-col items-center gap-1">
                                                            <Button
                                                                variant={selectedTime === time ? "default" : "outline"}
                                                                size="sm"
                                                                disabled={isDisabled}
                                                                onClick={() => !isDisabled && setSelectedTime(time)}
                                                                className={cn(
                                                                    "w-full",
                                                                    selectedTime === time && "bg-indigo-600 hover:bg-indigo-700",
                                                                    isDisabled && "opacity-50 cursor-not-allowed"
                                                                )}
                                                            >
                                                                {selectedTime === time && selectedItem ? (
                                                                    <span className="text-[10px] leading-tight">
                                                                        {time} - {(() => {
                                                                            const mins = selectedPackageId ? parseDurationStr(selectedPackage?.duration) : (selectedService?.durationMinutes ?? 0);
                                                                            const [h, m] = time.split(':').map(Number);
                                                                            const d = new Date();
                                                                            d.setHours(h);
                                                                            d.setMinutes(m + mins);
                                                                            return format(d, 'HH:mm');
                                                                        })()}
                                                                    </span>
                                                                ) : time}
                                                            </Button>
                                                            {slotInfo.yourBooking ? (
                                                                <span className="text-[10px] text-amber-600 font-medium">Already Booked</span>
                                                            ) : slotInfo.dateBlocked ? (
                                                                <span className="text-[10px] text-red-600 font-medium">Unavailable</span>
                                                            ) : slotInfo.full ? (
                                                                <span className="text-[10px] text-red-500 font-medium">Full</span>
                                                            ) : slotInfo.capacity > 1 ? (
                                                                <span className="text-[10px] text-green-600 font-medium">
                                                                    {slotInfo.capacity - slotInfo.taken} spot{slotInfo.capacity - slotInfo.taken !== 1 ? 's' : ''} left
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Your Booking</h2>

                                    <div className="bg-indigo-50/50 p-6 rounded-2xl space-y-4 border border-indigo-100">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                                                <CalendarIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 font-medium">Date & Time</p>
                                                <p className="font-semibold text-gray-900">
                                                    {selectedDate && format(selectedDate, 'EEEE, MMMM do, yyyy')}
                                                </p>
                                                <p className="text-gray-600">
                                                    {selectedTime} - {(() => {
                                                        const mins = selectedPackageId ? parseDurationStr(selectedPackage?.duration) : (selectedService?.durationMinutes ?? 0);
                                                        const [h, m] = selectedTime?.split(':').map(Number) || [0, 0];
                                                        const d = new Date();
                                                        d.setHours(h);
                                                        d.setMinutes(m + mins);
                                                        return format(d, 'HH:mm');
                                                    })()}
                                                    <span className="ml-2 text-xs text-gray-400">
                                                        ({selectedPackageId ? selectedPackage?.duration : `${selectedService?.durationMinutes} mins`})
                                                    </span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                                                <CheckCircle className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-500 font-medium">{selectedPackageId ? 'Package' : 'Service'}</p>
                                                <p className="font-semibold text-gray-900">{selectedItem?.name}</p>

                                                {selectedPackageId && selectedPackage && (
                                                    <div className="mt-2 space-y-2">
                                                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Service Breakdown:</p>
                                                        {(() => {
                                                            let currentStartTime = selectedTime || "00:00";
                                                            return services.filter(s => selectedPackage.serviceIds?.includes(s.id)).map((s, idx) => {
                                                                const start = currentStartTime;
                                                                const [h, m] = start.split(':').map(Number);
                                                                const d = new Date();
                                                                d.setHours(h);
                                                                d.setMinutes(m + s.durationMinutes);
                                                                const end = format(d, 'HH:mm');
                                                                currentStartTime = end;
                                                                return (
                                                                    <div key={s.id} className="flex justify-between items-center bg-white/50 p-2 rounded-lg border border-indigo-100/50">
                                                                        <span className="text-sm text-gray-700">{s.name}</span>
                                                                        <span className="text-xs text-gray-500 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">
                                                                            {start} - {end}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            });
                                                        })()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="border-t border-indigo-200 mt-4 pt-4 space-y-2">
                                            {/* Coupon Input */}
                                            {/* Loyalty Points Input */}
                                            {customerLoyalty && (
                                                <div className="flex items-center justify-between p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 gap-3 mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <Gift className="w-5 h-5 text-indigo-600" />
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-900">Your Points: {customerLoyalty.currentPoints}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {useLoyaltyPoints
                                                                    ? `Redeeming points for $${(Math.min(customerLoyalty.currentPoints, Math.floor(parseFloat(String((selectedItem as any)?.price ?? (selectedItem as any)?.basePrice ?? 0)) / loyaltyRedeemRatio)) * loyaltyRedeemRatio).toFixed(2)}`
                                                                    : `Use points for discount (Min. $${loyaltyMinBill})`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant={useLoyaltyPoints ? "outline" : "secondary"}
                                                        size="sm"
                                                        className="h-8 shrink-0"
                                                        disabled={
                                                            parseFloat(String((selectedItem as any)?.price ?? (selectedItem as any)?.basePrice ?? 0)) < loyaltyMinBill ||
                                                            (!allowCouponLoyaltyCombination && !!appliedCoupon)
                                                        }
                                                        onClick={() => setUseLoyaltyPoints(!useLoyaltyPoints)}
                                                    >
                                                        {useLoyaltyPoints ? 'Cancel' : 'Use Points'}
                                                    </Button>
                                                </div>
                                            )}

                                            <div className="flex gap-2 mb-4">
                                                <Input
                                                    value={couponCode}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        setCouponCode(e.target.value.toUpperCase());
                                                        setCouponError('');
                                                    }}
                                                    placeholder="Enter coupon code"
                                                    className="uppercase text-sm h-9"
                                                    disabled={!!appliedCoupon || (!allowCouponLoyaltyCombination && useLoyaltyPoints)}
                                                />
                                                {appliedCoupon ? (
                                                    <Button variant="outline" size="sm" onClick={() => setAppliedCoupon(null)} className="h-9 text-red-500">
                                                        Remove
                                                    </Button>
                                                ) : (
                                                    <Button variant="secondary" size="sm" onClick={handleApplyCoupon} disabled={!couponCode || isApplyingCoupon} className="h-9">
                                                        {isApplyingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                                                    </Button>
                                                )}
                                            </div>
                                            {couponError && <p className="text-xs text-red-500">{couponError}</p>}
                                            {appliedCoupon && (
                                                <div className="flex justify-between items-center bg-green-50 px-2 py-1 rounded text-sm text-green-700 font-medium">
                                                    <span>Coupon Applied: {appliedCoupon.coupon.code}</span>
                                                    <span>-${appliedCoupon.discount.toFixed(2)}</span>
                                                </div>
                                            )}

                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>Subtotal</span>
                                                <span>${parseFloat(String((selectedItem as any)?.price ?? (selectedItem as any)?.basePrice ?? 0)).toFixed(2)}</span>
                                            </div>
                                            {(() => {
                                                const base = parseFloat(String((selectedItem as any)?.price ?? (selectedItem as any)?.basePrice ?? 0));
                                                let memDiscount = activeMembership ? (base * Number(activeMembership.plan?.discountPercentage || 0) / 100) : 0;
                                                let coupDiscount = appliedCoupon ? appliedCoupon.discount : 0;
                                                let loyaltyDiscount = 0;

                                                // Calculate Loyalty Discount if used
                                                if (useLoyaltyPoints && customerLoyalty) {
                                                    const maxRedeemablePoints = Math.floor(base / loyaltyRedeemRatio);
                                                    const pointsToRedeem = Math.min(customerLoyalty.currentPoints, maxRedeemablePoints);
                                                    loyaltyDiscount = pointsToRedeem * loyaltyRedeemRatio;
                                                }

                                                // Respect admin's discount combination setting (Membership & Coupon)
                                                if (!allowDiscountCombination && activeMembership && appliedCoupon) {
                                                    if (coupDiscount >= memDiscount) memDiscount = 0;
                                                    else coupDiscount = 0;
                                                }

                                                // Respect Coupon & Loyalty combination toggle
                                                if (!allowCouponLoyaltyCombination && appliedCoupon && useLoyaltyPoints) {
                                                    if (coupDiscount >= loyaltyDiscount) loyaltyDiscount = 0;
                                                    else coupDiscount = 0;
                                                }

                                                // Ensure we don't discount more than the base price
                                                const totalDiscount = Math.min(base, memDiscount + coupDiscount + loyaltyDiscount);
                                                const subtotalAfterDiscount = base - totalDiscount;

                                                let totalTax = 0;
                                                const taxLines = taxes.map(tax => {
                                                    const amount = subtotalAfterDiscount * (Number(tax.rate) / 100);
                                                    totalTax += amount;
                                                    return (
                                                        <div key={tax.id} className="flex justify-between text-sm text-gray-600">
                                                            <span>{tax.name} ({tax.rate}%)</span>
                                                            <span>${amount.toFixed(2)}</span>
                                                        </div>
                                                    );
                                                });

                                                return (
                                                    <>
                                                        {memDiscount > 0 && (
                                                            <div className="flex justify-between text-sm text-emerald-600 font-medium">
                                                                <span>Membership Discount ({activeMembership?.plan?.discountPercentage}%)</span>
                                                                <span>-${memDiscount.toFixed(2)}</span>
                                                            </div>
                                                        )}
                                                        {taxLines}
                                                        {loyaltyDiscount > 0 && (
                                                            <div className="flex justify-between text-sm text-indigo-600 font-medium italic">
                                                                <span>Loyalty Points Redeemed</span>
                                                                <span>-${loyaltyDiscount.toFixed(2)}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between items-center pt-2 border-t border-indigo-100">
                                                            <span className="font-semibold text-gray-700">Total Price</span>
                                                            <span className="text-2xl font-bold text-indigo-700">
                                                                ${(subtotalAfterDiscount + totalTax).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>

                                        {/* Payment Method Selection */}
                                        {payAtStoreEnabled && (
                                            <div className="space-y-3 mt-4">
                                                <p className="text-sm font-semibold text-gray-700">How would you like to pay?</p>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div
                                                        className={cn(
                                                            "p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-1",
                                                            paymentMethod === 'online' ? "border-indigo-600 bg-indigo-50" : "border-gray-100 hover:border-indigo-200"
                                                        )}
                                                        onClick={() => setPaymentMethod('online')}
                                                    >
                                                        <Clock className="w-5 h-5 text-indigo-600" />
                                                        <span className="text-xs font-medium">Pay Online</span>
                                                    </div>
                                                    <div
                                                        className={cn(
                                                            "p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-1",
                                                            paymentMethod === 'store' ? "border-indigo-600 bg-indigo-50" : "border-gray-100 hover:border-indigo-200"
                                                        )}
                                                        onClick={() => setPaymentMethod('store')}
                                                    >
                                                        <DoorOpen className="w-5 h-5 text-indigo-600" />
                                                        <span className="text-xs font-medium">Pay at Store</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-6 pt-6 border-t border-indigo-100">
                                            <p className="text-xs text-center text-gray-500">
                                                By confirming, you agree to our cancellation policy.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                                <Button
                                    variant="ghost"
                                    onClick={handleBack}
                                    disabled={step === 1 || submitting || paymentLoading}
                                    className={cn(step === 1 && "invisible")}
                                >
                                    <ChevronLeft className="w-4 h-4 mr-2" /> Back
                                </Button>
                                <Button
                                    onClick={handleNext}
                                    disabled={submitting || paymentLoading}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]"
                                >
                                    {(submitting || paymentLoading) ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : step === 3 ? (
                                        paymentMethod === 'online' ? 'Confirm & Pay' : 'Confirm Booking'
                                    ) : (
                                        <>Next <ChevronRight className="w-4 h-4 ml-2" /></>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
