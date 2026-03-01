import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Ticket, Plus, Search, Users, DollarSign,
  Copy, Edit, Trash2, Percent, Tag, Gift, CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { marketingService, type Coupon } from '@/services/marketingService';
import { membershipService, type MembershipPlan } from '@/services/membershipService';

export function CouponsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateCouponOpen, setIsCreateCouponOpen] = useState(false);
  const [coupons, setCoupons] = useState<any[]>([]); // Using any for UI mapping, ideally define type
  const [loading, setLoading] = useState(true);

  // Form State
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [value, setValue] = useState('');
  const [minPurchase, setMinPurchase] = useState('');
  const [expiry, setExpiry] = useState('');
  const [limit, setLimit] = useState('');
  const [membershipId, setMembershipId] = useState<string>('all');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [memberships, setMemberships] = useState<MembershipPlan[]>([]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const [couponsData, membershipsData] = await Promise.all([
        marketingService.getCoupons(),
        membershipService.getPlans()
      ]);
      setCoupons(couponsData);
      setMemberships(membershipsData);
    } catch (error) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openCreateDialog = () => {
    setCode('');
    setValue('');
    setMinPurchase('');
    setExpiry('');
    setLimit('');
    setDiscountType('percentage');
    setMembershipId('all');
    setEditingId(null);
    setIsCreateCouponOpen(true);
  };

  const openEditDialog = (coupon: any) => {
    setCode(coupon.code);
    setValue(coupon.value.toString());
    setMinPurchase(coupon.minPurchaseAmount ? coupon.minPurchaseAmount.toString() : '');
    setExpiry(coupon.endDate ? new Date(coupon.endDate).toISOString().split('T')[0] : '');
    setLimit(coupon.usageLimit ? coupon.usageLimit.toString() : '');
    setDiscountType(coupon.discountType || 'percentage');

    // Determine membership restriction value
    if (coupon.isMembersOnly) {
      setMembershipId('members-only');
    } else {
      setMembershipId(coupon.membershipId ? coupon.membershipId.toString() : 'all');
    }

    setEditingId(coupon.id);
    setIsCreateCouponOpen(true);
  };

  const handleSaveCoupon = async () => {
    try {
      if (!code || !value || !expiry) {
        toast.error('Please fill required fields');
        return;
      }

      const payload = {
        code: code.toUpperCase(),
        discountType,
        value: parseFloat(value),
        minPurchaseAmount: minPurchase ? parseFloat(minPurchase) : 0,
        startDate: new Date().toISOString(),
        endDate: new Date(expiry).toISOString(),
        usageLimit: limit ? parseInt(limit) : undefined,
        membershipId: (membershipId === 'all' || membershipId === 'members-only') ? null : parseInt(membershipId),
        isMembersOnly: membershipId === 'members-only'
      };

      if (editingId) {
        await marketingService.updateCoupon(editingId, payload);
        toast.success('Coupon updated successfully!');
      } else {
        await marketingService.createCoupon(payload);
        toast.success('Coupon created successfully!');
      }

      setIsCreateCouponOpen(false);
      fetchCoupons();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save coupon');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await marketingService.deleteCoupon(id);
        toast.success('Coupon deleted');
        fetchCoupons();
      } catch (error) {
        toast.error('Failed to delete coupon');
      }
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Coupon code copied to clipboard');
  };

  const stats = {
    totalCoupons: coupons.length,
    activeCoupons: coupons.filter(c => c.isActive).length,
    totalRedemptions: coupons.reduce((acc, c) => acc + (c.usedCount || 0), 0),
    totalDiscount: 0, // Not tracked in basic stats
  };

  const filteredCoupons = coupons.filter(c =>
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-800">Coupons</h1>
          <p className="text-gray-500 mt-1">Create and manage promotional codes</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isCreateCouponOpen} onOpenChange={setIsCreateCouponOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-coral hover:opacity-90 text-white" onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Create Coupon
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle>
                <DialogDescription>
                  {editingId ? 'Update promotional code details.' : 'Define a new promotional code for your customers.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Coupon Code</Label>
                    <Input
                      id="code"
                      placeholder="e.g. SUMMER24"
                      className="uppercase"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discountType">Discount Type</Label>
                    <Select value={discountType} onValueChange={setDiscountType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed_amount">Fixed Amount ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="value">Discount Value</Label>
                    <Input
                      id="value"
                      type="number"
                      placeholder="20"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minPurchase">Min. Purchase ($)</Label>
                    <Input
                      id="minPurchase"
                      type="number"
                      placeholder="50"
                      value={minPurchase}
                      onChange={(e) => setMinPurchase(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    type="date"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="limit">Usage Limit (Total)</Label>
                    <Input
                      id="limit"
                      type="number"
                      placeholder="100"
                      value={limit}
                      onChange={(e) => setLimit(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="membership">Restrict to Membership</Label>
                    <Select value={membershipId} onValueChange={setMembershipId}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Customers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Customers</SelectItem>
                        <SelectItem value="members-only">Only Memberships</SelectItem>
                        {memberships.map((m) => (
                          <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateCouponOpen(false)}>Cancel</Button>
                <Button className="gradient-coral text-white" onClick={handleSaveCoupon}>
                  {editingId ? 'Save Changes' : 'Create Coupon'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Coupons', value: stats.totalCoupons.toString(), icon: Ticket, color: 'coral' },
          { label: 'Active', value: stats.activeCoupons.toString(), icon: CheckCircle, color: 'green' },
          { label: 'Redemptions', value: stats.totalRedemptions.toLocaleString(), icon: Users, color: 'blue' },
          { label: 'Total Discount', value: `$${stats.totalDiscount.toLocaleString()}`, icon: DollarSign, color: 'purple' },
        ].map((stat, index) => (
          <Card key={index} className="border-0 shadow-soft">
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
      <Tabs defaultValue="all">
        <TabsList className="bg-gray-100">
          <TabsTrigger value="all">All Coupons</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6 mt-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search coupons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 max-w-md"
            />
          </div>

          {/* Coupons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCoupons.map((coupon) => (
              <Card key={coupon.id} className="border-0 shadow-soft overflow-hidden">
                {/* Coupon Header */}
                <div className={cn(
                  'p-6 text-white relative overflow-hidden',
                  coupon.isActive ? 'gradient-coral' : 'bg-gray-400'
                )}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {coupon.discountType === 'percentage' ? (
                          <Percent className="w-5 h-5" />
                        ) : (
                          <DollarSign className="w-5 h-5" />
                        )}
                        <Badge className="bg-white/20 text-white">
                          {coupon.isActive ? 'active' : 'inactive'}
                        </Badge>
                      </div>
                      <span className="text-sm opacity-80">
                        {coupon.usedCount} / {coupon.usageLimit || '∞'} used
                      </span>
                    </div>
                    <p className="text-4xl font-bold">
                      {coupon.discountType === 'percentage'
                        ? `${coupon.value}%`
                        : `$${coupon.value}`
                      }
                    </p>
                    <p className="text-sm opacity-80">{coupon.description || coupon.name || 'Coupon'}</p>
                  </div>
                </div>

                <CardContent className="p-4">
                  {/* Coupon Code */}
                  <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg mb-4">
                    <code className="font-mono font-bold text-lg">{coupon.code}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyCode(coupon.code)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Min. Purchase</span>
                      <span className="font-medium">${coupon.minPurchaseAmount}</span>
                    </div>
                    {coupon.maxDiscountAmount && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Max Discount</span>
                        <span className="font-medium">${coupon.maxDiscountAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Valid Until</span>
                      <span className="font-medium">
                        {coupon.endDate
                          ? new Date(coupon.endDate).toLocaleDateString()
                          : 'No expiry'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Restriction</span>
                      <span className="font-medium bg-gray-200 px-2 py-0.5 rounded text-xs">
                        {coupon.isMembersOnly
                          ? 'Only Memberships'
                          : (coupon.membershipId ? (memberships.find(m => m.id === coupon.membershipId)?.name || 'Matching Membership') : 'All Customers')
                        }
                      </span>
                    </div>
                  </div>

                  {/* Usage Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Usage</span>
                      <span className="font-medium">
                        {coupon.usageLimit ? Math.round((coupon.usedCount / coupon.usageLimit) * 100) : 0}%
                      </span>
                    </div>
                    <Progress
                      value={coupon.usageLimit ? (coupon.usedCount / coupon.usageLimit) * 100 : 0}
                      className="h-2"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => openEditDialog(coupon)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" className="text-red-500" onClick={() => handleDelete(coupon.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredCoupons.length === 0 && !loading && (
              <div className="col-span-full text-center py-10 text-gray-500">
                No coupons found.
              </div>
            )}
            {loading && (
              <div className="col-span-full text-center py-10 text-gray-500">
                Loading...
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Coupon Types */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Coupon Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Percentage Off', icon: Percent, description: 'e.g., 20% off' },
              { name: 'Fixed Amount', icon: DollarSign, description: 'e.g., $25 off' },
              { name: 'Free Service', icon: Gift, description: 'Complimentary service' },
              { name: 'Bundle Deal', icon: Tag, description: 'Multi-service discount' },
            ].map((type, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-coral-50 hover:border-coral-200"
              >
                <type.icon className="w-6 h-6 text-coral-500" />
                <span className="font-medium">{type.name}</span>
                <span className="text-xs text-gray-500">{type.description}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
