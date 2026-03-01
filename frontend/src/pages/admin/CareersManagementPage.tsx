import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, MapPin, DollarSign, Plus, Download, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function CareersManagementPage() {
    const [activeTab, setActiveTab] = useState('postings');
    const [postings, setPostings] = useState<any[]>([]);
    const [applications, setApplications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isPostingModalOpen, setIsPostingModalOpen] = useState(false);
    const [editingPosting, setEditingPosting] = useState<any>(null);

    const [postingData, setPostingData] = useState({
        title: '',
        location: '',
        type: 'Full-Time',
        salary: '',
        description: '',
        requirements: '',
        isActive: true
    });

    const fetchPostings = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/careers/jobs');
            if (res.ok) {
                const data = await res.json();
                setPostings(data);
            }
        } catch (error) {
            toast.error("Failed to load postings");
        }
    };

    const fetchApplications = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/careers/applications', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
            });
            if (res.ok) {
                const data = await res.json();
                setApplications(data);
            }
        } catch (error) {
            toast.error("Failed to load applications");
        }
    };

    useEffect(() => {
        Promise.all([fetchPostings(), fetchApplications()]).finally(() => setIsLoading(false));
    }, []);

    const handleSavePosting = async () => {
        if (!postingData.title) return toast.error("Title is required");
        try {
            const payload = {
                ...postingData,
                requirements: postingData.requirements.split(',').map(r => r.trim()).filter(Boolean)
            };

            const url = editingPosting ? `http://localhost:5000/api/careers/jobs/${editingPosting.id}` : 'http://localhost:5000/api/careers/jobs';
            const method = editingPosting ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success(`Job ${editingPosting ? 'updated' : 'created'}`);
                fetchPostings();
                setIsPostingModalOpen(false);
            } else {
                toast.error("Failed to save job");
            }
        } catch (error) {
            toast.error("Error saving job");
        }
    };

    const handleDeletePosting = async (id: number) => {
        if (!confirm('Are you sure you want to delete this job posting?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/careers/jobs/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
            });
            if (res.ok) {
                toast.success('Deleted successfully');
                fetchPostings();
            }
        } catch (error) {
            toast.error("Error deleting job");
        }
    };

    const handleOpenEdit = (job: any) => {
        setEditingPosting(job);
        setPostingData({
            title: job.title,
            location: job.location,
            type: job.type,
            salary: job.salary,
            description: job.description,
            requirements: job.requirements.join(', '),
            isActive: job.isActive
        });
        setIsPostingModalOpen(true);
    };

    const handleOpenNew = () => {
        setEditingPosting(null);
        setPostingData({
            title: '',
            location: 'New York, NY',
            type: 'Full-Time',
            salary: '',
            description: '',
            requirements: '',
            isActive: true
        });
        setIsPostingModalOpen(true);
    };

    const handleUpdateApplicationStatus = async (id: number, status: string) => {
        try {
            const res = await fetch(`http://localhost:5000/api/careers/applications/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                toast.success('Status updated');
                fetchApplications();
            }
        } catch (error) {
            toast.error("Error updating status");
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading Careers Data...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-400">Careers & Recruiting</h1>
                    <p className="text-gray-500">Manage job postings and review candidate applications.</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-white shadow-sm border p-1 rounded-xl">
                    <TabsTrigger value="postings" className="rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">Job Postings</TabsTrigger>
                    <TabsTrigger value="applications" className="rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">Applications <Badge className="ml-2 bg-indigo-100 text-indigo-700">{applications.filter(a => a.status === 'new').length}</Badge></TabsTrigger>
                </TabsList>

                <TabsContent value="postings" className="mt-6">
                    <div className="flex justify-end mb-4">
                        <Button onClick={handleOpenNew} className="gradient-indigo text-white"><Plus className="w-4 h-4 mr-2" /> New Job Posting</Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        {postings.map(job => (
                            <Card key={job.id} className="shadow-sm border-indigo-50">
                                <CardContent className="p-5 relative">
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(job)}><Edit2 className="w-4 h-4 text-gray-500" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeletePosting(job.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                    </div>
                                    <h3 className="font-bold text-lg pr-16">{job.title}</h3>
                                    <Badge variant={job.isActive ? "default" : "secondary"} className="mt-1 mb-3">{job.isActive ? 'Active' : 'Closed'}</Badge>
                                    <div className="flex flex-col gap-1 text-sm text-gray-500 mb-4">
                                        <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {job.location}</span>
                                        <span className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> {job.type}</span>
                                        <span className="flex items-center gap-2"><DollarSign className="w-4 h-4" /> {job.salary}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                        {postings.length === 0 && (
                            <div className="col-span-2 p-12 text-center text-gray-500 border border-dashed rounded-xl">No job postings created yet.</div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="applications" className="mt-6">
                    <Card className="shadow-sm border-indigo-50 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-indigo-50/50 text-indigo-900 border-b border-indigo-100">
                                    <tr>
                                        <th className="p-4 font-semibold rounded-tl-xl whitespace-nowrap">Candidate</th>
                                        <th className="p-4 font-semibold whitespace-nowrap">Job Position</th>
                                        <th className="p-4 font-semibold whitespace-nowrap">Status</th>
                                        <th className="p-4 font-semibold whitespace-nowrap text-right rounded-tr-xl">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applications.map((app) => (
                                        <tr key={app.id} className="border-b border-gray-50 last:border-0 hover:bg-slate-50 transition-colors">
                                            <td className="p-4">
                                                <div className="font-medium text-gray-900">{app.name}</div>
                                                <div className="text-gray-500 text-xs">{app.email} • {app.phone}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-medium text-gray-700">{app.jobPosting?.title || 'Unknown Role'}</div>
                                                <div className="text-gray-400 text-xs">{new Date(app.createdAt).toLocaleDateString()}</div>
                                            </td>
                                            <td className="p-4">
                                                <Select value={app.status} onValueChange={(val) => handleUpdateApplicationStatus(app.id, val)}>
                                                    <SelectTrigger className="w-[130px] h-8 text-xs border-indigo-100 bg-white shadow-sm">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="new">New</SelectItem>
                                                        <SelectItem value="reviewing">Reviewing</SelectItem>
                                                        <SelectItem value="interviewed">Interviewed</SelectItem>
                                                        <SelectItem value="hired">Hired</SelectItem>
                                                        <SelectItem value="rejected">Rejected</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" asChild className="h-8">
                                                        <a href={app.resumeUrl?.startsWith('http') ? app.resumeUrl : `http://localhost:5000${app.resumeUrl}`} target="_blank" rel="noopener noreferrer"><Download className="w-4 h-4 mr-1" /> Resume</a>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {applications.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-12 text-center text-gray-500">No applications received yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={isPostingModalOpen} onOpenChange={setIsPostingModalOpen}>
                <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingPosting ? 'Edit Job Posting' : 'Create Job Posting'}</DialogTitle>
                        <DialogDescription className="hidden">Form for creating or editing a job posting</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Job Title *</Label>
                            <Input value={postingData.title} onChange={e => setPostingData({ ...postingData, title: e.target.value })} placeholder="e.g. Senior Massage Therapist" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Location</Label>
                                <Input value={postingData.location} onChange={e => setPostingData({ ...postingData, location: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Type</Label>
                                <Select value={postingData.type} onValueChange={v => setPostingData({ ...postingData, type: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Full-Time">Full-Time</SelectItem>
                                        <SelectItem value="Part-Time">Part-Time</SelectItem>
                                        <SelectItem value="Contract">Contract</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Salary Range</Label>
                            <Input value={postingData.salary} onChange={e => setPostingData({ ...postingData, salary: e.target.value })} placeholder="e.g. $50k - $70k or $30/hr" />
                        </div>
                        <div className="grid gap-2">
                            <Label>Requirements (comma-separated)</Label>
                            <Input value={postingData.requirements} onChange={e => setPostingData({ ...postingData, requirements: e.target.value })} placeholder="Licensed, 3+ years experience,..." />
                        </div>
                        <div className="grid gap-2">
                            <Label>Description</Label>
                            <Textarea rows={4} value={postingData.description} onChange={e => setPostingData({ ...postingData, description: e.target.value })} />
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="active" checked={postingData.isActive} onChange={e => setPostingData({ ...postingData, isActive: e.target.checked })} className="w-4 h-4 text-indigo-600 rounded border-gray-300" />
                            <Label htmlFor="active" className="cursor-pointer">Publish/Active</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPostingModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSavePosting} className="gradient-indigo text-white">Save Posting</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
