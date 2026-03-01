
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    HelpCircle, MessageSquare, Plus, Edit2, Trash2,
    CheckCircle, Clock, AlertCircle, Loader2, Save, X
} from 'lucide-react';
import { toast } from 'sonner';
import { helpService } from '@/services/helpService';
import type { FAQ, SupportTicket } from '@/services/helpService';
import { format } from 'date-fns';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

export function AdminHelpManagementPage() {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFAQDialogOpen, setIsFAQDialogOpen] = useState(false);
    const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
    const [editingFAQ, setEditingFAQ] = useState<Partial<FAQ> | null>(null);
    const [viewingTicket, setViewingTicket] = useState<SupportTicket | null>(null);
    const [adminNote, setAdminNote] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [faqsData, ticketsData] = await Promise.all([
                helpService.adminGetFAQs(),
                helpService.adminGetAllTickets()
            ]);
            setFaqs(faqsData);
            setTickets(ticketsData);
        } catch (error) {
            toast.error('Failed to fetch help data');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveFAQ = async () => {
        if (!editingFAQ?.question || !editingFAQ?.answer) return;
        try {
            if (editingFAQ.id) {
                await helpService.updateFAQ(editingFAQ.id, editingFAQ);
                toast.success('FAQ updated');
            } else {
                await helpService.createFAQ(editingFAQ);
                toast.success('FAQ created');
            }
            setIsFAQDialogOpen(false);
            fetchData();
        } catch (error) {
            toast.error('Failed to save FAQ');
        }
    };

    const handleDeleteFAQ = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
        try {
            await helpService.deleteFAQ(id);
            toast.success('FAQ deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete FAQ');
        }
    };

    const handleUpdateTicketStatus = async (status: string) => {
        if (!viewingTicket) return;
        try {
            await helpService.adminUpdateTicket(viewingTicket.id, { status: status as any, adminNote });
            toast.success('Ticket updated');
            setIsTicketDialogOpen(false);
            fetchData();
        } catch (error) {
            toast.error('Failed to update ticket');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'open': return <Badge className="bg-blue-100 text-blue-600">Open</Badge>;
            case 'in-progress': return <Badge className="bg-yellow-100 text-yellow-600">In Progress</Badge>;
            case 'resolved': return <Badge className="bg-green-100 text-green-600">Resolved</Badge>;
            case 'closed': return <Badge className="bg-gray-100 text-gray-600">Closed</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-24">
                <Loader2 className="w-8 h-8 animate-spin text-coral-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-display font-bold text-gray-800">Help Management</h1>
                <p className="text-gray-500 mt-1">Manage FAQs and Customer Support Tickets</p>
            </div>

            <Tabs defaultValue="tickets">
                <TabsList>
                    <TabsTrigger value="tickets" className="gap-2">
                        <MessageSquare className="w-4 h-4" /> Support Tickets
                    </TabsTrigger>
                    <TabsTrigger value="faqs" className="gap-2">
                        <HelpCircle className="w-4 h-4" /> FAQs
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="tickets" className="space-y-4 mt-4">
                    <Card className="border-0 shadow-soft">
                        <CardHeader>
                            <CardTitle>Customer Support Tickets</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="border-b bg-gray-50/50">
                                        <tr>
                                            <th className="p-4 font-semibold text-gray-600">Ticket ID</th>
                                            <th className="p-4 font-semibold text-gray-600">Customer</th>
                                            <th className="p-4 font-semibold text-gray-600">Subject</th>
                                            <th className="p-4 font-semibold text-gray-600">Status</th>
                                            <th className="p-4 font-semibold text-gray-600">Date</th>
                                            <th className="p-4 font-semibold text-gray-600 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {tickets.map((ticket) => (
                                            <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-4">#{ticket.id}</td>
                                                <td className="p-4">
                                                    <div>
                                                        <p className="font-medium text-gray-800">{ticket.user?.firstName} {ticket.user?.lastName}</p>
                                                        <p className="text-xs text-gray-500">{ticket.user?.email}</p>
                                                    </div>
                                                </td>
                                                <td className="p-4">{ticket.subject}</td>
                                                <td className="p-4">{getStatusBadge(ticket.status)}</td>
                                                <td className="p-4 text-sm text-gray-500">
                                                    {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <Button variant="ghost" size="sm" onClick={() => {
                                                        setViewingTicket(ticket);
                                                        setAdminNote(ticket.adminNote || '');
                                                        setIsTicketDialogOpen(true);
                                                    }}>
                                                        View & Reply
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {tickets.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-gray-500">No support tickets found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="faqs" className="space-y-4 mt-4">
                    <div className="flex justify-end">
                        <Button className="gradient-coral text-white" onClick={() => {
                            setEditingFAQ({ category: 'General', isActive: true });
                            setIsFAQDialogOpen(true);
                        }}>
                            <Plus className="w-4 h-4 mr-2" /> Add FAQ
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {faqs.map((faq) => (
                            <Card key={faq.id} className="border-0 shadow-soft">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Category: {faq.category}</CardTitle>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="sm" onClick={() => {
                                            setEditingFAQ(faq);
                                            setIsFAQDialogOpen(true);
                                        }}>
                                            <Edit2 className="w-3 h-3" />
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteFAQ(faq.id)}>
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="font-semibold text-gray-800 mb-2">{faq.question}</p>
                                    <p className="text-sm text-gray-600 line-clamp-3">{faq.answer}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            {/* FAQ Dialog */}
            <Dialog open={isFAQDialogOpen} onOpenChange={setIsFAQDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingFAQ?.id ? 'Edit FAQ' : 'Add FAQ'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Question</label>
                            <Input
                                value={editingFAQ?.question || ''}
                                onChange={(e) => setEditingFAQ({ ...editingFAQ, question: e.target.value })}
                                placeholder="Enter question..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Answer</label>
                            <Textarea
                                value={editingFAQ?.answer || ''}
                                onChange={(e) => setEditingFAQ({ ...editingFAQ, answer: e.target.value })}
                                placeholder="Enter answer..."
                                className="min-h-[150px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category</label>
                            <Input
                                value={editingFAQ?.category || ''}
                                onChange={(e) => setEditingFAQ({ ...editingFAQ, category: e.target.value })}
                                placeholder="e.g. General, Account, Bookings"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsFAQDialogOpen(false)}>Cancel</Button>
                        <Button className="gradient-coral text-white" onClick={handleSaveFAQ}>Save FAQ</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Ticket Dialog */}
            <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Ticket Details #{viewingTicket?.id}</DialogTitle>
                    </DialogHeader>
                    {viewingTicket && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Customer</p>
                                    <p className="font-medium">{viewingTicket.user?.firstName} {viewingTicket.user?.lastName}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Date Received</p>
                                    <p className="font-medium">{format(new Date(viewingTicket.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Subject</p>
                                    <p className="font-medium">{viewingTicket.subject}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Current Status</p>
                                    {getStatusBadge(viewingTicket.status)}
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-bold">Message</p>
                                <p className="text-gray-800 whitespace-pre-wrap">{viewingTicket.message}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Admin Response / Note</label>
                                <Textarea
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                    placeholder="Add a reply or internal note..."
                                    className="min-h-[100px]"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2 pt-4">
                                <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => handleUpdateTicketStatus('in-progress')}>
                                    <Clock className="w-4 h-4 mr-2" /> Mark In Progress
                                </Button>
                                <Button variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleUpdateTicketStatus('resolved')}>
                                    <CheckCircle className="w-4 h-4 mr-2" /> Resolve
                                </Button>
                                <Button variant="outline" className="text-gray-600 border-gray-200 hover:bg-gray-50" onClick={() => handleUpdateTicketStatus('closed')}>
                                    <X className="w-4 h-4 mr-2" /> Close Ticket
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
