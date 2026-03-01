import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, ArrowRight, Heart, Share2, Star, Clock, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { serviceService } from '@/services/serviceService';
import type { Service, ServiceCategory } from '@/services/serviceService';

export function ServicesPage() {
    const [searchParams] = useSearchParams();
    const categoryParam = searchParams.get('category');

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | number>(categoryParam ? parseInt(categoryParam) : 'all');
    const [priceRange, setPriceRange] = useState([0, 300]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const [services, setServices] = useState<Service[]>([]);
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [servicesData, categoriesData] = await Promise.all([
                    serviceService.getServices(),
                    serviceService.getCategories()
                ]);
                setServices(servicesData);
                setCategories(categoriesData);
            } catch (error) {
                console.error('Failed to fetch services:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (categoryParam) {
            setSelectedCategory(parseInt(categoryParam));
        }
    }, [categoryParam]);

    const filteredServices = services.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || service.categoryId === selectedCategory || service.category?.id === selectedCategory;
        const matchesPrice = service.basePrice <= priceRange[1] && service.basePrice >= priceRange[0];
        return matchesSearch && matchesCategory && matchesPrice;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-coral-600" />
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header Banner */}
            <div className="bg-gray-900 text-white py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-coral-500/20 to-peach-500/20" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-display font-bold mb-4"
                    >
                        Our Premium Services
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-gray-300 max-w-2xl mx-auto"
                    >
                        Discover our wide range of treatments designed to rejuvenate your body and mind.
                    </motion.p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <aside className="lg:w-1/4 space-y-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-lg">Filters</h3>
                                <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                            </div>

                            {/* Search */}
                            <div className="relative mb-6">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Search services..."
                                    className="pl-9 bg-gray-50 border-gray-100"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Categories */}
                            <div className="space-y-3 mb-6">
                                <h4 className="font-semibold text-sm text-gray-500 uppercase tracking-wider">Categories</h4>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setSelectedCategory('all')}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === 'all' ? 'bg-coral-50 text-coral-600 font-medium' : 'hover:bg-gray-50 text-gray-600'}`}
                                    >
                                        All Services
                                    </button>
                                    {categories.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => setSelectedCategory(category.id)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === category.id ? 'bg-coral-50 text-coral-600 font-medium' : 'hover:bg-gray-50 text-gray-600'}`}
                                        >
                                            {category.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-sm text-gray-500 uppercase tracking-wider">Price Range</h4>
                                    <span className="text-sm font-medium text-coral-600">${priceRange[0]} - ${priceRange[1]}</span>
                                </div>
                                <Slider
                                    defaultValue={[0, 300]}
                                    max={500}
                                    step={10}
                                    value={priceRange}
                                    onValueChange={setPriceRange}
                                    className="py-4"
                                />
                            </div>
                        </div>
                    </aside>

                    {/* Services Grid */}
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-gray-500">Showing <span className="font-bold text-gray-900">{filteredServices.length}</span> services</p>
                            <div className="flex gap-2">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                    className={viewMode === 'grid' ? 'bg-gray-900' : ''}
                                >
                                    Grid
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                    className={viewMode === 'list' ? 'bg-gray-900' : ''}
                                >
                                    List
                                </Button>
                            </div>
                        </div>

                        <AnimatePresence mode="popLayout">
                            <div className={viewMode === 'grid' ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                                {filteredServices.map((service) => (
                                    <motion.div
                                        key={service.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.2 }}
                                        className={`bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:shadow-coral-500/10 transition-all duration-300 group ${viewMode === 'list' ? 'flex flex-row' : 'flex-col'
                                            }`}
                                    >
                                        <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-48' : 'aspect-[4/3]'}`}>
                                            <img
                                                src={service.imageUrls && service.imageUrls.length > 0
                                                    ? (service.imageUrls[0].startsWith('http') ? service.imageUrls[0] : `http://localhost:5000${service.imageUrls[0]}`)
                                                    : 'https://images.unsplash.com/photo-1600334019640-ebc96aff3366?w=800&auto=format&fit=crop'}
                                                alt={service.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute top-3 right-3 flex gap-2">
                                                <button className="w-8 h-8 rounded-full bg-white/90 backdrop-blur text-gray-400 hover:text-coral-500 flex items-center justify-center transition-colors">
                                                    <Heart className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-5 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <Badge variant="secondary" className="bg-coral-50 text-coral-600 hover:bg-coral-100 border-0">
                                                    {service.category?.name || 'Service'}
                                                </Badge>
                                                <div className="flex items-center text-yellow-400 text-sm font-medium">
                                                    <Star className="w-4 h-4 fill-current mr-1" />
                                                    {service.popularityScore ? (service.popularityScore / 20).toFixed(1) : '5.0'}
                                                </div>
                                            </div>

                                            <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-coral-600 transition-colors">
                                                {service.name}
                                            </h3>

                                            <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                                                {service.shortDescription}
                                            </p>

                                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                                                <div className="flex items-center">
                                                    <Clock className="w-4 h-4 mr-1.5" />
                                                    {service.durationMinutes} min
                                                </div>
                                                <div className="flex items-center text-green-600">
                                                    <Check className="w-4 h-4 mr-1.5" />
                                                    Available
                                                </div>
                                            </div>

                                            <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase font-semibold">Price</p>
                                                    <p className="text-xl font-bold text-coral-600">${service.basePrice}</p>
                                                </div>
                                                <Link to={`/customer/booking?serviceId=${service.id}`}>
                                                    <Button className="gradient-coral text-white rounded-full hover:shadow-lg hover:shadow-coral-500/25 transition-all">
                                                        Book Now
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
