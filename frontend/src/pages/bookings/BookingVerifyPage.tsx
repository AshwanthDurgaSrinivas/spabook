import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, Calendar, User, Sparkles, Navigation } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export function BookingVerifyPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const verify = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:5000/api/bookings/verify/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setResult(response.data.booking);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Verification failed');
            } finally {
                setLoading(false);
            }
        };

        if (id) verify();
    }, [id]);

    const handleConfirmCheckIn = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:5000/api/bookings/${id}/status`,
                { status: 'confirmed' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Check-in confirmed!');
            navigate(`/admin/bookings/${id}`);
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
                <p className="mt-4 text-gray-500 font-medium">Verifying Booking QR...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-3xl shadow-soft border border-red-100 flex flex-col items-center text-center space-y-4">
                <XCircle className="w-16 h-16 text-red-500" />
                <h1 className="text-2xl font-bold text-gray-800">Invalid QR Code</h1>
                <p className="text-gray-500">{error}</p>
                <Button variant="outline" onClick={() => navigate('/admin/bookings')} className="w-full">
                    Return to Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 py-10">
            <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-4">
                    <CheckCircle className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800">Booking Verified</h1>
                <p className="text-gray-500">Scan successful. Please confirm customer arrival.</p>
            </div>

            <Card className="border-0 shadow-lg overflow-hidden">
                <div className="h-2 bg-green-500" />
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Appointment Detail</span>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Valid</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex items-start gap-3">
                            <User className="w-5 h-5 text-gray-400 mt-1" />
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Customer</p>
                                <p className="text-lg font-semibold text-gray-800">{result.customer}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Sparkles className="w-5 h-5 text-gray-400 mt-1" />
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Service</p>
                                <p className="text-lg font-semibold text-gray-800">{result.service}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Date & Time</p>
                                <p className="text-lg font-semibold text-gray-800">
                                    {new Date(result.date).toLocaleDateString()} at {result.time}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Navigation className="w-5 h-5 text-gray-400 mt-1" />
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Current Status</p>
                                <Badge variant="secondary" className="mt-1 capitalize">{result.status}</Badge>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 flex gap-3">
                        <Button
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12 text-lg font-bold rounded-2xl shadow-lg shadow-green-200"
                            onClick={handleConfirmCheckIn}
                        >
                            Confirm Check-in
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 h-12 text-lg font-medium rounded-2xl border-gray-200"
                            onClick={() => navigate(`/admin/bookings/${id}`)}
                        >
                            View Details
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
