import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Briefcase, MapPin, DollarSign, UploadCloud, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function CareersPage() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState<any>(null);
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

    // Application Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        coverLetter: ''
    });
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        fetch('http://localhost:5000/api/careers/jobs')
            .then(res => res.json())
            .then(data => {
                // filter only active jobs
                setJobs(data.filter((j: any) => j.isActive));
                setIsLoading(false);
            })
            .catch(() => {
                toast.error("Failed to load open positions");
                setIsLoading(false);
            });
    }, []);

    const handleApplyClick = (job: any) => {
        setSelectedJob(job);
        setIsApplyModalOpen(true);
        setIsSuccess(false);
        setFormData({ name: '', email: '', phone: '', coverLetter: '' });
        setResumeFile(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setResumeFile(e.target.files[0]);
        }
    };

    const handleSubmitApplication = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!resumeFile) {
            return toast.error("Please upload your resume");
        }

        setIsSubmitting(true);

        try {
            // 1. Upload Resume
            const formDataObj = new FormData();
            formDataObj.append('document', resumeFile);

            const uploadRes = await fetch('http://localhost:5000/api/upload/document', {
                method: 'POST',
                body: formDataObj
            });

            if (!uploadRes.ok) throw new Error("Resume upload failed");

            const uploadData = await uploadRes.json();
            const resumeUrl = uploadData.url;

            // 2. Submit Application
            const appPayload = {
                jobPostingId: selectedJob.id,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                coverLetter: formData.coverLetter,
                resumeUrl: resumeUrl
            };

            const appRes = await fetch('http://localhost:5000/api/careers/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(appPayload)
            });

            if (!appRes.ok) throw new Error("Failed to submit application");

            // Success
            setIsSuccess(true);
            toast.success("Application submitted successfully!");

        } catch (error: any) {
            toast.error(error.message || "An error occurred during submission");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="bg-gray-900 text-white py-20 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-gray-900 to-black opacity-80" />
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Join Our Team</h1>
                    <p className="text-xl max-w-2xl mx-auto text-gray-300 px-4">
                        Passionate about wellness? We're always looking for talented individuals to grow with us.
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-16 min-h-[50vh]">
                <h2 className="text-2xl font-bold mb-8 text-gray-800">Open Positions</h2>

                {isLoading ? (
                    <div className="space-y-4 animate-pulse">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-40 bg-gray-100 rounded-xl w-full" />
                        ))}
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-2xl border border-dashed">
                        We currently don't have any open positions. Please check back later!
                    </div>
                ) : (
                    <div className="space-y-6">
                        {jobs.map((job) => (
                            <Card key={job.id} className="border hover:border-indigo-200 transition-colors shadow-sm hover:shadow-md relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <CardHeader className="pl-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                                                <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-indigo-400" /> {job.location}</span>
                                                <span className="flex items-center gap-1"><Briefcase className="w-4 h-4 text-indigo-400" /> {job.type}</span>
                                                <span className="flex items-center gap-1"><DollarSign className="w-4 h-4 text-indigo-400" /> {job.salary}</span>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => handleApplyClick(job)}
                                            className="hidden sm:flex gradient-indigo text-white shadow-md hover:shadow-lg transition-all"
                                        >
                                            Apply Now
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="pl-6">
                                    <p className="text-gray-600 mb-5">{job.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {job.requirements?.map((req: string, i: number) => (
                                            <Badge key={i} variant="secondary" className="bg-indigo-50 text-indigo-700 font-normal">
                                                {req}
                                            </Badge>
                                        ))}
                                    </div>
                                    <Button
                                        onClick={() => handleApplyClick(job)}
                                        className="w-full mt-6 sm:hidden gradient-indigo text-white"
                                    >
                                        Apply Now
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
                <DialogContent className="max-w-lg sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-display text-gray-900">
                            {isSuccess ? 'Application Received' : `Apply for ${selectedJob?.title}`}
                        </DialogTitle>
                        <DialogDescription className="hidden">Application form for job</DialogDescription>
                    </DialogHeader>

                    {isSuccess ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Thank you for applying!</h3>
                            <p className="text-gray-500 max-w-sm">We've received your application and will be in touch soon if your qualifications match our needs.</p>
                            <Button onClick={() => setIsApplyModalOpen(false)} className="mt-6">Close</Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmitApplication} className="space-y-4 py-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name *</Label>
                                    <Input
                                        id="name"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number *</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="(555) 123-4567"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="resume">Resume/CV (PDF or Doc) *</Label>
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors relative">
                                    <input
                                        type="file"
                                        id="resume"
                                        required
                                        onChange={handleFileChange}
                                        accept=".pdf,.doc,.docx"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <UploadCloud className="w-8 h-8 text-indigo-400 mb-2" />
                                    {resumeFile ? (
                                        <p className="text-sm font-medium text-indigo-600">{resumeFile.name}</p>
                                    ) : (
                                        <>
                                            <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                                            <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX up to 5MB</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
                                <Textarea
                                    id="coverLetter"
                                    rows={4}
                                    value={formData.coverLetter}
                                    onChange={e => setFormData({ ...formData, coverLetter: e.target.value })}
                                    placeholder="Tell us why you're a great fit..."
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={() => setIsApplyModalOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isSubmitting} className="gradient-indigo text-white">
                                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                                </Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
