import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Search, Plus, Filter, MoreHorizontal, Mail, Phone, Star, Calendar,
  DollarSign, TrendingUp, Award, Edit, Trash2, Eye, Loader2, RefreshCcw,
  User, Briefcase, Settings, Clock, Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { employeeService, type Employee } from '@/services/employeeService';

export function EmployeeManagementPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Form state for editing
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [requiredHours, setRequiredHours] = useState(9);
  const [phone, setPhone] = useState('');
  const [commissionRate, setCommissionRate] = useState(0);
  const [password, setPassword] = useState('');
  const [geofenceBypass, setGeofenceBypass] = useState(false);
  const [geofenceId, setGeofenceId] = useState<string>('any');
  const [geofences, setGeofences] = useState<any[]>([]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getEmployees();
      setEmployees(data);
    } catch (error) {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

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
    fetchEmployees();
    fetchGeofences();
  }, []);

  const handleStatusChange = async (employee: Employee) => {
    const newStatus = employee.status === 'active' || employee.user?.status === 'active' ? 'inactive' : 'active';
    try {
      await employeeService.updateEmployee(employee.id, {
        status: newStatus,
        user: { status: newStatus }
      });
      toast.success(`Employee ${employee.firstName || employee.user?.firstName} is now ${newStatus}`);
      fetchEmployees();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const openEditDialog = (employee: Employee) => {
    setEditingEmployee(employee);
    setFirstName(employee.firstName || employee.user?.firstName || '');
    setLastName(employee.lastName || employee.user?.lastName || '');
    setEmail(employee.email || employee.user?.email || '');
    setDesignation(employee.designation || '');
    setDepartment(employee.department || '');
    setStatus(employee.status || employee.user?.status || 'active');
    setRequiredHours(employee.requiredHours || 9);
    setPhone(employee.phone || employee.user?.phone || '');
    setCommissionRate(employee.commissionRate || 0);
    setPassword(''); // Reset password field
    setGeofenceBypass(employee.geofenceBypass || false);
    setGeofenceId(employee.geofenceId ? employee.geofenceId.toString() : 'any');
    setIsEditOpen(true);
  };

  const handleUpdateEmployee = async () => {
    if (!editingEmployee) return;
    try {
      await employeeService.updateEmployee(editingEmployee.id, {
        designation,
        department,
        firstName,
        lastName,
        email,
        phone,
        status,
        requiredHours,
        commissionRate,
        password: password || undefined,
        geofenceBypass,
        geofenceId: geofenceId === 'any' ? null : parseInt(geofenceId),
        // Send user object for backward compatibility/sync
        user: { firstName, lastName, email, status, phone }
      });
      toast.success('Employee updated successfully');
      setIsEditOpen(false);
      fetchEmployees();
    } catch (error) {
      toast.error('Failed to update employee');
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    if (!confirm('Are you sure you want to PERMANENTLY delete this employee? This action cannot be undone.')) return;
    try {
      await employeeService.deleteEmployee(id);
      toast.success('Employee deleted permanently');
      fetchEmployees();
    } catch (error) {
      toast.error('Failed to delete employee');
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const fName = emp.firstName || emp.user?.firstName || '';
    const lName = emp.lastName || emp.user?.lastName || '';
    const empEmail = emp.email || emp.user?.email || '';

    const matchesSearch =
      fName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      empEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designation?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (emp.status || emp.user?.status || 'active') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Mock performance data mapping
  const getPerformance = (employeeId: number) => {
    // In a real app we'd fetch this from a performance API
    return {
      averageRating: (4 + Math.random()).toFixed(1),
      totalBookings: Math.floor(Math.random() * 100),
      totalRevenue: Math.floor(Math.random() * 5000),
      utilizationRate: Math.floor(Math.random() * 20) + 70
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-800">Employees</h1>
          <p className="text-gray-500 mt-1">Manage your staff and therapists</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-indigo-200 hover:bg-indigo-50" onClick={fetchEmployees}>
            <RefreshCcw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button className="bg-gradient-to-r from-[#4f46e5] to-[#8b5cf6] hover:opacity-90 text-white shadow-md shadow-indigo-500/20" asChild>
            <Link to="/admin/employees/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-soft">
          <CardContent className="p-4">
            <p className="text-3xl font-bold text-indigo-600">{employees.length}</p>
            <p className="text-sm text-gray-500">Total Employees</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-soft">
          <CardContent className="p-4">
            <p className="text-3xl font-bold text-green-500">{employees.filter(e => (e.status || e.user?.status || 'active') === 'active').length}</p>
            <p className="text-sm text-gray-500">Active Staff</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-soft">
          <CardContent className="p-4">
            <p className="text-3xl font-bold text-gray-500">{employees.filter(e => e.status === 'inactive' || e.user?.status === 'inactive').length}</p>
            <p className="text-sm text-gray-500">Inactive</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-soft">
          <CardContent className="p-4">
            <p className="text-3xl font-bold text-purple-500">Avg. Rate</p>
            <p className="text-sm text-gray-500">4.8 / 5.0</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <Tabs defaultValue="all" onValueChange={setStatusFilter}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <TabsList className="bg-gray-100">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
              </TabsList>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
            </div>

            <div className="mt-6">
              {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-indigo-500" /></div>
              ) : (
                <>
                  <div className="hidden lg:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Performance</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEmployees.map((employee) => {
                          const perf = getPerformance(employee.id);
                          const fName = employee.firstName || employee.user?.firstName || 'Unknown';
                          const lName = employee.lastName || employee.user?.lastName || 'Staff';
                          const empEmail = employee.email || employee.user?.email || 'N/A';
                          const empPhone = employee.phone || employee.user?.phone || 'N/A';
                          const empStatus = employee.status || employee.user?.status || 'active';

                          return (
                            <TableRow key={employee.id} className="hover:bg-gray-50">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#4f46e5] to-[#8b5cf6] flex items-center justify-center overflow-hidden">
                                    {employee.profileImage ? (
                                      <img
                                        src={employee.profileImage.startsWith('http') ? employee.profileImage : `http://localhost:5000${employee.profileImage}`}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <span className="text-white font-semibold text-sm">
                                        {fName[0]}{lName[0]}
                                      </span>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-800">
                                      {fName} {lName}
                                    </p>
                                    <p className="text-sm text-gray-500">{`ID: #${employee.id}`}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-sm">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">{empEmail}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">{empPhone}</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <p className="font-medium text-sm">{employee.designation}</p>
                                <p className="text-xs text-indigo-600 font-semibold mt-1 flex items-center gap-1.5">
                                  <Clock className="w-3 h-3" />
                                  Target: {employee.requiredHours || 9}h
                                </p>
                                <p className="text-xs text-gray-400 mt-1">{employee.department}</p>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    <span className="font-medium">{perf.averageRating}</span>
                                    <span className="text-sm text-gray-500">({perf.totalBookings} bookings)</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={cn(
                                  empStatus === 'active' && 'bg-green-100 text-green-600',
                                  empStatus === 'inactive' && 'bg-gray-100 text-gray-600',
                                )}>
                                  {empStatus.charAt(0).toUpperCase() + empStatus.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                      <Link to={`/admin/employees/${employee.id}`}>
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Profile
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openEditDialog(employee)}>
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit Employee
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-orange-500" onClick={() => handleStatusChange(employee)}>
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      {empStatus === 'active' ? 'Deactivate' : 'Activate'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteEmployee(employee.id)}>
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete Permanently
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {filteredEmployees.length === 0 && (
                          <TableRow><TableCell colSpan={6} className="text-center py-10 text-gray-500">No employees found.</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="lg:hidden space-y-4">
                    {filteredEmployees.map((employee) => {
                      const fName = employee.firstName || employee.user?.firstName || 'Unknown';
                      const lName = employee.lastName || employee.user?.lastName || 'Staff';
                      const empStatus = employee.status || employee.user?.status || 'active';
                      return (
                        <Card key={employee.id} className="border border-gray-100 shadow-sm overflow-hidden border-l-4 border-l-indigo-500">
                          <CardContent className="p-4 space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4f46e5] to-[#8b5cf6] flex items-center justify-center shrink-0 shadow-sm">
                                  <span className="text-white font-bold text-lg">
                                    {fName[0]}{lName[0]}
                                  </span>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-gray-900 leading-tight">{fName} {lName}</h3>
                                  </div>
                                  <p className="text-xs font-medium text-indigo-600 uppercase tracking-wider mt-0.5">{employee.designation}</p>
                                </div>
                              </div>
                              <Badge className={cn(
                                "text-[10px] px-2 h-5 rounded-full",
                                empStatus === 'active' && 'bg-green-100 text-green-700 border-green-200',
                                empStatus === 'inactive' && 'bg-gray-100 text-gray-600 border-gray-200',
                              )}>
                                {empStatus.charAt(0).toUpperCase() + empStatus.slice(1)}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-gray-50">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                                  <span className="truncate max-w-[120px]">{employee.email || employee.user?.email || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                                  {employee.phone || employee.user?.phone || 'N/A'}
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" asChild>
                                <Link to={`/admin/employees/${employee.id}`}>Profile</Link>
                              </Button>
                              <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => toast.info(`Schedule...`)}>
                                Schedule
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </Tabs>
        </CardHeader>
      </Card>

      {/* Edit Employee Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto border-0 shadow-2xl">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Edit className="w-6 h-6 text-indigo-500" />
              Update Employee Profile
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Modify account details, roles, and professional configurations.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6">
            {/* Section: Personal Info */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4" />
                Personal Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fname" className="text-gray-700 font-medium">First Name</Label>
                  <Input id="fname" value={firstName} onChange={e => setFirstName(e.target.value)} className="bg-gray-50 focus:bg-white transition-colors" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lname" className="text-gray-700 font-medium">Last Name</Label>
                  <Input id="lname" value={lastName} onChange={e => setLastName(e.target.value)} className="bg-gray-50 focus:bg-white transition-colors" />
                </div>
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input id="email" value={email} onChange={e => setEmail(e.target.value)} className="pl-10 bg-gray-50 focus:bg-white transition-colors" />
                  </div>
                </div>
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label htmlFor="phone" className="text-gray-700 font-medium">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} className="pl-10 bg-gray-50 focus:bg-white transition-colors" />
                  </div>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="pass" className="text-gray-700 font-medium">New Password (Leave blank to keep current)</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input id="pass" type="password" value={password} onChange={e => setPassword(e.target.value)} className="pl-10 bg-gray-50 focus:bg-white transition-colors" placeholder="••••••••" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Professional Info */}
            <div className="space-y-4 pt-2">
              <h4 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Professional Details
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Role / Designation</Label>
                  <Select value={designation} onValueChange={setDesignation}>
                    <SelectTrigger className="bg-gray-50 focus:bg-white transition-colors">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="receptionist">Receptionist</SelectItem>
                      <SelectItem value="therapist">Therapist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Department</Label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger className="bg-gray-50 focus:bg-white transition-colors">
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
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h4 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Working Hours & Earnings
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="requiredHours" className="text-gray-700 font-medium">Daily Required Hours</Label>
                  <Input
                    id="requiredHours"
                    type="number"
                    value={requiredHours}
                    onChange={e => setRequiredHours(parseInt(e.target.value))}
                    className="bg-gray-50 focus:bg-white transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comm" className="text-gray-700 font-medium">Commission Rate (%)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="comm"
                      type="number"
                      value={commissionRate}
                      onChange={e => setCommissionRate(parseFloat(e.target.value))}
                      className="pl-10 bg-gray-50 focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Status & Security */}
            <div className="space-y-4 pt-2">
              <h4 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Account Status & Permissions
              </h4>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2 col-span-2">
                  <Label className="text-gray-700 font-medium">Application Status</Label>
                  <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                    <SelectTrigger className={cn(
                      "transition-colors",
                      status === 'active' ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
                    )}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active" className="text-green-600 font-medium">Active (Full Access)</SelectItem>
                      <SelectItem value="inactive" className="text-red-500 font-medium">Inactive (Restricted)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label className="text-gray-700 font-medium">Work Location (Geofence)</Label>
                  <Select value={geofenceId} onValueChange={setGeofenceId}>
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

                <div className="col-span-2 flex items-center justify-between p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold text-gray-800">Geofence Bypass</Label>
                    <p className="text-xs text-indigo-600">Allow clock-in from any location (even outside geofence)</p>
                  </div>
                  <Switch
                    checked={geofenceBypass}
                    onCheckedChange={setGeofenceBypass}
                    className="data-[state=checked]:bg-indigo-600"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)} className="rounded-xl border-gray-200 hover:bg-gray-50 h-11 px-6 font-medium">
              Cancel
            </Button>
            <Button className="gradient-indigo text-white shadow-lg shadow-indigo-200 rounded-xl h-11 px-8 font-bold" onClick={handleUpdateEmployee}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
