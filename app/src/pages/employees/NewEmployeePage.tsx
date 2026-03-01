import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    User, Mail, Phone, Briefcase, Award,
    Settings, ChevronLeft, Camera, Sparkles,
    Plus, Github, Twitter, Linkedin, Globe,
    Lock, Eye, EyeOff, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { employeeService } from '@/services/employeeService';

export function NewEmployeePage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [specializations, setSpecializations] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [geofences, setGeofences] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        bio: '',
        designation: '',
        department: '',
        commissionRate: '30',
        hireDate: new Date().toISOString().split('T')[0],
        password: '',
        requiredHours: '9',
        geofenceBypass: false,
        geofenceId: 'any'
    });

    // Image state
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const fetchGeofences = async () => {
        try {
            const { geofenceService } = await import('@/services/geofenceService');
            const data = await geofenceService.getLocations();
            setGeofences(data.filter(g => g.isActive));
        } catch (error) {
            console.error('Failed to fetch geofences', error);
        }
    };

    useEffect(() => {
        fetchGeofences();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!specializations.includes(tagInput.trim())) {
                setSpecializations([...specializations, tagInput.trim()]);
            }
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        setSpecializations(specializations.filter(t => t !== tag));
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload
        setIsUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('image', file);

        try {
            const response = await fetch('http://localhost:5000/api/upload/image', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: uploadFormData
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            setImageUrl(data.url);
            toast.success('Profile photo uploaded');
        } catch (error) {
            toast.error('Upload failed');
            setImagePreview(null);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.password) {
            toast.error('Please set a password for the employee account');
            return;
        }

        setIsLoading(true);

        try {
            await employeeService.createEmployee({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                department: formData.department,
                designation: formData.designation,
                role: formData.designation.toLowerCase(), // Map designation to role
                commissionRate: formData.commissionRate ? parseFloat(formData.commissionRate) : 0,
                skills: specializations.reduce((acc, tag) => ({ ...acc, [tag.toLowerCase().replace(/\s+/g, '-')]: 5 }), {}),
                profileImage: imageUrl,
                requiredHours: parseInt(formData.requiredHours),
                geofenceBypass: formData.geofenceBypass,
                geofenceId: formData.geofenceId === 'any' ? null : parseInt(formData.geofenceId),
                isActive: true
            });

            toast.success('Employee onboarded successfully!');
            navigate('/admin/employees');
        } catch (error: any) {
            console.error('Onboarding failed:', error);
            const message = error.response?.data?.message || error.message || 'Failed to onboard employee';
            let details = error.response?.data?.error;

            if (typeof details === 'object') {
                details = JSON.stringify(details);
            }

            toast.error(`${message} ${details ? ': ' + details : ''}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full hover:bg-white/50">
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                </Button>
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-800">Add New Staff</h1>
                    <p className="text-gray-500">Onboard a new therapist or team member</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Personal & Professional Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-0 shadow-soft overflow-hidden">
                        <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-gradient-x" />
                        <CardContent className="relative pt-0 px-6">
                            <div className="flex flex-col sm:flex-row items-end gap-6 -mt-12">
                                <div className="relative group">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                    <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-md cursor-pointer" onClick={handleImageClick}>
                                        <div className="w-full h-full rounded-xl bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden relative">
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Profile Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <Camera className="w-8 h-8 text-gray-400" />
                                            )}
                                            {isUploading && (
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        size="icon"
                                        className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full gradient-indigo shadow-lg scale-100 transition-transform"
                                        onClick={handleImageClick}
                                    >
                                        <Plus className="w-4 h-4 text-white" />
                                    </Button>
                                </div>
                                <div className="flex-1 pb-2">
                                    <h3 className="text-xl font-bold text-gray-800">Profile Photo</h3>
                                    <p className="text-sm text-gray-500">Upload a professional headshot for the customer portal</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-soft">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <User className="w-5 h-5 text-indigo-500" />
                                Personal Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input id="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="e.g. Sarah" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input id="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="e.g. Miller" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input id="email" type="email" value={formData.email} onChange={handleInputChange} className="pl-10" placeholder="sarah.m@spabook.com" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input id="phone" value={formData.phone} onChange={handleInputChange} className="pl-10" placeholder="+1 (555) 000-0000" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Login Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="pl-10 pr-10"
                                        placeholder="Set account password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <Label htmlFor="bio">Professional Bio</Label>
                                <Textarea id="bio" value={formData.bio} onChange={handleInputChange} placeholder="Share experience..." className="min-h-[100px] resize-none" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-soft">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-indigo-500" />
                                Professional Info
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Role / Designation</Label>
                                <Select onValueChange={(v) => handleSelectChange('designation', v)} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="manager">Manager</SelectItem>
                                        <SelectItem value="receptionist">Receptionist</SelectItem>
                                        <SelectItem value="therapist">Therapist</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Department</Label>
                                <Select onValueChange={(v) => handleSelectChange('department', v)} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="front-office">Front Office</SelectItem>
                                        <SelectItem value="management">Management</SelectItem>
                                        <SelectItem value="service-delivery">Service Delivery</SelectItem>
                                        <SelectItem value="beauty">Beauty & Wellness</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="md:col-span-2 space-y-3">
                                <Label>Specializations</Label>
                                <div className="flex flex-wrap gap-2 min-h-[42px] p-2 bg-gray-50 rounded-lg border border-gray-100">
                                    {specializations.map((tag) => (
                                        <Badge key={tag} className="bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 cursor-pointer transition-colors group" onClick={() => removeTag(tag)}>
                                            {tag}
                                            <span className="ml-1 opacity-50 group-hover:opacity-100">×</span>
                                        </Badge>
                                    ))}
                                    <input
                                        className="flex-1 bg-transparent border-none outline-none text-sm min-w-[120px] h-6 px-1"
                                        placeholder="Type and press Enter to add..."
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={handleAddTag}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <Card className="border-0 shadow-soft">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <Settings className="w-5 h-5 text-indigo-500" />
                                Configurations
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="hireDate">Hire Date</Label>
                                <Input id="hireDate" type="date" value={formData.hireDate} onChange={handleInputChange} className="w-full" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                                <Input id="commissionRate" type="number" value={formData.commissionRate} onChange={handleInputChange} placeholder="30" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="requiredHours">Daily Required Hours</Label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input id="requiredHours" type="number" value={formData.requiredHours} onChange={handleInputChange} className="pl-10" placeholder="9" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Work Location (Geofence)</Label>
                                <Select value={formData.geofenceId} onValueChange={(v) => handleSelectChange('geofenceId', v)}>
                                    <SelectTrigger className="bg-gray-50 focus:bg-white transition-colors">
                                        <SelectValue placeholder="Select location" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="any">All Locations (Default)</SelectItem>
                                        {geofences.map(loc => (
                                            <SelectItem key={loc.id} value={loc.id.toString()}>{loc.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                                <div className="space-y-0.5">
                                    <Label className="text-xs font-bold text-indigo-900">Geofence Bypass</Label>
                                    <p className="text-[10px] text-indigo-600">Allow clock-in from any location (even outside geofence)</p>
                                </div>
                                <Switch
                                    checked={formData.geofenceBypass}
                                    onCheckedChange={(v) => setFormData({ ...formData, geofenceBypass: v })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-soft">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-indigo-500" />
                                Social Profiles
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="relative">
                                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input className="pl-10 text-xs" placeholder="LinkedIn URL" />
                            </div>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input className="pl-10 text-xs" placeholder="Personal Website" />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-3">
                        <Button type="submit" className="w-full gradient-indigo text-white font-bold py-6 shadow-indigo" disabled={isLoading || isUploading}>
                            {isLoading ? 'Processing...' : isUploading ? 'Uploading Photo...' : 'Onboard Employee'}
                        </Button>
                        <Button type="button" variant="outline" className="w-full border-gray-200" onClick={() => navigate('/admin/employees')} disabled={isLoading}>
                            Discard
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
