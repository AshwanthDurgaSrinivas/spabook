import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Building, Bell, Shield, CreditCard, Calendar,
  Clock, Mail, Phone, Save, Users, Loader2, AlertCircle, Gift,
  MapPin, Instagram, Facebook, Twitter
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { settingsService } from '@/services/settingsService';

export function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Record<string, any>>({
    business_name: 'SpaBook Pro Salon',
    business_email: 'contact@spabook.com',
    business_phone: '+1 (555) 123-4567',
    business_address: '123 Spa Street',
    default_payment_gateway: 'Razorpay',
    tax_rate: '8.25',
    currency: 'USD',
    timezone: 'America/New_York',
    allow_discount_combination: true,
    allow_same_day_booking: true,
    enable_waitlist: true,
    guest_checkout: true,
    min_advance_booking: '2',
    booking_duration: '60',
    buffer_time: '15',
    loyalty_points_earn_ratio: '1',
    loyalty_points_redeem_ratio: '0.1',
    loyalty_min_bill_redemption: '50',
    allow_coupon_loyalty_combination: true,
    allow_pay_at_venue: true,
    weekly_schedule: {
      Monday: { isOpen: true, start: '09:00', end: '18:00' },
      Tuesday: { isOpen: true, start: '09:00', end: '18:00' },
      Wednesday: { isOpen: true, start: '09:00', end: '18:00' },
      Thursday: { isOpen: true, start: '09:00', end: '18:00' },
      Friday: { isOpen: true, start: '09:00', end: '18:00' },
      Saturday: { isOpen: true, start: '10:00', end: '16:00' },
      Sunday: { isOpen: false, start: '09:00', end: '18:00' }
    }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsService.getSettings();
        const settingsMap: Record<string, any> = {};
        data.forEach(s => {
          let val: any = s.value;
          if (val === 'true') val = true;
          if (val === 'false') val = false;
          if (s.key === 'weekly_schedule') {
            try { val = JSON.parse(val); } catch (e) { console.error("Error parsing weekly_schedule"); }
          }
          settingsMap[s.key] = val;
        });
        setSettings(prev => ({ ...prev, ...settingsMap }));
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
      const keysToSave = Object.keys(settings).filter(k => k !== 'business_start_hour' && k !== 'business_end_hour');
      await Promise.all(
        keysToSave.map(key => {
          const value = settings[key];
          const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
          return settingsService.updateSetting(key, stringValue);
        })
      );
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-gray-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-800">Settings</h1>
          <p className="text-gray-500 mt-1">Configure your business and system preferences</p>
        </div>
        <Button
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="general">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <TabsList className="flex flex-row lg:flex-col w-full h-auto bg-transparent gap-2 lg:gap-0 lg:space-y-1 overflow-x-auto pb-2 lg:pb-0 mb-4 lg:mb-0 justify-start">
              <TabsTrigger value="general" className="justify-center lg:justify-start w-auto lg:w-full whitespace-nowrap px-4 py-2">
                <Building className="w-4 h-4 mr-2" /> General
              </TabsTrigger>
              <TabsTrigger value="business" className="justify-center lg:justify-start w-auto lg:w-full whitespace-nowrap px-4 py-2">
                <Calendar className="w-4 h-4 mr-2" /> Business Hours
              </TabsTrigger>
              <TabsTrigger value="booking" className="justify-center lg:justify-start w-auto lg:w-full whitespace-nowrap px-4 py-2">
                <Clock className="w-4 h-4 mr-2" /> Booking Rules
              </TabsTrigger>
              <TabsTrigger value="notifications" className="justify-center lg:justify-start w-auto lg:w-full whitespace-nowrap px-4 py-2">
                <Bell className="w-4 h-4 mr-2" /> Notifications
              </TabsTrigger>
              <TabsTrigger value="payments" className="justify-center lg:justify-start w-auto lg:w-full whitespace-nowrap px-4 py-2">
                <CreditCard className="w-4 h-4 mr-2" /> Payments
              </TabsTrigger>
              <TabsTrigger value="security" className="justify-center lg:justify-start w-auto lg:w-full whitespace-nowrap px-4 py-2">
                <Shield className="w-4 h-4 mr-2" /> Security
              </TabsTrigger>
              <TabsTrigger value="users" className="justify-center lg:justify-start w-auto lg:w-full whitespace-nowrap px-4 py-2">
                <Users className="w-4 h-4 mr-2" /> Users & Roles
              </TabsTrigger>
              <TabsTrigger value="footer" className="justify-center lg:justify-start w-auto lg:w-full whitespace-nowrap px-4 py-2">
                <MapPin className="w-4 h-4 mr-2" /> Footer & Social
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="lg:col-span-3">
            <TabsContent value="general" className="mt-0 space-y-6">
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Building className="w-5 h-5 text-indigo-500" /> Business Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Business Name</Label>
                      <Input value={settings.business_name} onChange={(e) => setSettings({ ...settings, business_name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={settings.business_email} onChange={(e) => setSettings({ ...settings, business_email: e.target.value })} type="email" />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input value={settings.business_phone} onChange={(e) => setSettings({ ...settings, business_phone: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Website</Label>
                      <Input defaultValue="https://spabook.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input value={settings.business_address} onChange={(e) => setSettings({ ...settings, business_address: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Timezone</Label>
                      <select
                        className="w-full px-3 py-2 border rounded-lg"
                        value={settings.timezone}
                        onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                      >
                        <option value="America/New_York">Eastern Time (US & Canada)</option>
                        <option value="America/Chicago">Central Time (US & Canada)</option>
                        <option value="America/Denver">Mountain Time (US & Canada)</option>
                        <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                        <option value="Asia/Kolkata">India Standard Time</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <select
                        className="w-full px-3 py-2 border rounded-lg"
                        value={settings.currency}
                        onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                      >
                        <option value="USD">USD ($)</option>
                        <option value="INR">INR (₹)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="business" className="mt-0">
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-500" /> Business Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-6">Set your regular weekly business hours. The booking system will follow these specific times for each day.</p>

                  <div className="space-y-4">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                      const dayConfig = settings.weekly_schedule?.[day] || { isOpen: true, start: '09:00', end: '18:00' };

                      const handleDayUpdate = (updates: Partial<typeof dayConfig>) => {
                        setSettings({
                          ...settings,
                          weekly_schedule: {
                            ...settings.weekly_schedule,
                            [day]: { ...dayConfig, ...updates }
                          }
                        });
                      };

                      return (
                        <div key={day} className={cn(
                          "flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl gap-4 transition-all border",
                          dayConfig.isOpen
                            ? "bg-white border-indigo-100 shadow-sm"
                            : "bg-gray-50 border-transparent opacity-70"
                        )}>
                          <div className="flex items-center gap-4 min-w-[140px]">
                            <Switch
                              checked={dayConfig.isOpen}
                              onCheckedChange={(val) => handleDayUpdate({ isOpen: val })}
                            />
                            <span className={cn("font-semibold", dayConfig.isOpen ? "text-gray-900" : "text-gray-500")}>
                              {day}
                            </span>
                          </div>

                          {dayConfig.isOpen ? (
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <Input
                                  type="time"
                                  value={dayConfig.start}
                                  onChange={(e) => handleDayUpdate({ start: e.target.value })}
                                  className="w-32 pl-8 h-9 text-sm"
                                />
                              </div>
                              <span className="text-gray-400 text-sm font-medium">to</span>
                              <div className="relative">
                                <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <Input
                                  type="time"
                                  value={dayConfig.end}
                                  onChange={(e) => handleDayUpdate({ end: e.target.value })}
                                  className="w-32 pl-8 h-9 text-sm"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center text-sm text-gray-400 font-medium italic">
                              Closed for the day
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="booking" className="mt-0 space-y-6">
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-500" /> Booking Rules
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Min. Advance Booking (hrs)</Label>
                        <Input type="number" value={settings.min_advance_booking} onChange={(e) => setSettings({ ...settings, min_advance_booking: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Max. Advance Booking (days)</Label>
                        <Input type="number" value={settings.max_advance_booking} onChange={(e) => setSettings({ ...settings, max_advance_booking: e.target.value })} />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-medium">Allow Same-Day Booking</p>
                          <p className="text-sm text-gray-500">Customers can book for today</p>
                        </div>
                        <Switch checked={settings.allow_same_day_booking} onCheckedChange={(val) => setSettings({ ...settings, allow_same_day_booking: val })} />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-medium">Membership & Coupon</p>
                          <p className="text-sm text-gray-500">Enable combining membership and coupon discounts</p>
                        </div>
                        <Switch checked={settings.allow_discount_combination} onCheckedChange={(val) => setSettings({ ...settings, allow_discount_combination: val })} />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-medium">Coupon & Loyalty</p>
                          <p className="text-sm text-gray-500">Enable combining coupon and loyalty points</p>
                        </div>
                        <Switch checked={settings.allow_coupon_loyalty_combination} onCheckedChange={(val) => setSettings({ ...settings, allow_coupon_loyalty_combination: val })} />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-medium">Guest Checkout</p>
                          <p className="text-sm text-gray-500">Allow bookings without accounts</p>
                        </div>
                        <Switch checked={settings.guest_checkout} onCheckedChange={(val) => setSettings({ ...settings, guest_checkout: val })} />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-medium">Pay at Store</p>
                          <p className="text-sm text-gray-500">Enable "Pay at Venue" option for customers</p>
                        </div>
                        <Switch checked={settings.allow_pay_at_venue} onCheckedChange={(val) => setSettings({ ...settings, allow_pay_at_venue: val })} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>


            </TabsContent>

            <TabsContent value="payments" className="mt-0">
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-indigo-500" /> Payment Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Default Payment Gateway</Label>
                      <select
                        className="w-full px-3 py-2 border rounded-lg"
                        value={settings.default_payment_gateway}
                        onChange={(e) => setSettings({ ...settings, default_payment_gateway: e.target.value })}
                      >
                        <option value="Razorpay">Razorpay</option>
                        <option value="Stripe">Stripe</option>
                        <option value="PayPal">PayPal</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                      <AlertCircle className="w-5 h-5 text-indigo-500" />
                      <p>Multiple taxes are now managed in the <Link to="/admin/taxes" className="text-indigo-600 font-bold hover:underline">Tax Management</Link> page.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="mt-0">
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Bell className="w-5 h-5 text-indigo-500" /> Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">Manage how you and your customers receive updates.</p>
                  <div className="space-y-4">
                    {['Email Confirmations', 'SMS Reminders', 'Marketing Emails'].map(n => (
                      <div key={n} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <span className="font-medium">{n}</span>
                        <Switch defaultChecked />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-0">
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-500" /> Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium">Force HTTPS</p>
                      <p className="text-sm text-gray-500">Always use secure connection</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium">Session Timeout</p>
                      <p className="text-sm text-gray-500">Auto logout after inactivity</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="mt-0">
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-500" /> Users & Roles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { role: 'Admin', count: 1 },
                      { role: 'Manager', count: 2 },
                      { role: 'Staff', count: 8 }
                    ].map(r => (
                      <div key={r.role} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <span className="font-medium">{r.role}</span>
                        <Badge variant="secondary">{r.count} users</Badge>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-6">Manage All Users</Button>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="footer" className="mt-0 space-y-6">
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-indigo-500" /> Social Links & Footer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Instagram className="w-4 h-4 text-pink-500" /> Instagram URL
                      </Label>
                      <Input
                        value={settings.social_instagram || ''}
                        onChange={(e) => setSettings({ ...settings, social_instagram: e.target.value })}
                        placeholder="https://instagram.com/yourbrand"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Facebook className="w-4 h-4 text-blue-600" /> Facebook URL
                      </Label>
                      <Input
                        value={settings.social_facebook || ''}
                        onChange={(e) => setSettings({ ...settings, social_facebook: e.target.value })}
                        placeholder="https://facebook.com/yourbrand"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Twitter className="w-4 h-4 text-sky-500" /> Twitter URL
                      </Label>
                      <Input
                        value={settings.social_twitter || ''}
                        onChange={(e) => setSettings({ ...settings, social_twitter: e.target.value })}
                        placeholder="https://twitter.com/yourbrand"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-medium">Opening Hours Display (Footer)</h3>
                    <p className="text-sm text-gray-500">How these appear in the public footer. Leave blank to use system defaults.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Weekdays (Mon-Fri)</Label>
                        <Input
                          value={settings.hours_mon_fri || ''}
                          onChange={(e) => setSettings({ ...settings, hours_mon_fri: e.target.value })}
                          placeholder="9:00 AM - 8:00 PM"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Saturday</Label>
                        <Input
                          value={settings.hours_sat || ''}
                          onChange={(e) => setSettings({ ...settings, hours_sat: e.target.value })}
                          placeholder="10:00 AM - 6:00 PM"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Sunday</Label>
                        <Input
                          value={settings.hours_sun || ''}
                          onChange={(e) => setSettings({ ...settings, hours_sun: e.target.value })}
                          placeholder="11:00 AM - 5:00 PM"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs >

    </div >
  );
}
