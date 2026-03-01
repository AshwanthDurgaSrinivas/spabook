import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { ScrollToTop } from './components/ScrollToTop';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { LayoutDashboard, Calendar, CalendarDays, Plus, Menu } from 'lucide-react';
import { cn } from './lib/utils';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Admin Pages
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { BookingManagementPage } from './pages/bookings/BookingManagementPage';
import { CalendarViewPage } from './pages/bookings/CalendarViewPage';
import { ServiceManagementPage } from './pages/services/ServiceManagementPage';
import { EmployeeManagementPage } from './pages/employees/EmployeeManagementPage';
import { NewEmployeePage } from './pages/employees/NewEmployeePage';
import { EmployeeDetailPage } from './pages/employees/EmployeeDetailPage';
import { NewServicePage } from './pages/services/NewServicePage';
import { EditServicePage } from './pages/services/EditServicePage';
import { ServiceDetailPage } from './pages/services/ServiceDetailPage';
import { NewCustomerPage } from './pages/customers/NewCustomerPage';
import { EditCustomerPage } from './pages/customers/EditCustomerPage';
import { CustomerManagementPage } from './pages/customers/CustomerManagementPage';
import { CRMDashboardPage } from './pages/crm/CRMDashboardPage';
import { LoyaltyProgramPage } from './pages/loyalty/LoyaltyProgramPage';
import { PaymentBillingPage } from './pages/payments/PaymentBillingPage';
import { InventoryManagementPage } from './pages/inventory/InventoryManagementPage';
import { MembershipPackagesPage } from './pages/membership/MembershipPackagesPage';
import { RoomManagementPage } from './pages/rooms/RoomManagementPage';
import { AttendancePage } from './pages/attendance/AttendancePage';
import { LeaveManagementPage } from './pages/attendance/LeaveManagementPage';
import { AnalyticsReportingPage } from './pages/analytics/AnalyticsReportingPage';
import { MarketingHubPage } from './pages/marketing/MarketingHubPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { CouponsPage } from './pages/coupons/CouponsPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { HelpPage } from './pages/help/HelpPage';
import { IntegrationsPage } from './pages/integrations/IntegrationsPage';
import { MessagesPage } from './pages/admin/MessagesPage';
import { AdminPackagesPage } from './pages/admin/PackageManagementPage';
import { GalleryManagementPage } from './pages/admin/GalleryManagementPage';
import { NotificationManagementPage } from './pages/admin/NotificationManagementPage';
import { AllNotificationsPage } from './pages/admin/AllNotificationsPage';
import { TaxManagementPage } from './pages/admin/TaxManagementPage';
import { GeofenceSettingsPage } from './pages/admin/GeofenceSettingsPage';
import { CareersManagementPage } from './pages/admin/CareersManagementPage';
import { AdminHelpManagementPage } from './pages/admin/AdminHelpManagementPage';

// Public Pages
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { ServicesPage } from './pages/public/ServicesPage';
import { ContactPage } from './pages/public/ContactPage';
import { PackagesPage } from './pages/public/PackagesPage';
import { GalleryPage } from './pages/public/GalleryPage';
import { BlogPage } from './pages/public/BlogPage';
import { CareersPage } from './pages/public/CareersPage';
import { CancellationPage, PrivacyPage, TermsPage } from './pages/public/LegalPages';
import { PublicLayout } from './components/layout/public/PublicLayout';

// Admin Details & Forms
import { BookingDetailPage } from './pages/bookings/BookingDetailPage';
import { NewBookingPage } from './pages/bookings/NewBookingPage';
import { BookingVerifyPage } from './pages/bookings/BookingVerifyPage';
import { CustomerDetailPage } from './pages/customers/CustomerDetailPage';
import { SocialSuccessPage } from './pages/auth/SocialSuccessPage';
// For now, mapping NewCustomer to placeholders or generic forms if needed


