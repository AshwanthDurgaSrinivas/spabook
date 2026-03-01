import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User, Calendar, Star, Gift, CreditCard, Bell, Settings, Clock,
  ChevronRight, Heart, Award, MapPin, Phone, Mail, Camera,
  Edit, CheckCircle, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export function CustomerPortalPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Default empty/starting state
  const customer = {
    firstName: user?.firstName || 'Guest',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    totalVisits: 0,
    lifetimeValue: 0,
    averageOrderValue: 0
  };

  const loyalty = {
    currentPoints: 0,
    lifetimePoints: 0,
    redeemedPoints: 0,
    currentTier: { name: 'Member' }
  };

  const bookings: any[] = [];
  const loyaltyTiers: any[] = [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-800">Customer Portal</h1>
          <p className="text-gray-500 mt-1">Preview of customer self-service experience</p>
        </div>
        <Button variant="outline" className="border-indigo-200 hover:bg-indigo-50">
          <Settings className="w-4 h-4 mr-2" />
          Portal Settings
        </Button>
      </div>

      {/* Profile Card */}
      <Card className="border-0 shadow-soft overflow-hidden">
        <div className="gradient-coral p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30">
              <span className="text-3xl font-bold">
                {customer.firstName[0]}{customer.lastName[0]}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{customer.firstName} {customer.lastName}</h2>
              <p className="opacity-80">{customer.email}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className="bg-white/20 text-white">
                  <Award className="w-3 h-3 mr-1" />
                  {loyalty.currentTier?.name} Member
                </Badge>
                <Badge className="bg-white/20 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  {customer.totalVisits} Visits
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">{loyalty.currentPoints}</p>
              <p className="text-sm opacity-80">Loyalty Points</p>
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-indigo-600">${customer.lifetimeValue}</p>
              <p className="text-sm text-gray-500">Lifetime Value</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-blue-500">{customer.totalVisits}</p>
              <p className="text-sm text-gray-500">Total Visits</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-green-500">${customer.averageOrderValue}</p>
              <p className="text-sm text-gray-500">Avg. Order</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-purple-500">2</p>
              <p className="text-sm text-gray-500">Upcoming</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">My Bookings</TabsTrigger>
          <TabsTrigger value="loyalty">Loyalty</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Appointments */}
            <Card className="border-0 shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  Upcoming Appointments
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-indigo-600">
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.slice(0, 2).map((booking) => (
                    <div key={booking.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-12 h-12 rounded-lg gradient-coral flex items-center justify-center text-white">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Swedish Massage</p>
                        <p className="text-sm text-gray-500">{booking.bookingDate} at {booking.startTime}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-600">{booking.status}</Badge>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4 gradient-coral text-white">
                  Book New Appointment
                </Button>
              </CardContent>
            </Card>

            {/* Loyalty Progress */}
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-600" />
                  Loyalty Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <p className="text-4xl font-bold text-indigo-600">{loyalty.currentPoints}</p>
                  <p className="text-gray-500">Current Points</p>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Progress to {loyaltyTiers[3]?.name}</span>
                    <span className="font-medium">{loyalty.currentPoints} / {loyaltyTiers[3]?.minPoints}</span>
                  </div>
                  <Progress
                    value={(loyalty.currentPoints / (loyaltyTiers[3]?.minPoints || 5000)) * 100}
                    className="h-3"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-indigo-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-indigo-600">{loyalty.lifetimePoints}</p>
                    <p className="text-sm text-gray-500">Lifetime Points</p>
                  </div>
                  <div className="p-4 bg-indigo-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-indigo-600">{loyalty.redeemedPoints}</p>
                    <p className="text-sm text-gray-500">Redeemed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6 mt-6">
          <Card className="border-0 shadow-soft">
            <CardContent className="p-6">
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium">Swedish Massage</p>
                        <p className="text-sm text-gray-500">{booking.bookingDate} at {booking.startTime}</p>
                        <p className="text-sm text-indigo-600">{booking.bookingNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={cn(
                        booking.status === 'completed' && 'bg-green-100 text-green-600',
                        booking.status === 'confirmed' && 'bg-blue-100 text-blue-600',
                        booking.status === 'cancelled' && 'bg-red-100 text-red-600',
                      )}>
                        {booking.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6 mt-6">
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-500">First Name</label>
                  <p className="font-medium">{customer.firstName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Last Name</label>
                  <p className="font-medium">{customer.lastName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="font-medium">{customer.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Phone</label>
                  <p className="font-medium">{customer.phone}</p>
                </div>
              </div>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
