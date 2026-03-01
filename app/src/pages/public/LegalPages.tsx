
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Calendar, CreditCard, Shield, Clock } from 'lucide-react';

export function CancellationPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Cancellation Policy</h1>
                <div className="max-w-3xl mx-auto space-y-6 text-gray-600">
                    <p>
                        We understand that life happens. However, to respect the time of our therapists and other clients, we request that you provide sufficient notice for cancellations.
                    </p>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-coral-500" />
                            24-Hour Notice Required
                        </h2>
                        <p>
                            Please notify us at least 24 hours in advance if you need to cancel or reschedule your appointment. This allows us to offer the time slot to another client.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-coral-500" />
                            Cancellation Fees
                        </h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Prior to 24 hours:</strong> No charge.</li>
                            <li><strong>Within 24 hours:</strong> 50% of the service price will be charged.</li>
                            <li><strong>No-show:</strong> Full price of the service will be charged.</li>
                        </ul>
                    </div>

                    <p className="text-sm text-gray-500 italic">
                        Exceptions may be made for emergencies or illness at the discretion of management.
                    </p>

                    <Button className="gradient-coral text-white mt-8">Contact Us</Button>
                </div>
            </div>
        </div>
    );
}

export function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
            <div className="prose prose-coral max-w-none text-gray-600 space-y-6">
                <p>Last updated: February 17, 2026</p>
                <p>At Sparkle Beauty Lounge, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information.</p>

                <h2 className="text-xl font-bold text-gray-800">1. Information We Collect</h2>
                <p>We collect information you provide directly to us, such as when you create an account, book an appointment, or contact us.</p>
                <ul className="list-disc pl-5">
                    <li>Name, email address, phone number</li>
                    <li>Payment information (processed securely via third-party providers)</li>
                    <li>Appointment history and preferences</li>
                </ul>

                <h2 className="text-xl font-bold text-gray-800">2. How We Use Your Information</h2>
                <p>We use your information to provide our services, communicate with you, and improve your experience.</p>
                <ul className="list-disc pl-5">
                    <li>Process bookings and payments</li>
                    <li>Send appointment reminders and updates</li>
                    <li>Personalize your spa experience</li>
                </ul>

                <h2 className="text-xl font-bold text-gray-800">3. Data Security</h2>
                <p>We implement industry-standard security measures to protect your data. Your payment information is encrypted and never stored on our servers.</p>

                <p>For more details, please contact us at privacy@sparklelounge.com.</p>
            </div>
        </div>
    );
}

export function TermsPage() {
    return (
        <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
            <div className="prose prose-coral max-w-none text-gray-600 space-y-6">
                <p>Last updated: February 17, 2026</p>
                <p>Welcome to Sparkle Beauty Lounge. By accessing or using our website and services, you agree to be bound by these Terms of Service.</p>

                <h2 className="text-xl font-bold text-gray-800">1. Appointments</h2>
                <p>All appointments are subject to availability. We reserve the right to reschedule or cancel appointments due to unforeseen circumstances.</p>

                <h2 className="text-xl font-bold text-gray-800">2. Payments</h2>
                <p>Payment is due at the time of service or booking, as specified. We accept major credit cards and cash.</p>

                <h2 className="text-xl font-bold text-gray-800">3. Code of Conduct</h2>
                <p>We maintain a respectful and safe environment for our clients and staff. Inappropriate behavior will not be tolerated and may result in service termination.</p>

                <h2 className="text-xl font-bold text-gray-800">4. Limitation of Liability</h2>
                <p>Sparkle Beauty Lounge is not liable for any indirect, incidental, or consequential damages arising from your use of our services.</p>

                <p>If you have any questions, please contact us at support@sparklelounge.com.</p>
            </div>
        </div>
    );
}
