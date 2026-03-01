import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CreditCard, DollarSign, TrendingUp, TrendingDown,
  Clock, ArrowUpRight, ArrowDownRight, Wallet, Gift,
  Receipt, Plus, Filter, Search, Send, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { paymentService, type Payment } from '@/services/paymentService';
import { marketingService } from '@/services/marketingService';
import { analyticsService } from '@/services/analyticsService';
import type { DashboardStats, RevenueData } from '@/types';

export function PaymentBillingPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paymentsData, dashData] = await Promise.all([
        paymentService.getPayments(),
        analyticsService.getDashboardStats()
      ]);
      setPayments(paymentsData);
      setStats(dashData.stats);
      setRevenueTrend(dashData.revenueData);
    } catch (error) {
      toast.error('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalRevenue = stats?.totalRevenue || 0;
  const todayRevenue = (stats as any)?.todayRevenue || 0;
  const totalRefunds = (stats as any)?.totalRefunds || 0;
  const pendingAmount = payments.filter(p => p.status === 'pending').reduce((acc, p) => acc + (typeof p.amount === 'string' ? parseFloat(p.amount) : p.amount), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-800">Payments & Billing</h1>
          <p className="text-gray-500 mt-1">Manage transactions, gift cards, and financial reports</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-coral-200 hover:bg-coral-50" onClick={fetchData}>
            <Loader2 className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button className="gradient-coral hover:opacity-90 text-white" onClick={() => toast.info('New invoice builder opening...')}>
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, change: `+${stats?.revenueChange || 0}%`, icon: DollarSign, trend: 'up' },
          { label: 'Today', value: `$${todayRevenue.toLocaleString()}`, change: '+8.2%', icon: TrendingUp, trend: 'up' },
          { label: 'Pending', value: `$${pendingAmount.toLocaleString()}`, change: '-2.1%', icon: Clock, trend: 'down' },
          { label: 'Refunds', value: `$${totalRefunds.toLocaleString()}`, change: '+5.3%', icon: TrendingDown, trend: 'up' },
        ].map((stat, index) => (
          <Card key={index} className="border-0 shadow-soft cursor-pointer hover:bg-gray-50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="w-3 h-3 text-green-500" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 text-red-500" />
                    )}
                    <span className={cn(
                      'text-xs',
                      stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                    )}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-coral-100 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-coral-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Revenue Chart */}
          <Card className="border-0 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Revenue Overview</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-600">
                  {stats?.revenueChange && stats.revenueChange > 0 ? `+${stats.revenueChange}%` : `${stats?.revenueChange || 0}%`} vs last period
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueTrend}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F08080" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#F08080" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickFormatter={d => new Date(d).toLocaleDateString()} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#F08080"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Credit Cards</h3>
                    <p className="text-sm text-gray-500">65% of payments</p>
                  </div>
                </div>
                <p className="text-2xl font-bold">${(totalRevenue * 0.65).toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Digital Wallets</h3>
                    <p className="text-sm text-gray-500">35% of payments</p>
                  </div>
                </div>
                <p className="text-2xl font-bold">${(totalRevenue * 0.35).toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6 mt-6">
          <Card className="border-0 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Search transactions..." className="pl-10 w-64" />
                </div>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-coral-500" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Transaction ID</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Booking ID</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Amount</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Method</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <p className="font-medium text-coral-500">TXN-{payment.id.toString().padStart(6, '0')}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-medium">#{payment.bookingId}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-gray-600">{new Date(payment.paymentDate).toLocaleDateString()}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-bold">${payment.amount}</p>
                          </td>
                          <td className="py-4 px-4 capitalize">
                            {payment.method}
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={cn(
                              payment.status === 'completed' && 'bg-green-100 text-green-600',
                              payment.status === 'pending' && 'bg-yellow-100 text-yellow-600',
                            )}>
                              {payment.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <Button variant="ghost" size="sm" onClick={() => toast.success(`Receipt for TXN-${payment.id} generating...`)}>
                              <Receipt className="w-4 h-4 mr-2" />
                              Receipt
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {payments.length === 0 && (
                        <tr><td colSpan={7} className="text-center py-10 text-gray-500">No transactions found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>

  );
}
