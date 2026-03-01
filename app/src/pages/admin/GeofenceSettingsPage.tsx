import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    MapPin, Plus, Trash2, Shield,
    UserCheck, UserX, Loader2, Save,
    CheckCircle2, AlertCircle, Info
} from 'lucide-react';
import { geofenceService, type GeofenceLocation } from '@/services/geofenceService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';

export function GeofenceSettingsPage() {
    const [locations, setLocations] = useState<GeofenceLocation[]>([]);
    const [exceptions, setExceptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // New location form
    const [newLoc, setNewLoc] = useState({
        name: '',
        latitude: '',
        longitude: '',
        radius: '100'
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [locs, excs] = await Promise.all([
                geofenceService.getLocations(),
                geofenceService.getExceptions()
            ]);
            setLocations(locs);
            setExceptions(excs);
        } catch (error) {
            toast.error('Failed to load geofencing data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddLocation = async () => {
        if (!newLoc.name || !newLoc.latitude || !newLoc.longitude) {
            toast.error('Please fill in all required fields');
            return;
        }
        try {
            setSaving(true);
            await geofenceService.createLocation({
                name: newLoc.name,
                latitude: Number(newLoc.latitude),
                longitude: Number(newLoc.longitude),
                radius: Number(newLoc.radius),
                isActive: true
            });
            toast.success('Location added successfully');
            setNewLoc({ name: '', latitude: '', longitude: '', radius: '100' });
            fetchData();
        } catch (error) {
            toast.error('Failed to add location');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteLocation = async (id: number) => {
        if (!confirm('Are you sure you want to delete this location?')) return;
        try {
            await geofenceService.deleteLocation(id);
            toast.success('Location deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete location');
        }
    };

    const toggleException = async (employeeId: number, currentStatus: boolean) => {
        try {
            await geofenceService.updateException(employeeId, !currentStatus);
            toast.success('Exception status updated');
            fetchData();
        } catch (error) {
            toast.error('Failed to update exception');
        }
    };

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }
        toast.info('Detecting your current coordinates...');
        navigator.geolocation.getCurrentPosition((position) => {
            setNewLoc(prev => ({
                ...prev,
                latitude: position.coords.latitude.toString(),
                longitude: position.coords.longitude.toString()
            }));
            toast.success('Location detected!');
        }, (error) => {
            toast.error('Could not detect location: ' + error.message);
        });
    };

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-3xl font-display font-bold text-gray-800">Geofencing Settings</h1>
                <p className="text-gray-500 mt-2">Manage authorized work locations and employee exceptions for attendance tracking.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Locations Management */}
                <div className="xl:col-span-2 space-y-6">
                    <Card className="border-0 shadow-soft overflow-hidden">
                        <CardHeader className="border-b border-gray-50 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-indigo-500" />
                                    Work Locations
                                </CardTitle>
                                <CardDescription>Multiple authorized office locations</CardDescription>
                            </div>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="gradient-indigo text-white shadow-indigo shadow-sm font-medium">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Location
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add New Work Location</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Location Name</Label>
                                            <Input
                                                placeholder="e.g. Main Office"
                                                value={newLoc.name}
                                                onChange={e => setNewLoc({ ...newLoc, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Latitude</Label>
                                                <Input
                                                    type="number"
                                                    placeholder="0.000000"
                                                    value={newLoc.latitude}
                                                    onChange={e => setNewLoc({ ...newLoc, latitude: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Longitude</Label>
                                                <Input
                                                    type="number"
                                                    placeholder="0.000000"
                                                    value={newLoc.longitude}
                                                    onChange={e => setNewLoc({ ...newLoc, longitude: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Allowed Radius (meters)</Label>
                                            <Input
                                                type="number"
                                                value={newLoc.radius}
                                                onChange={e => setNewLoc({ ...newLoc, radius: e.target.value })}
                                            />
                                        </div>
                                        <Button variant="outline" className="w-full flex items-center justify-center gap-2" onClick={getCurrentLocation}>
                                            <MapPin className="w-4 h-4" />
                                            Detect My Current Location
                                        </Button>
                                    </div>
                                    <DialogFooter>
                                        <Button className="w-full gradient-indigo text-white" onClick={handleAddLocation} disabled={saving}>
                                            {saving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                            Save Location
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                                    <p className="text-gray-500 mt-4">Loading locations...</p>
                                </div>
                            ) : locations.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                        <MapPin className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800">No locations configured</h3>
                                    <p className="text-gray-500 max-w-xs mt-1">If no locations are configured, employees can clock in from anywhere.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {locations.map(loc => (
                                        <div key={loc.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mt-1">
                                                    <MapPin className="w-5 h-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-800">{loc.name}</h3>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Coords: {loc.latitude.toString().slice(0, 8)}, {loc.longitude.toString().slice(0, 8)}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <Badge variant="outline" className="text-xs font-normal border-indigo-100 bg-indigo-50/30 text-indigo-700">
                                                            {loc.radius}m radius
                                                        </Badge>
                                                        {loc.isActive ? (
                                                            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 text-xs font-normal">Active</Badge>
                                                        ) : (
                                                            <Badge className="bg-gray-50 text-gray-500 border-gray-100 text-xs font-normal">Inactive</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteLocation(loc.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-soft bg-indigo-900 text-white overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                                    <Shield className="w-8 h-8 text-indigo-300" />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-xl font-bold">How Geofencing works?</h3>
                                    <p className="text-indigo-200 mt-1">
                                        Once you add at least one location, employees will be required to share their GPS coordinates to Clock In or Clock Out.
                                        The system will verify if they are within any of the authorized work radiuses.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Exceptions Management */}
                <div className="space-y-6">
                    <Card className="border-0 shadow-soft">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-indigo-500" />
                                Exceptions
                            </CardTitle>
                            <CardDescription>Employees who can clock in from anywhere</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-gray-300" /></div>
                            ) : exceptions.length === 0 ? (
                                <div className="p-8 text-center text-gray-400">
                                    <UserX className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">No special exceptions granted yet.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {exceptions.map(emp => (
                                        <div key={emp.id} className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                                    {emp.firstName?.[0] || 'E'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800">{emp.firstName} {emp.lastName}</p>
                                                    <p className="text-xs text-indigo-600 font-medium">Bypass Enabled</p>
                                                </div>
                                            </div>
                                            <Button size="icon" variant="ghost" className="text-gray-400 hover:text-red-500 hover:bg-red-50" onClick={() => toggleException(emp.id, true)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-soft border-l-4 border-l-yellow-400 bg-yellow-50/50">
                        <CardContent className="p-4">
                            <div className="flex gap-3">
                                <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
                                <div className="text-sm text-yellow-800">
                                    <p className="font-bold mb-1">Granting new exceptions</p>
                                    <p>Go to the <b>Employee Management</b> page to flip the "Geofence Bypass" switch for specific employees.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
