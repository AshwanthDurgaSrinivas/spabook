import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Mail, Phone, Crown, Calendar, CheckCircle2, UserCircle2, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function ProfilePage() {
    const { user } = useAuth();

    // Fallback if user is just basic login info without full profile
    const firstName = user?.firstName || 'Guest';
    const lastName = user?.lastName || '';
    const email = user?.email || '';
    const phone = user?.phone || 'No phone number provided';
    const membership = user?.membership;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex flex-col sm:items-center sm:flex-row justify-between gap-4">
                <h1 className="text-3xl font-display font-bold text-gray-800">My Profile</h1>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2 w-fit border-indigo-200" onClick={() => toast.info('Edit profile functionality coming soon!')}>
                        <Edit className="w-4 h-4" /> Edit Profile
                    </Button>
                </div>
            </div>

            <Card className="border-0 shadow-soft overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                <div className="px-6 pb-6 relative">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 sm:-mt-12 sm:ml-4">
                        <div className="border-4 border-white rounded-full overflow-hidden w-28 h-28 sm:w-32 sm:h-32 shadow-lg bg-white flex-shrink-0">
                            <Avatar className="w-full h-full">
                                <AvatarImage src={user?.avatar} />
                                <AvatarFallback className="text-4xl bg-indigo-50 text-indigo-700 font-bold">{firstName[0]}</AvatarFallback>
                            </Avatar>
                        </div>

                        <div className="flex-1 flex flex-col sm:flex-row justify-between items-center sm:items-start w-full gap-4 sm:pt-4 text-center sm:text-left">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{firstName} {lastName}</h2>
                                <p className="text-gray-500 text-sm">Member since {user?.createdAt ? format(new Date(user.createdAt), 'MMM yyyy') : 'Recently'}</p>
                            </div>

                            {membership ? (
                                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 px-4 py-1.5 rounded-full flex gap-2 items-center text-sm font-semibold shadow-sm">
                                    <Crown className="w-4 h-4" />
                                    {membership.plan?.name}
                                </Badge>
                            ) : (
                                <Badge variant="secondary" className="px-4 py-1.5 rounded-full text-sm font-medium">Basic Account</Badge>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Contact Card */}
                <Card className="border-0 shadow-soft">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <UserCircle2 className="w-5 h-5 text-indigo-500" />
                            Contact Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Mail className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Email Address</p>
                                <p className="font-medium text-gray-900">{email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Phone className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Phone Number</p>
                                <p className="font-medium text-gray-900">{phone}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Membership Status Card */}
                {membership ? (
                    <Card className="border-0 shadow-soft border-l-4 border-amber-400 bg-amber-50/30">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2 text-amber-700">
                                <Crown className="w-5 h-5" />
                                Active Membership
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Calendar className="w-4 h-4" />
                                        Valid Until
                                    </div>
                                    <span className="font-bold text-gray-900">{format(new Date(membership.endDate), 'MMM dd, yyyy')}</span>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Your Exclusive Benefits</p>
                                    <div className="grid grid-cols-1 gap-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            <span>{membership.plan?.discountPercentage}% Discount on all services</span>
                                        </div>
                                        {Array.isArray(membership.plan?.benefits) && membership.plan.benefits.map((benefit: string, i: number) => (
                                            <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                <span>{benefit}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-0 shadow-soft">
                        <CardHeader>
                            <CardTitle className="text-lg">Premium Membership</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center py-6">
                            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Crown className="w-8 h-8 text-indigo-600" />
                            </div>
                            <p className="text-gray-600 text-sm mb-6">Upgrade to a membership plan to unlock exclusive discounts and priority booking.</p>
                            <Button className="gradient-coral text-white w-full" onClick={() => window.location.href = '/customer/membership'}>
                                View Plans & Upgrade
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            <Card className="border-0 shadow-soft">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 font-bold">
                        Notification Preferences
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                            <div className="flex flex-col">
                                <span className="font-semibold text-gray-900">Email Notifications</span>
                                <span className="text-xs text-gray-500">Updates on bookings and rewards</span>
                            </div>
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">Enabled</Badge>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                            <div className="flex flex-col">
                                <span className="font-semibold text-gray-900">SMS Alerts</span>
                                <span className="text-xs text-gray-500">Booking confirmations via SMS</span>
                            </div>
                            <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0">Disabled</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
