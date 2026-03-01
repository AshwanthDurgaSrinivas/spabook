import { useState, useEffect } from 'react';
import {
    Plus, Search, Edit, Trash2, Check, X, Star,
    Loader2, MoreVertical, Package as PackageIcon,
    Clock, DollarSign, Tag, ChevronsUpDown, Copy, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog';
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { packageService, type SpaPackage } from '@/services/packageService';
import { serviceService, type Service } from '@/services/serviceService';
import { toast } from 'sonner';

export function AdminPackagesPage() {
    const [packages, setPackages] = useState<SpaPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<SpaPackage | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [availableServices, setAvailableServices] = useState<Service[]>([]);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        duration: '',
        features: '',
        serviceIds: [] as number[],
        isPopular: false,
        isActive: true
    });

    useEffect(() => {
        loadPackages();
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            const data = await serviceService.getServices();
            // Filter by isActive (backend model uses boolean isActive)
            setAvailableServices(data.filter(s => s.isActive !== false));
        } catch (error) {
            console.error('Failed to load services', error);
        }
    };

    const loadPackages = async () => {
        try {
            setLoading(true);
            const data = await packageService.getPackages(true); // Include inactive
            setPackages(data);
        } catch (error) {
            toast.error('Failed to load packages');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setEditingPackage(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            originalPrice: '',
            duration: '',
            features: '',
            serviceIds: [],
            isPopular: false,
            isActive: true
        });
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (pkg: SpaPackage) => {
        setEditingPackage(pkg);
        setFormData({
            name: pkg.name,
            description: pkg.description,
            price: pkg.price.toString(),
            originalPrice: pkg.originalPrice?.toString() || '',
            duration: pkg.duration,
            features: pkg.features.join('\n'),
            serviceIds: pkg.serviceIds || [],
            isPopular: pkg.isPopular,
            isActive: pkg.isActive
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const data = {
                ...formData,
                price: parseFloat(formData.price),
                originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
                features: formData.features.split('\n').filter(f => f.trim() !== '')
            };

            if (editingPackage) {
                await packageService.updatePackage(editingPackage.id, data as any);
                toast.success('Package updated successfully');
            } else {
                await packageService.createPackage(data as any);
                toast.success('Package created successfully');
            }
            setIsDialogOpen(false);
            loadPackages();
        } catch (error) {
            toast.error(editingPackage ? 'Failed to update package' : 'Failed to create package');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDuplicate = async (pkg: SpaPackage) => {
        try {
            const { id, ...pkgData } = pkg as any;
            await packageService.createPackage({
                ...pkgData,
                name: `${pkgData.name} (Copy)`,
                slug: undefined // If backend handles slugs for packages too
            });
            toast.success('Package duplicated successfully');
            loadPackages();
        } catch (error) {
            toast.error('Failed to duplicate package');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this package?')) return;
        try {
            await packageService.deletePackage(id);
            toast.success('Package deleted');
            loadPackages();
        } catch (error) {
            toast.error('Failed to delete package');
        }
    };

    const filteredPackages = packages.filter(pkg =>
        pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900">Experience Packages</h1>
                    <p className="text-gray-500">Manage your exclusive service bundles and special offers.</p>
                </div>
                <Button onClick={handleOpenCreate} className="gradient-coral text-white shadow-md">
                    <Plus className="w-4 h-4 mr-2" /> Add New Package
                </Button>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search packages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow>
                            <TableHead>Package Name</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Features</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-40 text-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-coral-500 mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : filteredPackages.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-40 text-center text-gray-500">
                                    No packages found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredPackages.map((pkg) => (
                                <TableRow key={pkg.id} className="hover:bg-gray-50/50 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center shrink-0 ${pkg.isPopular ? 'bg-coral-50 text-coral-600' : 'bg-gray-100 text-gray-600'}`}>
                                                {pkg.image ? (
                                                    <img
                                                        src={pkg.image.startsWith('http') ? pkg.image : `http://localhost:5000${pkg.image}`}
                                                        alt="Package"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <PackageIcon className="w-5 h-5" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 flex items-center gap-2">
                                                    {pkg.name}
                                                    {pkg.isPopular && <Star className="w-3 h-3 fill-coral-500 text-coral-500" />}
                                                </p>
                                                <p className="text-xs text-gray-500 line-clamp-1">{pkg.description}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Clock className="w-4 h-4" />
                                            <span className="text-sm">{pkg.duration}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900">${pkg.price}</span>
                                            {pkg.originalPrice && (
                                                <span className="text-xs text-gray-400 line-through">${pkg.originalPrice}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1 max-w-[200px]">
                                            <Badge variant="outline" className="font-normal w-fit">
                                                {pkg.features.length} features
                                            </Badge>
                                            {pkg.serviceIds && pkg.serviceIds.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {pkg.serviceIds.map(id => {
                                                        const service = availableServices.find(s => s.id === id);
                                                        return service ? (
                                                            <Badge key={id} variant="secondary" className="font-normal bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border-indigo-100 text-[10px] py-0 px-1">
                                                                {service.name}
                                                            </Badge>
                                                        ) : null;
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`rounded-full ${pkg.isActive ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-700 hover:bg-gray-100'}`}>
                                            {pkg.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40">
                                                <DropdownMenuItem onClick={() => handleOpenEdit(pkg)} className="cursor-pointer">
                                                    <Edit className="w-4 h-4 mr-2" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDuplicate(pkg)} className="cursor-pointer">
                                                    <Copy className="w-4 h-4 mr-2" /> Duplicate
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(pkg.id)} className="cursor-pointer text-red-600 focus:text-red-600">
                                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">{editingPackage ? 'Edit Package' : 'Create New Package'}</DialogTitle>
                        <DialogDescription>
                            Define the name, price, and services included in this special bundle.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="name">Package Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Dream Spa Journey"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="description">Short Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Briefly explain what's special about this package..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">Offer Price ($)</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        placeholder="199.99"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        className="pl-9"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="originalPrice">Original Value ($)</Label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        id="originalPrice"
                                        type="number"
                                        step="0.01"
                                        placeholder="249.99"
                                        value={formData.originalPrice}
                                        onChange={e => setFormData({ ...formData, originalPrice: e.target.value })}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="duration">Total Duration</Label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        id="duration"
                                        placeholder="e.g. 2 hours"
                                        value={formData.duration}
                                        onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                        className="pl-9"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 pt-8">
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isPopular}
                                            onChange={e => setFormData({ ...formData, isPopular: e.target.checked })}
                                            className="w-4 h-4 rounded text-coral-500 focus:ring-coral-500"
                                        />
                                        <span className="text-sm font-medium">Mark as Popular</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="w-4 h-4 rounded text-coral-500 focus:ring-coral-500"
                                        />
                                        <span className="text-sm font-medium">Active</span>
                                    </label>
                                </div>
                            </div>
                            <div className="space-y-3 col-span-2">
                                <Label>Select Services to Include</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className="w-full justify-between bg-gray-50/50 border-gray-200 hover:bg-white transition-all h-auto min-h-[42px] py-2 px-3 font-normal"
                                        >
                                            <div className="flex flex-wrap gap-1 items-center overflow-hidden">
                                                {formData.serviceIds.length > 0 ? (
                                                    formData.serviceIds.map((id) => {
                                                        const service = availableServices.find((s) => s.id === id);
                                                        return service ? (
                                                            <Badge
                                                                key={id}
                                                                variant="secondary"
                                                                className="bg-coral-50 text-coral-700 border-coral-100 flex items-center gap-1 group"
                                                            >
                                                                {service.name}
                                                                <X
                                                                    className="w-3 h-3 cursor-pointer hover:text-coral-900"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const newServiceIds = formData.serviceIds.filter(sid => sid !== id);
                                                                        setFormData({ ...formData, serviceIds: newServiceIds });
                                                                    }}
                                                                />
                                                            </Badge>
                                                        ) : null;
                                                    })
                                                ) : (
                                                    <span className="text-gray-500">Select services...</span>
                                                )}
                                            </div>
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0" align="start">
                                        <Command className="w-full">
                                            <CommandInput placeholder="Search services..." />
                                            <CommandList>
                                                <CommandEmpty>No services found.</CommandEmpty>
                                                <CommandGroup className="max-h-60 overflow-y-auto">
                                                    {availableServices.map((service) => (
                                                        <CommandItem
                                                            key={service.id}
                                                            value={service.name}
                                                            onSelect={() => {
                                                                const isSelected = formData.serviceIds.includes(service.id);
                                                                const newServiceIds = isSelected
                                                                    ? formData.serviceIds.filter(id => id !== service.id)
                                                                    : [...formData.serviceIds, service.id];

                                                                setFormData(prev => {
                                                                    const updatedData = { ...prev, serviceIds: newServiceIds };

                                                                    // Automatically add service name to features if checked
                                                                    if (!isSelected) {
                                                                        const currentFeatures = prev.features.split('\n').filter(f => f.trim() !== '');
                                                                        if (!currentFeatures.includes(service.name)) {
                                                                            updatedData.features = [...currentFeatures, service.name].join('\n');
                                                                        }
                                                                    }

                                                                    return updatedData;
                                                                });
                                                            }}
                                                        >
                                                            <div className={cn(
                                                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                                formData.serviceIds.includes(service.id)
                                                                    ? "bg-primary text-primary-foreground"
                                                                    : "opacity-50 [&_svg]:invisible"
                                                            )}>
                                                                <Check className={cn("h-4 w-4")} />
                                                            </div>
                                                            {service.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <p className="text-[10px] text-gray-400">Search and select multiple services from your inventory.</p>
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="features">Features / Includes (One per line)</Label>
                                <Textarea
                                    id="features"
                                    placeholder="90min Full Body Massage&#10;Hot Stone Therapy&#10;Organic Facial"
                                    value={formData.features}
                                    onChange={e => setFormData({ ...formData, features: e.target.value })}
                                    className="min-h-[120px]"
                                    required
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-4 border-t border-gray-100">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" className="gradient-coral text-white min-w-[120px]" disabled={submitting}>
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    editingPackage ? 'Update Package' : 'Create Package'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
