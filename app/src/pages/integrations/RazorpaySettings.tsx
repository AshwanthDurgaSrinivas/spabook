
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, Loader2, Save, ShieldCheck } from 'lucide-react';
import { settingsService } from '@/services/settingsService';
import { toast } from 'sonner';

export function RazorpaySettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [keyId, setKeyId] = useState('');
    const [keySecret, setKeySecret] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await settingsService.getSettings();
                const id = data.find(s => s.key === 'razorpay_key_id')?.value || '';
                const secret = data.find(s => s.key === 'razorpay_key_secret')?.value || '';
                setKeyId(id);
                setKeySecret(secret);
            } catch (error) {
                console.error('Failed to fetch settings', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await settingsService.updateSetting('razorpay_key_id', keyId);
            await settingsService.updateSetting('razorpay_key_secret', keySecret);
            toast.success('Razorpay credentials saved successfully');
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-coral-500" /></div>;
    }

    return (
        <Card className="border-0 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <img src="https://razorpay.com/favicon.png" className="w-6 h-6" alt="Razorpay" />
                        Razorpay Configuration
                    </CardTitle>
                    <p className="text-sm text-gray-500">Configure your payment gateway credentials</p>
                </div>
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-medium">
                    <ShieldCheck className="w-3 h-3" />
                    Encrypted Storage
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="keyId">Key ID</Label>
                        <Input
                            id="keyId"
                            placeholder="rzp_test_..."
                            value={keyId}
                            onChange={(e) => setKeyId(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="keySecret">Key Secret</Label>
                        <Input
                            id="keySecret"
                            type="password"
                            placeholder="********"
                            value={keySecret}
                            onChange={(e) => setKeySecret(e.target.value)}
                        />
                        <p className="text-xs text-gray-400 italic">Sensitive data is stored in an encrypted format.</p>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="gradient-coral text-white min-w-[140px]"
                    >
                        {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Credentials
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
