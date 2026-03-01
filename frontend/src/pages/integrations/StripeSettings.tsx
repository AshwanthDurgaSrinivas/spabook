import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, ShieldCheck } from 'lucide-react';
import { settingsService } from '@/services/settingsService';
import { toast } from 'sonner';

export function StripeSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [publicKey, setPublicKey] = useState('');
    const [secretKey, setSecretKey] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await settingsService.getSettings();
                const pub = data.find(s => s.key === 'stripe_publishable_key')?.value || '';
                const secret = data.find(s => s.key === 'stripe_secret_key')?.value || '';
                setPublicKey(pub);
                setSecretKey(secret);
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
            await settingsService.updateSetting('stripe_publishable_key', publicKey);
            await settingsService.updateSetting('stripe_secret_key', secretKey);
            toast.success('Stripe credentials saved successfully');
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
                        <CreditCard className="w-6 h-6 text-indigo-500" />
                        Stripe Configuration
                    </CardTitle>
                    <p className="text-sm text-gray-500">Configure your Stripe API keys</p>
                </div>
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-medium">
                    <ShieldCheck className="w-3 h-3" />
                    Encrypted Storage
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="publicKey">Publishable Key</Label>
                        <Input
                            id="publicKey"
                            placeholder="pk_test_..."
                            value={publicKey}
                            onChange={(e) => setPublicKey(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="secretKey">Secret Key</Label>
                        <Input
                            id="secretKey"
                            type="password"
                            placeholder="********"
                            value={secretKey}
                            onChange={(e) => setSecretKey(e.target.value)}
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

import { CreditCard } from 'lucide-react';
