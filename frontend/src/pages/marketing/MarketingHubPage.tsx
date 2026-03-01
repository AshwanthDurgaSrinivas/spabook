import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Megaphone, Mail, MessageSquare, Plus, Send, Eye, MousePointer,
  Edit, Copy, BarChart3, Zap, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { marketingService } from '@/services/marketingService';
import type { MarketingCampaign, EmailTemplate, MarketingAutomation } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export function MarketingHubPage({ embedded = false }: { embedded?: boolean }) {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [isNewCampaignOpen, setIsNewCampaignOpen] = useState(false);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [automations, setAutomations] = useState<MarketingAutomation[]>([]);
  const [loading, setLoading] = useState(true);

  // New Campaign Form State
  const [newCampaign, setNewCampaign] = useState<Partial<MarketingCampaign>>({
    name: '',
    campaignType: 'email',
    description: '',
    status: 'draft',
    segmentCriteria: { segment: 'all' }
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [campaignsData, templatesData, automationsData] = await Promise.all([
        marketingService.getCampaigns(),
        marketingService.getTemplates(),
        marketingService.getAutomations()
      ]);
      setCampaigns(campaignsData);
      setTemplates(templatesData);
      setAutomations(automationsData);
    } catch (error) {
      toast.error('Failed to load marketing data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCampaign = async () => {
    if (!newCampaign.name) {
      toast.error('Campaign name is required');
      return;
    }
    try {
      await marketingService.createCampaign(newCampaign);
      toast.success('Campaign created successfully!');
      setIsNewCampaignOpen(false);
      fetchData();
      setNewCampaign({
        name: '',
        campaignType: 'email',
        description: '',
        status: 'draft',
        segmentCriteria: { segment: 'all' }
      });
    } catch (error) {
      toast.error('Failed to create campaign');
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      try {
        await marketingService.deleteCampaign(id);
        toast.success('Campaign deleted successfully!');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete campaign');
      }
    }
  };

  const campaignStats = campaigns.length > 0
    ? campaigns.slice(0, 5).map(c => ({
      name: c.name,
      sent: c.totalSent,
      opened: c.totalOpened,
      clicked: c.totalClicked
    }))
    : [
      { name: 'No Data', sent: 0, opened: 0, clicked: 0 },
    ];

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* Header */}
      {!embedded && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-800">Marketing Hub</h1>
            <p className="text-gray-500 mt-1">Create and manage marketing campaigns</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-coral-200 hover:bg-coral-50" onClick={fetchData}>
              <Loader2 className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
              Refresh
            </Button>
            <Dialog open={isNewCampaignOpen} onOpenChange={setIsNewCampaignOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-coral hover:opacity-90 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  New Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create Marketing Campaign</DialogTitle>
                  <DialogDescription>Launch a new promotion or update to your customers.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Campaign Name</Label>
                    <Input
                      placeholder="e.g. Summer Glow Sale"
                      value={newCampaign.name}
                      onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Channel</Label>
                      <Select
                        value={newCampaign.campaignType}
                        onValueChange={(val: any) => setNewCampaign({ ...newCampaign, campaignType: val })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email Campaign</SelectItem>
                          <SelectItem value="sms">SMS Marketing</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Audience</Label>
                      <Select defaultValue="all">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Customers</SelectItem>
                          <SelectItem value="vip">VIP Only</SelectItem>
                          <SelectItem value="recent">Recent Visitors</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Short description for internal use..."
                      value={newCampaign.description}
                      onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsNewCampaignOpen(false)}>Cancel</Button>
                  <Button className="gradient-coral text-white" onClick={handleCreateCampaign}>
                    Create Campaign
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}


      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Campaigns', value: campaigns.length.toString(), icon: Megaphone, color: 'coral' },
          { label: 'Emails Sent', value: campaigns.reduce((acc, c) => acc + c.totalSent, 0).toLocaleString(), icon: Mail, color: 'blue' },
          { label: 'Open Rate', value: campaigns.length > 0 ? (campaigns.reduce((acc, c) => acc + (c.totalSent > 0 ? (c.totalOpened / c.totalSent) : 0), 0) / campaigns.length * 100).toFixed(1) + '%' : '0%', icon: Eye, color: 'green' },
          { label: 'Automations', value: automations.length.toString(), icon: Zap, color: 'purple' },
        ].map((stat, index) => (
          <Card key={index} className="border-0 shadow-soft cursor-pointer hover:bg-gray-50 transition-colors">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', `bg-${stat.color}-100`)}>
                <stat.icon className={cn('w-6 h-6', `text-${stat.color}-500`)} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          {!embedded && (
            <>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="automation">Automation</TabsTrigger>
            </>
          )}
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6 mt-6">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-coral-500" /></div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="border-0 shadow-soft">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {campaign.campaignType === 'email' && <Mail className="w-5 h-5 text-coral-500" />}
                          {campaign.campaignType === 'sms' && <MessageSquare className="w-5 h-5 text-green-500" />}
                          <h3 className="text-lg font-semibold">{campaign.name}</h3>
                        </div>
                        <p className="text-sm text-gray-500">{campaign.description}</p>
                      </div>
                      <Badge className={cn(
                        campaign.status === 'sent' && 'bg-green-100 text-green-600',
                        campaign.status === 'draft' && 'bg-gray-100 text-gray-600',
                        campaign.status === 'scheduled' && 'bg-blue-100 text-blue-600',
                      )}>
                        {campaign.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xl font-bold">{campaign.totalRecipients}</p>
                        <p className="text-xs text-gray-500">Recipients</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xl font-bold">{campaign.totalSent}</p>
                        <p className="text-xs text-gray-500">Sent</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xl font-bold text-green-600">
                          {campaign.totalSent > 0 ? ((campaign.totalOpened / campaign.totalSent) * 100).toFixed(1) : 0}%
                        </p>
                        <p className="text-xs text-gray-500">Open Rate</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xl font-bold text-coral-600">
                          {campaign.totalOpened > 0 ? ((campaign.totalClicked / campaign.totalOpened) * 100).toFixed(1) : 0}%
                        </p>
                        <p className="text-xs text-gray-500">Click Rate</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => toast.info(`Viewing detailed analytics for ${campaign.name}...`)}>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Analytics
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={() => toast.success(`${campaign.name} campaign duplicated!`)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </Button>
                      <Button variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteCampaign(campaign.id)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {campaigns.length === 0 && !loading && (
                <div className="col-span-full text-center py-20 text-gray-400">No campaigns found.</div>
              )}
            </div>
          )}
        </TabsContent>

        {!embedded && (
          <>
            <TabsContent value="templates" className="space-y-6 mt-6">
              {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-coral-500" /></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map((template) => (
                    <Card key={template.id} className="border-0 shadow-soft">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Mail className="w-5 h-5 text-coral-500" />
                          <h3 className="font-semibold">{template.name}</h3>
                        </div>
                        <p className="text-sm text-gray-500 mb-2 font-medium">Subject: {template.subject}</p>
                        <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 line-clamp-3 mb-4 h-20 overflow-hidden">
                          {template.bodyHtml ? template.bodyHtml.replace(/<[^>]*>/g, '') : 'No content'}
                        </div>
                        <div className="flex flex-wrap gap-1 mb-4 h-12 overflow-y-auto content-start">
                          {template.variables?.map((variable, i) => (
                            <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                              {'{{'}{variable}{'}}'}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1" onClick={() => toast.info(`Opening editor for ${template.name}...`)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button className="gradient-coral text-white flex-1" onClick={() => toast.info(`Template ${template.name} is ready to use!`)}>
                            <Send className="w-4 h-4 mr-2" />
                            Use
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {templates.length === 0 && !loading && (
                    <div className="col-span-full text-center py-20 text-gray-400">No email templates found.</div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="automation" className="space-y-6 mt-6">
              {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-coral-500" /></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {automations.map((workflow) => (
                    <Card key={workflow.id} className="border-0 shadow-soft">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-coral-100 flex items-center justify-center border border-coral-200">
                              <Zap className="w-5 h-5 text-coral-500" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{workflow.name}</h3>
                              <p className="text-sm text-gray-500">Trigger: {workflow.trigger}</p>
                            </div>
                          </div>
                          <Badge className={cn(
                            workflow.isActive ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600',
                          )}>
                            {workflow.isActive ? 'Active' : 'Paused'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <p className="font-bold">{workflow.totalSends}</p>
                            <p className="text-[10px] text-gray-500 uppercase">Sends</p>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <p className="font-bold">{workflow.totalSends > 0 ? ((workflow.totalOpens / workflow.totalSends) * 100).toFixed(0) : 0}%</p>
                            <p className="text-[10px] text-gray-500 uppercase">Opens</p>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <p className="font-bold">{workflow.totalOpens > 0 ? ((workflow.totalClicks / workflow.totalOpens) * 100).toFixed(0) : 0}%</p>
                            <p className="text-[10px] text-gray-500 uppercase">Clicks</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-400 font-medium">Last updated: {new Date(workflow.updatedAt).toLocaleDateString()}</p>
                          <Button variant="outline" size="sm" className="hover:bg-coral-50" onClick={() => toast.info(`Configuring automation for ${workflow.name}...`)}>Configure</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {automations.length === 0 && !loading && (
                    <div className="col-span-full text-center py-20 text-gray-400">No automation workflows found.</div>
                  )}
                </div>
              )}
            </TabsContent>
          </>
        )}

        <TabsContent value="analytics" className="space-y-6 mt-6">
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Campaign Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={campaignStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Bar dataKey="sent" fill="#e5e7eb" radius={[4, 4, 0, 0]} name="Sent" />
                    <Bar dataKey="opened" fill="#F8AD9D" radius={[4, 4, 0, 0]} name="Opened" />
                    <Bar dataKey="clicked" fill="#F08080" radius={[4, 4, 0, 0]} name="Clicked" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div >
  );
}