// Customer Pages
import { CustomerLayout } from './components/layout/customer/CustomerLayout';
import { BookingPage } from './pages/customer/BookingPage';
import { AppointmentsPage } from './pages/customer/AppointmentsPage';
import { ProfilePage } from './pages/customer/ProfilePage';
import { PaymentsPage } from './pages/customer/PaymentsPage';
import { LoyaltyPage } from './pages/customer/LoyaltyPage';
import { SettingsPage } from './pages/customer/SettingsPage';
import { MembershipPage as CustomerMembershipPage } from './pages/customer/MembershipPage';
import { CustomerPortalPage } from './pages/portal/CustomerPortalPage'; // Keep for reference

import './App.css';

function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 768);
  const [unreadNotifications, setUnreadNotifications] = useState(5);
  const [isBottomVisible, setIsBottomVisible] = useState(false);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

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

  const adminNavItems = [
    { icon: LayoutDashboard, label: 'Home', path: '/admin/dashboard' },
    { icon: Calendar, label: 'Bookings', path: '/admin/bookings' },
    { icon: Plus, label: 'New', path: '/admin/bookings/new', isCenter: true },
    { icon: CalendarDays, label: 'Schedule', path: '/admin/calendar' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-white flex">
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'md:pl-20' : 'md:pl-72'} pb-20 md:pb-0 overflow-x-hidden`}>
        <Header
          onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden overflow-y-auto scrollbar-smooth relative">
          <div className="max-w-7xl mx-auto w-full animate-fade-in">
            {children}
          </div>
          <div ref={bottomSentinelRef} className="absolute bottom-0 h-1 w-full pointer-events-none" />
        </main>
      </div>

      {/* Mobile Bottom Navigation for Admin */}
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
          {adminNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl transition-all duration-300 relative",
                  item.isCenter ? "-mt-8" : "p-1",
                  isActive && !item.isCenter ? "text-slate-900" : "text-slate-500 hover:text-slate-900"
                )}
              >
                {isActive && !item.isCenter && (
                  <motion.div
                    layoutId="adminBottomNavIndicator"
                    className="absolute -top-2 w-8 h-1 bg-indigo-600 rounded-full"
                  />
                )}

                <div className={cn(
                  "transition-all flex items-center justify-center",
                  item.isCenter
                    ? "w-14 h-14 bg-gradient-to-br from-[#4f46e5] to-[#8b5cf6] rounded-full text-white shadow-lg shadow-indigo-500/30 border-4 border-white"
                    : "p-2 rounded-full",
                  isActive && !item.isCenter && "bg-slate-50"
                )}>
                  <Icon className={cn(
                    "transition-all",
                    item.isCenter ? "w-6 h-6" : "w-6 h-6",
                    isActive && !item.isCenter && "text-slate-900"
                  )} />
                </div>
                <span className={cn(
                  "text-[10px] font-bold transition-colors",
                  item.isCenter ? "mt-1" : "",
                  isActive ? "text-slate-900" : "text-slate-500"
                )}>{item.label}</span>
              </Link>
            );
          })}
          {/* Menu Button to toggle Sidebar */}
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="flex flex-col items-center gap-1 p-1 rounded-xl text-slate-500 hover:text-slate-900 transition-all duration-300"
          >
            <div className="p-2 rounded-full">
              <Menu className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold">Menu</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  disallowedRoles?: string[];
}

function ProtectedRoute({ children, allowedRoles, disallowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">Initializing Session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has an allowed role
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect based on what they ARE allowed to see
    if (user.role === 'customer') return <Navigate to="/customer/appointments" replace />;
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Check if user has a disallowed role
  if (disallowedRoles && user && disallowedRoles.includes(user.role)) {
    // Staff roles should go to admin dashboard
    if (['admin', 'manager', 'receptionist', 'therapist', 'employee', 'super_admin'].includes(user.role)) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    // Otherwise fallback to customer area if they are somehow blocked there but not staff
    return <Navigate to="/customer/appointments" replace />;
  }

  return <>{children}</>;
}

function RedirectWithQuery({ to }: { to: string }) {
  const location = useLocation();
  return <Navigate to={`${to}${location.search}`} replace />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <ScrollToTop />
            <Toaster
              position="top-right"
              richColors
              closeButton
              toastOptions={{
                style: {
                  background: 'linear-gradient(135deg, #4f46e5 0%, #8b5cf6 100%)',
                  color: 'white',
                  border: 'none',
                },
              }}
            />
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/auth/success" element={<SocialSuccessPage />} />

              {/* Legacy and Incorrect Route Redirects */}
              <Route path="/booking" element={<RedirectWithQuery to="/customer/booking" />} />
              <Route path="/book" element={<RedirectWithQuery to="/customer/booking" />} />

              {/* Public Routes */}
              <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
              <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
              <Route path="/services" element={<PublicLayout><ServicesPage /></PublicLayout>} />
              <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
              <Route path="/packages" element={<PublicLayout><PackagesPage /></PublicLayout>} />
              <Route path="/gallery" element={<PublicLayout><GalleryPage /></PublicLayout>} />
              <Route path="/blog" element={<PublicLayout><BlogPage /></PublicLayout>} />
              <Route path="/careers" element={<PublicLayout><CareersPage /></PublicLayout>} />
              <Route path="/help" element={<PublicLayout><HelpPage /></PublicLayout>} />
              <Route path="/cancellation" element={<PublicLayout><CancellationPage /></PublicLayout>} />
              <Route path="/privacy" element={<PublicLayout><PrivacyPage /></PublicLayout>} />
              <Route path="/terms" element={<PublicLayout><TermsPage /></PublicLayout>} />

              {/* Customer Dashboard Routes - Restricted to ONLY customers */}
              <Route
                path="/customer"
                element={
                  <ProtectedRoute disallowedRoles={['admin', 'manager', 'employee', 'receptionist', 'therapist', 'super_admin']}>
                    <CustomerLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="appointments" replace />} />
                <Route path="appointments" element={<AppointmentsPage />} />
                <Route path="booking" element={<BookingPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="payments" element={<PaymentsPage />} />
                <Route path="loyalty" element={<LoyaltyPage />} />
                <Route path="membership" element={<CustomerMembershipPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="help" element={<HelpPage />} />
              </Route>
              {/* Direct route for booking flow outside of dashboard if needed, or keep inside */}
              {/* Direct route for booking flow outside of dashboard if needed, or keep inside */}
              <Route element={<ProtectedRoute disallowedRoles={['admin', 'manager', 'employee', 'receptionist', 'therapist', 'super_admin']}><CustomerLayout /></ProtectedRoute>}>
                <Route path="/book" element={<BookingPage />} />
                <Route path="/membership" element={<CustomerMembershipPage />} />
              </Route>


              {/* Admin Routes */}
              <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
              <Route path="/dashboard" element={<Navigate to="/admin/dashboard" />} /> {/* Redirect old path */}

              <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'therapist', 'super_admin', 'employee']}><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/bookings" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'therapist', 'super_admin', 'employee']}><AppLayout><BookingManagementPage /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/bookings/new" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'therapist', 'super_admin', 'employee']}><AppLayout><NewBookingPage /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/bookings/verify/:id" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'therapist', 'super_admin', 'employee']}><AppLayout><BookingVerifyPage /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/bookings/:id" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'therapist', 'super_admin', 'employee']}><AppLayout><BookingDetailPage /></AppLayout></ProtectedRoute>} />

              <Route path="/admin/calendar" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'therapist', 'super_admin', 'employee']}><AppLayout><CalendarViewPage /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/services" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'therapist', 'super_admin', 'employee']}><AppLayout><ServiceManagementPage /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/services/new" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'therapist', 'super_admin', 'employee']}><AppLayout><NewServicePage /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/services/edit/:id" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'therapist', 'super_admin', 'employee']}><AppLayout><EditServicePage /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/services/:id" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'therapist', 'super_admin', 'employee']}><AppLayout><ServiceDetailPage /></AppLayout></ProtectedRoute>} />

              <Route path="/admin/employees" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'therapist', 'super_admin', 'employee']}><AppLayout><EmployeeManagementPage /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/employees/new" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'therapist', 'super_admin', 'employee']}><AppLayout><NewEmployeePage /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/employees/:id" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'therapist', 'super_admin', 'employee']}><AppLayout><EmployeeDetailPage /></AppLayout></ProtectedRoute>} />

              <Route path="/admin/customers" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'therapist', 'super_admin', 'employee']}><AppLayout><CustomerManagementPage /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/customers/new" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'therapist', 'super_admin', 'employee']}><AppLayout><NewCustomerPage /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/customers/edit/:id" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'therapist', 'super_admin', 'employee']}><AppLayout><EditCustomerPage /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/customers/:id" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'therapist', 'super_admin', 'employee']}><AppLayout><CustomerDetailPage /></AppLayout></ProtectedRoute>} />

              <Route path="/admin/crm" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'therapist', 'super_admin', 'employee']}><AppLayout><CRMDashboardPage /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/loyalty" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'therapist', 'super_admin', 'employee']}><AppLayout><LoyaltyProgramPage /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/payments" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'therapist', 'super_admin', 'employee']}><AppLayout><PaymentBillingPage /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/inventory" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'therapist', 'super_admin', 'employee']}><AppLayout><InventoryManagementPage /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/memberships" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'therapist', 'super_admin', 'employee']}><AppLayout><MembershipPackagesPage /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/rooms" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'therapist', 'super_admin', 'employee']}><AppLayout><RoomManagementPage /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/attendance" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'therapist', 'super_admin', 'employee']}><AppLayout><AttendancePage /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/my-attendance" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'therapist', 'super_admin', 'employee']}><AppLayout><AttendancePage forcePersonal={true} /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/leave" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'therapist', 'super_admin', 'employee']}><AppLayout><LeaveManagementPage /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/my-leave" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'therapist', 'super_admin', 'employee']}><AppLayout><LeaveManagementPage forcePersonal={true} /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'therapist', 'super_admin', 'employee']}><AppLayout><AnalyticsReportingPage /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/marketing" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'therapist', 'super_admin', 'employee']}><AppLayout><MarketingHubPage /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/coupons" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'therapist', 'super_admin', 'employee']}><AppLayout><CouponsPage /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/gallery" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'therapist', 'super_admin', 'employee']}><AppLayout><GalleryManagementPage /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'therapist', 'super_admin', 'employee']}><AppLayout><ReportsPage /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/help" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'therapist', 'super_admin', 'employee']}><AppLayout><AdminHelpManagementPage /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/integrations" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'therapist', 'super_admin', 'employee']}><AppLayout><IntegrationsPage /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/messages" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'therapist', 'super_admin', 'employee']}><AppLayout><MessagesPage /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/push-notifications" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'therapist', 'super_admin', 'employee']}><AppLayout><NotificationManagementPage /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/notifications/all" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'therapist', 'super_admin', 'employee']}><AppLayout><AllNotificationsPage /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/packages" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'therapist', 'super_admin', 'employee']}><AppLayout><AdminPackagesPage /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/taxes" element={<ProtectedRoute allowedRoles={['admin']}><AppLayout><TaxManagementPage /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/careers" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><AppLayout><CareersManagementPage /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'therapist', 'super_admin', 'employee']}><AppLayout><AdminSettingsPage /></AppLayout></ProtectedRoute>} />
              <Route path="/admin/geofence" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><AppLayout><GeofenceSettingsPage /></AppLayout></ProtectedRoute>} />

              {/* Legacy Portal Route - Redirect to new Appointments */}
              <Route path="/portal" element={<Navigate to="/customer/appointments" />} />

            </Routes>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
