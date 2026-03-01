import { useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  LayoutDashboard, Calendar, CalendarDays, Sparkles, Users, UserCircle, Heart, Award, Bell,
  CreditCard, Package, Crown, Gift, Ticket, DoorOpen, Clock, BarChart3, FileText, Briefcase,
  Megaphone, Plug, Settings, HelpCircle, ChevronLeft, ChevronRight, Mail, Image, Send, Percent, MapPin
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: string;
  badge?: string | number | null;
  allowedRoles?: string[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const adminNavigationGroups: NavGroup[] = [
  {
    title: 'Operations',
    items: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: 'LayoutDashboard', allowedRoles: ['admin', 'manager', 'receptionist', 'therapist', 'employee', 'super_admin'] },
      { name: 'Bookings', path: '/admin/bookings', icon: 'Calendar', allowedRoles: ['admin', 'manager', 'receptionist', 'therapist', 'employee', 'super_admin'] },
      { name: 'Calendar', path: '/admin/calendar', icon: 'CalendarDays', allowedRoles: ['admin', 'manager', 'receptionist', 'therapist', 'employee', 'super_admin'] },
      { name: 'Analytics', path: '/admin/analytics', icon: 'BarChart3', allowedRoles: ['admin', 'manager', 'super_admin'] },
    ]
  },
  {
    title: 'Client Management',
    items: [
      { name: 'Customers', path: '/admin/customers', icon: 'UserCircle', allowedRoles: ['admin', 'manager', 'receptionist', 'employee', 'super_admin'] },
      { name: 'Memberships', path: '/admin/memberships', icon: 'Crown', allowedRoles: ['admin', 'manager', 'super_admin'] },
      { name: 'Loyalty', path: '/admin/loyalty', icon: 'Award', allowedRoles: ['admin', 'manager', 'super_admin'] },
      { name: 'Packages', path: '/admin/packages', icon: 'Package', allowedRoles: ['admin', 'manager', 'super_admin'] },
      { name: 'CRM', path: '/admin/crm', icon: 'Heart', allowedRoles: ['admin', 'manager', 'super_admin'] },
    ]
  },
  {
    title: 'Human Resources',
    items: [
      { name: 'Employees', path: '/admin/employees', icon: 'Users', allowedRoles: ['admin', 'manager', 'super_admin'] },
      { name: 'Staff Attendance', path: '/admin/attendance', icon: 'BarChart3', allowedRoles: ['admin', 'manager', 'super_admin'] },
      { name: 'Staff Leaves', path: '/admin/leave', icon: 'CalendarDays', allowedRoles: ['admin', 'manager', 'super_admin'] },
      { name: 'Geofencing', path: '/admin/geofence', icon: 'MapPin', allowedRoles: ['admin', 'manager', 'super_admin'] },
      { name: 'My Attendance', path: '/admin/my-attendance', icon: 'Clock', allowedRoles: ['manager', 'therapist', 'receptionist', 'employee'] },
      { name: 'My Leaves', path: '/admin/my-leave', icon: 'CalendarDays', allowedRoles: ['manager', 'therapist', 'receptionist', 'employee'] },
    ]
  },
  {
    title: 'Financials',
    items: [
      { name: 'Payments', path: '/admin/payments', icon: 'CreditCard', allowedRoles: ['admin', 'manager', 'receptionist', 'super_admin'] },
      { name: 'Taxes', path: '/admin/taxes', icon: 'Percent', allowedRoles: ['admin', 'super_admin'] },
      { name: 'Coupons', path: '/admin/coupons', icon: 'Ticket', allowedRoles: ['admin', 'manager', 'super_admin'] },
      { name: 'Reports', path: '/admin/reports', icon: 'FileText', allowedRoles: ['admin', 'manager', 'super_admin'] },
    ]
  },
  {
    title: 'Resources',
    items: [
      { name: 'Services', path: '/admin/services', icon: 'Sparkles', allowedRoles: ['admin', 'manager', 'super_admin'] },
      { name: 'Rooms', path: '/admin/rooms', icon: 'DoorOpen', allowedRoles: ['admin', 'manager', 'super_admin'] },
      { name: 'Inventory', path: '/admin/inventory', icon: 'Package', allowedRoles: ['admin', 'manager', 'super_admin'] },
    ]
  },
  {
    title: 'Communication',
    items: [
      { name: 'Messages', path: '/admin/messages', icon: 'Mail', allowedRoles: ['admin', 'manager', 'super_admin'] },
      { name: 'Notifications', path: '/admin/notifications/all', icon: 'Bell', allowedRoles: ['admin', 'manager', 'receptionist', 'therapist', 'employee', 'super_admin'] },
      { name: 'Push Notifications', path: '/admin/push-notifications', icon: 'Send', allowedRoles: ['admin', 'manager', 'super_admin'] },
      { name: 'Gallery', path: '/admin/gallery', icon: 'Image', allowedRoles: ['admin', 'manager', 'super_admin'] },
      { name: 'Careers', path: '/admin/careers', icon: 'Briefcase', allowedRoles: ['admin', 'manager'] },
    ]
  },
  {
    title: 'System',
    items: [
      { name: 'Integrations', path: '/admin/integrations', icon: 'Plug', allowedRoles: ['admin', 'super_admin'] },
      { name: 'Help', path: '/admin/help', icon: 'HelpCircle', allowedRoles: ['admin', 'manager', 'receptionist', 'therapist', 'employee', 'super_admin'] },
      { name: 'Settings', path: '/admin/settings', icon: 'Settings', allowedRoles: ['admin', 'super_admin'] },
    ]
  }
];

