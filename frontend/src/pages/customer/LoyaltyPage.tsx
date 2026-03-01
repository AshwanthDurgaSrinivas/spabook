import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Gift, Award, ArrowUpRight, Loader2, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { loyaltyService, type CustomerLoyalty, type LoyaltyTier } from '@/services/loyaltyService';
import { bookingService, type Booking } from '@/services/bookingService';
import { format } from 'date-fns';

export function LoyaltyPage() {
    const [loading, setLoading] = useState(true);
    const [loyalty, setLoyalty] = useState<CustomerLoyalty | null>(null);
    const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [myLoyalty, allTiers, myBookings] = await Promise.all([
                    loyaltyService.getMyLoyalty(),
                    loyaltyService.getTiers(),
                    bookingService.getBookings()
                ]);

                setLoyalty(myLoyalty);
                setTiers(allTiers);

                const historyItems: any[] = [];

                myBookings.forEach(b => {
                    const dateStr = format(new Date(b.bookingDate), 'MMM dd, yyyy');
                    const dateTime = new Date(b.bookingDate).getTime();

                    // Points earned (only if completed)
                    // Use saved pointsEarned if available, fallback to floor(totalPrice)
                    const earnedPoints = b.pointsEarned || (b.status === 'completed' ? Math.floor(Number(b.totalPrice || 0)) : 0);
                    if (earnedPoints > 0 && b.status === 'completed') {
                        historyItems.push({
                            id: `earn-${b.id}`,
                            date: dateStr,
                            timestamp: dateTime,
                            desc: `Visit: ${b.service?.name || 'Spa Service'}`,
                            points: `+${earnedPoints}`,
                            type: 'earn'
                        });
                    }

                    // Points spent (redeemed)
                    const spentPoints = b.pointsRedeemed || 0;
                    if (spentPoints > 0) {
                        historyItems.push({
                            id: `spend-${b.id}`,
                            date: dateStr,
                            timestamp: dateTime,
                            desc: `Redemption: ${b.service?.name || 'Spa Service'}`,
                            points: `-${spentPoints}`,
                            type: 'spend'
                        });
                    }
                });

                // Sort by true timestamp descending
                setHistory(historyItems.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10));
            } catch (error) {
                console.error('Failed to fetch loyalty data', error);
                toast.error('Could not load rewards info');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    const currentPoints = loyalty?.currentPoints || 0;

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-800">My Loyalty Rewards</h1>
                    <p className="text-gray-500 mt-1">Earn points and redeem exclusive rewards</p>
                </div>
            </div>

            {/* Hero Card */}
            <div
                className="relative rounded-3xl overflow-hidden text-white p-8 md:p-12 shadow-xl"
                style={{ background: 'linear-gradient(135deg, #f97316, #fb923c, #fdba74)' }}
            >
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                        <p className="text-white/80 uppercase tracking-widest font-semibold text-sm mb-2">Total Points Balance</p>
                        <h2 className="text-6xl md:text-8xl font-bold mb-2">{currentPoints} <span className="text-2xl font-medium">pts</span></h2>
                        <p className="text-white/90 text-lg">Use your points for exclusive discounts at checkout.</p>
                    </div>
                    <div className="w-full max-w-sm bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 flex flex-col items-center">
                        <Gift className="w-12 h-12 mb-3 text-white" />
                        <h3 className="text-xl font-bold mb-2 text-center">Reward Member</h3>
                        <p className="text-sm text-center opacity-90">
                            Earn 1 point for every $1 spent on your favorite services and products!
                        </p>
                    </div>
                </div>
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            </div>



            <Card className="border-0 shadow-soft">
                <CardHeader>
                    <CardTitle>Points History</CardTitle>
                </CardHeader>
                <CardContent>
                    {history.length > 0 ? (
                        <div className="space-y-4">
                            {history.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${item.type === 'earn' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            {item.type === 'earn' ? <Trophy className="w-4 h-4" /> : <Gift className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{item.desc}</p>
                                            <p className="text-sm text-gray-500">{item.date}</p>
                                        </div>
                                    </div>
                                    <span className={`font-bold ${item.type === 'earn' ? 'text-green-600' : 'text-red-600'}`}>
                                        {item.points}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <Award className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            <p>No points activity yet. Complete your first booking to earn points!</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
