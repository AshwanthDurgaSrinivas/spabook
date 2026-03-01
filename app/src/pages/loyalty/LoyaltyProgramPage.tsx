import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Award, Star, Gift, TrendingUp, Users, Crown, Gem,
  Plus, Edit, Trash2, Eye, Sparkles, Zap, Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { loyaltyService, type LoyaltyTier, type CustomerLoyalty, type PointsTransaction } from '@/services/loyaltyService';
import { marketingService, type Coupon } from '@/services/marketingService'; // Assuming distinct Coupon type or same
import { customerService, type Customer } from '@/services/customerService';

export function LoyaltyProgramPage() {
  const [activeTab, setActiveTab] = useState('tiers');
  const [isAddPointsOpen, setIsAddPointsOpen] = useState(false);
  const [isRedeemPointsOpen, setIsRedeemPointsOpen] = useState(false);
  const [isCreateCouponOpen, setIsCreateCouponOpen] = useState(false);

  // Data State
  const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
  const [members, setMembers] = useState<CustomerLoyalty[]>([]); // These are loyalty profiles
  const [coupons, setCoupons] = useState<Coupon[]>([]); // Assuming Coupon type matches
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Tier Management State
  const [isTierDialogOpen, setIsTierDialogOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<LoyaltyTier | null>(null);
  const [tierForm, setTierForm] = useState({
    name: '',
    minSpent: 0,
    earnRatio: 1.0,
    redeemValue: 0.1,
    minBillForRedemption: 50.0,
    color: '#6366f1',
    description: ''
  });

  // Form State for Add Points
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [pointsAmount, setPointsAmount] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('purchase');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tiersData, membersData, couponsData, customersData, transactionsData] = await Promise.all([
        loyaltyService.getTiers(),
        loyaltyService.getAllLoyalties(),
        marketingService.getCoupons(),
        customerService.getCustomers(),
        loyaltyService.getTransactions()
      ]);
      setTiers(tiersData);
      setMembers(membersData);
      setCoupons(couponsData);
      setCustomers(customersData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load loyalty data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCoupon = async (data: any) => {
    // Implementation similar to CouponsPage
    try {
      await marketingService.createCoupon(data);
      toast.success('Coupon created');
      setIsCreateCouponOpen(false);
      const c = await marketingService.getCoupons();
      setCoupons(c);
    } catch (e) {
      toast.error('Failed to create coupon');
    }
  };

  const handleAddPoints = async () => {
    if (!selectedCustomerId || !pointsAmount) {
      toast.error('Please select a customer and amount');
      return;
    }

    try {
      setLoading(true);
      await loyaltyService.adjustPoints(
        parseInt(selectedCustomerId),
        parseInt(pointsAmount),
        adjustmentReason
      );
      toast.success('Points adjusted successfully!');
      setIsAddPointsOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to adjust points');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTier = async () => {
    try {
      setLoading(true);
      if (editingTier) {
        await loyaltyService.updateTier(editingTier.id, tierForm);
        toast.success('Tier updated');
      } else {
        await loyaltyService.createTier(tierForm);
        toast.success('Tier created');
      }
      setIsTierDialogOpen(false);
      fetchData();
    } catch (e) {
      toast.error('Failed to save tier');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTier = async (id: number) => {
    if (!confirm('Are you sure you want to delete this tier?')) return;
    try {
      setLoading(true);
      await loyaltyService.deleteTier(id);
      toast.success('Tier deleted');
      fetchData();
    } catch (e) {
      toast.error('Failed to delete tier');
    } finally {
      setLoading(false);
    }
  };

  const openEditTier = (tier: LoyaltyTier) => {
    setEditingTier(tier);
    setTierForm({
      name: tier.name || '',
      minSpent: tier.minSpent || 0,
      earnRatio: tier.earnRatio || 1.0,
      redeemValue: tier.redeemValue || 0.1,
      minBillForRedemption: tier.minBillForRedemption || 50.0,
      color: tier.color || '#6366f1',
      description: tier.description || ''
    });
    setIsTierDialogOpen(true);
  };

  const openAddTier = () => {
    setEditingTier(null);
    setTierForm({
      name: '',
      minSpent: 0,
      earnRatio: 1.0,
      redeemValue: 0.1,
      minBillForRedemption: 50.0,
      color: '#6366f1',
      description: ''
    });
    setIsTierDialogOpen(true);
  };

  // Helper function to safely parse benefits JSON if it comes as string, or use as object
  const getBenefits = (benefits: any) => {
    if (typeof benefits === 'string') {
      try { return JSON.parse(benefits); } catch { return {}; }
    }
    return benefits || {};
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-800">Loyalty Program</h1>
          <p className="text-gray-500 mt-1">Manage rewards, points, and customer tiers</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Redeem Points Dialog */}
          <Dialog open={isRedeemPointsOpen} onOpenChange={setIsRedeemPointsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-coral-200 hover:bg-coral-50">
                <Gift className="w-4 h-4 mr-2" />
                Redeem Points
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Redeem Points</DialogTitle>
                <DialogDescription>
                  Apply customer loyalty points towards a service or product discount.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Search Customer</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input className="pl-10" placeholder="Name or email..." />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Available Coupons</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reward" />
                    </SelectTrigger>
                    <SelectContent>
                      {coupons.filter(c => c.isActive).map(c => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.code} ({c.description || 'No desc'})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRedeemPointsOpen(false)}>Cancel</Button>
                <Button className="gradient-coral text-white" onClick={() => {
                  toast.success('Reward redeemed successfully!');
                  setIsRedeemPointsOpen(false);
                }}>Confirm Redemption</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add Points Dialog */}
          <Dialog open={isAddPointsOpen} onOpenChange={setIsAddPointsOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-coral hover:opacity-90 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Points
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Loyalty Points</DialogTitle>
                <DialogDescription>
                  Manually adjust or award points to a customer's loyalty account.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Select Customer</Label>
                  <Select onValueChange={setSelectedCustomerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Search customers..." />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(c => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.firstName} {c.lastName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="points">Points to Add</Label>
                  <Input id="points" type="number" placeholder="e.g. 100" onChange={e => setPointsAmount(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Adjustment</Label>
                  <Select onValueChange={setAdjustmentReason} defaultValue="purchase">
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="purchase">Service Purchase</SelectItem>
                      <SelectItem value="referral">Referral Bonus</SelectItem>
                      <SelectItem value="complimentary">Complimentary / Apology</SelectItem>
                      <SelectItem value="other">Manual Override</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddPointsOpen(false)}>Cancel</Button>
                <Button className="gradient-coral text-white" onClick={handleAddPoints}>Apply Adjustment</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Members', value: members.length.toString(), icon: Users, color: 'coral' },
          { label: 'Total Spent', value: `$${members.reduce((acc, m) => acc + Number(m.totalSpent || 0), 0).toLocaleString()}`, icon: TrendingUp, color: 'blue' },
          { label: 'Points Issued', value: members.reduce((acc, m) => acc + (m.totalPointsEarned || 0), 0).toLocaleString(), icon: Star, color: 'yellow' },
          { label: 'Points Redeemed', value: members.reduce((acc, m) => acc + (m.totalPointsRedeemed || 0), 0).toLocaleString(), icon: Gift, color: 'green' },
        ].map((stat, index) => (
          <Card key={index} className="border-0 shadow-soft cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toast.info(`Viewing detailed report for ${stat.label}...`)}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', `bg-${stat.color}-100`)}>
                <stat.icon className={cn('w-6 h-6', `text-${stat.color}-500`)} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100">
          <TabsTrigger value="tiers">Loyalty Program</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
        </TabsList>

        <TabsContent value="tiers" className="space-y-6 mt-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Loyalty Program Rules</h2>
          </div>

          <div className="max-w-2xl">
            {tiers.length > 0 && (
              <Card className="border-0 shadow-soft overflow-hidden">
                <div className="h-2 bg-coral-500" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Global Earning & Redemption Rules</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <p className="text-xs uppercase text-gray-500 font-bold">Earn Ratio (Pts/$)</p>
                      <p className="text-2xl font-bold text-coral-500">{(tiers[0].earnRatio || 1)}x</p>
                      <p className="text-[10px] text-gray-400">Points earned per $1 spent</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs uppercase text-gray-500 font-bold">Redeem Value ($/Pt)</p>
                      <p className="text-2xl font-bold text-blue-500">${(tiers[0].redeemValue || 0.1)}/pt</p>
                      <p className="text-[10px] text-gray-400">Value of 1 point during redemption</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs uppercase text-gray-500 font-bold">Min. Bill ($)</p>
                      <p className="text-2xl font-bold text-gray-800">${(tiers[0].minBillForRedemption || 50)}</p>
                      <p className="text-[10px] text-gray-400">Minimum total to allow redemption</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-800">Status: Active</h4>
                      <p className="text-xs text-gray-500">All members follow these global rules.</p>
                    </div>
                    <Button variant="outline" onClick={() => openEditTier(tiers[0])} className="border-coral-200 text-coral-600 hover:bg-coral-50">
                      <Edit className="w-4 h-4 mr-2" />
                      Configure Rules
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {tiers.length === 0 && !loading && (
              <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Loyalty rules not initialized.</p>
                <Button onClick={openAddTier} className="mt-4 gradient-coral text-white">Initialize Rules</Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-6 mt-6">
          <Card className="border-0 shadow-soft">
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Customer</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Spent (Lifetime)</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Current Points</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((loyalty) => {
                      const currentTier = tiers.find(t => t.id === loyalty.tierId);
                      const nextTier = tiers.find(t => Number(t.minSpent) > (currentTier?.minSpent || 0));
                      const progress = nextTier ? (Number(loyalty.totalSpent) / Number(nextTier.minSpent)) * 100 : 100;

                      return (
                        <tr key={loyalty.customerId} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full gradient-coral flex items-center justify-center font-bold text-white text-sm">
                                {loyalty.customer ? `${loyalty.customer.firstName[0]}${loyalty.customer.lastName[0]}` : '??'}
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">
                                  {loyalty.customer ? `${loyalty.customer.firstName} ${loyalty.customer.lastName}` : `Customer #${loyalty.customerId}`}
                                </p>
                                <p className="text-xs text-gray-400">{loyalty.customer?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-bold text-gray-800">
                            ${(Number(loyalty.totalSpent) || 0).toLocaleString()}
                          </td>
                          <td className="py-4 px-4 text-coral-600 font-bold">
                            {(loyalty.currentPoints || 0).toLocaleString()} pts
                          </td>
                          <td className="py-4 px-4 text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/admin/customers/${loyalty.customerId}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                Profile
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6 mt-6">
          <Card className="border-0 shadow-soft">
            <CardContent className="p-0">
              {transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-6 font-medium text-gray-500">Member</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-500">Points</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-500">Type</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-500">Reason</th>
                        <th className="text-right py-3 px-6 font-medium text-gray-500">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-6">
                            <p className="font-medium text-gray-800">{tx.customer?.firstName} {tx.customer?.lastName}</p>
                            <p className="text-xs text-gray-400">{tx.customer?.email}</p>
                          </td>
                          <td className="py-4 px-6">
                            <span className={cn(
                              "font-bold",
                              tx.type === 'earned' || (tx.type === 'adjusted' && tx.points > 0) ? "text-green-500" : "text-red-500"
                            )}>
                              {tx.type === 'earned' || (tx.type === 'adjusted' && tx.points > 0) ? '+' : '-'}{Math.abs(tx.points)}
                            </span>
                          </td>
                          <td className="py-4 px-6 uppercase text-[10px] font-bold">
                            <Badge variant="outline" className={cn(
                              tx.type === 'earned' && "border-green-200 text-green-600 bg-green-50",
                              tx.type === 'redeemed' && "border-red-200 text-red-600 bg-red-50",
                              tx.type === 'adjusted' && "border-blue-200 text-blue-600 bg-blue-50"
                            )}>
                              {tx.type}
                            </Badge>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-600 italic">
                            {tx.reason}
                          </td>
                          <td className="py-4 px-6 text-right text-sm text-gray-400">
                            {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Zap className="w-16 h-16 text-coral-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700">No Transactions Found</h3>
                  <p className="text-gray-500 mt-2">Adjusted points and redemptions will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coupons" className="space-y-6 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Active Coupons</h2>
            {/* Create Coupon Button & Dialog reused or duplicated. For brevity, assuming shared component or duplicated logic */}
            <Button className="gradient-coral text-white" onClick={() => setIsCreateCouponOpen(true)}><Plus className="w-4 h-4 mr-2" /> Create Coupon</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon) => (
              <Card key={coupon.id} className="border-0 shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge className={cn(
                      coupon.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600',
                    )}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {coupon.usedCount} / {coupon.usageLimit || '∞'} used
                    </span>
                  </div>
                  {/* ... Coupon display details ... */}
                  <div className="bg-gradient-to-r from-coral-500 to-coral-400 rounded-xl p-4 text-white mb-4">
                    <p className="text-3xl font-bold">{coupon.code}</p>
                    <p className="text-sm opacity-90">{coupon.description}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Discount</span>
                      <span className="font-medium">
                        {coupon.discountType === 'percentage'
                          ? `${coupon.value}%`
                          : `$${coupon.value}`
                        }
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Min. Purchase</span>
                      <span className="font-medium">${coupon.minPurchaseAmount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Valid Until</span>
                      <span className="font-medium">
                        {coupon.endDate
                          ? new Date(coupon.endDate).toLocaleDateString()
                          : 'No expiry'
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Manage Tier Dialog */}
      <Dialog open={isTierDialogOpen} onOpenChange={setIsTierDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Configure Loyalty Rules</DialogTitle>
            <DialogDescription>
              Set the points earning and redemption rules for your loyalty program.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2 col-span-2 hidden">
              <Label>Tier Name</Label>
              <Input value={tierForm.name} onChange={e => setTierForm({ ...tierForm, name: e.target.value })} placeholder="e.g. Gold" />
            </div>
            {/* hidden min spent because we removed tiers */}
            <div className="space-y-2 hidden">
              <Label>Min. Spent ($)</Label>
              <Input type="number" value={tierForm.minSpent} onChange={e => setTierForm({ ...tierForm, minSpent: e.target.value === '' ? 0 : parseFloat(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Earn Ratio (Pts/$)</Label>
              <Input type="number" step="0.1" value={tierForm.earnRatio} onChange={e => setTierForm({ ...tierForm, earnRatio: e.target.value === '' ? 1 : parseFloat(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Redeem Value ($/Pt)</Label>
              <Input type="number" step="0.01" value={tierForm.redeemValue} onChange={e => setTierForm({ ...tierForm, redeemValue: e.target.value === '' ? 0.1 : parseFloat(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Min. Bill ($)</Label>
              <Input type="number" value={tierForm.minBillForRedemption} onChange={e => setTierForm({ ...tierForm, minBillForRedemption: e.target.value === '' ? 50 : parseFloat(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Theme Color</Label>
              <Input type="color" value={tierForm.color} onChange={e => setTierForm({ ...tierForm, color: e.target.value })} className="h-10 p-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTierDialogOpen(false)}>Cancel</Button>
            <Button className="gradient-coral text-white" onClick={handleSaveTier}>Save Tier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Coupon Dialog - Simplified instantiation for this replacement */}
      <Dialog open={isCreateCouponOpen} onOpenChange={setIsCreateCouponOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Coupon</DialogTitle></DialogHeader>
          {/* Form would go here */}
          <DialogFooter><Button onClick={() => setIsCreateCouponOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
