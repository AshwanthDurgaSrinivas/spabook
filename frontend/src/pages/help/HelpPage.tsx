
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, Mail, MessageSquare, FileText, Phone, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { helpService } from '@/services/helpService';
import type { FAQ } from '@/services/helpService';

export function HelpPage() {
    const [ticketSubject, setTicketSubject] = useState('');
    const [ticketMessage, setTicketMessage] = useState('');
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const data = await helpService.getFAQs();
                setFaqs(data);
            } catch (error) {
                console.error('Failed to fetch FAQs', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFaqs();
    }, []);

    const handleSubmitTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await helpService.createTicket({ subject: ticketSubject, message: ticketMessage });
            toast.success('Support ticket submitted successfully. We will contact you shortly.');
            setTicketSubject('');
            setTicketMessage('');
        } catch (error) {
            toast.error('Failed to submit ticket. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-display font-bold text-gray-800">Help & Support</h1>
                <p className="text-gray-500 mt-1">Find answers to common questions or contact support</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* FAQs and Docs */}
                <div className="lg:col-span-2 space-y-6">
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="w-8 h-8 animate-spin text-coral-500" />
                        </div>
                    ) : (
                        <Card className="border-0 shadow-soft">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <HelpCircle className="w-5 h-5 text-coral-500" />
                                    Frequently Asked Questions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                    {faqs.map((faq) => (
                                        <AccordionItem key={faq.id} value={`item-${faq.id}`}>
                                            <AccordionTrigger className="text-left font-medium text-gray-700">
                                                {faq.question}
                                            </AccordionTrigger>
                                            <AccordionContent className="text-gray-600">
                                                {faq.answer}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                    {faqs.length === 0 && (
                                        <p className="text-center text-gray-500 py-4">No FAQs found.</p>
                                    )}
                                </Accordion>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="border-0 shadow-soft">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <FileText className="w-5 h-5 text-blue-500" />
                                Documentation & Guides
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Button variant="outline" className="h-auto p-4 justify-start text-left" onClick={() => toast.info('Opening user guide...')}>
                                    <div className="bg-blue-50 p-2 rounded-lg mr-3">
                                        <FileText className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">User Guide</h3>
                                        <p className="text-xs text-gray-500 mt-1">Comprehensive manual for all features</p>
                                    </div>
                                </Button>
                                <Button variant="outline" className="h-auto p-4 justify-start text-left" onClick={() => toast.info('Opening API docs...')}>
                                    <div className="bg-purple-50 p-2 rounded-lg mr-3">
                                        <MessageSquare className="w-5 h-5 text-purple-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">API Documentation</h3>
                                        <p className="text-xs text-gray-500 mt-1">For developers and integrations</p>
                                    </div>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Contact Form */}
                <div className="space-y-6">
                    <Card className="border-0 shadow-soft bg-gradient-to-br from-coral-500 to-peach-500 text-white">
                        <CardContent className="p-6">
                            <h3 className="font-bold text-xl mb-4">Need Quick Help?</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/20 p-2 rounded-lg">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-white/80">Support Hotline</p>
                                        <p className="font-semibold">+1 (800) 123-4567</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/20 p-2 rounded-lg">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-white/80">Email Support</p>
                                        <p className="font-semibold">support@spabook.com</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-soft">
                        <CardHeader>
                            <CardTitle className="text-lg">Contact Support</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmitTicket} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Subject</label>
                                    <Input
                                        placeholder="Brief description of issue"
                                        value={ticketSubject}
                                        onChange={(e) => setTicketSubject(e.target.value)}
                                        required
                                        disabled={submitting}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Message</label>
                                    <Textarea
                                        placeholder="Describe your issue in detail..."
                                        className="min-h-[120px]"
                                        value={ticketMessage}
                                        onChange={(e) => setTicketMessage(e.target.value)}
                                        required
                                        disabled={submitting}
                                    />
                                </div>
                                <Button type="submit" className="w-full gradient-coral hover:opacity-90" disabled={submitting}>
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            Submitting...
                                        </>
                                    ) : (
                                        'Submit Ticket'
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
