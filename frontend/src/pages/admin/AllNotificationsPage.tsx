import { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Bookmark, Clock, Filter, Search, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { notificationService, type Notification } from '@/services/notificationService';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function AllNotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread' | 'system' | 'booking' | 'payment'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const data = await notificationService.getNotifications();
            setNotifications(data);
        } catch (error) {
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            toast.success('All notifications marked as read');
        } catch (error) {
            toast.error('Failed to mark all as read');
        }
    };

    const handleMarkRead = async (id: number) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            toast.error('Failed to update notification');
        }
    };

    const filteredNotifications = notifications.filter(n => {
        const matchesFilter =
            filter === 'all' ||
            (filter === 'unread' && !n.isRead) ||
            (filter === n.type);

        const matchesSearch =
            n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.message.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-gray-500 text-sm">View and manage all your system alerts and updates.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleMarkAllRead}
                        className="rounded-xl border-indigo-100 text-indigo-600 hover:bg-indigo-50"
                        disabled={!notifications.some(n => !n.isRead)}
                    >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Mark all read
                    </Button>
                </div>
            </div>

            <Card className="border-0 shadow-soft overflow-hidden">
                <CardHeader className="bg-white border-b border-gray-100 pb-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                            <Button
                                variant={filter === 'all' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setFilter('all')}
                                className="rounded-lg text-xs"
                            >
                                All
                            </Button>
                            <Button
                                variant={filter === 'unread' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setFilter('unread')}
                                className="rounded-lg text-xs"
                            >
                                Unread
                            </Button>
                            <Button
                                variant={filter === 'booking' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setFilter('booking')}
                                className="rounded-lg text-xs"
                            >
                                Bookings
                            </Button>
                            <Button
                                variant={filter === 'payment' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setFilter('payment')}
                                className="rounded-lg text-xs"
                            >
                                Payments
                            </Button>
                            <Button
                                variant={filter === 'system' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setFilter('system')}
                                className="rounded-lg text-xs"
                            >
                                System
                            </Button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search notifications..."
                                className="pl-9 bg-gray-50/50 border-gray-100 rounded-xl h-9 w-64"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-12 text-center text-gray-400">
                            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p>Loading notifications...</p>
                        </div>
                    ) : filteredNotifications.length > 0 ? (
                        <div className="divide-y divide-gray-50">
                            {filteredNotifications.map((n) => (
                                <div
                                    key={n.id}
                                    onClick={() => !n.isRead && handleMarkRead(n.id)}
                                    className={cn(
                                        "p-6 hover:bg-gray-50/50 transition-colors cursor-pointer group flex items-start gap-4",
                                        !n.isRead && "bg-indigo-50/30"
                                    )}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110",
                                        n.type === 'booking' && "bg-blue-100 text-blue-600",
                                        n.type === 'payment' && "bg-green-100 text-green-600",
                                        n.type === 'system' && "bg-purple-100 text-purple-600",
                                        n.type === 'reminder' && "bg-orange-100 text-orange-600"
                                    )}>
                                        <Bell className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className={cn(
                                                "text-sm font-semibold truncate",
                                                !n.isRead ? "text-gray-900" : "text-gray-600"
                                            )}>
                                                {n.title}
                                            </h3>
                                            <span className="text-[10px] text-gray-400 font-medium">
                                                {format(new Date(n.createdAt), 'MMM d, h:mm a')}
                                            </span>
                                        </div>
                                        <p className={cn(
                                            "text-sm leading-relaxed",
                                            !n.isRead ? "text-gray-700" : "text-gray-500"
                                        )}>
                                            {n.message}
                                        </p>
                                        <div className="flex items-center gap-3 mt-3">
                                            <Badge variant="outline" className="text-[10px] uppercase tracking-wider bg-white">
                                                {n.type}
                                            </Badge>
                                            {!n.isRead && (
                                                <span className="flex items-center gap-1 text-[10px] text-indigo-600 font-bold uppercase tracking-wider">
                                                    <div className="w-1 h-1 rounded-full bg-indigo-600" />
                                                    Unread
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-20 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bell className="w-8 h-8 text-gray-200" />
                            </div>
                            <h3 className="text-gray-900 font-semibold mb-1">No notifications found</h3>
                            <p className="text-gray-500 text-sm">
                                {searchQuery ? 'Try adjusting your search or filters.' : 'You are all caught up!'}
                            </p>
                            {searchQuery && (
                                <Button
                                    variant="link"
                                    onClick={() => { setSearchQuery(''); setFilter('all'); }}
                                    className="text-indigo-600 mt-2"
                                >
                                    Clear all filters
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
