import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plug, CreditCard, Mail,
  CheckCircle, XCircle, Settings, RefreshCw, ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { RazorpaySettings } from './RazorpaySettings';
import { PayPalSettings } from './PayPalSettings';
import { StripeSettings } from './StripeSettings';
import { SMTPSettings } from './SMTPSettings';
import { settingsService } from '@/services/settingsService';

export function IntegrationsPage() {
  const [configuring, setConfiguring] = useState<string | null>(null);
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsService.getSettings();
        setSettings(data);
      } catch (error) {
        console.error('Failed to fetch settings', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [configuring]); // Re-fetch when coming back from config

  const isRazorpayConnected = settings.some(s => s.key === 'razorpay_key_id' && s.value);
  const isStripeConnected = settings.some(s => s.key === 'stripe_publishable_key' && s.value);
  const isPayPalConnected = settings.some(s => s.key === 'paypal_client_id' && s.value);
  const isSMTPConnected = settings.some(s => s.key === 'smtp_host' && s.value);

  const integrationCategories = [
    {
      name: 'Payment Gateways',
      icon: CreditCard,
      integrations: [
        { name: 'Razorpay', description: 'Popular gateway for India', connected: isRazorpayConnected, icon: '💳' },
        { name: 'Stripe', description: 'Accept credit card payments', connected: isStripeConnected, icon: '💳' },
        { name: 'PayPal', description: 'PayPal checkout integration', connected: isPayPalConnected, icon: '🅿️' },
      ],
    },
    {
      name: 'Email & Notifications',
      icon: Mail,
      integrations: [
        { name: 'SMTP', description: 'Custom email server', connected: isSMTPConnected, icon: '📧' },
      ],
    },
  ];

  const connectedCount = integrationCategories.reduce((acc, cat) => acc + cat.integrations.filter(i => i.connected).length, 0);

  const handleConnect = (name: string) => {
    if (name === 'Razorpay' || name === 'PayPal' || name === 'Stripe' || name === 'SMTP') {
      setConfiguring(name);
    } else {
      toast.success(`${name} connected successfully`);
    }
  };

  const handleDisconnect = (name: string) => {
    toast.info(`${name} disconnected`);
  };

  if (configuring) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setConfiguring(null)} className="gap-2 -ml-2 text-gray-600 hover:text-coral-500 hover:bg-coral-50">
          <ChevronLeft className="w-4 h-4" /> Back to Integrations
        </Button>
        {configuring === 'Razorpay' && <RazorpaySettings />}
        {configuring === 'PayPal' && <PayPalSettings />}
        {configuring === 'Stripe' && <StripeSettings />}
        {configuring === 'SMTP' && <SMTPSettings />}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-800">Integrations</h1>
          <p className="text-gray-500 mt-1">Connect with third-party services and APIs</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-coral-200 hover:bg-coral-50">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync All
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Connected', value: connectedCount.toString(), color: 'green' },
          { label: 'Available', value: '4', color: 'coral' },
          { label: 'Last Sync', value: 'Active', color: 'blue' },
          { label: 'Status', value: 'Healthy', color: 'purple' },
        ].map((stat, index) => (
          <Card key={index} className="border-0 shadow-soft">
            <CardContent className="p-4 text-center">
              <p className={cn('text-2xl font-bold', `text-${stat.color}-500`)}>{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="all">
        <TabsList className="bg-gray-100">
          <TabsTrigger value="all">All Integrations</TabsTrigger>
          <TabsTrigger value="connected">Connected</TabsTrigger>
          <TabsTrigger value="available">Available</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6 mt-6">
          {integrationCategories.map((category, catIndex) => (
            <Card key={catIndex} className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <category.icon className="w-5 h-5 text-coral-500" />
                  {category.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.integrations.map((integration, intIndex) => (
                    <div
                      key={intIndex}
                      className={cn(
                        'p-4 rounded-xl border transition-all',
                        integration.connected
                          ? 'border-green-200 bg-green-50/50'
                          : 'border-gray-200 hover:border-coral-200 hover:bg-coral-50/30'
                      )}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{integration.icon}</span>
                          <div>
                            <h4 className="font-semibold">{integration.name}</h4>
                            <p className="text-sm text-gray-500">{integration.description}</p>
                          </div>
                        </div>
                        {integration.connected ? (
                          <Badge className="bg-green-100 text-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Not Connected</Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        {integration.connected ? (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">Last sync: 2 min ago</span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleConnect(integration.name)}
                              >
                                <Settings className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500"
                                onClick={() => handleDisconnect(integration.name)}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          </>
                        ) : (
                          <Button
                            className="w-full gradient-coral text-white"
                            onClick={() => handleConnect(integration.name)}
                          >
                            <Plug className="w-4 h-4 mr-2" />
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

    </div>
  );
}
