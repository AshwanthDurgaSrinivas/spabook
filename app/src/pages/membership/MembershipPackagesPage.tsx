import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Crown, Plus, Users, Calendar, Check, DollarSign,
  Gift, Edit, Eye, Loader2, RefreshCcw
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { membershipService, type MembershipPlan, type CustomerMembership } from '@/services/membershipService';

export function MembershipPackagesPage() {
  const [activeTab, setActiveTab] = useState('plans');
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);

  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [memberships, setMemberships] = useState<CustomerMembership[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [duration, setDuration] = useState('30');
  const [discount, setDiscount] = useState('0');
  const [submitting, setSubmitting] = useState(false);
  const [planType, setPlanType] = useState<'membership' | 'package'>('membership');
  const [totalVisits, setTotalVisits] = useState('0');
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [benefits, setBenefits] = useState<string[]>([]);
  const [newBenefit, setNewBenefit] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansData, subsData] = await Promise.all([
        membershipService.getPlans(),
        membershipService.getAllSubscriptions()
      ]);
      setPlans(plansData);
      setMemberships(subsData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddBenefit = () => {
    if (newBenefit && !benefits.includes(newBenefit)) {
      setBenefits([...benefits, newBenefit]);
      setNewBenefit('');
    }
  };

  const handleRemoveBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  const handleCreatePlan = async () => {
    try {
      if (!name) {
        toast.error('Plan name is required');
        return;
      }
      setSubmitting(true);

      const finalBenefits = [...benefits];
      if (planType === 'package' && totalVisits !== '0') {
        finalBenefits.push(`Total Visits: ${totalVisits}`);
      }

      await membershipService.createPlan({
        name: planType === 'package' ? `${name} (Package)` : name,
        description,
        price: parseFloat(price),
        durationDays: planType === 'membership' ? parseInt(duration) : 0,
        discountPercentage: parseFloat(discount),
        benefits: finalBenefits,
        isActive: true
      });
      toast.success('Plan created successfully');
      setIsCreatePlanOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error('Failed to create plan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePlan = async () => {
    if (!editingPlan) return;
    try {
      setSubmitting(true);

      await membershipService.updatePlan(editingPlan.id, {
        name,
        description,
        price: parseFloat(price),
        durationDays: planType === 'membership' ? parseInt(duration) : 0,
        discountPercentage: parseFloat(discount),
        benefits: benefits
      });
      toast.success('Plan updated successfully');
      setIsEditOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to update plan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePlan = async (id: number) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    try {
      await membershipService.deletePlan(id);
      toast.success('Plan deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete plan');
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('0');
    setDuration('30');
    setDiscount('0');
    setTotalVisits('0');
    setPlanType('membership');
    setBenefits([]);
    setNewBenefit('');
  };

  const openEditDialog = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setName(plan.name.replace(' (Package)', ''));
    setDescription(plan.description || '');
    setPrice(plan.price.toString());
    setDuration(plan.durationDays.toString());
    setDiscount(plan.discountPercentage.toString());
    setBenefits(Array.isArray(plan.benefits) ? plan.benefits : []);

    if (plan.name.toLowerCase().includes('package')) {
      setPlanType('package');
    } else {
      setPlanType('membership');
    }
    setIsEditOpen(true);
  };

  const membershipPlansList = plans.filter(p => !p.name.toLowerCase().includes('package') && !p.name.toLowerCase().includes('bundle'));
  const packagesList = plans.filter(p => p.name.toLowerCase().includes('package') || p.name.toLowerCase().includes('bundle'));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-800">Memberships & Packages</h1>
          <p className="text-gray-500 mt-1">Manage membership plans and prepaid packages</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-coral-200" onClick={fetchData}>
            <RefreshCcw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button className="gradient-coral hover:opacity-90 text-white" onClick={() => { resetForm(); setIsCreatePlanOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Create Plan
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Members', value: memberships.filter(m => m.status === 'active').length.toString(), icon: Users, color: 'indigo' },
          { label: 'Total Plans', value: plans.length.toString(), icon: Crown, color: 'amber' },
          { label: 'Monthly Revenue', value: `$${memberships.filter(m => m.status === 'active').reduce((acc, m) => acc + Number(m.plan?.price || 0), 0).toLocaleString()}`, icon: DollarSign, color: 'emerald' },
          {
            label: 'Expiring Soon', value: memberships.filter(m => {
              const end = new Date(m.endDate);
              const now = new Date();
              const diff = end.getTime() - now.getTime();
              return m.status === 'active' && diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
            }).length.toString(), icon: Calendar, color: 'rose'
          },
        ].map((stat, index) => (
          <Card key={index} className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center bg-gray-50')}>
                <stat.icon className={cn('w-6 h-6', {
                  'text-indigo-600': stat.color === 'indigo',
                  'text-amber-600': stat.color === 'amber',
                  'text-emerald-600': stat.color === 'emerald',
                  'text-rose-600': stat.color === 'rose',
                })} />
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
        <TabsList className="bg-gray-100/50 p-1 rounded-xl">
          <TabsTrigger value="plans" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Membership Plans</TabsTrigger>
          <TabsTrigger value="packages" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Prepaid Packages</TabsTrigger>
          <TabsTrigger value="members" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Active Members</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6 mt-6">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {membershipPlansList.map((plan) => (
                <Card key={plan.id} className="border-0 shadow-sm overflow-hidden flex flex-col h-full">
                  <div className="h-1 bg-indigo-600" />
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-4">
                      <Crown className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-xl font-bold">{plan.name}</h3>
                    </div>

                    <div className="mb-6">
                      <p className="text-3xl font-bold text-gray-900">${plan.price}</p>
                      <p className="text-sm text-gray-500">
                        {plan.durationDays} days validity
                      </p>
                    </div>

                    <p className="text-gray-600 mb-6 text-sm line-clamp-3">{plan.description}</p>

                    <div className="space-y-3 mb-8 flex-1">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="text-sm font-medium">{plan.discountPercentage}% auto-discount on bookings</span>
                      </div>
                      {Array.isArray(plan.benefits) && plan.benefits.map((benefit, i) => (
                        <div key={i} className="flex items-center gap-2 text-gray-600">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <Button variant="outline" className="flex-1" onClick={() => openEditDialog(plan)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="ghost" className="flex-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50" onClick={() => handleDeletePlan(plan.id)}>
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {membershipPlansList.length === 0 && (
                <div className="col-span-full text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-500">No membership plans found.</p>
                  <Button variant="link" onClick={() => setIsCreatePlanOpen(true)} className="text-indigo-600 mt-2">Create your first plan</Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="packages" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packagesList.map((plan) => (
              <Card key={plan.id} className="border-0 shadow-sm overflow-hidden flex flex-col h-full">
                <div className="h-1 bg-emerald-600" />
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <Gift className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                  </div>

                  <div className="mb-6">
                    <p className="text-3xl font-bold text-gray-900">${plan.price}</p>
                    <p className="text-sm text-gray-500">Prepaid Package</p>
                  </div>

                  <p className="text-gray-600 mb-6 text-sm line-clamp-3">{plan.description}</p>

                  <div className="space-y-3 mb-8 flex-1">
                    {Array.isArray(plan.benefits) && plan.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-center gap-2 text-gray-600">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <Button variant="outline" className="flex-1" onClick={() => openEditDialog(plan)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="ghost" className="flex-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50" onClick={() => handleDeletePlan(plan.id)}>
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {packagesList.length === 0 && (
              <div className="col-span-full text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-gray-500">No prepaid packages found.</p>
                <Button variant="link" onClick={() => { setPlanType('package'); setIsCreatePlanOpen(true); }} className="text-emerald-600 mt-2">Create your first package</Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-6 mt-6">
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="py-4 px-6 text-sm font-semibold text-gray-600">Member</th>
                      <th className="py-4 px-6 text-sm font-semibold text-gray-600">Plan</th>
                      <th className="py-4 px-6 text-sm font-semibold text-gray-600">Start Date</th>
                      <th className="py-4 px-6 text-sm font-semibold text-gray-600">End Date</th>
                      <th className="py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                      <th className="py-4 px-6 text-sm font-semibold text-gray-600 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {memberships.map((membership) => (
                      <tr key={membership.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                              {membership.customer?.firstName?.[0] || 'C'}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{membership.customer ? `${membership.customer.firstName} ${membership.customer.lastName}` : `Customer #${membership.customerId}`}</p>
                              <p className="text-xs text-gray-500">{membership.customer?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant="outline" className="font-medium text-emerald-700 bg-emerald-50 border-emerald-100">
                            {membership.plan?.name}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {new Date(membership.startDate).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {new Date(membership.endDate).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          <Badge className={cn(
                            'rounded-full px-3',
                            membership.status === 'active' ? 'bg-emerald-100 text-emerald-700 border-none' : 'bg-gray-100 text-gray-600 border-none'
                          )}>
                            {membership.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                            <Eye className="w-4 h-4 text-gray-400" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Unified Plan Modal */}
      <Dialog open={isCreatePlanOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreatePlanOpen(false);
          setIsEditOpen(false);
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-0 shadow-2xl">
          <div className="h-1.5 bg-indigo-600" />
          <div className="p-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold">{isEditOpen ? 'Edit Membership Plan' : 'Create New Plan'}</DialogTitle>
              <DialogDescription>Define the details, pricing and benefits for your membership tier.</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <Label className="text-sm font-semibold">Plan Name</Label>
                  <Input placeholder="e.g. Platinum Prestige" value={name} onChange={e => setName(e.target.value)} className="bg-gray-50 border-0 focus-visible:ring-indigo-600" />
                </div>
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <Label className="text-sm font-semibold">Plan Type</Label>
                  <Select value={planType} onValueChange={(v: any) => setPlanType(v)}>
                    <SelectTrigger className="bg-gray-50 border-0 focus:ring-indigo-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="membership">Standard Membership</SelectItem>
                      <SelectItem value="package">Prepaid Package</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Description</Label>
                <Input placeholder="Briefly explain what this plan offers..." value={description} onChange={e => setDescription(e.target.value)} className="bg-gray-50 border-0 focus-visible:ring-indigo-600" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Price ($)</Label>
                  <Input type="number" value={price} onChange={e => setPrice(e.target.value)} className="bg-gray-50 border-0 focus-visible:ring-indigo-600" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    {planType === 'membership' ? 'Validity (Days)' : 'Visits'}
                  </Label>
                  <Input
                    type="number"
                    value={planType === 'membership' ? duration : totalVisits}
                    onChange={e => planType === 'membership' ? setDuration(e.target.value) : setTotalVisits(e.target.value)}
                    className="bg-gray-50 border-0 focus-visible:ring-indigo-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Discount (%)</Label>
                  <Input type="number" value={discount} onChange={e => setDiscount(e.target.value)} className="bg-gray-50 border-0 focus-visible:ring-indigo-600" />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <Label className="text-sm font-semibold flex items-center justify-between">
                  Core Benefits
                  <span className="text-xs font-normal text-gray-500">Hit enter to add</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Free Welcome Kit"
                    value={newBenefit}
                    onChange={e => setNewBenefit(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddBenefit())}
                    className="bg-gray-50 border-0 focus-visible:ring-indigo-600 flex-1"
                  />
                  <Button type="button" onClick={handleAddBenefit} className="bg-indigo-600 text-white hover:bg-indigo-700">Add</Button>
                </div>

                <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-gray-50 rounded-xl">
                  {benefits.length === 0 && <p className="text-gray-400 text-xs my-auto">No custom benefits added yet.</p>}
                  {benefits.map((benefit, i) => (
                    <Badge key={i} className="bg-white text-gray-700 border border-gray-200 hover:border-indigo-200 pl-3 pr-1 py-1 gap-2 rounded-lg">
                      {benefit}
                      <button onClick={() => handleRemoveBenefit(i)} className="p-0.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-rose-500 transition-colors">
                        <Plus className="w-3.5 h-3.5 rotate-45" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="mt-8 gap-3">
              <Button variant="ghost" onClick={() => { setIsCreatePlanOpen(false); setIsEditOpen(false); resetForm(); }} className="hover:bg-gray-100">Cancel</Button>
              <Button
                className="bg-indigo-600 text-white hover:bg-indigo-700 px-8"
                onClick={isEditOpen ? handleUpdatePlan : handleCreatePlan}
                disabled={submitting}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {isEditOpen ? 'Update Plan' : 'Create Plan'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
