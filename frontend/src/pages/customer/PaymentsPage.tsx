
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, DollarSign, Download, Plus, TrendingUp, History, Calendar } from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { paymentService, type Payment } from '@/services/paymentService';
import { format } from 'date-fns';

interface PaymentStats {
    totalSpent: number;
    pendingAmount: number;
    totalTransactions: number;
    lastTransaction: string | null;
}

export function PaymentsPage() {
    const [transactions, setTransactions] = useState<Payment[]>([]);
    const [stats, setStats] = useState<PaymentStats | null>(null);
    const [loading, setLoading] = useState(true);

    // Mock payment methods for visual (since no backend for saved cards yet)
    const paymentMethods = [
        { id: '1', type: 'Visa', last4: '4242', expiry: '12/24', isDefault: true },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [paymentsData, statsData] = await Promise.all([
                    paymentService.getMyPayments(),
                    paymentService.getMyPaymentStats()
                ]);
                setTransactions(paymentsData);
                setStats(statsData);
            } catch (error) {
                console.error("Failed to fetch payment data", error);
                toast.error("Failed to load payment history and analytics");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-800">Payments & Billing</h1>
                    <p className="text-gray-500 mt-1">Manage payment methods and view history</p>
                </div>
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-0 shadow-soft bg-white/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-coral-100 rounded-xl">
                                <TrendingUp className="w-6 h-6 text-coral-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Total Spent</p>
                                <h3 className="text-2xl font-bold text-gray-900">${stats?.totalSpent.toFixed(2) || '0.00'}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-soft bg-white/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <History className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Transactions</p>
                                <h3 className="text-2xl font-bold text-gray-900">{stats?.totalTransactions || 0}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-soft bg-white/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-yellow-100 rounded-xl">
                                <DollarSign className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Pending</p>
                                <h3 className="text-2xl font-bold text-gray-900">${stats?.pendingAmount.toFixed(2) || '0.00'}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-soft bg-white/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <Calendar className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Last Payment</p>
                                <h3 className="text-lg font-bold text-gray-900">
                                    {stats?.lastTransaction ? format(new Date(stats.lastTransaction), 'MMM dd, yyyy') : 'No data'}
                                </h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>


            <Card className="border-0 shadow-soft overflow-hidden">
                <CardHeader className="bg-white border-b border-gray-100">
                    <CardTitle className="text-lg font-semibold">Transaction History</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/50">
                                    <TableHead className="font-semibold py-4">Invoice ID</TableHead>
                                    <TableHead className="font-semibold py-4">Date</TableHead>
                                    <TableHead className="font-semibold py-4">Amount</TableHead>
                                    <TableHead className="font-semibold py-4">Status</TableHead>
                                    <TableHead className="font-semibold py-4">Payment Method</TableHead>
                                    <TableHead className="text-right font-semibold py-4 pr-6">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <History className="w-8 h-8 opacity-20" />
                                                <p>No recent transactions found.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    transactions.map((tx) => (
                                        <TableRow key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                                            <TableCell className="font-medium indent-2">INV-{tx.id.toString().padStart(4, '0')}</TableCell>
                                            <TableCell>{format(new Date(tx.paymentDate), 'MMM dd, yyyy')}</TableCell>
                                            <TableCell className="font-semibold">${Number(tx.amount).toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className={cn(
                                                    "px-3 py-1 font-medium rounded-full border-none shadow-none text-xs",
                                                    tx.status === 'completed' && "bg-green-100 text-green-700",
                                                    tx.status === 'pending' && "bg-yellow-100 text-yellow-700",
                                                    tx.status === 'failed' && "bg-red-100 text-red-700",
                                                    tx.status === 'refunded' && "bg-blue-100 text-blue-700"
                                                )}>
                                                    {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="capitalize">
                                                <span className="flex items-center gap-2">
                                                    <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                                                    {tx.method.replace('_', ' ')}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => toast.success(`Downloaded Invoice #${tx.id}`)}>
                                                    <Download className="w-4 h-4 text-gray-400 group-hover:text-coral-500" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden p-4 space-y-4">
                        {transactions.map((tx) => (
                            <div key={tx.id} className="p-4 border border-gray-100 rounded-2xl space-y-3 bg-gray-50/30">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-gray-900 text-sm">INV-{tx.id.toString().padStart(4, '0')}</span>
                                    <span className="text-xs text-gray-500">{format(new Date(tx.paymentDate), 'MMM dd, yyyy')}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold text-gray-900">${Number(tx.amount).toFixed(2)}</span>
                                    <Badge variant="secondary" className={cn(
                                        "px-2 py-0.5 text-[10px] font-semibold border-none rounded-full",
                                        tx.status === 'completed' && "bg-green-100 text-green-700",
                                        tx.status === 'pending' && "bg-yellow-100 text-yellow-700",
                                        tx.status === 'failed' && "bg-red-100 text-red-700",
                                        tx.status === 'refunded' && "bg-blue-100 text-blue-700"
                                    )}>
                                        {tx.status.toUpperCase()}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                    <span className="text-xs text-gray-600 capitalize flex items-center gap-1.5">
                                        <CreditCard className="w-3 h-3 text-gray-400" />
                                        {tx.method.replace('_', ' ')}
                                    </span>
                                    <Button variant="ghost" size="sm" className="p-0 h-auto font-semibold text-coral-600" onClick={() => toast.success(`Downloaded Invoice #${tx.id}`)}>
                                        <Download className="w-3.5 h-3.5 mr-1" /> PDF
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

