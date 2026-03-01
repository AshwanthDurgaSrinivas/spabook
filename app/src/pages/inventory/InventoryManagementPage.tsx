import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Package, Plus, Search, Filter, AlertTriangle, TrendingDown, TrendingUp,
  ShoppingCart, Truck, Eye, Loader2, Trash2, Edit, Copy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { productService, type Product } from '@/services/productService';


export function InventoryManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isPurchaseOrderOpen, setIsPurchaseOrderOpen] = useState(false);
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);

  // Form state
  const [pname, setPname] = useState('');
  const [pcategory, setPcategory] = useState('Skincare');
  const [psku, setPsku] = useState('');
  const [pqty, setPqty] = useState('0');
  const [pprice, setPprice] = useState('0.00');
  const [pcost, setPcost] = useState('0.00');
  const [pminStock, setPminStock] = useState('5');

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const stockData = useMemo(() => {
    const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);
    return categories.map(cat => {
      const catProducts = products.filter(p => p.category === cat);
      return {
        name: cat,
        inStock: catProducts.filter(p => p.stock > p.minStock).length,
        lowStock: catProducts.filter(p => p.stock > 0 && p.stock <= p.minStock).length,
        outOfStock: catProducts.filter(p => p.stock <= 0).length
      };
    });
  }, [products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreateProduct = async () => {
    try {
      if (!pname || !psku) {
        toast.error('Name and SKU are required');
        return;
      }
      await productService.createProduct({
        name: pname,
        category: pcategory,
        sku: psku,
        stock: parseInt(pqty),
        price: parseFloat(pprice),
        cost: parseFloat(pcost),
        minStock: parseInt(pminStock),
        isActive: true
      });
      toast.success('Product added successfully!');
      setIsAddProductOpen(false);
      // Reset form
      setPname('');
      setPsku('');
      setPqty('0');
      setPprice('0.00');
      setPcost('0.00');
      setPminStock('5');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to add product');
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    try {
      await productService.updateProduct(editingProduct.id, {
        name: pname,
        category: pcategory,
        sku: psku,
        stock: parseInt(pqty),
        price: parseFloat(pprice),
        cost: parseFloat(pcost),
        minStock: parseInt(pminStock)
      });
      toast.success('Product updated successfully!');
      setIsEditOpen(false);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update product');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await productService.deleteProduct(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleDuplicateProduct = async (product: Product) => {
    try {
      const { id, ...prodData } = product;
      await productService.createProduct({
        ...prodData,
        name: `${prodData.name} (Copy)`,
        sku: `${prodData.sku}-COPY-${Math.floor(Math.random() * 1000)}`
      });
      toast.success('Product duplicated');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to duplicate product');
    }
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setPname(product.name);
    setPcategory(product.category);
    setPsku(product.sku || '');
    setPqty(product.stock.toString());
    setPprice(product.price.toString());
    setPcost(product.cost.toString());
    setPminStock(product.minStock.toString());
    setIsEditOpen(true);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (product: Product) => {
    if (product.stock <= 0) return { label: 'Out of Stock', color: 'bg-red-500' };
    if (product.stock <= product.minStock) return { label: 'Low Stock', color: 'bg-yellow-500' };
    return { label: 'In Stock', color: 'bg-green-500' };
  };

  const totalProducts = products.length;
  const inStock = products.filter(p => p.stock > p.minStock).length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
  const outOfStock = products.filter(p => p.stock <= 0).length;

  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-800">Inventory</h1>
          <p className="text-gray-500 mt-1">Manage products, stock levels, and suppliers</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-coral-200 hover:bg-coral-50" onClick={fetchProducts}>
            <Loader2 className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>

          {/* Add Product Dialog */}
          <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-coral hover:opacity-90 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Enter details for the new inventory item.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="pname">Product Name</Label>
                  <Input id="pname" placeholder="e.g. Essential Oil" value={pname} onChange={e => setPname(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={pcategory} onValueChange={setPcategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Skincare">Skincare</SelectItem>
                      <SelectItem value="Massage Oils">Massage Oils</SelectItem>
                      <SelectItem value="Nail Care">Nail Care</SelectItem>
                      <SelectItem value="Hair Removal">Hair Removal</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="psku">SKU</Label>
                  <Input id="psku" placeholder="SKU-001" value={psku} onChange={e => setPsku(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pqty">Initial Stock</Label>
                  <Input id="pqty" type="number" placeholder="0" value={pqty} onChange={e => setPqty(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pmin">Min. Stock Level</Label>
                  <Input id="pmin" type="number" placeholder="5" value={pminStock} onChange={e => setPminStock(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pprice">Selling Price ($)</Label>
                  <Input id="pprice" type="number" placeholder="0.00" value={pprice} onChange={e => setPprice(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pcost">Cost Price ($)</Label>
                  <Input id="pcost" type="number" placeholder="0.00" value={pcost} onChange={e => setPcost(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddProductOpen(false)}>Cancel</Button>
                <Button className="gradient-coral text-white" onClick={handleCreateProduct}>Save Product</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Product Dialog */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Edit Product</DialogTitle>
                <DialogDescription>
                  Update details for {editingProduct?.name}.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="ename">Product Name</Label>
                  <Input id="ename" placeholder="e.g. Essential Oil" value={pname} onChange={e => setPname(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={pcategory} onValueChange={setPcategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Skincare">Skincare</SelectItem>
                      <SelectItem value="Massage Oils">Massage Oils</SelectItem>
                      <SelectItem value="Nail Care">Nail Care</SelectItem>
                      <SelectItem value="Hair Removal">Hair Removal</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="esku">SKU</Label>
                  <Input id="esku" placeholder="SKU-001" value={psku} onChange={e => setPsku(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eqty">Stock Level</Label>
                  <Input id="eqty" type="number" placeholder="0" value={pqty} onChange={e => setPqty(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emin">Min. Stock Level</Label>
                  <Input id="emin" type="number" placeholder="5" value={pminStock} onChange={e => setPminStock(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eprice">Selling Price ($)</Label>
                  <Input id="eprice" type="number" placeholder="0.00" value={pprice} onChange={e => setPprice(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ecost">Cost Price ($)</Label>
                  <Input id="ecost" type="number" placeholder="0.00" value={pcost} onChange={e => setPcost(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                <Button className="gradient-coral text-white" onClick={handleUpdateProduct}>Update Product</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: totalProducts.toString(), icon: Package, color: 'coral' },
          { label: 'In Stock', value: inStock.toString(), icon: TrendingUp, color: 'green' },
          { label: 'Low Stock', value: lowStock.toString(), icon: AlertTriangle, color: 'yellow' },
          { label: 'Out of Stock', value: outOfStock.toString(), icon: TrendingDown, color: 'red' },
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
      <Tabs defaultValue="products">
        <TabsList className="bg-gray-100">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="stock">Stock Levels</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6 mt-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <Button variant="outline" onClick={() => toast.info('Advanced filter options coming soon!')}>
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Products Table */}
          <Card className="border-0 shadow-soft">
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-coral-500" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Product</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">SKU</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Category</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Stock</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Price</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => {
                        const stockStatus = getStockStatus(product);
                        const maxStock = product.minStock * 4; // Mock max for progress bar
                        return (
                          <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                  <Package className="w-5 h-5 text-gray-400" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">{product.name}</p>
                                  <p className="text-sm text-gray-500 opacity-60">ID: #{product.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm text-gray-600">{product.sku}</p>
                            </td>
                            <td className="py-4 px-4">
                              <Badge variant="secondary">{product.category}</Badge>
                            </td>
                            <td className="py-4 px-4">
                              <div className="w-24">
                                <div className="flex justify-between text-sm mb-1">
                                  <span>{product.stock}</span>
                                  <span className="text-gray-400">/ {maxStock}</span>
                                </div>
                                <Progress
                                  value={(product.stock / maxStock) * 100}
                                  className="h-1.5"
                                />
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div>
                                <p className="font-medium">${product.price}</p>
                                <p className="text-sm text-gray-500">Cost: ${product.cost}</p>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <Badge className={cn('text-white', stockStatus.color)}>
                                {stockStatus.label}
                              </Badge>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)}>
                                  <Edit className="w-4 h-4 text-indigo-500" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDuplicateProduct(product)}>
                                  <Copy className="w-4 h-4 text-emerald-500" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)}>
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredProducts.length === 0 && (
                        <tr><td colSpan={7} className="text-center py-10 text-gray-500">No products found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stock" className="space-y-6 mt-6">
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Stock Level by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stockData}>
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
                    <Bar dataKey="inStock" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="lowStock" fill="#eab308" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="outOfStock" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

