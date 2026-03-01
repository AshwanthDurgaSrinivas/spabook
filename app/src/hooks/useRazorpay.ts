
import { useState, useCallback } from 'react';
import api from '../lib/api';
import { toast } from 'sonner';

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: any) => void;
    prefill: {
        name: string;
        email: string;
        contact?: string;
    };
    theme: {
        color: string;
    };
    image?: string;
    notes?: Record<string, any>;
    modal?: {
        ondismiss: () => void;
    };
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

export const useRazorpay = () => {
    const [loading, setLoading] = useState(false);

    const loadScript = useCallback((src: string) => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    }, []);

    const initPayment = async (data: {
        id: number,
        amount: number,
        customerName: string,
        customerEmail: string,
        customerPhone?: string,
        currency?: string,
        type: 'booking' | 'membership'
    }) => {
        setLoading(true);
        try {
            const isLoaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
            if (!isLoaded) {
                toast.error('Razorpay SDK failed to load. Are you online?');
                return;
            }

            // 1. Get Key ID
            const { data: { keyId } } = await api.get('/payments/key');

            // 2. Create Order
            const orderEndpoint = data.type === 'membership' ? '/memberships/create-order' : '/payments/create-order';
            const orderPayload = data.type === 'membership'
                ? { planId: data.id }
                : { amount: data.amount, bookingId: data.id, currency: data.currency || 'USD' };

            const { data: order } = await api.post(orderEndpoint, orderPayload);

            // 3. Open Razorpay Checkout
            return new Promise((resolve) => {
                let isResolved = false;

                const checkInterval = setInterval(async () => {
                    try {
                        if (data.type === 'booking') {
                            const { data: updatedBooking } = await api.get(`/bookings/${data.id}`);
                            if (updatedBooking.paymentStatus === 'paid') {
                                if (!isResolved) {
                                    isResolved = true;
                                    clearInterval(checkInterval);
                                    resolve(true);
                                }
                            }
                        } else {
                            const { data: sub } = await api.get('/memberships/my/subscription');
                            if (sub && sub.planId === data.id && sub.status === 'active') {
                                if (!isResolved) {
                                    isResolved = true;
                                    clearInterval(checkInterval);
                                    resolve(true);
                                }
                            }
                        }
                    } catch (e) { /* ignore polling */ }
                }, 2000);

                const options: RazorpayOptions = {
                    key: keyId,
                    amount: order.amount,
                    currency: order.currency,
                    name: 'Sparkle Beauty Lounge',
                    description: `Payment for ${data.type === 'membership' ? 'Membership' : 'Booking #' + data.id}`,
                    order_id: order.id,
                    handler: async (response: any) => {
                        try {
                            const verifyEndpoint = data.type === 'membership' ? '/memberships/verify-payment' : '/payments/verify-payment';
                            const verifyPayload = {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                ...(data.type === 'membership' ? { planId: data.id } : { bookingId: data.id })
                            };

                            const verifyRes = await api.post(verifyEndpoint, verifyPayload);

                            if (verifyRes.data.status === 'success') {
                                toast.success('Payment successful!');
                                if (!isResolved) {
                                    isResolved = true;
                                    clearInterval(checkInterval);
                                    resolve(true);
                                }
                            }
                        } catch (error) {
                            toast.error('Payment verification failed');
                        }
                    },
                    prefill: {
                        name: data.customerName,
                        email: data.customerEmail,
                        ...(data.customerPhone ? { contact: data.customerPhone } : {})
                    },
                    theme: {
                        color: '#6366f1'
                    },
                    image: 'https://cdn.razorpay.com/logos/H97vls96pT3pS5_medium.png',
                    notes: order.notes,
                    modal: {
                        ondismiss: () => {
                            if (!isResolved) {
                                isResolved = true;
                                clearInterval(checkInterval);
                                setLoading(false);
                                resolve(false);
                            }
                        }
                    }
                };

                const rzp = new window.Razorpay(options);

                rzp.on('payment.failed', function (response: any) {
                    toast.error('Payment failed: ' + response.error.description);
                    if (!isResolved) {
                        isResolved = true;
                        clearInterval(checkInterval);
                        resolve(false);
                    }
                });

                rzp.open();
            });

        } catch (error: any) {
            console.error('Razorpay Error:', error);
            const message = error.response?.data?.message || 'Could not initialize payment';
            toast.error(message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { initPayment, loading };
};
