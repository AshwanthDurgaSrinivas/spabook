import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, Chrome, Facebook, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/customer/appointments';
  const { login, isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState('email');
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    rememberMe: false,
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user && !authLoading) {
      if (user.userType === 'Employee' || ['admin', 'manager', 'receptionist', 'therapist', 'employee', 'super_admin'].includes(user.role)) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/customer/appointments', { replace: true });
      }
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await login(formData.email, formData.password);
      toast.success('Welcome back!', {
        description: `Logged in as ${user.firstName} ${user.lastName}`,
      });

      // Role-based redirection
      if (user.userType === 'Employee' || ['admin', 'manager', 'receptionist', 'therapist', 'employee', 'super_admin'].includes(user.role)) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        // Customers go to their appointments or portal, or where they came from
        navigate(from, { replace: true });
      }
    } catch (error) {
      toast.error('Login failed', {
        description: 'Please check your credentials and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    if (provider === 'Google') {
      window.location.href = 'http://localhost:5000/api/auth/google';
    } else {
      toast.info(`${provider} login`, {
        description: 'Social login integration coming soon!',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Back to Website Link */}
      <Link
        to="/"
        className="fixed top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-indigo-500 transition-colors z-20 font-medium group"
      >
        <div className="w-8 h-8 rounded-full bg-white/50 backdrop-blur-sm shadow-sm flex items-center justify-center group-hover:bg-indigo-50 transition-all">
          <ArrowLeft className="w-4 h-4" />
        </div>
        Back to Website
      </Link>

      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-slate-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-100/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-2xl gradient-coral flex items-center justify-center shadow-indigo-500/30 mb-8 animate-float">
            <Sparkles className="w-14 h-14 text-white" />
          </div>
          <h1 className="text-5xl font-display font-bold text-gray-800 mb-4">
            SpaBook <span className="text-gradient-coral">Pro</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-md">
            The complete salon and spa management solution for modern businesses
          </p>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl shadow-soft">
              <p className="text-3xl font-bold text-indigo-600">10K+</p>
              <p className="text-sm text-gray-600">Active Users</p>
            </div>
            <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl shadow-soft">
              <p className="text-3xl font-bold text-indigo-600">500+</p>
              <p className="text-sm text-gray-600">Businesses</p>
            </div>
            <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl shadow-soft">
              <p className="text-3xl font-bold text-indigo-600">99.9%</p>
              <p className="text-sm text-gray-600">Uptime</p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <Card className="border-0 shadow-xl shadow-indigo-500/10 bg-white/80 backdrop-blur-xl">
          <CardHeader className="space-y-1">
            <div className="lg:hidden flex justify-center mb-4">
              <div className="w-16 h-16 rounded-xl gradient-coral flex items-center justify-center shadow-indigo-500/20">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-display font-bold text-center text-gray-800">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center text-gray-500">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleSocialLogin('Google')}
                className="border-gray-200 hover:bg-gray-50"
              >
                <Chrome className="w-5 h-5 mr-2 text-red-500" />
                Google
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialLogin('Facebook')}
                className="border-gray-200 hover:bg-gray-50"
              >
                <Facebook className="w-5 h-5 mr-2 text-blue-600" />
                Facebook
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Login Method Tabs */}
            <Tabs value={loginMethod} onValueChange={setLoginMethod}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="phone">
                  <Phone className="w-4 h-4 mr-2" />
                  Phone
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit}>
                <TabsContent value="email" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="phone" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </TabsContent>

                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={formData.rememberMe}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, rememberMe: checked as boolean })
                        }
                      />
                      <Label htmlFor="remember" className="text-sm font-normal">
                        Remember me
                      </Label>
                    </div>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-indigo-600 hover:text-indigo-700"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full gradient-coral hover:opacity-90 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Tabs>

            <p className="text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
