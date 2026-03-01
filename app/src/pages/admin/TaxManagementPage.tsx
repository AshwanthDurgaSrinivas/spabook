import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Plus,
    Trash2,
    Edit2,
    Save,
    X,
    Percent,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { taxService, type Tax } from '@/services/taxService';
import { toast } from 'sonner';

export function TaxManagementPage() {
    const [taxes, setTaxes] = useState<Tax[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<Tax>>({
        name: '',
        rate: 0,
        isActive: true
    });

    useEffect(() => {
        fetchTaxes();
    }, []);

    const fetchTaxes = async () => {
        try {
            const data = await taxService.getTaxes();
            setTaxes(data);
        } catch (error) {
            toast.error('Failed to fetch taxes');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name || formData.rate === undefined) {
            toast.error('Please fill in all fields');
            return;
        }

        try {
            if (editingId) {
                await taxService.updateTax(editingId, formData);
                toast.success('Tax updated successfully');
            } else {
                await taxService.createTax(formData);
                toast.success('Tax created successfully');
            }
            setIsAdding(false);
            setEditingId(null);
            setFormData({ name: '', rate: 0, isActive: true });
            fetchTaxes();
        } catch (error) {
            toast.error('Failed to save tax');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this tax?')) return;
        try {
            await taxService.deleteTax(id);
            toast.success('Tax deleted successfully');
            fetchTaxes();
        } catch (error) {
            toast.error('Failed to delete tax');
        }
    };

    const startEdit = (tax: Tax) => {
        setEditingId(tax.id);
        setFormData({ name: tax.name, rate: tax.rate, isActive: tax.isActive });
        setIsAdding(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tax Management</h1>
                    <p className="text-gray-500 mt-1">Configure multiple tax rates and rules for your services</p>
                </div>
                {!isAdding && (
                    <Button
                        onClick={() => {
                            setIsAdding(true);
                            setEditingId(null);
                            setFormData({ name: '', rate: 0, isActive: true });
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add New Tax
                    </Button>
                )}
            </div>

            {isAdding && (
                <Card className="border-2 border-indigo-100 bg-indigo-50/30">
                    <CardHeader>
                        <CardTitle className="text-lg">
                            {editingId ? 'Edit Tax Rate' : 'Add New Tax Rate'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label>Tax Name (e.g., GST, Service Tax)</Label>
                                <Input
                                    placeholder="Enter tax name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Rate (%)</Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        step="0.01"
                                        value={formData.rate}
                                        onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) })}
                                        className="pr-8"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                                        <Percent className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-end gap-3">
                                <div className="flex-1 flex items-center justify-between p-2 bg-white rounded-lg border">
                                    <Label className="cursor-pointer">Active</Label>
                                    <Switch
                                        checked={formData.isActive}
                                        onCheckedChange={(val) => setFormData({ ...formData, isActive: val })}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="icon" onClick={() => setIsAdding(false)}>
                                        <X className="w-4 h-4 text-gray-500" />
                                    </Button>
                                    <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
                                        <Save className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {taxes.map((tax) => (
                    <Card key={tax.id} className={cn(
                        "transition-all border-l-4",
                        tax.isActive ? "border-l-green-500" : "border-l-gray-300"
                    )}>
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{tax.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-2xl font-display font-bold text-indigo-600">
                                            {tax.rate}%
                                        </span>
                                        {!tax.isActive && (
                                            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium uppercase tracking-wider">
                                                Inactive
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => startEdit(tax)}>
                                        <Edit2 className="w-4 h-4 text-gray-400 hover:text-indigo-600" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(tax.id)}>
                                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {taxes.length === 0 && !isAdding && (
                    <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No Taxes Configured</h3>
                        <p className="text-gray-500">Currently, prices will be calculated with 0% tax.</p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => setIsAdding(true)}
                        >
                            Add Your First Tax
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
