import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
    ChevronLeft, User, Mail, Phone, MapPin,
    Calendar, CreditCard, Heart, Award,
    History, Settings, Edit, MessageSquare, Plus,
    Clock, CheckCircle, Loader2, Shield, Bell, Trash2
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { customerService, type Customer } from '@/services/customerService';
import { bookingService, type Booking } from '@/services/bookingService';
import { loyaltyService, type CustomerLoyalty, type LoyaltyTier } from '@/services/loyaltyService';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export function CustomerDetailPage() {
    const { user } = useAuth();
    const isAdmin = ['admin', 'manager', 'receptionist', 'super_admin'].includes(user?.role || '');
    const { id } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [customerBookings, setCustomerBookings] = useState<Booking[]>([]);
    const [loyalty, setLoyalty] = useState<CustomerLoyalty | null>(null);
    const [allTiers, setAllTiers] = useState<LoyaltyTier[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const customerId = parseInt(id);
            const [custData, bookingsData, loyaltyData, tiersData] = await Promise.all([
                customerService.getCustomerById(customerId),
                bookingService.getBookings(),
                loyaltyService.getCustomerLoyalty(customerId),
                loyaltyService.getTiers()
            ]);
            setCustomer(custData);
            setCustomerBookings(bookingsData.filter(b => b.customerId === customerId));
            setLoyalty(loyaltyData);
            setAllTiers(tiersData.sort((a, b) => a.minPoints - b.minPoints));
        } catch (error) {
            console.error('Failed to load customer details', error);
            toast.error('Failed to load customer details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-coral-500" />
                <p className="text-gray-500 font-medium">Loading high-profile data...</p>
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="text-center py-20">
                <h3 className="text-xl font-bold text-gray-800">Customer not found</h3>
                <Button variant="link" onClick={() => navigate('/admin/customers')}>Return to list</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                    <ChevronLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-800">Customer Profile</h1>
                    <p className="text-gray-500">Manage customer details, history, and preferences</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Column: Basic Info */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-0 shadow-soft overflow-hidden">
                        <div className="h-24 gradient-coral" />
                        <CardContent className="pt-0 px-6 pb-6 mt-[-48px] text-center">
                            <div className="inline-block relative">
                                <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-lg mx-auto bg-gray-100 flex items-center justify-center">
                                    {customer.avatar ? (
                                        <img src={customer.avatar} alt="avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-12 h-12 text-gray-300" />
                                    )}
                                </div>
                                {customer.segment === 'vip' && (
                                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                        <Award className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 mt-4">{customer.firstName} {customer.lastName}</h2>
                            <p className="text-sm text-gray-500 font-medium">#{customer.customerCode}</p>
                            <div className="flex items-center justify-center gap-2 mt-3">
                                <Badge className={cn(
                                    'capitalize',
                                    customer.segment === 'vip' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                                )}>
                                    {customer.segment}
                                </Badge>
                                <Badge variant="outline">Active</Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div className="p-3 bg-gray-50 rounded-xl">
                                    <p className="text-xs text-gray-500 uppercase font-bold">Visits</p>
                                    <p className="text-lg font-bold text-gray-800">{customer.totalVisits ?? 0}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-xl">
                                    <p className="text-xs text-gray-500 uppercase font-bold">Spent</p>
                                    <p className="text-lg font-bold text-gray-800">${(customer.totalSpent ?? 0).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3 pt-6 border-t border-gray-100 text-left">
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="w-4 h-4 text-coral-500" />
                                    <span className="text-gray-600 truncate">{customer.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="w-4 h-4 text-coral-500" />
                                    <span className="text-gray-600">{customer.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <MapPin className="w-4 h-4 text-coral-500" />
                                    <span className="text-gray-600 italic">No address on file</span>
                                </div>
                            </div>

                            {isAdmin && (
                                <Button className="w-full mt-6 gradient-coral text-white shadow-coral">
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Send Message
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-soft">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold uppercase text-gray-500 tracking-wider">Preferences</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-sm text-gray-800 font-medium">Preferred Specialist</p>
                                <p className="text-sm text-gray-500">Jessica Chen</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-gray-800 font-medium">Room Type</p>
                                <p className="text-sm text-gray-500">VIP Sanctuary</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-gray-800 font-medium">Skin Type</p>
                                <Badge variant="secondary" className="bg-peach-50 text-peach-600">{customer.skinType}</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Content */}
                <div className="lg:col-span-3">
                    <Tabs defaultValue="history">
                        <TabsList className="bg-transparent border-b border-gray-200 rounded-none w-full justify-start h-auto p-0 mb-6">
                            <TabsTrigger
                                value="history"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-coral-500 data-[state=active]:bg-transparent data-[state=active]:text-coral-600 px-6 py-3"
                            >
                                Booking History
                            </TabsTrigger>
                            <TabsTrigger
                                value="notes"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-coral-500 data-[state=active]:bg-transparent data-[state=active]:text-coral-600 px-6 py-3"
                            >
                                Clinical Notes
                            </TabsTrigger>
                            <TabsTrigger
                                value="loyalty"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-coral-500 data-[state=active]:bg-transparent data-[state=active]:text-coral-600 px-6 py-3"
                            >
                                Loyalty & Rewards
                            </TabsTrigger>
                            {isAdmin && (
                                <TabsTrigger
                                    value="settings"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-coral-500 data-[state=active]:bg-transparent data-[state=active]:text-coral-600 px-6 py-3"
                                >
                                    Settings
                                </TabsTrigger>
                            )}
                        </TabsList>

                        <TabsContent value="history" className="space-y-4 m-0">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-800">Booking History</h3>
                                {isAdmin && (
                                    <Button size="sm" className="gradient-coral text-white">
                                        <Plus className="w-4 h-4 mr-2" />
                                        New Appointment
                                    </Button>
                                )}
                            </div>

                            {customerBookings.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4">
                                    {customerBookings.map((b) => (
                                        <Card key={b.id} className="border-0 shadow-soft hover:shadow-md transition-shadow">
                                            <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-coral-50 flex items-center justify-center text-coral-500">
                                                        <Calendar className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-800">Swedish Massage</p>
                                                        <div className="flex items-center gap-3 text-sm text-gray-500">
                                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {b.bookingDate}</span>
                                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {b.startTime}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <div className="text-right">
                                                        <p className="font-bold text-gray-800">${b.totalAmount ?? b.totalPrice ?? 0}</p>
                                                        <Badge variant="outline" className="capitalize">{b.status}</Badge>
                                                    </div>
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link to={`/admin/bookings/${b.id}`}><Settings className="w-4 h-4" /></Link>
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <Card className="border-dashed border-2 py-12 text-center">
                                    <p className="text-gray-500">No bookings found for this customer.</p>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="notes">
                            <Card className="border-0 shadow-soft">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="text-lg font-bold">Notes & Medical History</CardTitle>
                                    {isAdmin && <Button variant="outline" size="sm">Add Note</Button>}
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Heart className="w-4 h-4 text-red-500" />
                                            <span className="font-bold text-gray-800">Medical Warning</span>
                                        </div>
                                        <p className="text-sm text-gray-700">Allergic to almond oil and certain latex materials. Use hypoallergenic products only.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="border-l-4 border-coral-200 pl-4 py-1">
                                            <p className="text-xs text-gray-400">Feb 10, 2024 • by Jessica Chen</p>
                                            <p className="text-sm text-gray-700 mt-1 font-medium">Customer mentioned lower back tension due to long office hours. Recommended deep tissue for next session.</p>
                                        </div>
                                        <div className="border-l-4 border-coral-200 pl-4 py-1">
                                            <p className="text-xs text-gray-400">Jan 15, 2024 • by Maria Garcia</p>
                                            <p className="text-sm text-gray-700 mt-1 font-medium">Standard facial. Responded well to the new hydration serum. Redness reduced by end of session.</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="loyalty">
                            {loyalty ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card
                                        className="border-0 shadow-soft text-white"
                                        style={{ background: loyalty.tier?.color ? `linear-gradient(135deg, ${loyalty.tier.color}dd, ${loyalty.tier.color})` : 'linear-gradient(135deg, #FF7C7C, #FF4D4D)' }}
                                    >
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <Award className="w-10 h-10" />
                                                <Badge className="bg-white/20 text-white border-white/40 uppercase">{loyalty.tier?.name || 'Standard'}</Badge>
                                            </div>
                                            <p className="text-sm opacity-80 uppercase tracking-widest font-bold">Loyalty Points</p>
                                            <p className="text-4xl font-bold mt-1">{(loyalty.currentPoints || 0).toLocaleString()}</p>

                                            {(() => {
                                                const nextTier = allTiers.find(t => t.minPoints > (loyalty.currentPoints || 0));
                                                if (nextTier) {
                                                    const progress = Math.min(((loyalty.currentPoints || 0) / nextTier.minPoints) * 100, 100);
                                                    return (
                                                        <>
                                                            <p className="text-xs mt-4 opacity-75">Next tier in {nextTier.minPoints - loyalty.currentPoints} points ({nextTier.name})</p>
                                                            <Progress value={progress} className="h-2 bg-white/20 mt-2" />
                                                        </>
                                                    );
                                                }
                                                return <p className="text-xs mt-4 opacity-75">Maximum tier reached!</p>;
                                            })()}
                                        </CardContent>
                                    </Card>
                                    <Card className="border-0 shadow-soft">
                                        <CardContent className="p-6">
                                            <h4 className="font-bold text-gray-800 mb-4">Active Benefits</h4>
                                            <ul className="space-y-2">
                                                <li className="flex items-center gap-2 text-sm text-gray-600">
                                                    <CheckCircle className="w-4 h-4 text-green-500" /> {loyalty.tier?.discountPercentage || 0}% discount on all services
                                                </li>
                                                <li className="flex items-center gap-2 text-sm text-gray-600">
                                                    <CheckCircle className="w-4 h-4 text-green-500" /> Free birthday treatment
                                                </li>
                                                <li className="flex items-center gap-2 text-sm text-gray-600">
                                                    <CheckCircle className="w-4 h-4 text-green-500" /> Priority booking access
                                                </li>
                                                {loyalty.tier?.name === 'Platinum' && (
                                                    <li className="flex items-center gap-2 text-sm text-gray-600">
                                                        <CheckCircle className="w-4 h-4 text-green-500" /> Dedicated concierge
                                                    </li>
                                                )}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </div>
                            ) : (
                                <Card className="border-dashed border-2 py-12 text-center">
                                    <p className="text-gray-500">No loyalty data found for this customer.</p>
                                </Card>
                            )}
                        </TabsContent>
                        <TabsContent value="settings" className="m-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="border-0 shadow-soft">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-indigo-500" />
                                            Account Control
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label className="text-base">Account Status</Label>
                                                <p className="text-sm text-gray-500">Enable or disable customer access.</p>
                                            </div>
                                            <Switch
                                                checked={customer.status === 'active'}
                                                onCheckedChange={async (val) => {
                                                    try {
                                                        await customerService.updateCustomer(customer.id, { status: val ? 'active' : 'inactive' });
                                                        toast.success(`Customer ${val ? 'activated' : 'deactivated'}`);
                                                        fetchData();
                                                    } catch (e) {
                                                        toast.error("Failed to update status");
                                                    }
                                                }}
                                            />
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label className="text-base">VIP Membership</Label>
                                                <p className="text-sm text-gray-500">Elevate customer to VIP tier manually.</p>
                                            </div>
                                            <Switch
                                                checked={customer.segment === 'vip'}
                                                onCheckedChange={async (val) => {
                                                    try {
                                                        await customerService.updateCustomer(customer.id, { segment: val ? 'vip' : 'regular' });
                                                        toast.success(`Segment updated to ${val ? 'VIP' : 'Regular'}`);
                                                        fetchData();
                                                    } catch (e) {
                                                        toast.error("Failed to update segment");
                                                    }
                                                }}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-soft">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Bell className="w-5 h-5 text-indigo-500" />
                                            Communication
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label className="text-base">Marketing Emails</Label>
                                                <p className="text-sm text-gray-500">Receive promotional offers.</p>
                                            </div>
                                            <Switch
                                                checked={customer.marketingEmails !== false} // Default to true if undefined
                                                onCheckedChange={async (val) => {
                                                    try {
                                                        await customerService.updateCustomer(customer.id, { marketingEmails: val });
                                                        toast.success("Preferences updated");
                                                        fetchData();
                                                    } catch (e) {
                                                        toast.error("Failed to update preferences");
                                                    }
                                                }}
                                            />
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label className="text-base">SMS Notifications</Label>
                                                <p className="text-sm text-gray-500">Receive appointment reminders.</p>
                                            </div>
                                            <Switch
                                                checked={customer.smsNotifications !== false} // Default to true if undefined
                                                onCheckedChange={async (val) => {
                                                    try {
                                                        await customerService.updateCustomer(customer.id, { smsNotifications: val });
                                                        toast.success("Preferences updated");
                                                        fetchData();
                                                    } catch (e) {
                                                        toast.error("Failed to update preferences");
                                                    }
                                                }}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-soft border-red-100 bg-red-50/50 md:col-span-2">
                                    <CardHeader>
                                        <CardTitle className="text-lg text-red-600 flex items-center gap-2">
                                            <Trash2 className="w-5 h-5" />
                                            Danger Zone
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <p className="font-bold text-gray-800">Delete Customer Profile</p>
                                            <p className="text-sm text-gray-600">Permanently remove this customer and all associated data. This action cannot be undone.</p>
                                        </div>
                                        <Button
                                            variant="destructive"
                                            className="bg-red-600 hover:bg-red-700"
                                            onClick={async () => {
                                                if (window.confirm(`Are you sure you want to delete ${customer.firstName} ${customer.lastName}? This will permanently remove all their data and booking history.`)) {
                                                    try {
                                                        await customerService.deleteCustomer(customer.id);
                                                        toast.success("Customer profile deleted");
                                                        navigate('/admin/customers');
                                                    } catch (e) {
                                                        toast.error("Failed to delete customer");
                                                    }
                                                }
                                            }}
                                        >
                                            Delete Permanently
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
