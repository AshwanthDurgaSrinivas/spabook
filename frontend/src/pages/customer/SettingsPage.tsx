import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, Lock, Globe, Moon, Shield, Save, X, Eye, EyeOff } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import api from '@/lib/api';

export function SettingsPage() {
    const { user, refreshUser } = useAuth();
    const { isDarkMode, toggleDarkMode } = useTheme();

    // State for general & notifications
    const [language, setLanguage] = useState(user?.language || 'English (US)');
    const [marketingEmails, setMarketingEmails] = useState(user?.marketingEmails !== false);
    const [smsNotifications, setSmsNotifications] = useState(user?.smsNotifications !== false);

    // State for password change
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswords, setShowPasswords] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setLanguage(user.language || 'English (US)');
            setMarketingEmails(user.marketingEmails !== false);
            setSmsNotifications(user.smsNotifications !== false);
        }
    }, [user]);

    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            await api.put('/auth/profile', {
                language,
                marketingEmails,
                smsNotifications,
                darkMode: isDarkMode
            });
            await refreshUser();
            toast.success('Settings updated successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update settings');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword) {
            toast.error('Please fill in all password fields');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            toast.error('New password must be at least 6 characters');
            return;
        }

        try {
            await api.post('/auth/change-password', {
                currentPassword,
                newPassword
            });
            toast.success('Password updated successfully');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-800 dark:text-white">Account Settings</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your preferences and security</p>
                </div>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6">
                    <TabsTrigger value="general" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">General</TabsTrigger>
                    <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">Notifications</TabsTrigger>
                    <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">Security</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <Card className="border-0 shadow-soft overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Globe className="w-5 h-5 text-indigo-500" />
                                Language & Appearance
                            </CardTitle>
                            <CardDescription>Personalize your experience on Sparkle Lounge</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                <div className="space-y-0.5">
                                    <Label className="text-base font-semibold">Dark Mode</Label>
                                    <p className="text-sm text-gray-500">Switch between light and dark themes</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Moon className={cn("w-4 h-4", isDarkMode ? "text-indigo-400" : "text-gray-400")} />
                                    <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                <div className="space-y-0.5">
                                    <Label className="text-base font-semibold">Language</Label>
                                    <p className="text-sm text-gray-500">Select your preferred language</p>
                                </div>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-w-[140px]"
                                >
                                    <option>English (US)</option>
                                    <option>Spanish</option>
                                    <option>French</option>
                                    <option>German</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <Card className="border-0 shadow-soft overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-teal-500 to-emerald-500" />
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Bell className="w-5 h-5 text-teal-500" />
                                Notification Alert
                            </CardTitle>
                            <CardDescription>Choose how you want to stay updated</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                <div className="space-y-0.5">
                                    <Label className="text-base font-semibold">Booking Alerts</Label>
                                    <p className="text-sm text-gray-500">Confirmations and appointment updates</p>
                                </div>
                                <Badge className="bg-teal-100 text-teal-700 border-teal-200">System Always On</Badge>
                            </div>

                            <div className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-800 rounded-xl">
                                <div className="space-y-0.5">
                                    <Label className="text-base font-semibold">Email Marketing</Label>
                                    <p className="text-sm text-gray-500">Receive special offers and discounts</p>
                                </div>
                                <Switch checked={marketingEmails} onCheckedChange={setMarketingEmails} />
                            </div>

                            <div className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-800 rounded-xl">
                                <div className="space-y-0.5">
                                    <Label className="text-base font-semibold">SMS Reminders</Label>
                                    <p className="text-sm text-gray-500">Get alerts on your phone</p>
                                </div>
                                <Switch checked={smsNotifications} onCheckedChange={setSmsNotifications} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <Card className="border-0 shadow-soft overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-red-500 to-orange-500" />
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Shield className="w-5 h-5 text-red-500" />
                                Login & Security
                            </CardTitle>
                            <CardDescription>Keep your account safe and secure</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-gray-800 dark:text-gray-200">Reset Password</h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-indigo-600"
                                        onClick={() => setShowPasswords(!showPasswords)}
                                    >
                                        {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </Button>
                                </div>
                                <div className="grid gap-4 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl">
                                    <div className="grid gap-2">
                                        <Label htmlFor="current" className="text-sm">Current Password</Label>
                                        <input
                                            type={showPasswords ? "text" : "password"}
                                            id="current"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="new" className="text-sm">New Password</Label>
                                            <input
                                                type={showPasswords ? "text" : "password"}
                                                id="new"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="New password"
                                                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="confirm" className="text-sm">Confirm Password</Label>
                                            <input
                                                type={showPasswords ? "text" : "password"}
                                                id="confirm"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Confirm password"
                                                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        className="w-full gradient-coral shadow-lg shadow-coral-500/20 text-white rounded-xl h-12 mt-2"
                                        onClick={handleChangePassword}
                                    >
                                        Update Password
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700 sticky bottom-4 z-10">
                <p className="text-sm text-gray-500 hidden sm:block">Last saved: {user?.updatedAt ? new Date(user.updatedAt).toLocaleTimeString() : 'Just now'}</p>
                <div className="flex gap-4 w-full sm:w-auto">
                    <Button
                        variant="ghost"
                        className="flex-1 sm:flex-none rounded-xl"
                        onClick={() => window.location.reload()}
                    >
                        <X className="w-4 h-4 mr-2" />
                        Discard
                    </Button>
                    <Button
                        className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20 h-10 px-8"
                        onClick={handleSaveChanges}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}

// Support components
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
