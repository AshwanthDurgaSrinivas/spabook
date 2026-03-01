import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
import Setting from '../models/Setting';
import { decrypt } from '../utils/encryption';

// Dynamic transporter getter
const getTransporter = async () => {
    const settings = await Setting.findAll({
        where: {
            key: [
                'smtp_host', 'smtp_port', 'smtp_user', 'smtp_password', 'smtp_secure'
            ]
        }
    });

    const config: Record<string, any> = {};
    settings.forEach(s => {
        config[s.key] = s.value;
    });

    const user = config.smtp_user || '';
    const pass = config.smtp_password ? decrypt(config.smtp_password) : '';
    const host = config.smtp_host || 'smtp.ethereal.email';
    const port = parseInt(config.smtp_port || '587');
    const secure = config.smtp_secure === 'true';

    return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
        tls: { rejectUnauthorized: false }
    });
};

export const notificationService = {
    sendEmail: async (to: string, subject: string, html: string, attachments: any[] = []) => {
        try {
            if (!to) {
                console.warn('[Email] Skipping: No recipient email provided');
                return false;
            }

            const transporter = await getTransporter();
            const fromEmailSetting = await Setting.findOne({ where: { key: 'smtp_from_email' } });
            const fromNameSetting = await Setting.findOne({ where: { key: 'smtp_from_name' } });

            const from = fromEmailSetting
                ? `"${fromNameSetting?.value || 'Sparkle Beauty Lounge'}" <${fromEmailSetting.value}>`
                : '"Sparkle Beauty Lounge" <noreply@sparklebeauty.com>';

            console.log(`[Email] Sending to ${to}: ${subject}`);

            const info = await transporter.sendMail({
                from,
                to,
                subject,
                html,
                attachments
            });

            const hostSetting = await Setting.findOne({ where: { key: 'smtp_host' } });
            if (hostSetting?.value?.includes('ethereal')) {
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            }
            return true;
        } catch (error) {
            console.error('Error sending email:', error);
            // Don't crash if email fails
            return false;
        }
    },

    sendBookingConfirmation: async (booking: any) => {
        try {
            const customerName = `${booking.customer?.firstName} ${booking.customer?.lastName}` || 'Valued Guest';
            const serviceName = booking.service?.name || 'Your Spa Treatment';
            const date = booking.bookingDate;
            const time = booking.startTime;
            const bookingId = booking.id;
            const bookingRef = booking.bookingNumber || `APT-${bookingId}`;

            // Generate QR Code for check-in
            const qrData = JSON.stringify({
                bookingId,
                bookingRef,
                customer: customerName,
                date,
                time
            });
            const qrCodeDataUri = await QRCode.toDataURL(qrData);

            const subject = `Confirmed: Your ${serviceName} at Sparkle Beauty Lounge`;

            const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; }
                    .header { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; padding: 40px 20px; text-align: center; }
                    .content { padding: 30px; }
                    .details-box { background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #f3f4f6; }
                    .qr-section { text-align: center; margin: 30px 0; border-top: 1px dashed #e5e7eb; padding-top: 30px; }
                    .qr-code { border: 4px solid #fff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-radius: 8px; }
                    .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
                    .btn { display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin:0; font-size: 28px;">Booking Confirmed!</h1>
                        <p style="margin:10px 0 0; opacity: 0.9;">We look forward to seeing you, ${customerName}.</p>
                    </div>
                    <div class="content">
                        <p>Hi ${customerName},</p>
                        <p>Your appointment at <strong>Sparkle Beauty Lounge</strong> has been successfully booked and confirmed. Here are your appointment details:</p>
                        
                        <div class="details-box">
                            <p style="margin:0 0 10px;"><strong>Service:</strong> ${serviceName}</p>
                            <p style="margin:0 0 10px;"><strong>Date:</strong> ${date}</p>
                            <p style="margin:0 0 10px;"><strong>Time:</strong> ${time}</p>
                            <p style="margin:0;"><strong>Reference:</strong> ${bookingRef}</p>
                        </div>

                        <div class="qr-section">
                            <p style="margin-bottom: 15px; font-weight: 500;">Your Fast Check-in QR Code</p>
                            <img src="cid:checkin-qr" width="150" height="150" class="qr-code" alt="Check-in QR Code" />
                            <p style="font-size: 12px; color: #6b7280; margin-top: 10px;">Please show this QR code at the reception when you arrive for a faster check-in process.</p>
                        </div>

                        <p>If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="#" class="btn">Manage Appointment</a>
                        </div>
                    </div>
                    <div class="footer">
                        <p>Sparkle Beauty Lounge &bull; 123 Wellness Blvd, Spa City</p>
                        <p>&copy; 2026 Sparkle Booking System. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            `;

            const attachments = [
                {
                    filename: 'qr-code.png',
                    path: qrCodeDataUri,
                    cid: 'checkin-qr' // same cid value as in the html img src
                }
            ];

            await notificationService.sendEmail(booking.customer?.email, subject, html, attachments);
        } catch (error) {
            console.error('Error generating booking confirmation email:', error);
        }
    }
};
