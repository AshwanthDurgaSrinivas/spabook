import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ChevronLeft, Clock, DollarSign, Tag,
    Edit, Trash2, Calendar, Users, Star,
    CheckCircle2, Info, Loader2
} from 'lucide-react';
import { serviceService, type Service } from '@/services/serviceService';
import { toast } from 'sonner';

export function ServiceDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [service, setService] = useState<Service | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchService = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await serviceService.getServiceById(parseInt(id));
                setService(data);
            } catch (error) {
                toast.error('Failed to load service details');
                navigate('/admin/services');
            } finally {
                setLoading(false);
            }
        };
        fetchService();
    }, [id, navigate]);

    const handleDelete = async () => {
        if (!service) return;
        if (confirm('Are you sure you want to delete this service?')) {
            try {
                await serviceService.deleteService(service.id);
                toast.success('Service deleted successfully');
                navigate('/admin/services');
            } catch (e) {
                toast.error('Failed to delete service');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 animate-spin text-coral-500" />
            </div>
        );
    }

    if (!service) return null;

    const imageUrl = service.imageUrls?.[0]
        ? (service.imageUrls[0].startsWith('http') ? service.imageUrls[0] : `http://localhost:5000${service.imageUrls[0]}`)
        : null;

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-12">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-display font-bold text-gray-800">{service.name}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="bg-coral-50 text-coral-600 hover:bg-coral-50">
                                {service.category?.name || 'General'}
                            </Badge>
                            <Badge variant="outline" className={service.isActive ? 'text-green-600 border-green-200' : 'text-gray-400'}>
                                {service.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => navigate(`/admin/services/edit/${service.id}`)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Service
                    </Button>
                    <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleDelete}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-0 shadow-soft overflow-hidden">
                        <div className="aspect-video w-full bg-gray-100 relative">
                            {imageUrl ? (
                                <img src={imageUrl} alt={service.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                                    <Star className="w-12 h-12 opacity-20" />
                                    <p className="text-sm">No image provided</p>
                                </div>
                            )}
                        </div>
                        <CardContent className="p-8">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">About the Treatment</h3>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {service.description || 'No description available for this service.'}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800">Premium Materials</h4>
                                        <p className="text-sm text-gray-500 leading-tight">We use only high-end, organic products for this treatment.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500 shrink-0">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800">Expert Staff</h4>
                                        <p className="text-sm text-gray-500 leading-tight">Performed by our most experienced therapists.</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="border-0 shadow-soft bg-white">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <Clock className="w-5 h-5 text-coral-500" />
                                    <span className="text-sm font-medium text-gray-500">Duration</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-800">{service.durationMinutes} min</p>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-soft bg-white">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <DollarSign className="w-5 h-5 text-green-600" />
                                    <span className="text-sm font-medium text-gray-500">Base Price</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-800">${service.basePrice}</p>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-soft bg-white">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <Calendar className="w-5 h-5 text-indigo-500" />
                                    <span className="text-sm font-medium text-gray-500">Total Bookings</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-800">124</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="space-y-6">
                    <Card className="border-0 shadow-soft">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Booking Analytics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Popularity</span>
                                    <span className="font-bold text-gray-800">High (Top 10%)</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-coral-500 w-[85%]" />
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                        <span className="text-sm font-bold">4.9/5.0</span>
                                    </div>
                                    <span className="text-xs text-gray-500">48 Reviews</span>
                                </div>
                                <p className="text-sm text-gray-600 italic leading-relaxed">
                                    "Best massage I've ever had. Emily was extremely professional and the atmosphere was divine."
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-soft bg-gray-900 text-white">
                        <CardContent className="p-6">
                            <h4 className="font-bold text-lg mb-2">Quick Promotions</h4>
                            <p className="text-sm text-gray-400 mb-6">Create a dynamic discount for off-peak hours.</p>
                            <Button className="w-full bg-white text-gray-900 hover:bg-gray-100 font-bold">
                                Create Offer
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-soft">
                        <CardContent className="p-6 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-coral-50 flex items-center justify-center text-coral-500 shrink-0">
                                <Info className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800 text-sm">Policy Info</h4>
                                <p className="text-xs text-gray-500 mt-1">
                                    Cancellations within 24 hours incur a 50% charge.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
