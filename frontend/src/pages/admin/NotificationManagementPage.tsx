import { useState, useEffect } from 'react';
import { Bell, Send, Users, AlertTriangle, Info, Calendar as CalendarIcon, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { notificationService } from '@/services/notificationService';
import { employeeService } from '@/services/employeeService';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function NotificationManagementPage() {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState<'system' | 'booking' | 'payment' | 'reminder'>('system');
    const [targetType, setTargetType] = useState<'all' | 'specific'>('all');
    const [targetUserId, setTargetUserId] = useState<string>('all');
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = async () => {
        try {
            setLoading(true);
            const data = await employeeService.getEmployees();
            setEmployees(data);
        } catch (error) {
            toast.error('Failed to load employees');
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !message) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setSending(true);
            await notificationService.createNotification({
                title,
                message,
                type,
                userId: targetType === 'specific' && targetUserId !== 'all' ? parseInt(targetUserId) : undefined
            });
            toast.success('Notification sent successfully!');
            setTitle('');
            setMessage('');
        } catch (error) {
            toast.error('Failed to send notification');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Push Notifications</h1>
                    <p className="text-gray-500 text-sm">Send real-time alerts and messages to your staff.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Section */}
                <Card className="lg:col-span-2 border-0 shadow-soft">
                    <CardHeader>
                        <CardTitle className="text-lg">Compose Notification</CardTitle>
                        <CardDescription>Created messages will appear instantly on staff dashboards.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSend} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Notification Title</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g. System Maintenance, New Booking Policy"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="bg-gray-50/50"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Notification Category</Label>
                                    <Select value={type} onValueChange={(v: any) => setType(v)}>
                                        <SelectTrigger className="bg-gray-50/50">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="system">
                                                <div className="flex items-center gap-2">
                                                    <Info className="w-4 h-4 text-purple-500" />
                                                    <span>System Alert</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="booking">
                                                <div className="flex items-center gap-2">
                                                    <CalendarIcon className="w-4 h-4 text-blue-500" />
                                                    <span>Booking Update</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="payment">
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="w-4 h-4 text-green-500" />
                                                    <span>Payment / Commission</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="reminder">
                                                <div className="flex items-center gap-2">
                                                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                                                    <span>General Reminder</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Recipient(s)</Label>
                                    <Select
                                        value={targetUserId}
                                        onValueChange={(v) => {
                                            setTargetUserId(v);
                                            setTargetType(v === 'all' ? 'all' : 'specific');
                                        }}
                                    >
                                        <SelectTrigger className="bg-gray-50/50">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Employees (Global)</SelectItem>
                                            {employees.map(emp => (
                                                <SelectItem key={emp.id} value={emp.id.toString()}>
                                                    {emp.firstName} {emp.lastName} ({emp.role})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">Message Content</Label>
                                <Textarea
                                    id="message"
                                    placeholder="Type your message here..."
                                    rows={4}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="bg-gray-50/50 resize-none"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 gradient-coral text-white font-bold rounded-xl shadow-lg ring-offset-2 hover:ring-2 ring-coral-500/20 transition-all"
                                disabled={sending}
                            >
                                {sending ? (
                                    'Sending Notification...'
                                ) : (
                                    <>
                                        Send Notification <Send className="ml-2 w-4 h-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Preview Section */}
                <Card className="border-0 shadow-soft bg-gray-50/50">
                    <CardHeader>
                        <CardTitle className="text-lg">Live Preview</CardTitle>
                        <CardDescription>This is how it will look in the staff header.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-3 max-w-sm mx-auto">
                            <div className={cn(
                                'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                                type === 'booking' && 'bg-blue-500',
                                type === 'payment' && 'bg-green-500',
                                type === 'system' && 'bg-purple-500',
                                type === 'reminder' && 'bg-orange-500'
                            )} />
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-gray-900 truncate">
                                    {title || 'New Notification Title'}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {message || 'Your message content will appear here...'}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-1">Just now</p>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                        </div>

                        <div className="mt-8 space-y-4">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Tips</h4>
                            <div className="flex gap-3 text-sm text-gray-600 bg-white p-3 rounded-xl border border-gray-100 italic">
                                <Info className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                                <p>Use clear, concise titles to get immediate attention.</p>
                            </div>
                            <div className="flex gap-3 text-sm text-gray-600 bg-white p-3 rounded-xl border border-gray-100 italic">
                                <Users className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                                <p>Targeted notifications only show up for that specific user.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
