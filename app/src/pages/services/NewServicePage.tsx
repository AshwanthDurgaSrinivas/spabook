import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    Sparkles, DollarSign, Clock, Tag,
    ChevronLeft, Camera, Plus, Save, Loader2, Users
} from 'lucide-react';
import { serviceService, type ServiceCategory } from '@/services/serviceService';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export function NewServicePage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState<ServiceCategory[]>([]);

    // Form state
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [durationMinutes, setDurationMinutes] = useState('60');
    const [basePrice, setBasePrice] = useState('');
    const [description, setDescription] = useState('');
    const [capacity, setCapacity] = useState('1');

    // New Category state
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [displayOrder, setDisplayOrder] = useState('0');
    const catFileInputRef = useRef<HTMLInputElement>(null);
    const [catImagePreview, setCatImagePreview] = useState<string | null>(null);
    const [catImageUrl, setCatImageUrl] = useState<string | null>(null);
    const [isUploadingCat, setIsUploadingCat] = useState(false);

    // Image state
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const fetchCategories = useCallback(async () => {
        try {
            const data = await serviceService.getCategories();
            setCategories(data);
        } catch (error) {
            toast.error('Failed to load categories');
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName) {
            toast.error('Category name is required');
            return;
        }

        setIsCreatingCategory(true);
        try {
            const newCat = await serviceService.createCategory({
                name: newCategoryName,
                displayOrder: parseInt(displayOrder) || 0,
                image: catImageUrl,
                isActive: true
            });
            toast.success('Category created successfully!');
            await fetchCategories(); // Refresh the list
            setCategoryId(newCat.id.toString()); // Auto-select the new category
            setIsCategoryDialogOpen(false);
            setNewCategoryName('');
            setDisplayOrder('0');
            setCatImageUrl(null);
            setCatImagePreview(null);
        } catch (error) {
            toast.error('Failed to create category');
        } finally {
            setIsCreatingCategory(false);
        }
    };

    const handleCatImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => setCatImagePreview(reader.result as string);
        reader.readAsDataURL(file);

        setIsUploadingCat(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('http://localhost:5000/api/upload/image', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
                body: formData
            });
            if (!response.ok) throw new Error('Upload failed');
            const data = await response.json();
            setCatImageUrl(data.url);
            toast.success('Category image uploaded');
        } catch (error) {
            toast.error('Caterogy image upload failed');
            setCatImagePreview(null);
        } finally {
            setIsUploadingCat(false);
        }
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
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('http://localhost:5000/api/upload/image', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            setImageUrl(data.url);
            toast.success('Image uploaded successfully');
        } catch (error) {
            toast.error('Image upload failed');
            setImagePreview(null);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !categoryId || !basePrice || !durationMinutes) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsLoading(true);
        try {
            await serviceService.createService({
                name,
                categoryId: parseInt(categoryId),
                durationMinutes: parseInt(durationMinutes),
                basePrice: parseFloat(basePrice),
                capacity: parseInt(capacity) || 1,
                description,
                imageUrls: imageUrl ? [imageUrl] : [],
                status: 'active'
            });
            toast.success('Service created successfully!');
            navigate('/admin/services');
        } catch (error) {
            toast.error('Failed to create service');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                    <ChevronLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-800">New Service</h1>
                    <p className="text-gray-500">Add a new treatment or service to your menu</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 border-0 shadow-soft">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-coral-500" />
                            General Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Service Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. Deep Tissue Massage"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Category</Label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-coral-600 hover:text-coral-700 hover:bg-coral-50 gap-1 text-xs"
                                        onClick={() => setIsCategoryDialogOpen(true)}
                                    >
                                        <Plus className="w-3 h-3" />
                                        Quick Add
                                    </Button>
                                </div>
                                <Select value={categoryId} onValueChange={setCategoryId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="duration">Duration (Minutes)</Label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        id="duration"
                                        type="number"
                                        className="pl-10"
                                        placeholder="60"
                                        value={durationMinutes}
                                        onChange={(e) => setDurationMinutes(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe the service, its benefits, and what customers can expect..."
                                className="min-h-[120px]"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="border-0 shadow-soft">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-coral-500" />
                                Pricing
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Base Price</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                    <Input
                                        id="price"
                                        type="number"
                                        className="pl-8"
                                        placeholder="0.00"
                                        value={basePrice}
                                        onChange={(e) => setBasePrice(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tax">Tax Rate (%)</Label>
                                <Input id="tax" type="number" placeholder="8.25" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="capacity" className="flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5 text-coral-500" />
                                    Concurrent Capacity
                                </Label>
                                <Input
                                    id="capacity"
                                    type="number"
                                    min="1"
                                    placeholder="1"
                                    value={capacity}
                                    onChange={(e) => setCapacity(e.target.value)}
                                />
                                <p className="text-[11px] text-gray-400">
                                    How many customers can book this service at the same time. Set to 1 for exclusive one‑on‑one sessions, higher for group classes or shared treatments.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-soft">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <Camera className="w-5 h-5 text-coral-500" />
                                Service Image
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            <div
                                className="aspect-video rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:bg-gray-100 transition-colors cursor-pointer relative overflow-hidden"
                                onClick={handleImageClick}
                            >
                                {imagePreview ? (
                                    <>
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        {isUploading && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                                            <Camera className="w-8 h-8 text-white" />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-8 h-8 text-gray-400" />
                                        <span className="text-xs text-gray-500">
                                            {isUploading ? 'Uploading...' : 'Upload Image'}
                                        </span>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-3">
                        <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>Discard</Button>
                        <Button type="submit" className="flex-1 gradient-coral text-white" disabled={isLoading || isUploading}>
                            {isLoading ? 'Creating...' : isUploading ? 'Uploading Image...' : 'Save Service'}
                        </Button>
                    </div>
                </div>
            </form>

            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add New Category</DialogTitle>
                        <DialogDescription>
                            Create a new category to group your services.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateCategory} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="cat-name">Category Name</Label>
                            <Input
                                id="cat-name"
                                placeholder="e.g. Wellness Packages"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Category Image</Label>
                            <input
                                type="file"
                                ref={catFileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleCatImageChange}
                            />
                            <div
                                className="aspect-[2/1] rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:bg-gray-100 transition-colors cursor-pointer relative overflow-hidden"
                                onClick={() => catFileInputRef.current?.click()}
                            >
                                {catImagePreview ? (
                                    <>
                                        <img src={catImagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        {isUploadingCat && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                <Loader2 className="w-6 h-6 text-white animate-spin" />
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <Camera className="w-6 h-6 text-gray-400" />
                                        <span className="text-xs text-gray-500">
                                            {isUploadingCat ? 'Uploading...' : 'Upload Image'}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cat-order">Display Order</Label>
                            <Input
                                id="cat-order"
                                type="number"
                                placeholder="0"
                                value={displayOrder}
                                onChange={(e) => setDisplayOrder(e.target.value)}
                            />
                            <p className="text-[10px] text-gray-400 font-normal">Controls position in tabs (lower numbers show first)</p>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" className="gradient-coral text-white" disabled={isCreatingCategory || isUploadingCat}>
                                {isCreatingCategory ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Adding...
                                    </>
                                ) : 'Add Category'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
