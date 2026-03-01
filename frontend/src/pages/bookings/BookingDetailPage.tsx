import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    ChevronLeft, Calendar, Clock, User, Sparkles,
    MapPin, CreditCard, CheckCircle, MessageSquare,
    Printer, Edit, Trash2, MoreHorizontal, Mail,
    QrCode, Phone
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { bookingService, type Booking } from '@/services/bookingService';
import { Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const bookingStatuses = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-500' },
    { value: 'completed', label: 'Completed', color: 'bg-green-500' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
];

export function BookingDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchBooking = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            const data = await bookingService.getBookingById(parseInt(id));
            setBooking(data);
        } catch (error) {
            toast.error('Failed to load booking details');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchBooking();
    }, [fetchBooking]);

    const handleStatusUpdate = async (newStatus: string) => {
        if (!booking) return;
        try {
            await bookingService.updateStatus(booking.id, newStatus);
            toast.success(`Booking status updated to ${newStatus}`);
            fetchBooking();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                <p className="text-gray-500 mt-4">Loading booking details...</p>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <p className="text-gray-500 font-display text-xl">Booking not found</p>
                <Button onClick={() => navigate('/admin/bookings')} variant="outline">Back to Bookings</Button>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        const statusConfig = bookingStatuses.find(s => s.value === status);
        return (
            <Badge className={cn('text-white px-3 py-1 capitalize', statusConfig?.color || 'bg-gray-400')}>
                {statusConfig?.label || status}
            </Badge>
        );
    };

    const generateInvoice = () => {
        if (!booking) return;
        const doc = new jsPDF() as any;
        const brandColor: [number, number, number] = [99, 102, 241]; // Indigo-500
        const accentColor = [168, 85, 247]; // Purple-500

        // Background decorative shapes
        doc.setFillColor(249, 250, 251);
        doc.rect(0, 0, 210, 297, 'F');

        doc.setDrawColor(brandColor[0], brandColor[1], brandColor[2]);
        doc.setLineWidth(0.5);
        doc.line(14, 45, 196, 45);

        // Header
        doc.setFontSize(24);
        doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
        doc.text('SPARKLE', 14, 25);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('BEAUTY LOUNGE', 14, 32);

        // Right side info
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('123 Wellness Blvd, Spa City', 196, 25, { align: 'right' });
        doc.text('contact@sparklebeauty.com', 196, 30, { align: 'right' });
        doc.text('+1 (555) 999-8888', 196, 35, { align: 'right' });

        // Bill to
        doc.setFontSize(14);
        doc.setTextColor(31, 41, 55);
        doc.text('APPOINTMENT INVOICE', 14, 60);

        doc.setFontSize(10);
        doc.setTextColor(107, 114, 128);
        doc.text('BILL TO:', 14, 75);

        doc.setFontSize(12);
        doc.setTextColor(31, 41, 55);
        doc.text(`${booking.customer?.firstName} ${booking.customer?.lastName}`, 14, 82);
        doc.setFontSize(10);
        doc.setTextColor(75, 85, 99);
        doc.text(booking.customer?.email || '', 14, 88);
        doc.text(booking.customer?.phone || '', 14, 93);

        // Ref info
        doc.setFontSize(10);
        doc.text(`Reference: ${booking.bookingNumber || `APT-${booking.id}`}`, 196, 75, { align: 'right' });
        doc.text(`Booking Date: ${booking.bookingDate}`, 196, 82, { align: 'right' });
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 196, 88, { align: 'right' });

        // Service Table
        autoTable(doc, {
            startY: 110,
            head: [['DESCRIPTION', 'DATE & TIME', 'TOTAL']],
            body: [
                [
                    {
                        content: booking.package
                            ? `${booking.package.name} (Package)\n${booking.package.description || ''}`
                            : `${booking.service?.name || 'Treatment'}\n${booking.service?.description || ''}`,
                        styles: { textColor: [31, 41, 55] }
                    },
                    `${booking.bookingDate}\nat ${booking.startTime}`,
                    `$${booking.totalAmount ?? booking.totalPrice}`
                ]
            ],
            styles: {
                fontSize: 10,
                cellPadding: 8,
            },
            headStyles: {
                fillColor: brandColor,
                textColor: [255, 255, 255],
                fontStyle: 'bold',
            },
            alternateRowStyles: {
                fillColor: [249, 250, 251],
            },
            margin: { left: 14, right: 14 },
        });

        // Totals section
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.setTextColor(100);

        doc.text('Subtotal:', 140, finalY);
        doc.text(`$${Number(booking.totalPrice || 0).toFixed(2)}`, 196, finalY, { align: 'right' });

        let currentY = finalY + 6;
        if (booking.taxes && booking.taxes.length > 0) {
            booking.taxes.forEach(tax => {
                doc.text(`${tax.name} (${tax.rate}%):`, 140, currentY);
                doc.text(`$${Number(tax.amount || 0).toFixed(2)}`, 196, currentY, { align: 'right' });
                currentY += 6;
            });
        }

        doc.setDrawColor(229, 231, 235);
        doc.line(130, currentY - 2, 196, currentY - 2);
        currentY += 8;

        doc.setFontSize(12);
        doc.setTextColor(31, 41, 55);
        doc.text('TOTAL AMOUNT', 140, currentY);
        doc.setFontSize(16);
        doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
        doc.text(`$${Number(booking.totalAmount || 0).toFixed(2)}`, 196, currentY, { align: 'right' });

        // QR Code Placeholder or mention
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175);
        doc.text('Show the QR code from your confirmation email for fast check-in.', 105, 275, { align: 'center' });
        doc.text('Thank you for choosing Sparkle!', 105, 282, { align: 'center' });

        doc.save(`Invoice_${booking.bookingNumber || booking.id}.pdf`);
        toast.success('Professional invoice generated');
    };

    const handleAction = async (action: string) => {
        if (action === 'Complete') handleStatusUpdate('completed');
        else if (action === 'Cancel') handleStatusUpdate('cancelled');
        else if (action === 'Print') generateInvoice();
        else if (action === 'Resend') {
            try {
                if (!booking) return;
                await bookingService.resendConfirmation(booking.id);
                toast.success('Confirmation email sent');
            } catch {
                toast.error('Failed to resend confirmation');
            }
        }
        else toast.info(`Action "${action}" triggered`);
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-display font-bold text-gray-800">
                                {booking.bookingNumber || `APT-${booking.id}`}
                            </h1>
                            {getStatusBadge(booking.status)}
                        </div>
                        <p className="text-gray-500 mt-1">
                            Booked on {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'Unknown Date'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-indigo-200 hover:bg-indigo-50" onClick={() => handleAction('Print')}>
                        <Printer className="w-4 h-4 mr-2" />
                        Print
                    </Button>
                    <EditBookingDialog booking={booking} onUpdated={fetchBooking} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-0 shadow-soft overflow-hidden">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                            <CardTitle className="text-lg font-semibold">Appointment Details</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-coral-50 flex items-center justify-center flex-shrink-0 text-coral-500">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Date</p>
                                            <p className="text-lg font-semibold text-gray-800">
                                                {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'Date TBD'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-coral-50 flex items-center justify-center flex-shrink-0 text-coral-500">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Time</p>
                                            <p className="text-lg font-semibold text-gray-800">
                                                {booking.startTime} - {booking.endTime} ({booking.totalDuration || booking.service?.durationMinutes || 0} min)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-coral-50 flex items-center justify-center flex-shrink-0 text-coral-500">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Location</p>
                                            <p className="text-lg font-semibold text-gray-800">
                                                {(booking as any).room?.name
                                                    ? (booking as any).room.name
                                                    : booking.roomId
                                                        ? `Room #${booking.roomId}`
                                                        : 'Main Treatment Area'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-coral-50 flex items-center justify-center flex-shrink-0 text-coral-500">
                                            <Sparkles className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Provider</p>
                                            <p className="text-lg font-semibold text-gray-800">
                                                {booking.therapist
                                                    ? `${(booking.therapist as any).firstName ?? ''} ${(booking.therapist as any).lastName ?? ''}`.trim() || 'Staff Member'
                                                    : 'Assigning Staff...'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-gray-100" />

                            <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Services</p>
                                <div className="p-4 rounded-xl border border-gray-100 hover:border-coral-200 transition-colors bg-gray-50/30">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center text-white">
                                                <Sparkles className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">
                                                    {booking.package ? (
                                                        <span className="flex items-center gap-1.5 text-indigo-700">
                                                            <span className="w-2 h-2 rounded-full bg-indigo-500" />
                                                            {booking.package.name} (Package)
                                                        </span>
                                                    ) : (booking.service?.name || 'Treatment')}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {booking.package ? booking.package.duration : `${booking.service?.durationMinutes || 0} min`}
                                                    {booking.package ? (booking.package.description ? ` • ${booking.package.description}` : '') : ((booking.service as any)?.description ? ` • ${(booking.service as any).description}` : '')}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="font-bold text-lg text-indigo-600">${booking.totalPrice}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Internal Notes</p>
                                <div className="p-4 rounded-xl bg-yellow-50/50 border border-yellow-100 italic text-gray-600">
                                    {(booking as any).notes || (booking as any).internalNotes || (
                                        <span className="opacity-50">No internal notes for this booking.</span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment History */}
                    <Card className="border-0 shadow-soft">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Payment Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>${Number(booking.totalPrice || 0).toFixed(2)}</span>
                                </div>
                                {booking.taxes && booking.taxes.map((tax, idx) => (
                                    <div key={idx} className="flex justify-between text-gray-600">
                                        <span>{tax.name} ({tax.rate}%)</span>
                                        <span>${Number(tax.amount || 0).toFixed(2)}</span>
                                    </div>
                                ))}
                                {!booking.taxes && (
                                    <div className="flex justify-between text-gray-600">
                                        <span>Tax (0%)</span>
                                        <span>$0.00</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-gray-600">
                                    <span>Discount</span>
                                    <span className="text-green-600">-$0.00</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center py-2 text-xl font-bold text-gray-800">
                                    <span>Total Amount</span>
                                    <span>${Number(booking.totalAmount || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-800 uppercase">Payment Status</p>
                                            <p className="text-xs text-gray-500">
                                                {booking.paymentStatus === 'paid' ? 'Processed via Gateway' : 'Awaiting Payment'}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className={cn(
                                        "capitalize",
                                        booking.paymentStatus === 'paid' && 'bg-green-100 text-green-600',
                                        booking.paymentStatus === 'pending' && 'bg-yellow-100 text-yellow-600',
                                        booking.paymentStatus === 'partial' && 'bg-orange-100 text-orange-600',
                                    )}>
                                        {booking.paymentStatus || 'Pending'}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* QR Code Verification */}
                    <Card className="border-0 shadow-soft bg-gradient-to-br from-indigo-50 to-white">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <QrCode className="w-5 h-5 text-indigo-500" />
                                Appointment Check-in QR
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-indigo-100">
                                <QRCodeSVG
                                    value={JSON.stringify({
                                        bookingId: booking.id,
                                        bookingNumber: booking.bookingNumber || `B-${booking.id}`,
                                        customer: `${booking.customer?.firstName} ${booking.customer?.lastName}`,
                                        date: booking.bookingDate,
                                        verifyUrl: `${window.location.origin}/admin/bookings/verify/${booking.id}`
                                    })}
                                    size={180}
                                    level="H"
                                    includeMargin={true}
                                />
                            </div>
                            <p className="text-sm text-gray-500 text-center max-w-[250px]">
                                Ask the receptionist to scan this QR code for instant check-in on arrival.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Customer Card */}
                    <Card className="border-0 shadow-soft overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6]" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-semibold">Customer info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-14 h-14 rounded-full border-2 border-indigo-100 overflow-hidden shadow-sm">
                                    <img
                                        src={booking.customer?.avatar || `https://ui-avatars.com/api/?name=${booking.customer?.firstName}+${booking.customer?.lastName}&background=6366f1&color=fff`}
                                        alt="avatar"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">{booking.customer?.firstName} {booking.customer?.lastName}</h3>
                                    <Badge className="bg-indigo-100 text-indigo-700 border-0">VIP Member</Badge>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">{booking.customer?.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">{booking.customer?.phone || 'No phone provided'}</span>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full border-indigo-100 text-indigo-600 hover:bg-indigo-50" asChild>
                                <Link to={`/admin/customers/${booking.customerId}`}>View Full Profile</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="border-0 shadow-soft">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Management</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full justify-start hover:bg-green-50 hover:text-green-600 hover:border-green-200" onClick={() => handleAction('Complete')}>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Mark as Completed
                            </Button>
                            <Button variant="outline" className="w-full justify-start hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200" onClick={() => handleAction('Resend')}>
                                <Mail className="w-4 h-4 mr-2" />
                                Resend Confirmation
                            </Button>
                            <Button variant="outline" className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-700 hover:border-red-200" onClick={() => handleAction('Cancel')}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Cancel Appointment
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function EditBookingDialog({ booking, onUpdated }: { booking: Booking, onUpdated: () => void }) {
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(booking.status);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            await bookingService.updateBooking(booking.id, { status });
            toast.success('Booking updated successfully');
            setOpen(false);
            onUpdated();
        } catch {
            toast.error('Failed to update booking');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:opacity-90 text-white shadow-md shadow-blue-500/20">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Booking
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Booking</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                            <SelectTrigger id="status">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
