
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Star, Loader2 } from 'lucide-react';
import { packageService, type SpaPackage } from '@/services/packageService';
import { serviceService, type Service } from '@/services/serviceService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function PackagesPage() {
    const [packages, setPackages] = useState<SpaPackage[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                const [packagesData, servicesData] = await Promise.all([
                    packageService.getPackages(),
                    serviceService.getServices()
                ]);
                setPackages(packagesData);
                setServices(servicesData);
            } catch (error) {
                console.error('Failed to load data', error);
                toast.error('Failed to load packages. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);


    const handleBookPackage = (pkg: SpaPackage) => {
        // Redirect to booking with package pre-selected
        navigate(`/customer/booking?packageId=${pkg.id}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-coral-500 mx-auto mb-4" />
                    <p className="text-gray-600">Loading exclusive packages...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h1 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-6">Exclusive Packages</h1>
                    <p className="text-xl text-gray-600">
                        Curated experiences designed to provide the ultimate relaxation and value.
                    </p>
                </div>

                {packages.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-soft">
                        <Sparkles className="w-12 h-12 text-coral-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900">No Packages Available</h3>
                        <p className="text-gray-500 mt-2">Check back soon for our latest exclusive offers.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-8">
                        {packages.map((pkg) => (
                            <Card key={pkg.id} className={`flex flex-col border-2 relative ${pkg.isPopular ? 'bg-coral-50 border-coral-200 shadow-xl scale-105 z-10' : 'bg-white border-gray-100 shadow-soft'}`}>
                                {pkg.isPopular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-coral-500 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                                        <Star className="w-3 h-3 fill-current" /> Most Popular
                                    </div>
                                )}
                                <CardHeader>
                                    <CardTitle className="text-2xl font-bold text-gray-900">{pkg.name}</CardTitle>
                                    <CardDescription>{pkg.duration}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <div className="mb-6">
                                        <span className="text-4xl font-bold text-coral-600">${pkg.price}</span>
                                        {pkg.originalPrice && (
                                            <span className="text-gray-400 line-through ml-2 text-lg">${pkg.originalPrice}</span>
                                        )}
                                    </div>
                                    <p className="text-gray-600 mb-6">{pkg.description}</p>

                                    {pkg.serviceIds && pkg.serviceIds.length > 0 && (
                                        <div className="mb-6">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Included Services</p>
                                            <div className="flex flex-wrap gap-2">
                                                {pkg.serviceIds.map(id => {
                                                    const s = services.find(srv => srv.id === id);
                                                    return s ? (
                                                        <Badge key={id} variant="secondary" className="bg-white border-gray-100 text-gray-600 font-normal hover:bg-gray-50 flex items-center gap-1">
                                                            <Sparkles className="w-3 h-3 text-coral-400" /> {s.name}
                                                        </Badge>
                                                    ) : null;
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Package Features</p>
                                    <ul className="space-y-2">
                                        {pkg.features.map((feature, i) => (
                                            <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                                                <div className="w-4 h-4 rounded-full bg-green-50 flex items-center justify-center text-green-500 flex-shrink-0">
                                                    <Check className="w-2.5 h-2.5" />
                                                </div>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        onClick={() => handleBookPackage(pkg)}
                                        className={`w-full ${pkg.isPopular ? 'gradient-coral text-white shadow-lg' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
                                    >
                                        Book Package
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
