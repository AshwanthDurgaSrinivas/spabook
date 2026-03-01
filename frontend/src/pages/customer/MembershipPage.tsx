import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Crown, Zap, ShieldCheck, ArrowRight, Loader2, XCircle, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { membershipService, type MembershipPlan, type CustomerMembership } from '@/services/membershipService';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRazorpay } from '@/hooks/useRazorpay';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function MembershipPage() {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const { initPayment, loading: paymentLoading } = useRazorpay();
    const [plans, setPlans] = useState<MembershipPlan[]>([]);
    const [myMembership, setMyMembership] = useState<CustomerMembership | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    // Dialog States
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showChangeDialog, setShowChangeDialog] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [plansData, myData] = await Promise.all([
                membershipService.getPlans(),
                membershipService.getMyMembership()
            ]);
            setPlans(plansData.filter(p => p.isActive));
            setMyMembership(myData);
        } catch (error) {
            toast.error('Failed to load memberships');
        } finally {
            setLoading(false);
        }
    };

    const handleManageSubscription = () => {
        setShowCancelDialog(true);
    };

    const handleCancelSubscription = async () => {
        try {
            setIsCancelling(true);
            await membershipService.cancelSubscription();
            toast.success('Membership cancelled successfully');
            await Promise.all([
                fetchData(),
                refreshUser()
            ]);
            setShowCancelDialog(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to cancel membership');
        } finally {
            setIsCancelling(false);
        }
    };

    const handlePlanClick = (plan: MembershipPlan) => {
        if (!user) {
            toast.error('Please login to purchase a membership');
            return;
        }

        if (myMembership && myMembership.planId !== plan.id) {
            setSelectedPlan(plan);
            setShowChangeDialog(true);
        } else if (!myMembership) {
            handleSubscribe(plan);
        }
    };

    const handleSubscribe = async (plan: MembershipPlan) => {
        try {
            setActionLoading(plan.id);
            const success = await initPayment({
                id: plan.id,
                amount: plan.price,
                customerName: `${user?.firstName} ${user?.lastName}`,
                customerEmail: user?.email || '',
                customerPhone: user?.phone || '',
                type: 'membership'
            });

            if (success) {
                toast.success('Membership activated successfully!');
                await Promise.all([
                    fetchData(),
                    refreshUser()
                ]);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Subscription failed');
        } finally {
            setActionLoading(null);
            setShowChangeDialog(false);
            setSelectedPlan(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                <p className="text-slate-500 font-medium animate-pulse">Curating your wellness tier...</p>
            </div>
        );
    }

    const currentPlan = plans.find(p => p.id === myMembership?.planId) || myMembership?.plan;
    const isUpgrade = selectedPlan && currentPlan && parseFloat(String(selectedPlan.price)) > parseFloat(String(currentPlan.price || 0));

    return (
        <div className="space-y-12 pb-20">
            <header className="relative py-20 overflow-hidden rounded-[3rem] bg-slate-900 text-white">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-900" />

                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-sm font-bold text-indigo-300 uppercase tracking-widest"
                    >
                        Exclusive Tiers
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-display font-bold"
                    >
                        Elevate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Wellness Experience</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-slate-400 max-w-2xl mx-auto"
                    >
                        Join our exclusive membership program and unlock a world of personalized beauty care, priority bookings, and luxury spa benefits.
                    </motion.p>
                </div>
            </header>

            {myMembership && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <Card className="border-0 shadow-2xl shadow-indigo-500/10 overflow-hidden group">
                        <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-b from-indigo-500 to-purple-500" />
                        <CardContent className="p-8">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="space-y-4 text-center md:text-left">
                                    <div className="flex items-center gap-3 justify-center md:justify-start">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                                            <Crown className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Active Membership</p>
                                            <h2 className="text-2xl font-bold text-slate-900">{myMembership.plan?.name}</h2>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-100 px-3 py-1">
                                            Expires: {new Date(myMembership.endDate).toLocaleDateString()}
                                        </Badge>
                                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 px-3 py-1">
                                            Status: Active
                                        </Badge>
                                    </div>
                                </div>
                                <div className="text-center md:text-right space-y-2">
                                    <p className="text-sm text-slate-500">Your next renewal</p>
                                    <p className="text-2xl font-bold text-slate-900">${myMembership.plan?.price}</p>
                                    <Button
                                        variant="outline"
                                        className="rounded-full border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                                        onClick={handleManageSubscription}
                                    >
                                        Cancel Subscription
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {plans.map((plan, index) => {
                    const isCurrent = myMembership?.planId === plan.id;
                    const isPopular = plan.name.toLowerCase().includes('gold') || plan.name.toLowerCase().includes('glow');
                    const isHigherTier = currentPlan && parseFloat(String(plan.price)) > parseFloat(String(currentPlan.price || 0));

                    return (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                        >
                            <Card className={cn(
                                "flex flex-col h-full border-2 transition-all duration-500 relative overflow-hidden group",
                                isPopular ? "border-indigo-500 shadow-xl shadow-indigo-500/10 scale-105" : "border-slate-100 hover:border-indigo-200 shadow-lg hover:shadow-xl",
                                isCurrent && "border-emerald-500 opacity-90"
                            )}>
                                {isPopular && (
                                    <div className="absolute top-0 right-0">
                                        <div className="bg-indigo-500 text-white text-[10px] font-bold px-8 py-1 rotate-45 translate-x-3 translate-y-3 uppercase tracking-tighter">
                                            Most Popular
                                        </div>
                                    </div>
                                )}

                                <CardHeader className="p-8 pb-4">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={cn(
                                            "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
                                            isPopular ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                                        )}>
                                            {index === 0 ? <Loader2 className="w-8 h-8 rotate-45" /> : index === 1 ? <Sparkles className="w-8 h-8" /> : <Crown className="w-8 h-8" />}
                                        </div>
                                    </div>
                                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                                    <CardDescription className="text-slate-500 min-h-[3rem] mt-2">{plan.description}</CardDescription>
                                </CardHeader>

                                <CardContent className="p-8 pt-0 flex-1 flex flex-col">
                                    <div className="mb-8">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-bold text-slate-900">${plan.price}</span>
                                            <span className="text-slate-500 font-medium">/ {plan.durationDays} days</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8 flex-1">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Included Benefits</p>
                                        <ul className="space-y-3">
                                            {plan.benefits.map((benefit: string, i: number) => (
                                                <li key={i} className="flex gap-3 text-sm text-slate-600">
                                                    <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                                        <Check className="w-3 h-3 text-emerald-600" />
                                                    </div>
                                                    <span>{benefit}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <Button
                                        onClick={() => handlePlanClick(plan)}
                                        disabled={isCurrent || (actionLoading !== null)}
                                        className={cn(
                                            "w-full rounded-2xl h-12 font-bold transition-all",
                                            isCurrent
                                                ? "bg-emerald-500 hover:bg-emerald-500 text-white cursor-default"
                                                : isPopular
                                                    ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                                                    : "bg-slate-900 hover:bg-slate-800 text-white"
                                        )}
                                    >
                                        {actionLoading === plan.id ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : isCurrent ? (
                                            <div className="flex items-center gap-2">
                                                <ShieldCheck className="w-5 h-5" />
                                                Active Plan
                                            </div>
                                        ) : myMembership ? (
                                            <div className="flex items-center gap-2">
                                                {isHigherTier ? 'Upgrade Plan' : 'Downgrade Plan'}
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                Purchase Now
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            <section className="bg-indigo-50/50 rounded-[2rem] p-8 md:p-12 border border-indigo-100">
                <div className="grid md:grid-cols-3 gap-12">
                    <div className="space-y-3">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm mb-4">
                            <Zap className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Instant Benefits</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">Discounts and rewards are applied instantly to your profile the moment you subscribe.</p>
                    </div>
                    <div className="space-y-3">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm mb-4">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Flexible Changes</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">Upgrade or downgrade your plan at any time. New benefits will apply immediately.</p>
                    </div>
                    <div className="space-y-3">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm mb-4">
                            <Crown className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Prestige Support</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">Membership entitles you to priority support and exclusive member-only beauty consultations.</p>
                    </div>
                </div>
            </section>

            {/* Cancel Dialog */}
            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent className="rounded-3xl border-0 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-bold flex items-center gap-3 text-red-600">
                            <XCircle className="w-8 h-8" />
                            Cancel Membership
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-600 py-4">
                            Are you sure you want to cancel your <span className="font-bold text-slate-900">{myMembership?.plan?.name}</span> membership?
                            You will lose access to all exclusive benefits and discounts immediately.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-3">
                        <AlertDialogCancel className="rounded-2xl h-12 border-slate-200">Keep Membership</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleCancelSubscription();
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-2xl h-12 px-8 font-bold flex items-center gap-2"
                        >
                            {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                            Cancel Subscription
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Upgrade/Downgrade Dialog */}
            <AlertDialog open={showChangeDialog} onOpenChange={setShowChangeDialog}>
                <AlertDialogContent className="rounded-3xl border-0 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-bold flex items-center gap-3">
                            {isUpgrade ? (
                                <ArrowUpCircle className="w-8 h-8 text-indigo-600" />
                            ) : (
                                <ArrowDownCircle className="w-8 h-8 text-amber-500" />
                            )}
                            {isUpgrade ? 'Upgrade Membership' : 'Downgrade Membership'}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-600 py-4">
                            Are you sure you want to <span className="font-bold text-slate-900">{isUpgrade ? 'upgrade' : 'downgrade'}</span> from {myMembership?.plan?.name} to <span className="font-bold text-slate-900">{selectedPlan?.name}</span>?
                            <br /><br />
                            {isUpgrade
                                ? "You'll get even more exclusive benefits! Your current plan will be replaced by the new tier upon successful payment."
                                : "You'll still enjoy great benefits, but some premium features might be removed. Your current plan will be replaced by the new tier."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-3">
                        <AlertDialogCancel className="rounded-2xl h-12 border-slate-200">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                if (selectedPlan) {
                                    setShowChangeDialog(false);
                                    handleSubscribe(selectedPlan);
                                }
                            }}
                            className={cn(
                                "text-white rounded-2xl h-12 px-8 font-bold flex items-center gap-2",
                                isUpgrade ? "bg-indigo-600 hover:bg-indigo-700" : "bg-slate-900 hover:bg-slate-800"
                            )}
                        >
                            {paymentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                            Confirm & Pay ${selectedPlan?.price}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
