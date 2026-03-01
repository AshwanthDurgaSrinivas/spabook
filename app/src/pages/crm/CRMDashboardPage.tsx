import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Users, TrendingUp, Heart, MessageSquare,
  Star, Target, Mail, UserCheck, DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { crmService, type CRMAnalytics } from '@/services/crmService';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { toast } from 'sonner';
import { useEffect, useCallback } from 'react';
import { Loader2, Search, Send, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MarketingHubPage } from '../marketing/MarketingHubPage';

const COLORS = ['#F08080', '#F4978E', '#F8AD9D', '#FBC4AB', '#FFDAB9'];

export function CRMDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState<CRMAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedSegment, setSelectedSegment] = useState<{ label: string, value: string } | null>(null);
  const [segmentCustomers, setSegmentCustomers] = useState<any[]>([]);
  const [listModalOpen, setListModalOpen] = useState(false);
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [fetchingList, setFetchingList] = useState(false);
  const [campaignForm, setCampaignForm] = useState({ subject: '', message: '' });

  const fetchCRMData = useCallback(async (showToast = false) => {
    try {
      if (!showToast) setLoading(true);
      const data = await crmService.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      toast.error('Failed to load CRM data');
    } finally {
      if (!showToast) setLoading(false);
    }
  }, []);

  const handleSendCampaign = async (id: number) => {
    const promise = crmService.sendCampaign(id);
    toast.promise(promise, {
      loading: 'Sending campaign to all customers...',
      success: (data) => {
        fetchCRMData(true);
        return `Successfully sent to ${data.count} customers!`;
      },
      error: 'Failed to send campaign'
    });
  };

  const openViewList = async (segment: { label: string, value: string }) => {
    try {
      setSelectedSegment(segment);
      setListModalOpen(true);
      setFetchingList(true);
      const customers = await crmService.getCustomersBySegment(segment.value);
      setSegmentCustomers(customers);
    } catch (error) {
      toast.error('Failed to fetch customers for this segment');
    } finally {
      setFetchingList(false);
    }
  };

  const openCampaignModal = (segment?: { label: string, value: string }) => {
    const defaultSegment = segment || { label: 'All Customers', value: 'all' };
    setSelectedSegment(defaultSegment);
    setCampaignForm({
      subject: segment ? `${segment.label} Special Offer` : `Special Update for All Customers`,
      message: `Hi there,\n\nWe have a special update for our ${segment ? segment.label : 'valued'} family!\n\nBest regards,\nSparkle Beauty Team`
    });
    setCampaignModalOpen(true);
  };

  const handleSendTargetedCampaign = async () => {
    if (!selectedSegment) return;
    if (!campaignForm.subject || !campaignForm.message) {
      toast.error('Please fill in both subject and message');
      return;
    }

    const promise = crmService.sendSegmentCampaign(
      selectedSegment.value,
      campaignForm.subject,
      campaignForm.message
    );

    toast.promise(promise, {
      loading: `Sending campaign to ${selectedSegment.label} customers...`,
      success: (data) => {
        setCampaignModalOpen(false);
        fetchCRMData(true);
        return `Success! Sent to ${data.count} customers.`;
      },
      error: 'Failed to send targeted campaign'
    });
  };

  useEffect(() => {
    fetchCRMData();
  }, [fetchCRMData]);

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-coral-500" />
      </div>
    );
  }

  // Formatting segment data for Pie Chart
  const segmentChartData = analytics.segments.map((s, i) => ({
    name: s.label,
    value: s.count,
    color: COLORS[i % COLORS.length]
  }));

  const metrics = [
    { label: 'Total Customers', value: analytics.metrics.totalCustomers.toLocaleString(), change: '+5.2%', icon: Users, color: 'coral' },
    { label: 'Active Customers', value: analytics.metrics.activeCustomers.toLocaleString(), change: '+3.8%', icon: UserCheck, color: 'green' },
    { label: 'Avg. Lifetime Value', value: `$${Number(analytics.metrics.avgLTV || 0).toFixed(0)}`, change: '+8.1%', icon: DollarSign, color: 'blue' },
    { label: 'Retention Rate', value: `${analytics.metrics.retentionRate}%`, change: '+2.3%', icon: Heart, color: 'purple' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-800">CRM Dashboard</h1>
          <p className="text-gray-500 mt-1">Customer Relationship Management & Analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="gradient-coral hover:opacity-90 text-white" onClick={() => openCampaignModal()}>
            <Target className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="border-0 shadow-soft cursor-pointer hover:bg-gray-50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{metric.label}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{metric.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-500">{metric.change}</span>
                  </div>
                </div>
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', `bg-${metric.color}-100`)}>
                  <metric.icon className={cn('w-5 h-5', `text-${metric.color}-500`)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="rfm">RFM Analysis</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Customer Segments Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={segmentChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {segmentChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  {analytics.segments.map((segment, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-xs text-gray-500">{segment.label}</span>
                      </div>
                      <span className="text-sm font-bold">{segment.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.funnel.map((stage: any, index: number) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-gray-700">{stage.stage}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400">{stage.count}</span>
                          <span className="text-xs font-bold text-coral-500">{stage.percentage}%</span>
                        </div>
                      </div>
                      <Progress value={stage.percentage} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Real-time Customer Behavior</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.recentActivities.length > 0 ? (
                  analytics.recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                        activity.type === 'booking' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                      )}>
                        <Star className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 text-sm">{activity.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400">by {activity.user}</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs text-gray-400">
                            {new Date(activity.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-10">No recent activity found.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segments" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analytics.segments.map((segment) => (
              <Card key={segment.value} className="border-0 shadow-soft border-t-4 border-t-coral-400">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary" className="bg-coral-50 text-coral-600 border-coral-200">
                      {segment.label}
                    </Badge>
                    <span className="text-3xl font-bold text-gray-800">{segment.count}</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-6 uppercase tracking-wider font-semibold">Targets for targeted campaigns</p>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 text-xs h-9" onClick={() => openViewList(segment)}>
                      View List
                    </Button>
                    <Button className="gradient-coral text-white flex-1 text-xs h-9" onClick={() => openCampaignModal(segment)}>
                      Campaign
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rfm" className="space-y-6 mt-6">
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">RFM Segment Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.rfm}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} stroke="#94a3b8" />
                    <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="#94a3b8" />
                    <Tooltip
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="count" fill="#F08080" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-8 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email Campaign Stats */}
            <Card className="border-0 shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Email System</h3>
                    <p className="text-xs text-gray-400">Marketing & Transactional</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-1">Total Sent</p>
                    <p className="text-lg font-bold">{(analytics.campaigns.email.sent || 0).toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-1">Opened</p>
                    <p className="text-lg font-bold text-green-500">{analytics.campaigns.email.opened || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-1">Clicked</p>
                    <p className="text-lg font-bold text-blue-500">{analytics.campaigns.email.clicked || 0}</p>
                  </div>
                </div>
                <Button className="w-full gradient-coral text-white h-11" onClick={() => openCampaignModal()}>
                  New Email Campaign
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Latest Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.campaigns.list.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.campaigns.list.map((campaign, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border border-gray-50 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-2 h-2 rounded-full", campaign.status === 'sent' ? 'bg-green-500' : 'bg-yellow-500')} />
                          <div>
                            <p className="text-sm font-semibold">{campaign.name}</p>
                            <p className="text-[10px] text-gray-400 uppercase">{campaign.campaignType} • {campaign.status}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-xs text-coral-500 hover:text-coral-600 hover:bg-coral-50"
                            disabled={campaign.status === 'sent'}
                            onClick={() => handleSendCampaign(campaign.id)}
                          >
                            {campaign.status === 'sent' ? 'Sent' : 'Send Now'}
                          </Button>
                          <Badge variant="outline" className="text-[10px]">{new Date(campaign.createdAt).toLocaleDateString()}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-400 py-6 text-sm">No campaigns history found.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Advanced Campaigns Dashboard</h2>
            <MarketingHubPage embedded={true} />
          </div>
        </TabsContent>
      </Tabs>

      {/* View List Modal */}
      <Dialog open={listModalOpen} onOpenChange={setListModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedSegment?.label} Customers</DialogTitle>
            <DialogDescription>
              List of all customers currently in the {selectedSegment?.label} segment.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto mt-4">
            {fetchingList ? (
              <div className="flex justify-center p-10">
                <Loader2 className="w-8 h-8 animate-spin text-coral-500" />
              </div>
            ) : segmentCustomers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {segmentCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.firstName} {customer.lastName}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.phone || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-10 text-gray-400">
                No customers found in this segment.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Campaign Modal */}
      <Dialog open={campaignModalOpen} onOpenChange={setCampaignModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Email Campaign</DialogTitle>
            <DialogDescription>
              Configure and send an email campaign to selected customers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="segment">Target Audience</Label>
              <Select
                value={selectedSegment?.value || 'all'}
                onValueChange={(val) => {
                  const seg = val === 'all'
                    ? { label: 'All Customers', value: 'all' }
                    : analytics.segments.find(s => s.value === val);

                  if (seg) setSelectedSegment({ label: seg.label, value: seg.value });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  {analytics.segments.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject Line</Label>
              <Input
                id="subject"
                placeholder="e.g. Special Offer for You!"
                value={campaignForm.subject}
                onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message Content</Label>
              <Textarea
                id="message"
                placeholder="Compose your marketing message..."
                className="min-h-[150px]"
                value={campaignForm.message}
                onChange={(e) => setCampaignForm({ ...campaignForm, message: e.target.value })}
              />
            </div>
            <Button className="w-full gradient-coral text-white h-11" onClick={handleSendTargetedCampaign}>
              <Send className="w-4 h-4 mr-2" />
              Send Campaign Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
