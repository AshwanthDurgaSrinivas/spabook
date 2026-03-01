import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, Star, CheckCircle, ArrowRight, Sparkles, Clock, Shield, Award, Heart, Quote } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, useScroll, useSpring } from 'framer-motion';
import { serviceService, type Service, type ServiceCategory } from '@/services/serviceService';
import { packageService, type SpaPackage } from '@/services/packageService';
import { Loader2 } from 'lucide-react';

export function HomePage() {
    const { isAuthenticated } = useAuth();
    const [services, setServices] = useState<Service[]>([]);
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [packages, setPackages] = useState<SpaPackage[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [sData, cData, pData] = await Promise.all([
                    serviceService.getServices(),
                    serviceService.getCategories(),
                    packageService.getPackages()
                ]);
                setServices(sData);
                setCategories(cData);
                setPackages(pData);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            {/* Scroll Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-indigo-600 z-[60] origin-left"
                style={{ scaleX }}
            />

            {/* Hero Section */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden"
            >
                {/* Floating Elements */}
                <motion.div
                    animate={{
                        y: [0, -20, 0],
                        rotate: [0, 10, 0]
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-20 left-10 w-20 h-20 bg-indigo-100/30 rounded-full blur-3xl -z-10"
                />
                <motion.div
                    animate={{
                        y: [0, 30, 0],
                        rotate: [0, -15, 0]
                    }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-20 right-10 w-32 h-32 bg-violet-100/30 rounded-full blur-3xl -z-10"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 left-1/3 w-64 h-64 bg-indigo-200/20 rounded-full blur-[100px] -z-10"
                />

                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-slate-50 to-transparent -z-20" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="space-y-8"
                        >
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100/50 cursor-default"
                            >
                                <Star className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                                <span className="text-sm font-medium text-indigo-700">#1 Rated Salon Management System</span>
                            </motion.div>
                            <h1 className="text-5xl lg:text-7xl font-display font-bold leading-tight">
                                Experience the <br />
                                <motion.span
                                    initial={{ backgroundPosition: "0% 50%" }}
                                    animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                                    className="text-transparent bg-clip-text bg-gradient-to-r from-[#4f46e5] via-[#8b5cf6] to-[#4f46e5] bg-[length:200%_auto]"
                                >
                                    Art of Beauty
                                </motion.span>
                            </h1>
                            <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
                                Discover a world of relaxation and rejuvenation. Book your appointment today and let our experts take care of you.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to={isAuthenticated ? "/customer/booking" : "/login"}>
                                    <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-full gradient-coral text-white shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/50 hover:-translate-y-1 transition-all duration-300">
                                        Book Appointment <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </Link>
                                <Link to="/services">
                                    <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 rounded-full border-2 border-gray-200 hover:border-indigo-200 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 transition-all">
                                        View Services
                                    </Button>
                                </Link>
                            </div>
                            <div className="flex items-center gap-8 pt-4">
                                <div className="flex -space-x-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <motion.div
                                            key={i}
                                            whileHover={{ y: -5, zIndex: 10 }}
                                            className={`w-12 h-12 rounded-full border-4 border-white bg-gray-200 overflow-hidden relative shadow-sm`}
                                        >
                                            <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Customer" className="w-full h-full object-cover" />
                                        </motion.div>
                                    ))}
                                </div>
                                <div>
                                    <div className="flex items-center gap-1 text-yellow-500">
                                        {[...Array(5)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, scale: 0 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.8 + (i * 0.1) }}
                                            >
                                                <Star className="w-5 h-5 fill-current" />
                                            </motion.div>
                                        ))}
                                    </div>
                                    <p className="text-sm font-medium text-gray-500"><span className="text-gray-900 font-bold">4.9/5</span> from 2,000+ reviews</p>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="relative lg:h-[600px] hidden lg:block"
                        >
                            <div className="absolute top-10 right-10 w-full h-full bg-gradient-to-br from-indigo-200 to-violet-200 rounded-[3rem] opacity-20 transform rotate-6" />
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className="relative w-full h-full rounded-[3rem] overflow-hidden shadow-2xl shadow-indigo-900/10 border-8 border-white group"
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=2070&auto=format&fit=crop"
                                    alt="Spa Treatment"
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
                                />

                                {packages.length > 0 ? (
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 1 }}
                                        className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/50"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Special Offer</p>
                                                <h3 className="text-xl font-bold text-gray-900">{packages[0].name}</h3>
                                            </div>
                                            <motion.span
                                                animate={{ scale: [1, 1.1, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="text-2xl font-bold text-indigo-600"
                                            >
                                                ${packages[0].price}
                                            </motion.span>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 1 }}
                                        className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/50"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Special Offer</p>
                                                <h3 className="text-xl font-bold text-gray-900">Summer Glow Package</h3>
                                            </div>
                                            <motion.span
                                                animate={{ scale: [1, 1.1, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="text-2xl font-bold text-indigo-600"
                                            >
                                                $129
                                            </motion.span>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* Why Choose Us */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-4">Why Choose Sparkle Beauty Lounge?</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">We combine luxury, comfort, and expertise to provide you with the ultimate wellness experience.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { icon: Award, title: "Expert Staff", desc: "Highly trained and certified professionals dedicated to your care." },
                            { icon: Shield, title: "Premium Products", desc: "We use only the finest, organic, and skin-friendly products." },
                            { icon: Clock, title: "Online Booking", desc: "Book your appointments 24/7 with our easy-to-use platform." },
                            { icon: Heart, title: "Personalized Care", desc: "Treatments tailored to your unique needs and preferences." }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ y: 30, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                whileHover={{ y: -10 }}
                                className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100 group"
                            >
                                <motion.div
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.8 }}
                                    className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-100 transition-colors"
                                >
                                    <feature.icon className="w-8 h-8" />
                                </motion.div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Popular Services - Direct Booking */}
            <section className="py-24 bg-gray-50 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-12">
                        <motion.div
                            initial={{ x: -30, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-4">Popular Treatments</h2>
                            <p className="text-lg text-gray-600">Our most requested services loved by customized.</p>
                        </motion.div>
                        <Link to="/services">
                            <Button variant="outline" className="hidden md:flex hover-lift">View All Services</Button>
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {isLoading ? (
                            <div className="col-span-3 flex justify-center py-20">
                                <Loader2 className="w-12 h-12 animate-spin text-coral-500" />
                            </div>
                        ) : services.slice(0, 3).map((service, index) => (
                            <motion.div
                                key={service.id}
                                initial={{ y: 50, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                whileHover={{ y: -15 }}
                                className="bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-2xl transition-all duration-300 group flex flex-col h-full border border-gray-100/50"
                            >
                                <div className="h-64 overflow-hidden relative flex-shrink-0">
                                    <img
                                        src={service.imageUrls && service.imageUrls.length > 0
                                            ? (service.imageUrls[0].startsWith('http') ? service.imageUrls[0] : `http://localhost:5000${service.imageUrls[0]}`)
                                            : 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800'}
                                        alt={service.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-sm">
                                        <Star className="w-3 h-3 text-yellow-500 fill-current" /> {service.popularityScore || '4.8'}
                                    </div>
                                </div>
                                <div className="p-8 flex flex-col flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">{service.name}</h3>
                                            <div className="flex items-center text-sm text-gray-500 gap-2">
                                                <Clock className="w-4 h-4" /> {service.durationMinutes} min
                                            </div>
                                        </div>
                                        <span className="text-2xl font-bold text-coral-600">${service.basePrice}</span>
                                    </div>
                                    <div className="mt-auto">
                                        <Link to={isAuthenticated ? `/customer/booking?serviceId=${service.id}` : "/login"}>
                                            <Button className="w-full gradient-coral text-white py-6 rounded-xl hover:shadow-lg transition-all transform active:scale-95">
                                                Book Now
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories Grid */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-4">Browse by Category</h2>
                        <p className="text-lg text-gray-600">Explore our comprehensive menu of wellness services.</p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                        {isLoading ? (
                            <div className="col-span-4 flex justify-center py-10">
                                <Loader2 className="w-10 h-10 animate-spin text-coral-500" />
                            </div>
                        ) : categories.slice(0, 4).map((cat, i) => {
                            const serviceCount = services.filter(s => s.categoryId === cat.id).length;
                            const catImages = [
                                "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=500",
                                "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=500",
                                "https://images.unsplash.com/photo-1570172619664-d62b3393996b?w=500",
                                "https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=500"
                            ];
                            const catImage = cat.image
                                ? (cat.image.startsWith('http') ? cat.image : `http://localhost:5000${cat.image}`)
                                : catImages[i % catImages.length];

                            return (
                                <motion.div
                                    key={cat.id}
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    whileInView={{ scale: 1, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <Link to={`/services?category=${cat.id}`} className="group relative h-64 md:h-80 rounded-3xl overflow-hidden cursor-pointer block">
                                        <img src={catImage} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-8">
                                            <h3 className="text-white text-2xl font-bold mb-1">{cat.name}</h3>
                                            <p className="text-gray-300 text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                                {serviceCount} Services <ArrowRight className="w-4 h-4" />
                                            </p>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 bg-slate-50/50 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-4">What Our Clients Say</h2>
                        <p className="text-lg text-gray-600">Don't just take our word for it. Read love stories from our happy clients.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                text: "The best massage I've ever had! The therapist was incredibly skilled and attentive to my needs. The atmosphere was so calming.",
                                author: "Jennifer Lawrence",
                                role: "Regular Client",
                                avatar: "https://randomuser.me/api/portraits/women/44.jpg"
                            },
                            {
                                text: "I've tried many places for back pain, but the Deep Tissue massage here is unmatched. Truly therapeutic and relaxing.",
                                author: "Sarah Williams",
                                role: "VIP Member",
                                avatar: "https://randomuser.me/api/portraits/women/68.jpg"
                            },
                            {
                                text: "Booking is so easy and the staff is always welcoming. It's my favorite place to unwind after a stressful week.",
                                author: "Michael Chen",
                                role: "Regular Client",
                                avatar: "https://randomuser.me/api/portraits/men/32.jpg"
                            }
                        ].map((review, i) => (
                            <motion.div
                                key={i}
                                initial={{ x: 50, opacity: 0 }}
                                whileInView={{ x: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white p-8 rounded-3xl shadow-soft relative pt-12"
                            >
                                <Quote className="absolute top-8 left-8 w-10 h-10 text-indigo-200 fill-indigo-100" />
                                <p className="text-gray-600 italic mb-8 relative z-10 leading-relaxed">"{review.text}"</p>
                                <div className="flex items-center gap-4">
                                    <img src={review.avatar} alt={review.author} className="w-12 h-12 rounded-full object-cover ring-4 ring-indigo-50" />
                                    <div>
                                        <h4 className="font-bold text-gray-900">{review.author}</h4>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">{review.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <motion.section
                whileInView={{ backgroundColor: ["#111827", "#1f2937", "#111827"] }}
                transition={{ duration: 10, repeat: Infinity }}
                className="py-24 relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gray-900 z-0">
                    <img src="https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=1920&q=80" alt="Background" className="w-full h-full object-cover opacity-20" />
                </div>
                <div className="max-w-4xl mx-auto px-4 relative z-10 text-center text-white">
                    <motion.h2
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-display font-bold mb-6"
                    >
                        Ready to Relax and Rejuvenate?
                    </motion.h2>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto"
                    >
                        Book your appointment today and take the first step towards a healthier, happier you.
                    </motion.p>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col sm:flex-row justify-center gap-4"
                    >
                        <Link to={isAuthenticated ? "/customer/booking" : "/login"}>
                            <Button size="lg" className="text-lg px-10 py-7 rounded-full gradient-coral text-white shadow-2xl hover:shadow-white/20 hover:-translate-y-1 transition-all">
                                Book Your Visit
                            </Button>
                        </Link>
                        <Link to="/contact">
                            <Button size="lg" variant="outline" className="text-lg px-10 py-7 rounded-full border-2 border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white hover:text-gray-900 transition-all">
                                Contact Us
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </motion.section>
        </div>
    );
}
