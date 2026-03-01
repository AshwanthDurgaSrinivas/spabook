import { Link, useLocation } from 'react-router-dom';
import { BrandLogo } from '../BrandLogo';
import { Button } from '@/components/ui/button';
import { Sparkles, Menu, X, Instagram, Facebook, Twitter, MapPin, Phone, Mail, Clock, ChevronRight, Home, Info, Calendar, Gift, BookOpen, CreditCard, Settings, LogOut, User } from 'lucide-react';
import { useState, useEffect, useRef, forwardRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function PublicHeader() {
    const { isAuthenticated } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Services', path: '/services' },
        { name: 'Packages', path: '/packages' },
        { name: 'Gallery', path: '/gallery' },
        { name: 'Blog', path: '/blog' },
        { name: 'Contact', path: '/contact' },
    ];

    const isActive = (path: string) => {
        if (path === '/' && location.pathname !== '/') return false;
        return location.pathname.startsWith(path);
    };

    return (
        <nav className={`absolute md:fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'md:bg-white/90 md:backdrop-blur-md md:shadow-sm md:py-1' : 'md:bg-white/50 md:backdrop-blur-sm md:py-3'} bg-transparent py-4 md:py-3`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-center md:justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center group">
                        <BrandLogo className="group-hover:scale-105 transition-transform duration-300" />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`font-medium transition-all duration-200 relative group ${isActive(link.path) ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-500'}`}
                            >
                                {link.name}
                                <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ${isActive(link.path) ? 'scale-x-100' : ''}`} />
                            </Link>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="hidden lg:flex items-center gap-4">
                        {isAuthenticated ? (
                            <Link to="/customer/appointments">
                                <Button variant="ghost" className="font-medium text-gray-600 hover:text-indigo-500 hover:bg-indigo-50">
                                    My Portal
                                </Button>
                            </Link>
                        ) : (
                            <Link to="/login">
                                <Button variant="ghost" className="font-medium text-gray-600 hover:text-indigo-500 hover:bg-indigo-50">
                                    Sign In
                                </Button>
                            </Link>
                        )}
                        <Link to="/services">
                            <Button className="gradient-coral text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 transition-all rounded-full px-6 hover:-translate-y-0.5">
                                Book Now
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="hidden md:flex lg:hidden text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                                <Menu className="w-6 h-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0 border-r border-indigo-100">
                            <SheetHeader className="sr-only">
                                <SheetTitle>Navigation Menu</SheetTitle>
                                <SheetDescription>Access the main navigation links and your account portal.</SheetDescription>
                            </SheetHeader>
                            <div className="flex flex-col h-full bg-white/95 backdrop-blur-md">
                                {/* Header in Drawer */}
                                <div className="p-6 border-b border-indigo-50 bg-gradient-to-br from-indigo-50/50 to-slate-50/50">
                                    <div className="flex items-center">
                                        <BrandLogo size="lg" />
                                    </div>
                                </div>

                                {/* Navigation Links */}
                                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
                                    <div>
                                        {isAuthenticated && <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Explore</h3>}
                                        <div className="flex flex-col gap-2">
                                            {navLinks.map((link, index) => (
                                                <Link
                                                    key={link.path}
                                                    to={link.path}
                                                    style={{ animationDelay: `${index * 50}ms` }}
                                                    className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-200 group animate-slide-in-left ${isActive(link.path)
                                                        ? 'bg-indigo-50 text-indigo-600 font-bold'
                                                        : 'text-gray-600 hover:bg-indigo-50/50'
                                                        }`}
                                                >
                                                    <span className="text-lg">{link.name}</span>
                                                    <ChevronRight className={`w-5 h-5 transition-transform duration-200 ${isActive(link.path) ? 'text-coral-500 opacity-100' : 'text-gray-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1'
                                                        }`} />
                                                </Link>
                                            ))}
                                        </div>
                                    </div>

                                    {isAuthenticated && (
                                        <div>
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">My Portal</h3>
                                            <div className="flex flex-col gap-2">
                                                {[
                                                    { icon: Calendar, label: 'My Appointments', path: '/customer/appointments' },
                                                    { icon: Calendar, label: 'Book Appointment', path: '/customer/booking' },
                                                    { icon: User, label: 'Profile', path: '/customer/profile' },
                                                    { icon: CreditCard, label: 'Payments', path: '/customer/payments' },
                                                    { icon: Settings, label: 'Settings', path: '/customer/settings' },
                                                ].map((item) => (
                                                    <Link
                                                        key={item.path}
                                                        to={item.path}
                                                        className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group relative ${isActive(item.path)
                                                            ? 'bg-coral-50 text-coral-600 font-bold'
                                                            : 'text-gray-600 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-coral-500' : 'text-gray-400 group-hover:text-coral-500'}`} />
                                                        <span className="font-medium">{item.label}</span>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Footer in Drawer */}
                                <div className="p-6 border-t border-coral-50 space-y-4">
                                    <div className="flex flex-col gap-3">
                                        {isAuthenticated ? (
                                            <Link to="/customer/appointments" className="w-full">
                                                <Button className="w-full h-12 rounded-xl gradient-coral text-white font-bold shadow-lg shadow-coral-500/25">
                                                    My Portal
                                                </Button>
                                            </Link>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-3">
                                                <Link to="/login" className="w-full">
                                                    <Button variant="outline" className="w-full h-12 rounded-xl border-peach-200 text-peach-600 font-medium hover:bg-peach-50">
                                                        Sign In
                                                    </Button>
                                                </Link>
                                                <Link to="/register" className="w-full">
                                                    <Button className="w-full h-12 rounded-xl gradient-orange text-white font-bold shadow-lg shadow-orange-500/20">
                                                        Join
                                                    </Button>
                                                </Link>
                                            </div>
                                        )}
                                        {!isAuthenticated && (
                                            <Link to="/services" className="w-full">
                                                <Button className="w-full h-12 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/10">
                                                    Book Appointment
                                                </Button>
                                            </Link>
                                        )}
                                    </div>

                                    <div className="flex justify-center gap-6 pt-4 text-gray-400">
                                        <Instagram className="w-5 h-5 hover:text-coral-500 cursor-pointer" />
                                        <Facebook className="w-5 h-5 hover:text-blue-600 cursor-pointer" />
                                        <Twitter className="w-5 h-5 hover:text-sky-500 cursor-pointer" />
                                    </div>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </nav>
    );
}

// Footer Component
export const PublicFooter = forwardRef<HTMLElement>((props, ref) => {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await (await import('@/services/settingsService')).settingsService.getPublicSettings();
                setSettings(data);
            } catch (error) {
                console.error('Failed to fetch public settings', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const address = settings.business_address || '123 Beauty Lane, Suite 100, New York, NY 10001';
    const phone = settings.business_phone || '+1 (555) 123-4567';
    const email = settings.business_email || 'hello@sparklebeauty.com';
    const instagram = settings.social_instagram || '#';
    const facebook = settings.social_facebook || '#';
    const twitter = settings.social_twitter || '#';
    const hours_mon_fri = settings.hours_mon_fri || '9:00 AM - 8:00 PM';
    const hours_sat = settings.hours_sat || '10:00 AM - 6:00 PM';
    const hours_sun = settings.hours_sun || '11:00 AM - 5:00 PM';

    return (
        <footer ref={ref} className="bg-gray-900 text-white pt-16 pb-8 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12">
                    {/* Brand Info */}
                    <div className="space-y-6 text-center sm:text-left">
                        <Link to="/" className="flex items-center justify-center sm:justify-start">
                            <BrandLogo variant="light" size="lg" />
                        </Link>
                        <p className="text-gray-400 leading-relaxed hidden sm:block">
                            Experience the art of beauty and relaxation. Our premium services are designed to rejuvenate your body and mind.
                        </p>
                        <div className="flex gap-4 justify-center sm:justify-start">
                            <a href={instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-indigo-600 transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href={facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-600 transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href={twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-sky-500 transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="sm:pl-8 lg:pl-0 hidden sm:block">
                        <h4 className="font-bold text-lg mb-6 text-center sm:text-left">Quick Links</h4>
                        <ul className="space-y-3 text-center sm:text-left">
                            <li><Link to="/about" className="text-gray-400 hover:text-indigo-500 transition-colors">About Us</Link></li>
                            <li><Link to="/services" className="text-gray-400 hover:text-indigo-500 transition-colors">Our Services</Link></li>
                            <li><Link to="/packages" className="text-gray-400 hover:text-indigo-500 transition-colors">Special Packages</Link></li>
                            <li><Link to="/help" className="text-gray-400 hover:text-indigo-500 transition-colors">Help & Support</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-bold text-lg mb-6 text-center sm:text-left">Contact Us</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-gray-400 justify-center sm:justify-start text-center sm:text-left">
                                <MapPin className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-1" />
                                <span>{address}</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-400 justify-center sm:justify-start">
                                <Phone className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                                <span>{phone}</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-400 justify-center sm:justify-start">
                                <Mail className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                                <span>{email}</span>
                            </li>
                        </ul>
                    </div>

                    {/* Opening Hours */}
                    <div>
                        <h4 className="font-bold text-lg mb-6 text-center sm:text-left">Opening Hours</h4>
                        <ul className="space-y-3">
                            <li className="flex justify-between text-gray-400 border-b border-gray-800 pb-2 sm:border-0 sm:pb-0">
                                <span>Mon - Fri</span>
                                <span>{hours_mon_fri}</span>
                            </li>
                            <li className="flex justify-between text-gray-400 border-b border-gray-800 pb-2 sm:border-0 sm:pb-0">
                                <span>Saturday</span>
                                <span>{hours_sat}</span>
                            </li>
                            <li className="flex justify-between text-gray-400">
                                <span>Sunday</span>
                                <span>{hours_sun}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                    <p className="text-center md:text-left">&copy; {new Date().getFullYear()} Sparkle Beauty Lounge. All rights reserved.</p>
                    <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                        <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link to="/cancellation" className="hover:text-white transition-colors">Cancellation Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
});

// Bottom Navigation Component
// Bottom Navigation Component
function PublicBottomNavigation({ isVisible = true }: { isVisible?: boolean }) {
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const [isMenuOpen, setMenuOpen] = useState(false);

    const navItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Info, label: 'About', path: '/about' },
        { icon: Sparkles, label: 'Services', path: '/services' },
        { icon: Phone, label: 'Contact', path: '/contact' },
    ];

    return (
        <>
            <motion.div
                initial={{ y: 0, opacity: 1 }}
                animate={{
                    y: isVisible ? 0 : 100,
                    opacity: isVisible ? 1 : 0
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="md:hidden fixed bottom-5 left-4 right-4 bg-white/70 backdrop-blur-3xl rounded-full px-4 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-white/40 z-50"
            >
                <div className="flex items-center justify-between">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.label}
                                to={item.path}
                                className={cn(
                                    "flex flex-col items-center gap-1 rounded-xl transition-all duration-300 relative",
                                    item.label === 'Services'
                                        ? "-mt-8"
                                        : "p-1",
                                    isActive && item.label !== 'Services' ? "text-slate-900" : "text-slate-500 hover:text-slate-900"
                                )}
                            >
                                {isActive && item.label !== 'Services' && (
                                    <motion.div
                                        layoutId="publicBottomNavIndicator"
                                        className="absolute -top-2 w-8 h-1 bg-indigo-600 rounded-full"
                                    />
                                )}

                                <div className={cn(
                                    "transition-all flex items-center justify-center",
                                    item.label === 'Services'
                                        ? "w-14 h-14 bg-gradient-to-br from-[#4f46e5] to-[#8b5cf6] rounded-full text-white shadow-lg shadow-indigo-500/30 border-4 border-white"
                                        : "p-1 rounded-full",
                                    isActive && item.label !== 'Services' && "bg-slate-50"
                                )}>
                                    <item.icon className={cn(
                                        "transition-all",
                                        item.label === 'Services' ? "w-6 h-6" : "w-5 h-5",
                                        isActive && item.label !== 'Services' && "text-slate-900"
                                    )} />
                                </div>
                                <span className={cn(
                                    "text-[10px] font-bold transition-colors",
                                    item.label === 'Services' ? "mt-1" : "",
                                    isActive ? "text-slate-900" : "text-slate-500"
                                )}>{item.label}</span>
                            </Link>
                        );
                    })}
                    <button
                        onClick={() => setMenuOpen(true)}
                        className="flex flex-col items-center gap-1 p-2 rounded-xl text-slate-500 hover:text-slate-900 transition-all duration-300"
                    >
                        <div className="p-1 rounded-full">
                            <Menu className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold">Menu</span>
                    </button>
                </div>
            </motion.div>

            {/* Existing Menu Logic reused/adapted for bottom sheet if needed */}
            <Sheet open={isMenuOpen} onOpenChange={setMenuOpen}>
                <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0 border-r border-indigo-100">
                    <SheetHeader className="sr-only">
                        <SheetTitle>Navigation Menu</SheetTitle>
                        <SheetDescription>Mobile navigation menu for Sparkle Beauty Lounge.</SheetDescription>
                    </SheetHeader>
                    <div className="flex flex-col h-full bg-white">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <div className="flex items-center">
                                <BrandLogo size="lg" />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            <div>
                                {isAuthenticated && <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Explore</h3>}
                                <div className="space-y-2">
                                    {[
                                        { name: 'Special Packages', path: '/packages', icon: Gift },
                                        { name: 'Gallery', path: '/gallery', icon: Instagram },
                                        { name: 'Blog & News', path: '/blog', icon: BookOpen },
                                    ].map((link) => (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            onClick={() => setMenuOpen(false)}
                                            className="flex items-center gap-4 p-3 rounded-xl hover:bg-indigo-50 group transition-all border border-transparent hover:border-indigo-100"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-white flex items-center justify-center text-gray-400 group-hover:text-indigo-500 transition-colors shadow-sm">
                                                <link.icon className="w-5 h-5" />
                                            </div>
                                            <span className="font-medium text-gray-700 group-hover:text-gray-900">{link.name}</span>
                                            <ChevronRight className="w-4 h-4 ml-auto text-gray-300 group-hover:text-indigo-400" />
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {isAuthenticated && (
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">My Portal</h3>
                                    <div className="space-y-2">
                                        {[
                                            { icon: Calendar, label: 'My Appointments', path: '/customer/appointments' },
                                            { icon: Calendar, label: 'Book Appointment', path: '/customer/booking' },
                                            { icon: User, label: 'Profile', path: '/customer/profile' },
                                            { icon: CreditCard, label: 'Payments', path: '/customer/payments' },
                                            { icon: Gift, label: 'Rewards', path: '/customer/loyalty' },
                                            { icon: Settings, label: 'Settings', path: '/customer/settings' },
                                        ].map((item) => (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                onClick={() => setMenuOpen(false)}
                                                className="flex items-center gap-4 p-3 rounded-xl hover:bg-indigo-50 group transition-all border border-transparent hover:border-indigo-100"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-white flex items-center justify-center text-gray-400 group-hover:text-indigo-500 transition-colors shadow-sm">
                                                    <item.icon className="w-5 h-5" />
                                                </div>
                                                <span className="font-medium text-gray-700 group-hover:text-gray-900">{item.label}</span>
                                                <ChevronRight className="w-4 h-4 ml-auto text-gray-300 group-hover:text-indigo-400" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-50 bg-gray-50/50 pb-safe">
                            {isAuthenticated ? (
                                <Link to="/customer/appointments" onClick={() => setMenuOpen(false)}>
                                    <Button className="w-full h-12 rounded-xl gradient-coral text-white font-bold shadow-lg shadow-indigo-500/25">
                                        Go to Dashboard
                                    </Button>
                                </Link>
                            ) : (
                                <Link to="/login" onClick={() => setMenuOpen(false)}>
                                    <Button variant="outline" className="w-full h-12 rounded-xl border-gray-200 hover:border-indigo-200 hover:text-indigo-600 font-medium bg-white">
                                        Sign In / Register
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </SheetContent>
            </Sheet >
        </>
    );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
    const [isFooterInView, setIsFooterInView] = useState(false);
    const footerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsFooterInView(entry.isIntersecting);
            },
            {
                threshold: 0.1,
            }
        );

        if (footerRef.current) {
            observer.observe(footerRef.current);
        }

        return () => {
            if (footerRef.current) {
                observer.unobserve(footerRef.current);
            }
        };
    }, []);

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col">
            <PublicHeader />
            <main className="flex-1 pt-16 pb-20 md:pb-0">
                <div className="animate-fade-in">
                    {children}
                </div>
            </main>
            <PublicFooter ref={footerRef} />
            <PublicBottomNavigation isVisible={!isFooterInView} />
        </div>
    );
}
