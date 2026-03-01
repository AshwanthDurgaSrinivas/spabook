
import { useState, useEffect } from 'react';
import {
    Mail, Search, Filter, MoreVertical, Eye, Trash2,
    CheckCircle, Clock, ChevronRight, MailOpen, Phone,
    ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { contactService } from '@/services/contactService';
import type { ContactRequest } from '@/services/contactService';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export function MessagesPage() {
    const [messages, setMessages] = useState<ContactRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMessage, setSelectedMessage] = useState<ContactRequest | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    useEffect(() => {
        loadMessages();
    }, []);

    const loadMessages = async () => {
        try {
            setLoading(true);
            const data = await contactService.getMessages();
            setMessages(data);
        } catch (error) {
            toast.error('Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (message: ContactRequest) => {
        try {
            const detail = await contactService.getMessageById(message.id);
            setSelectedMessage(detail);
            setIsDetailOpen(true);
            // After viewing, if it was unread, it becomes read in the list too
            if (message.status === 'unread') {
                setMessages(prev => prev.map(m => m.id === message.id ? { ...m, status: 'read' } : m));
            }
        } catch (error) {
            toast.error('Failed to load message details');
        }
    };

    const handleUpdateStatus = async (id: number, status: 'unread' | 'read' | 'replied') => {
        try {
            await contactService.updateStatus(id, status);
            setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
            if (selectedMessage?.id === id) {
                setSelectedMessage(prev => prev ? { ...prev, status } : null);
            }
            toast.success(`Status updated to ${status}`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this message?')) return;
        try {
            await contactService.deleteMessage(id);
            setMessages(prev => prev.filter(m => m.id !== id));
            setIsDetailOpen(false);
            toast.success('Message deleted');
        } catch (error) {
            toast.error('Failed to delete message');
        }
    };

    const filteredMessages = messages.filter(m =>
        `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'unread':
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Unread</Badge>;
            case 'read':
                return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-none">Read</Badge>;
            case 'replied':
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Replied</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
                    <p className="text-gray-500 text-sm">Manage inquiries and feedback from customers.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search messages..."
                            className="pl-10 w-full md:w-64 bg-white border-gray-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array(5).fill(0).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={5} className="h-16 animate-pulse bg-gray-50/50" />
                                </TableRow>
                            ))
                        ) : filteredMessages.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                                    No messages found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredMessages.map((message) => (
                                <TableRow
                                    key={message.id}
                                    className={`hover:bg-gray-50/50 cursor-pointer ${message.status === 'unread' ? 'bg-blue-50/30' : ''}`}
                                    onClick={() => handleViewDetails(message)}
                                >
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className={`font-medium ${message.status === 'unread' ? 'text-gray-900' : 'text-gray-600'}`}>
                                                {message.firstName} {message.lastName}
                                            </span>
                                            <span className="text-xs text-gray-500">{message.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="max-w-[300px] truncate underline decoration-transparent group-hover:decoration-current transition-all">
                                            {message.subject}
                                        </div>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(message.status)}</TableCell>
                                    <TableCell className="text-sm text-gray-500">
                                        {format(new Date(message.createdAt), 'MMM d, h:mm a')}
                                    </TableCell>
                                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40">
                                                <DropdownMenuItem onClick={() => handleViewDetails(message)}>
                                                    <Eye className="w-4 h-4 mr-2" /> View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleUpdateStatus(message.id, 'replied')}>
                                                    <CheckCircle className="w-4 h-4 mr-2" /> Mark as Replied
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(message.id)} className="text-red-600">
                                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Message Detail Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-2xl">
                    {selectedMessage && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center justify-between mb-2">
                                    <Badge variant="outline" className="text-gray-500">Message ID: #{selectedMessage.id}</Badge>
                                    {getStatusBadge(selectedMessage.status)}
                                </div>
                                <DialogTitle className="text-2xl font-bold">{selectedMessage.subject}</DialogTitle>
                                <DialogDescription className="text-gray-500">
                                    Received on {format(new Date(selectedMessage.createdAt), 'EEEE, MMMM do, yyyy @ h:mm a')}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6 mt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">From</p>
                                        <p className="font-bold text-gray-900">{selectedMessage.firstName} {selectedMessage.lastName}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Contact Info</p>
                                        <div className="space-y-1">
                                            <a href={`mailto:${selectedMessage.email}`} className="flex items-center text-indigo-600 hover:underline text-sm font-medium">
                                                <Mail className="w-4 h-4 mr-2" /> {selectedMessage.email}
                                            </a>
                                            {selectedMessage.phone && (
                                                <a href={`tel:${selectedMessage.phone}`} className="flex items-center text-indigo-600 hover:underline text-sm font-medium">
                                                    <Phone className="w-4 h-4 mr-2" /> {selectedMessage.phone}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 min-h-[150px]">
                                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-3">Message Content</p>
                                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                                        {selectedMessage.message}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleUpdateStatus(selectedMessage.id, 'replied')}
                                            disabled={selectedMessage.status === 'replied'}
                                        >
                                            <CheckCircle className="w-4 h-4 mr-2" /> Mark Replied
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => handleDelete(selectedMessage.id)} className="text-red-600 hover:bg-red-50">
                                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                                        </Button>
                                    </div>
                                    <a href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}>
                                        <Button className="gradient-coral text-white h-10 px-6">
                                            Reply via Email <Mail className="ml-2 w-4 h-4" />
                                        </Button>
                                    </a>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
