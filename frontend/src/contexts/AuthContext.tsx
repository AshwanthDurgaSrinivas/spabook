import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  role: string;
  userType: 'User' | 'Employee';
  permissions: string[];
  createdAt?: string;
  updatedAt?: string;
  membership?: any;
  marketingEmails?: boolean;
  smsNotifications?: boolean;
  language?: string;
  darkMode?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo user for development
const DEMO_ADMIN: User = {
  id: '1',
  email: 'admin@spabook.com',
  firstName: 'Admin',
  lastName: 'User',
  avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=F08080&color=fff',
  role: 'super_admin',
  userType: 'User',
  permissions: ['*'],
};

const DEMO_CUSTOMER: User = {
  id: '2',
  email: 'customer@example.com',
  firstName: 'John',
  lastName: 'Doe',
  avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=A0C4FF&color=fff',
  role: 'customer',
  userType: 'User',
  permissions: ['view_services', 'book_appointment'],
};

const DEMO_MANAGER: User = {
  id: '3',
  email: 'manager@spabook.com',
  firstName: 'Sarah',
  lastName: 'Connor',
  avatar: 'https://ui-avatars.com/api/?name=Sarah+Connor&background=FFD700&color=fff',
  role: 'manager',
  userType: 'User',
  permissions: ['manage_bookings', 'view_reports', 'manage_staff', 'manage_inventory'],
};

const DEMO_RECEPTIONIST: User = {
  id: '4',
  email: 'receptionist@spabook.com',
  firstName: 'Pam',
  lastName: 'Beesly',
  avatar: 'https://ui-avatars.com/api/?name=Pam+Beesly&background=98FB98&color=fff',
  role: 'receptionist',
  userType: 'Employee',
  permissions: ['manage_bookings', 'check_in_guest', 'process_payments'],
};

const DEMO_THERAPIST: User = {
  id: '5',
  email: 'therapist@spabook.com',
  firstName: 'Phoebe',
  lastName: 'Buffay',
  avatar: 'https://ui-avatars.com/api/?name=Phoebe+Buffay&background=DDA0DD&color=fff',
  role: 'therapist',
  userType: 'Employee',
  permissions: ['view_schedule', 'update_service_status'],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');

      if (storedToken) {
        try {
          // Verify token and get fresh user data
          const response = await fetch('http://localhost:5000/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            const user = data.user;

            const mappedUser: User = {
              id: String(user.id),
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              phone: user.phone,
              role: user.role,
              userType: user.userType,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
              membership: user.membership,
              marketingEmails: user.marketingEmails,
              smsNotifications: user.smsNotifications,
              language: user.language,
              darkMode: user.darkMode,
              avatar: `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`,
              permissions: user.role === 'admin' || user.role === 'super_admin' ? ['*'] :
                user.role === 'manager' ? ['manage_bookings', 'view_reports', 'manage_staff', 'manage_inventory'] :
                  user.role === 'receptionist' ? ['manage_bookings', 'check_in_guest', 'process_payments'] :
                    user.role === 'employee' || user.role === 'therapist' ? ['view_schedule', 'update_service_status'] :
                      ['view_services', 'book_appointment']
            };

            setUser(mappedUser);
            localStorage.setItem('user', JSON.stringify(mappedUser));
          } else {
            // Token invalid or expired
            localStorage.removeItem('user');
            localStorage.removeItem('auth_token');
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          // Fallback to local storage if network fails? Or clear?
          // For safety, maybe keep local storage but warn?
          // Let's clear to be safe against stale data issues that are confusing user
          localStorage.removeItem('user');
          localStorage.removeItem('auth_token');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      const user = data.user;

      // Map backend user to frontend user model (add permissions based on role for now)
      const mappedUser: User = {
        id: String(user.id),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        userType: user.userType,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        membership: user.membership,
        marketingEmails: user.marketingEmails,
        smsNotifications: user.smsNotifications,
        language: user.language,
        darkMode: user.darkMode,
        avatar: `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`,
        permissions: user.role === 'admin' || user.role === 'super_admin' ? ['*'] :
          user.role === 'manager' ? ['manage_bookings', 'view_reports', 'manage_staff', 'manage_inventory'] :
            user.role === 'receptionist' ? ['manage_bookings', 'check_in_guest', 'process_payments'] :
              user.role === 'employee' || user.role === 'therapist' ? ['view_schedule', 'update_service_status'] :
                ['view_services', 'book_appointment'] // Customer
      };

      setUser(mappedUser);
      localStorage.setItem('user', JSON.stringify(mappedUser));
      localStorage.setItem('auth_token', data.token);
      return mappedUser;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          role: 'customer' // Default role
        }),
      });
      console.log('Sending registration data:', { ...data, password: '***' }); // DEBUG LOG

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      // Auto login after register or just notify
      // For now, let's auto login logic or just return
      // We'll mimic login success logic if needed, but usually register just creates user.
      // Let's assume user needs to login after register? Or auto-login.
      // Let's try to auto-login using the same logic or just fetch token if backend returned it.
      // My backend register returns { message, userId }. No token.
      // So user has to login.

      // We will perform login immediately
      await login(data.email, data.password);

    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = (permission: string) => {
    if (!user) return false;
    if (user.permissions.includes('*')) return true;
    return user.permissions.includes(permission);
  };

  const refreshUser = async () => {
    const storedToken = localStorage.getItem('auth_token');
    if (!storedToken) return;

    try {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${storedToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const user = data.user;

        const mappedUser: User = {
          id: String(user.id),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          userType: user.userType,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          membership: user.membership,
          marketingEmails: user.marketingEmails,
          smsNotifications: user.smsNotifications,
          language: user.language,
          darkMode: user.darkMode,
          avatar: `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`,
          permissions: user.role === 'admin' || user.role === 'super_admin' ? ['*'] :
            user.role === 'manager' ? ['manage_bookings', 'view_reports', 'manage_staff', 'manage_inventory'] :
              user.role === 'receptionist' ? ['manage_bookings', 'check_in_guest', 'process_payments'] :
                user.role === 'employee' || user.role === 'therapist' ? ['view_schedule', 'update_service_status'] :
                  ['view_services', 'book_appointment']
        };

        setUser(mappedUser);
        localStorage.setItem('user', JSON.stringify(mappedUser));
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      register,
      hasPermission,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
