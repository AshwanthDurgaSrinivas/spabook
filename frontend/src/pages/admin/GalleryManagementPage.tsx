import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Image as ImageIcon, Loader2, Search, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { galleryService, type GalleryItem } from '@/services/galleryService';

const CATEGORIES = [
    { id: 'interior', name: 'Interior' },
    { id: 'treatments', name: 'Treatments' },
    { id: 'products', name: 'Products' },
    { id: 'events', name: 'Events' },
];

export function GalleryManagementPage() {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    // Upload State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [newItem, setNewItem] = useState({
        title: '',
        category: 'interior',
        imageUrl: '',
        description: ''
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchGalleryItems();
    }, []);

    const fetchGalleryItems = async () => {
        try {
            setIsLoading(true);
            const data = await galleryService.getGalleryItems(undefined, false); // fetch all, including inactive if implemented
            setItems(data);
        } catch (error) {
            toast.error('Failed to load gallery items');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);

        setIsUploading(true);
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
            setNewItem(prev => ({ ...prev, imageUrl: data.url }));
            toast.success('Image uploaded successfully');
        } catch (error) {
            toast.error('Image upload failed');
            setImagePreview(null);
        } finally {
            setIsUploading(false);
        }
    };

    const handleCreateItem = async () => {
        if (!newItem.title || !newItem.imageUrl || !newItem.category) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            await galleryService.createGalleryItem({
                ...newItem,
                isActive: true,
                displayOrder: 0
            });
            toast.success('Gallery item added successfully');
            setIsDialogOpen(false);
            setNewItem({ title: '', category: 'interior', imageUrl: '', description: '' });
            setImagePreview(null);
            fetchGalleryItems();
        } catch (error) {
            toast.error('Failed to add gallery item');
        }
    };

    const handleDeleteItem = async (id: number) => {
        if (!confirm('Are you sure you want to delete this image?')) return;
        try {
            await galleryService.deleteGalleryItem(id);
            toast.success('Image deleted successfully');
            setItems(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            toast.error('Failed to delete image');
        }
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === 'all' || item.category === activeTab;
        return matchesSearch && matchesTab;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-800">Gallery Management</h1>
                    <p className="text-gray-500 mt-1">Manage your website's gallery images</p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className="gradient-coral text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Image
                </Button>
            </div>

            <Tabs defaultValue="all" onValueChange={setActiveTab} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        {CATEGORIES.map(cat => (
                            <TabsTrigger key={cat.id} value={cat.id}>{cat.name}</TabsTrigger>
                        ))}
                    </TabsList>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search images..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>

                <TabsContent value={activeTab} className="mt-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="w-8 h-8 animate-spin text-coral-500" />
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No images found</h3>
                            <p className="text-gray-500">Upload images to populate your gallery</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredItems.map((item) => (
                                <Card key={item.id} className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 shadow-soft">
                                    <div className="relative aspect-[4/3] overflow-hidden">
                                        <img
                                            src={item.imageUrl.startsWith('http') ? item.imageUrl : `http://localhost:5000${item.imageUrl}`}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => handleDeleteItem(item.id)}
                                                className="h-10 w-10 rounded-full"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </Button>
                                        </div>
                                        <div className="absolute top-2 left-2">
                                            <Badge className="bg-white/90 text-gray-900 capitalize hover:bg-white">{item.category}</Badge>
                                        </div>
                                    </div>
                                    <CardContent className="p-4">
                                        <h3 className="font-semibold text-gray-800 truncate" title={item.title}>{item.title}</h3>
                                        <p className="text-xs text-gray-500 mt-1 capitalize">{item.category}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add New Image</DialogTitle>
                        <DialogDescription>Upload an image to your gallery</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Image</Label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-[2/1] rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer overflow-hidden relative"
                            >
                                {imagePreview ? (
                                    <>
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        {isUploading && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                <Loader2 className="w-6 h-6 animate-spin text-white" />
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-8 h-8 text-gray-400" />
                                        <span className="text-sm text-gray-500">Click to upload</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={newItem.title}
                                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                placeholder="e.g. Relaxation Lounge"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={newItem.category}
                                onValueChange={(val) => setNewItem({ ...newItem, category: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateItem} disabled={isUploading} className="gradient-coral text-white">
                            {isUploading ? 'Uploading...' : 'Save Image'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
