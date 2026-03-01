import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ZoomIn, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { galleryService, type GalleryItem } from '@/services/galleryService';

const galleryCategories = [
    { id: 'all', name: 'All' },
    { id: 'interior', name: 'Interior' },
    { id: 'treatments', name: 'Treatments' },
    { id: 'products', name: 'Products' },
];

export function GalleryPage() {
    const [images, setImages] = useState<GalleryItem[]>([]);
    const [filter, setFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                setIsLoading(true);
                const data = await galleryService.getGalleryItems();
                setImages(data);
            } catch (error) {
                console.error('Failed to fetch gallery:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchImages();
    }, []);

    const filteredImages = filter === 'all'
        ? images
        : images.filter(img => img.category === filter);

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="relative h-[40vh] bg-gray-900 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=2000"
                        alt="Gallery Hero"
                        className="w-full h-full object-cover opacity-40"
                    />
                </div>
                <div className="relative z-10 text-center text-white px-4">
                    <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Our Gallery</h1>
                    <p className="text-xl max-w-2xl mx-auto text-gray-200">
                        Take a visual journey through our tranquil spaces and restorative treatments.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Filters */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    {galleryCategories.map((category) => (
                        <Button
                            key={category.id}
                            variant={filter === category.id ? "default" : "outline"}
                            onClick={() => setFilter(category.id)}
                            className={`rounded-full px-6 ${filter === category.id
                                ? 'bg-coral-500 hover:bg-coral-600 text-white border-coral-500'
                                : 'border-gray-300 text-gray-600 hover:border-coral-300 hover:text-coral-500'
                                }`}
                        >
                            {category.name}
                        </Button>
                    ))}
                </div>

                {/* Gallery Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 animate-spin text-coral-500" />
                    </div>
                ) : (
                    <motion.div
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        <AnimatePresence>
                            {filteredImages.map((image) => (
                                <motion.div
                                    layout
                                    key={image.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="group relative rounded-2xl overflow-hidden shadow-lg cursor-pointer aspect-[4/3]"
                                >
                                    <img
                                        src={image.imageUrl.startsWith('http') ? image.imageUrl : `http://localhost:5000${image.imageUrl}`}
                                        alt={image.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white">
                                        <h3 className="text-2xl font-bold mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{image.title}</h3>
                                        <Badge variant="outline" className="text-white border-white translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75 capitalize">
                                            {image.category}
                                        </Badge>
                                        <Button size="icon" variant="secondary" className="mt-4 rounded-full w-12 h-12 translate-y-8 group-hover:translate-y-0 transition-transform duration-300 delay-100">
                                            <ZoomIn className="w-5 h-5 text-gray-900" />
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
