import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, Calendar, CreditCard, Star, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export function CustomerDashboardPage() {
    const stats = [
        { title: 'Upcoming Appointments', value: '2', icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50', path: '/customer/appointments' },
        { title: 'Reward Points', value: '1,250', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50', path: '/customer/loyalty' },
        { title: 'Total Spent', value: '$850', icon: CreditCard, color: 'text-green-500', bg: 'bg-green-50', path: '/customer/payments' },
        { title: 'Hours Relaxed', value: '12', icon: Clock, color: 'text-purple-500', bg: 'bg-purple-50', path: '/customer/appointments' },
    ];

    const data = [
        { name: 'Jan', visits: 1 },
        { name: 'Feb', visits: 3 },
        { name: 'Mar', visits: 2 },
        { name: 'Apr', visits: 4 },
        { name: 'May', visits: 2 },
        { name: 'Jun', visits: 5 },
    ];

    const quickActions = [
        { name: 'Book New appointment', path: '/customer/booking' },
        { name: 'View Services', path: '/services' },
        { name: 'Refer a Friend', action: () => toast.success('Referral link copied to clipboard!') },
        { name: 'Buy Gift Card', action: () => toast.info('Gift cards section coming soon!') },
    ];

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <Link key={i} to={stat.path}>
                        <Card className="border-0 shadow-soft hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                                    <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                                </div>
                                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity / Chart */}
                <Card className="lg:col-span-2 border-0 shadow-soft">
                    <CardHeader>
                        <CardTitle>Visit History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#F08080" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#F08080" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="visits" stroke="#F08080" fillOpacity={1} fill="url(#colorVisits)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Next Appointment Card */}
                <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border-0 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Calendar className="w-32 h-32" />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-white/90">Next Appointment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 relative z-10">
                        <div>
                            <p className="text-sm text-gray-400 mb-1">Service</p>
                            <h3 className="text-2xl font-bold">Deep Tissue Massage</h3>
                        </div>

                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-sm text-gray-400 mb-1">Date & Time</p>
                                <p className="text-lg font-medium">Feb 24, 2024</p>
                                <p className="text-coral-400 font-bold">10:00 AM</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-400 mb-1">Duration</p>
                                <p className="text-lg font-medium">60 min</p>
                            </div>
                        </div>

                        <Button
                            className="w-full bg-white text-gray-900 hover:bg-gray-100 font-bold mt-4"
                            onClick={() => toast.info('Reschedule request sent to support!')}
                        >
                            Reschedule
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((action, i) => (
                    action.path ? (
                        <Button key={i} variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-coral-200 hover:bg-coral-50 hover:text-coral-600 transition-colors" asChild>
                            <Link to={action.path}>
                                <span className="p-2 bg-gray-100 rounded-full group-hover:bg-white transition-colors">
                                    <ArrowUpRight className="w-4 h-4" />
                                </span>
                                {action.name}
                            </Link>
                        </Button>
                    ) : (
                        <Button
                            key={i}
                            variant="outline"
                            className="h-auto py-4 flex flex-col items-center gap-2 hover:border-coral-200 hover:bg-coral-50 hover:text-coral-600 transition-colors"
                            onClick={action.action}
                        >
                            <span className="p-2 bg-gray-100 rounded-full group-hover:bg-white transition-colors">
                                <ArrowUpRight className="w-4 h-4" />
                            </span>
                            {action.name}
                        </Button>
                    )
                ))}
            </div>
        </div>
    );
}