const customerNavigation: NavItem[] = [
  { name: 'Appointments', path: '/customer/appointments', icon: 'Calendar' },
  { name: 'Loyalty Rewards', path: '/customer/loyalty', icon: 'Award' },
  { name: 'Payments', path: '/customer/payments', icon: 'CreditCard' },
  { name: 'Profile', path: '/customer/profile', icon: 'UserCircle' },
  { name: 'Settings', path: '/customer/settings', icon: 'Settings' },
  { name: 'Help & Support', path: '/customer/help', icon: 'HelpCircle' },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Calendar, CalendarDays, Sparkles, Users, UserCircle, Heart, Award, Bell,
  CreditCard, Package, Crown, Gift, Ticket, DoorOpen, Clock, BarChart3, FileText,
  Megaphone, Plug, Settings, HelpCircle, Mail, Image, Send, Percent, MapPin, Briefcase
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const renderNavItem = (item: NavItem, index: number) => {
    const Icon = iconMap[item.icon as keyof typeof iconMap] || Settings;
    const active = isActive(item.path);
    const isHovered = hoveredItem === item.path;

    return (
      <li
        key={item.path}
        style={{ animationDelay: `${index * 30}ms` }}
        className="animate-slide-up"
      >
        <Link
          to={item.path}
          onMouseEnter={() => setHoveredItem(item.path)}
          onMouseLeave={() => setHoveredItem(null)}
          onClick={() => {
            if (window.innerWidth < 768) {
              onToggle();
            }
          }}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
            active
              ? 'gradient-coral text-white shadow-coral'
              : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600',
            collapsed && 'justify-center'
          )}
        >
          <Icon className={cn(
            'w-5 h-5 flex-shrink-0 transition-transform duration-200',
            (active || isHovered) && 'scale-110'
          )} />

          {!collapsed && (
            <>
              <span className="font-medium text-sm whitespace-nowrap flex-1">
                {item.name}
              </span>
              {item.badge && (
                <span className={cn(
                  'px-2 py-0.5 text-xs font-semibold rounded-full',
                  active ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-600'
                )}>
                  {item.badge}
                </span>
              )}
            </>
          )}

          {collapsed && (
            <div className={cn(
              'absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg',
              'whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible',
              'transition-all duration-200 z-50 shadow-lg',
            )}>
              {item.name}
            </div>
          )}
        </Link>
      </li>
    );
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden transition-all duration-300",
          collapsed ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
        )}
        onClick={onToggle}
      />
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen bg-white/90 backdrop-blur-xl border-r border-indigo-100',
          'flex flex-col transition-all duration-300 ease-in-out z-50',
          'shadow-soft',
          collapsed ? '-translate-x-full md:translate-x-0 md:w-20' : 'translate-x-0 w-72'
        )}
      >
        <div className={cn(
          "h-20 flex items-center border-b border-indigo-100 transition-all duration-300",
          collapsed ? "justify-center px-0" : "justify-between px-4"
        )}>
          <Link to="/" className={cn("flex items-center overflow-hidden transition-all", collapsed ? "gap-0" : "gap-3")}>
            <BrandLogo collapsed={collapsed} />
          </Link>
          <button
            onClick={onToggle}
            className={cn(
              'w-8 h-8 rounded-lg bg-indigo-50 hover:bg-indigo-100 flex items-center justify-center',
              'transition-all duration-200 hover:scale-110',
              collapsed ? 'absolute -right-4 top-6 bg-white shadow-md border border-indigo-100 z-[60]' : ''
            )}
          >
            {collapsed ? <ChevronRight className="w-4 h-4 text-indigo-600" /> : <ChevronLeft className="w-4 h-4 text-indigo-600" />}
          </button>
        </div>

        <nav className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden py-4 scrollbar-smooth custom-scrollbar",
          collapsed ? "px-2" : "px-3"
        )}>
          {user?.role === 'customer' ? (
            <ul className="space-y-1">
              {customerNavigation.map((item, index) => renderNavItem(item, index))}
            </ul>
          ) : (
            <div className="space-y-6">
              {adminNavigationGroups.map((group, groupIndex) => {
                const visibleItems = group.items.filter(item =>
                  !item.allowedRoles || (user && item.allowedRoles.includes(user.role))
                );

                if (visibleItems.length === 0) return null;

                return (
                  <div key={group.title} className="space-y-2">
                    {!collapsed && (
                      <h3 className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {group.title}
                      </h3>
                    )}
                    <ul className="space-y-1">
                      {visibleItems.map((item, itemIndex) =>
                        renderNavItem(item, groupIndex * 10 + itemIndex)
                      )}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-indigo-100">
          <div className={cn(
            'flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-slate-50',
            collapsed && 'justify-center'
          )}>
            <div className="w-10 h-10 rounded-full gradient-coral flex items-center justify-center flex-shrink-0 shadow-coral cursor-pointer">
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=F08080&color=fff`}
                className="w-full h-full rounded-full border-2 border-white/20"
                alt="Avatar"
              />
            </div>
            {!collapsed && (
              <div className="animate-fade-in overflow-hidden">
                <p className="font-medium text-sm text-gray-800 truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-indigo-500 truncate">
                  {user?.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
