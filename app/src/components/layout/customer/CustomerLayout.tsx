import { useState } from 'react';
import { BrandLogo } from '../BrandLogo';
import { motion } from 'framer-motion';
import {
    Users, Calendar, CreditCard, Gift, Settings,
    LogOut, Bell, Search, Menu, X, ChevronRight, ChevronLeft, User,
    Home, Info, Sparkles, Phone, BookOpen, Instagram, Crown
} from 'lucide-react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

export function CustomerLayout() {
    const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isBottomVisible, setIsBottomVisible] = useState(false);
    const bottomSentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsBottomVisible(entry.isIntersecting);
            },
            { threshold: 0.1 }
        );

        if (bottomSentinelRef.current) {
            observer.observe(bottomSentinelRef.current);
        }

        return () => {
            if (bottomSentinelRef.current) {
                observer.unobserve(bottomSentinelRef.current);
            }
        };
    }, []);


    if (!user) return null; // Or redirect

    const menuItems = [
        { icon: Calendar, label: 'My Appointments', path: '/customer/appointments' },
        { icon: Calendar, label: 'Book Appointment', path: '/customer/booking' },
        { icon: Crown, label: 'Membership', path: '/customer/membership' },
        { icon: User, label: 'Profile', path: '/customer/profile' },
        { icon: CreditCard, label: 'Payments', path: '/customer/payments' },
        { icon: Gift, label: 'Loyalty & Rewards', path: '/customer/loyalty' },
        { icon: Settings, label: 'Settings', path: '/customer/settings' },
    ];

    const publicLinks = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Info, label: 'About', path: '/about' },
        { icon: Sparkles, label: 'Services', path: '/services' },
        { icon: Gift, label: 'Packages', path: '/packages' },
        { icon: Instagram, label: 'Gallery', path: '/gallery' },
        { icon: BookOpen, label: 'Blog', path: '/blog' },
        { icon: Phone, label: 'Contact', path: '/contact' },
    ];

    const mobileNavItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Info, label: 'About', path: '/about' },
        { icon: Sparkles, label: 'Services', path: '/services' },
        { icon: Phone, label: 'Contact', path: '/contact' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Desktop Sidebar (Hidden on Mobile) */}
            <motion.aside
                initial={false}
                animate={{
                    width: isSidebarOpen ? 280 : 80,
                }}
                className={cn(
                    "hidden lg:flex bg-white border-r border-gray-100 flex-col fixed h-full z-50 shadow-sm transition-all duration-300",
                )}
            >
                <div className={cn(
                    "h-20 flex items-center border-b border-gray-50 transition-all duration-300 relative",
                    isSidebarOpen ? "justify-between px-6" : "justify-center px-4"
                )}>
                    <Link to="/" className={cn("flex flex-shrink-0 items-center overflow-hidden transition-all", isSidebarOpen ? "gap-3" : "gap-0")}>
                        <BrandLogo collapsed={!isSidebarOpen} />
                    </Link>

                    <button
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        className={cn(
                            "transition-all duration-200",
                            isSidebarOpen
                                ? "text-gray-400 hover:text-indigo-600"
                                : "absolute -right-4 top-6 w-8 h-8 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-indigo-600 hover:scale-110 z-[60]"
                        )}
                    >
                        {isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                </div>

                <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto scrollbar-thin">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                title={!isSidebarOpen ? item.label : undefined}
                                className={cn(
                                    "flex items-center rounded-xl transition-all duration-200 group relative",
                                    isSidebarOpen ? "gap-4 px-4 py-3" : "justify-center p-3 mx-2",
                                    isActive
                                        ? 'bg-indigo-50 text-indigo-600 font-medium'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                )}
                            >
                                <item.icon className={cn(
                                    "w-5 h-5 flex-shrink-0",
                                    isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'
                                )} />
                                {isSidebarOpen && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="whitespace-nowrap"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                                {!isSidebarOpen && (
                                    <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-xl">
                                        {item.label}
                                    </div>
                                )}
                            </Link>
                        )
                    })}

                    <div className="pt-6 mt-6 border-t border-gray-50">
                        {isSidebarOpen && (
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-4">
                                Main Website
                            </p>
                        )}
                        <div className="space-y-2">
                            {publicLinks.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    title={!isSidebarOpen ? item.label : undefined}
                                    className={cn(
                                        "flex items-center rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group relative",
                                        isSidebarOpen ? "gap-4 px-4 py-3" : "justify-center p-3 mx-2"
                                    )}
                                >
                                    <item.icon className="w-5 h-5 flex-shrink-0 text-gray-400 group-hover:text-gray-600" />
                                    {isSidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
                                    {!isSidebarOpen && (
                                        <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-xl">
                                            {item.label}
                                        </div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                </nav>

                <div className={cn("border-t border-gray-50", isSidebarOpen ? "p-4" : "p-2")}>
                    <button
                        onClick={() => {
                            logout();
                            navigate('/login');
                        }}
                        className={cn(
                            "flex items-center rounded-xl w-full text-left transition-colors hover:bg-red-50 text-gray-500 hover:text-red-600",
                            isSidebarOpen ? "gap-4 px-4 py-3" : "justify-center p-3"
                        )}
                        title={!isSidebarOpen ? "Sign Out" : undefined}
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {isSidebarOpen && <span>Sign Out</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarOpen ? 'lg:pl-[280px]' : 'lg:pl-[80px]'} pb-20 md:pb-0 relative overflow-x-hidden`}>
                {/* Top Header */}
                <header className="h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 transition-all">
                    <div className="flex items-center gap-3">
                        {/* Mobile Logo (Only visible on mobile) */}
                        <Link to="/" className="md:hidden">
                            <BrandLogo size="sm" />
                        </Link>
                        {/* Tablet Hamburger (Visible only on Tablet) */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="hidden md:flex lg:hidden text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 p-2 rounded-lg transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <span className="font-bold text-lg md:text-xl text-gray-900 hidden md:block">
                            {location.pathname === '/customer/booking' ? 'Book Appointment' :
                                location.pathname === '/customer/appointments' ? 'My Appointments' :
                                    location.pathname === '/customer/profile' ? 'My Profile' : 'Sparkle Lounge'}
                        </span>
                    </div>

                    <div className="hidden md:flex items-center bg-gray-50 rounded-full px-4 py-2 md:w-64 lg:w-96 border border-gray-100 focus-within:border-indigo-200 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                        <Search className="w-4 h-4 text-gray-400 mr-2" />
                        <input type="text" placeholder="Search appointments, services..." className="bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-400" />
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative text-gray-400 hover:text-indigo-600 transition-colors p-2 hover:bg-gray-50 rounded-full">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white ring-1 ring-white" />
                        </button>

                        <DropdownMenu>
                            <DropdownMenuTrigger className="outline-none">
                                <div className="flex items-center gap-3 hover:bg-gray-50 p-1 md:p-2 rounded-full transition-colors md:pr-4 md:border border-transparent md:hover:border-gray-100">
                                    <Avatar className="h-8 w-8 md:h-10 md:w-10 border-2 border-white shadow-sm cursor-pointer">
                                        <AvatarImage src={user.avatar} />
                                        <AvatarFallback className="bg-indigo-100 text-indigo-600">{user.firstName[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="text-left hidden md:block">
                                        <p className="text-sm font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                                        <p className="text-xs text-indigo-600 font-medium tracking-tight">
                                            {(user as any)?.membership?.plan?.name || user?.role.charAt(0).toUpperCase() + user?.role.slice(1) || 'Member'}
                                        </p>
                                    </div>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => navigate('/customer/profile')}>Profile</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate('/customer/settings')}>Settings</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate('/customer/loyalty')}>Loyalty Points</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => {
                                    logout();
                                    navigate('/login');
                                }} className="text-red-600">
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 md:p-8 animate-fade-in relative overflow-y-auto">
                    <div className="max-w-7xl mx-auto w-full">
                        <Outlet />
                    </div>
                    <div ref={bottomSentinelRef} className="absolute bottom-0 h-1 w-full pointer-events-none" />
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <motion.div
                initial={{ y: 0, opacity: 1 }}
                animate={{
                    y: isBottomVisible ? 100 : 0,
                    opacity: isBottomVisible ? 0 : 1
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="md:hidden fixed bottom-5 left-4 right-4 bg-white/70 backdrop-blur-3xl rounded-full px-4 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-white/40 z-50"
            >
                <div className="flex items-center justify-between">
                    {mobileNavItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex flex-col items-center gap-1 rounded-xl transition-all duration-300 relative",
                                    item.label === 'Services' ? "-mt-8" : "p-1",
                                    isActive && item.label !== 'Services' ? "text-slate-900" : "text-slate-500 hover:text-slate-900"
                                )}
                            >
                                {isActive && item.label !== 'Services' && (
                                    <motion.div
                                        layoutId="bottomNavIndicator"
                                        className="absolute -top-2 w-8 h-1 bg-indigo-600 rounded-full"
                                    />
                                )}

                                <div className={cn(
                                    "transition-all flex items-center justify-center",
                                    item.label === 'Services'
                                        ? "w-14 h-14 bg-gradient-to-br from-[#4f46e5] to-[#8b5cf6] rounded-full text-white shadow-lg shadow-indigo-500/30 border-4 border-white"
                                        : "p-2 rounded-full",
                                    isActive && item.label !== 'Services' && "bg-slate-50"
                                )}>
                                    <item.icon className={cn(
                                        "transition-all",
                                        item.label === 'Services' ? "w-6 h-6" : "w-6 h-6",
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
                    {/* More Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="flex flex-col items-center gap-1 p-1 rounded-xl text-slate-500 hover:text-slate-900 transition-all duration-300"
                    >
                        <div className="p-2 rounded-full">
                            <Menu className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold">Menu</span>
                    </button>
                </div>
            </motion.div>

            {/* Mobile "More" Drawer (Reusing Sidebar) */}
            {/* Mobile Menu Sheet */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0 border-r border-indigo-100 z-[60]">
                    <SheetHeader className="sr-only">
                        <SheetTitle>Navigation Menu</SheetTitle>
                        <SheetDescription>Access your customer dashboard and main website links.</SheetDescription>
                    </SheetHeader>
                    <div className="flex flex-col h-full bg-white">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <div className="flex items-center">
                                <BrandLogo size="lg" />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {/* Public Links */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Explore</h3>
                                <div className="space-y-2">
                                    {publicLinks.map((link) => {
                                        const isActive = location.pathname === link.path;
                                        return (
                                            <Link
                                                key={link.path}
                                                to={link.path}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className={`flex items-center gap-4 p-3 rounded-xl transition-all border group ${isActive
                                                    ? 'bg-indigo-50 border-indigo-100'
                                                    : 'hover:bg-indigo-50 border-transparent hover:border-indigo-100'
                                                    }`}
                                            >
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-sm ${isActive
                                                    ? 'bg-white text-indigo-600'
                                                    : 'bg-gray-50 group-hover:bg-white text-gray-400 group-hover:text-indigo-600'
                                                    }`}>
                                                    <link.icon className="w-5 h-5" />
                                                </div>
                                                <span className={`font-medium ${isActive ? 'text-indigo-900 font-bold' : 'text-gray-700 group-hover:text-gray-900'}`}>{link.label}</span>
                                                <ChevronRight className={`w-4 h-4 ml-auto transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-300 group-hover:text-indigo-400'}`} />
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Customer Dashboard Links */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">My Portal</h3>
                                <div className="space-y-2">
                                    {[
                                        { icon: Calendar, label: 'My Appointments', path: '/customer/appointments' },
                                        { icon: Calendar, label: 'Book Appointment', path: '/customer/booking' },
                                        { icon: Crown, label: 'Membership', path: '/customer/membership' },
                                        { icon: User, label: 'Profile', path: '/customer/profile' },
                                        { icon: CreditCard, label: 'Payments', path: '/customer/payments' },
                                        { icon: Gift, label: 'Rewards', path: '/customer/loyalty' },
                                        { icon: Settings, label: 'Settings', path: '/customer/settings' },
                                    ].map((item) => {
                                        const isActive = location.pathname === item.path;
                                        return (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className={`flex items-center gap-4 p-3 rounded-xl transition-all border group ${isActive
                                                    ? 'bg-indigo-50 border-indigo-100'
                                                    : 'hover:bg-indigo-50 border-transparent hover:border-indigo-100'
                                                    }`}
                                            >
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-sm ${isActive
                                                    ? 'bg-white text-indigo-600'
                                                    : 'bg-gray-50 group-hover:bg-white text-gray-400 group-hover:text-indigo-600'
                                                    }`}>
                                                    <item.icon className="w-5 h-5" />
                                                </div>
                                                <span className={`font-medium ${isActive ? 'text-indigo-900 font-bold' : 'text-gray-700 group-hover:text-gray-900'}`}>{item.label}</span>
                                                <ChevronRight className={`w-4 h-4 ml-auto transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-300 group-hover:text-indigo-400'}`} />
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-50 bg-gray-50/50 pb-safe">
                            <button
                                onClick={() => {
                                    logout();
                                    navigate('/login');
                                }}
                                className="w-full flex items-center justify-center gap-2 h-12 rounded-xl border border-red-200 text-red-600 font-medium hover:bg-red-50 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
