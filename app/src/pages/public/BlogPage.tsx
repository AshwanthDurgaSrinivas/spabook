
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ArrowRight, User } from 'lucide-react';

const blogPosts = [
    {
        id: 1,
        title: "10 Benefits of Regular Massage Therapy",
        excerpt: "Discover how incorporating massage into your routine can improve your physical and mental well-being.",
        category: "Wellness",
        author: "Sarah Johnson",
        date: "Feb 15, 2024",
        readTime: "5 min read",
        image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: 2,
        title: "Skincare Myths Debunked: What Really Works?",
        excerpt: "We break down common misconceptions about skincare and reveal the truth behind glowing skin.",
        category: "Beauty",
        author: "Emily Davis",
        date: "Feb 10, 2024",
        readTime: "7 min read",
        image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: 3,
        title: "The Ultimate Guide to Essential Oils",
        excerpt: "Learn about the therapeutic properties of popular essential oils and how to use them safely.",
        category: "Aromatherapy",
        author: "Jessica Lee",
        date: "Feb 05, 2024",
        readTime: "6 min read",
        image: "https://images.unsplash.com/photo-1556228720-1957be979e2c?auto=format&fit=crop&q=80&w=800",
    },
];

export function BlogPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white py-20 border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <Badge className="bg-coral-100 text-coral-600 mb-4 hover:bg-coral-200">Our Blog</Badge>
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6"> wellness & Beauty Insights</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Expert advice, tips, and trends to help you look and feel your best.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogPosts.map((post) => (
                        <Card key={post.id} className="border-0 shadow-soft hover:shadow-xl transition-all duration-300 overflow-hidden group h-full flex flex-col">
                            <div className="h-48 overflow-hidden relative">
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <Badge className="absolute top-4 left-4 bg-white/90 text-gray-900 backdrop-blur-sm shadow-sm hover:bg-white">
                                    {post.category}
                                </Badge>
                            </div>
                            <CardHeader className="flex-1 pb-2">
                                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-coral-500 transition-colors mb-2 line-clamp-2">
                                    {post.title}
                                </h3>
                                <p className="text-gray-600 text-sm line-clamp-3">
                                    {post.excerpt}
                                </p>
                            </CardHeader>
                            <CardFooter className="pt-0 mt-auto border-t border-gray-50 p-6">
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">{post.author}</span>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-coral-500 hover:text-coral-600 hover:bg-coral-50 group/btn">
                                        Read More <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <Button size="lg" variant="outline" className="px-8 border-gray-300">View All Posts</Button>
                </div>
            </div>
        </div>
    );
}
