
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, Loader2, Save, ShieldCheck, Mail, Send, AlertCircle } from 'lucide-react';
import { settingsService } from '@/services/settingsService';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';

export function SMTPSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);

    const [smtpHost, setSmtpHost] = useState('');
    const [smtpPort, setSmtpPort] = useState('587');
    const [smtpUser, setSmtpUser] = useState('');
    const [smtpPass, setSmtpPass] = useState('');
    const [smtpSecure, setSmtpSecure] = useState(false);
    const [smtpFromEmail, setSmtpFromEmail] = useState('');
    const [smtpFromName, setSmtpFromName] = useState('');
    const [preset, setPreset] = useState('');

    const applyPreset = (p: string) => {
        setPreset(p);
        if (p === 'gmail') {
            setSmtpHost('smtp.gmail.com');
            setSmtpPort('465');
            setSmtpSecure(true);
        } else if (p === 'outlook') {
            setSmtpHost('smtp.office365.com');
            setSmtpPort('587');
            setSmtpSecure(false);
        } else if (p === 'sendgrid') {
            setSmtpHost('smtp.sendgrid.net');
            setSmtpPort('587');
            setSmtpSecure(false);
        } else if (p === 'brevo') {
            setSmtpHost('smtp-relay.brevo.com');
            setSmtpPort('587');
            setSmtpSecure(false);
        }
    };

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await settingsService.getSettings();
                setSmtpHost(data.find(s => s.key === 'smtp_host')?.value || '');
                setSmtpPort(data.find(s => s.key === 'smtp_port')?.value || '587');
                setSmtpUser(data.find(s => s.key === 'smtp_user')?.value || '');
                setSmtpPass(data.find(s => s.key === 'smtp_password')?.value || '');
                setSmtpSecure(data.find(s => s.key === 'smtp_secure')?.value === 'true');
                setSmtpFromEmail(data.find(s => s.key === 'smtp_from_email')?.value || '');
                setSmtpFromName(data.find(s => s.key === 'smtp_from_name')?.value || '');
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
            await Promise.all([
                settingsService.updateSetting('smtp_host', smtpHost),
                settingsService.updateSetting('smtp_port', smtpPort),
                settingsService.updateSetting('smtp_user', smtpUser),
                settingsService.updateSetting('smtp_password', smtpPass),
                settingsService.updateSetting('smtp_secure', smtpSecure.toString()),
                settingsService.updateSetting('smtp_from_email', smtpFromEmail),
                settingsService.updateSetting('smtp_from_name', smtpFromName)
            ]);
            toast.success('SMTP settings saved successfully');
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleTest = async () => {
        setTesting(true);
        try {
            const result = await settingsService.testSMTP({
                host: smtpHost,
                port: smtpPort,
                user: smtpUser,
                password: smtpPass,
                secure: smtpSecure,
                fromEmail: smtpFromEmail
            });
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Connection test failed');
        } finally {
            setTesting(false);
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
                        <Mail className="w-6 h-6 text-coral-500" />
                        SMTP Configuration
                    </CardTitle>
                    <p className="text-sm text-gray-500">Configure your custom email server for notifications</p>
                </div>
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-medium">
                    <ShieldCheck className="w-3 h-3" />
                    Encrypted Credentials
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2 max-w-sm">
                    <Label htmlFor="preset">Provider Preset</Label>
                    <select
                        id="preset"
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-coral-200"
                        value={preset}
                        onChange={(e) => applyPreset(e.target.value)}
                    >
                        <option value="">-- Select Provider (Manual) --</option>
                        <option value="gmail">Gmail</option>
                        <option value="outlook">Outlook / MS Office 365</option>
                        <option value="sendgrid">SendGrid SMTP</option>
                        <option value="brevo">Brevo (formerly Sendinblue)</option>
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="smtpHost">SMTP Host</Label>
                            <Input
                                id="smtpHost"
                                placeholder="smtp.example.com"
                                value={smtpHost}
                                onChange={(e) => setSmtpHost(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="smtpPort">SMTP Port</Label>
                                <Input
                                    id="smtpPort"
                                    placeholder="587"
                                    value={smtpPort}
                                    onChange={(e) => setSmtpPort(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2 flex flex-col justify-end">
                                <div className="flex items-center space-x-2 pb-2">
                                    <Switch
                                        id="smtpSecure"
                                        checked={smtpSecure}
                                        onCheckedChange={setSmtpSecure}
                                        className="data-[state=checked]:bg-coral-500"
                                    />
                                    <Label htmlFor="smtpSecure">SSL/TLS</Label>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="smtpUser">Smtp Username</Label>
                            <Input
                                id="smtpUser"
                                placeholder="user@example.com"
                                value={smtpUser}
                                onChange={(e) => setSmtpUser(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="smtpPass">Smtp Password</Label>
                            <Input
                                id="smtpPass"
                                type="password"
                                placeholder="********"
                                value={smtpPass}
                                onChange={(e) => setSmtpPass(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="smtpFromName">Sender Name</Label>
                            <Input
                                id="smtpFromName"
                                placeholder="Sparkle Beauty Lounge"
                                value={smtpFromName}
                                onChange={(e) => setSmtpFromName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="smtpFromEmail">Sender Email</Label>
                            <Input
                                id="smtpFromEmail"
                                placeholder="noreply@sparklebeauty.com"
                                value={smtpFromEmail}
                                onChange={(e) => setSmtpFromEmail(e.target.value)}
                            />
                        </div>
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 mt-6">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-blue-700 mb-1">
                                <AlertCircle className="w-4 h-4" />
                                Information
                            </h4>
                            <p className="text-xs text-blue-600 leading-relaxed">
                                Use these settings to send all transactional and marketing emails
                                through your own server. For Gmail, you may need to use an
                                "App Password" instead of your regular account password.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="pt-6 flex flex-col sm:flex-row justify-end gap-3 border-t">
                    <Button
                        variant="outline"
                        onClick={handleTest}
                        disabled={testing || !smtpHost}
                        className="border-coral-200 text-coral-600 hover:bg-coral-50 min-w-[140px]"
                    >
                        {testing ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <Send className="w-4 h-4 mr-2" />
                        )}
                        Test Connection
                    </Button>
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
                        Save Configuration
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
