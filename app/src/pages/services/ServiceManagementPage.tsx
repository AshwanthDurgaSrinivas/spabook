import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search, Plus, Filter, MoreHorizontal, Clock, DollarSign, Users, Star,
  Edit, Trash2, Eye, Copy, TrendingUp, Image, Video, Package
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { serviceService, type Service, type ServiceCategory } from '@/services/serviceService';
import { toast } from 'sonner';
import { useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

export function ServiceManagementPage() {
  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [sData, cData] = await Promise.all([
        serviceService.getServices(),
        serviceService.getCategories()
      ]);
      setServicesList(sData);
      setCategories(cData);
    } catch (error) {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredServices = servicesList.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || service.categoryId?.toString() === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleDuplicate = async (serviceId: number) => {
    try {
      const service = await serviceService.getServiceById(serviceId);
      const { id, ...serviceData } = service as any;
      await serviceService.createService({
        ...serviceData,
        name: `${serviceData.name} (Copy)`,
        slug: undefined // Let backend generate new slug
      });
      toast.success('Service duplicated successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to duplicate service');
    }
  };

  const handleDelete = async (serviceId: number) => {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        await serviceService.deleteService(serviceId);
        toast.success('Service deleted successfully');
        fetchData();
      } catch (e) {
        toast.error('Failed to delete service');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-800">Services</h1>
          <p className="text-gray-500 mt-1">Manage your spa services and treatments</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-coral-200 hover:bg-coral-50" onClick={() => toast.info('Service filters coming soon!')}>
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button className="gradient-coral hover:opacity-90 text-white" asChild>
            <Link to="/admin/services/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Link>
          </Button>
        </div>
      </div>

      {/* Service Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-soft cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toast.info('Generating detailed service inventory report...')}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-coral-100 flex items-center justify-center">
              <Package className="w-6 h-6 text-coral-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{servicesList.length}</p>
              <p className="text-sm text-gray-500">Total Services</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-soft cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toast.info('Opening performance analytics...')}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">85%</p>
              <p className="text-sm text-gray-500">Avg. Occupancy</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-soft cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toast.info('Viewing reviews overview...')}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Star className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">4.8</p>
              <p className="text-sm text-gray-500">Avg. Rating</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-soft cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toast.info('Opening financial insights...')}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">$98</p>
              <p className="text-sm text-gray-500">Avg. Price</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Tabs */}
      <Tabs defaultValue="all" onValueChange={setCategoryFilter}>
        <TabsList className="bg-gray-100 flex-wrap h-auto gap-2">
          <TabsTrigger value="all">All Services</TabsTrigger>
          {categories.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id.toString()}>{cat.name}</TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full max-w-md"
            />
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredServices.map((service, index) => (
              <Card
                key={service.id}
                className="border-0 shadow-soft hover-lift overflow-hidden group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Service Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={service.imageUrls && service.imageUrls.length > 0
                      ? (service.imageUrls[0].startsWith('http') ? service.imageUrls[0] : `http://localhost:5000${service.imageUrls[0]}`)
                      : 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800'}
                    alt={service.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <Badge className="bg-coral-500 text-white mb-2">
                      {service.category?.name}
                    </Badge>
                    <h3 className="text-lg font-semibold text-white">{service.name}</h3>
                  </div>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="bg-white/90 hover:bg-white">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/admin/services/${service.id}`)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/admin/services/edit/${service.id}`)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Service
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(service.id)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500"
                          onClick={() => handleDelete(service.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <CardContent className="p-4">
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                    {service.shortDescription || service.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <Clock className="w-4 h-4 mx-auto text-coral-500 mb-1" />
                      <p className="text-xs text-gray-500">{service.durationMinutes} min</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <DollarSign className="w-4 h-4 mx-auto text-green-500 mb-1" />
                      <p className="text-xs text-gray-500">${service.basePrice}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <Star className="w-4 h-4 mx-auto text-yellow-500 mb-1" />
                      <p className="text-xs text-gray-500">{service.popularityScore}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className={cn(
                      service.status === 'active' && 'bg-green-100 text-green-600',
                      service.status === 'inactive' && 'bg-gray-100 text-gray-600',
                      service.status === 'draft' && 'bg-yellow-100 text-yellow-600',
                    )}>
                      {service.status}
                    </Badge>
                    <div className="flex gap-2">
                      {service.isPackage && (
                        <Badge variant="outline" className="text-xs">Package</Badge>
                      )}
                      {service.isAddon && (
                        <Badge variant="outline" className="text-xs">Add-on</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Tabs>

    </div>
  );
}
