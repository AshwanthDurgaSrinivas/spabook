


import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  Search, Plus, Filter, MoreHorizontal, Mail, Phone, Calendar, DollarSign,
  UserCheck, Edit, Eye, MessageSquare, Gift, Award, Loader2, Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { customerService, type Customer } from '@/services/customerService';
import { toast } from 'sonner';
import { membershipService, type MembershipPlan } from '@/services/membershipService';
import { useAuth } from '@/contexts/AuthContext';

// No longer using hardcoded segments

export function CustomerManagementPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [customersList, setCustomersList] = useState<Customer[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('all');

  const isAdmin = ['admin', 'manager', 'receptionist', 'super_admin'].includes(user?.role || '');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cData, pData] = await Promise.all([
          customerService.getCustomers(),
          membershipService.getPlans()
        ]);
        setCustomersList(cData);
        setPlans(pData);
      } catch (error) {
        toast.error('Failed to load customers or plans');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredCustomers = customersList.filter(customer => {
    const matchesSearch =
      customer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.includes(searchQuery);

    let matchesPlan = true;
    if (planFilter === 'regular') {
      matchesPlan = !(customer as any).hasActiveMembership;
    } else if (planFilter !== 'all') {
      matchesPlan = (customer as any).membershipPlan === planFilter;
    }
    return matchesSearch && matchesPlan;
  });

  const fetchCustomers = async () => {
    const data = await customerService.getCustomers();
    setCustomersList(data);
  };

  const handleDeleteCustomer = async (id: number) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      await customerService.deleteCustomer(id);
      toast.success('Customer deleted successfully');
      fetchCustomers();
    } catch (error) {
      toast.error('Failed to delete customer');
    }
  };

  const getSegmentBadge = (customer: any) => {
    if (customer.hasActiveMembership) {
      const planName = customer.membershipPlan || 'Member';
      return (
        <Badge className="bg-emerald-500 text-white flex items-center gap-1">
          <Award className="w-3 h-3" /> {planName}
        </Badge>
      );
    }
    return (
      <Badge className="bg-blue-400 text-white">
        Regular
      </Badge>
    );
  };

  const getCustomerData = (customer: Customer) => ({
    customerCode: customer.customerCode || `CUST-${customer.id.toString().padStart(4, '0')}`,
    segment: customer.segment || 'new',
    lifetimeValue: customer.lifetimeValue || 0,
    averageOrderValue: customer.averageOrderValue || 0,
    totalVisits: customer.totalVisits || 0,
    lastVisitDate: customer.lastVisitDate || 'N/A'
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-800">Customers</h1>
          <p className="text-gray-500 mt-1">Manage your customer relationships</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-coral-200 hover:bg-coral-50" onClick={() => toast.info('Customer filtering options coming soon!')}>
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          {isAdmin && (
            <Button className="gradient-coral hover:opacity-90 text-white" asChild>
              <Link to="/admin/customers/new">
                <Plus className="w-4 h-4 mr-2" />
                Add Customer
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-0 shadow-soft cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setPlanFilter('all')}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-coral-500">{customersList.length}</p>
            <p className="text-sm text-gray-500">Total</p>
          </CardContent>
        </Card>

        {plans.map(plan => (
          <Card key={plan.id} className="border-0 shadow-soft cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setPlanFilter(plan.name)}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-emerald-500">
                {customersList.filter(c => (c as any).membershipPlan === plan.name).length}
              </p>
              <p className="text-sm text-gray-500 truncate">{plan.name}</p>
            </CardContent>
          </Card>
        ))}

        <Card className="border-0 shadow-soft cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setPlanFilter('regular')}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">
              {customersList.filter(c => !(c as any).hasActiveMembership).length}
            </p>
            <p className="text-sm text-gray-500">Regular</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <Tabs defaultValue="all" value={planFilter} onValueChange={setPlanFilter}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-x-auto">
              <TabsList className="bg-gray-100 h-auto">
                <TabsTrigger value="all">All Customers</TabsTrigger>
                {plans.map(plan => (
                  <TabsTrigger key={plan.id} value={plan.name}>{plan.name}</TabsTrigger>
                ))}
                <TabsTrigger value="regular">Regular</TabsTrigger>
              </TabsList>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
            </div>

            <div className="mt-6">
              {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-coral-500" /></div>
              ) : (
                <>
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Segment</TableHead>
                          <TableHead>Lifetime Value</TableHead>
                          <TableHead>Visits</TableHead>
                          <TableHead>Last Visit</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCustomers.map((customer) => {
                          const data = getCustomerData(customer);
                          return (
                            <TableRow key={customer.id} className="hover:bg-gray-50">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full gradient-coral flex items-center justify-center">
                                    <span className="text-white font-semibold text-sm">
                                      {customer.firstName[0]}{customer.lastName[0]}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-800">
                                      {customer.firstName} {customer.lastName}
                                    </p>
                                    <p className="text-sm text-gray-500">{data.customerCode}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-sm">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">{customer.email}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">{customer.phone}</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{getSegmentBadge(customer)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4 text-green-500" />
                                  <span className="font-medium">{data.lifetimeValue.toLocaleString()}</span>
                                </div>
                                <p className="text-sm text-gray-500">
                                  Avg: ${data.averageOrderValue}
                                </p>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <UserCheck className="w-4 h-4 text-coral-500" />
                                  <span className="font-medium">{data.totalVisits}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-600">{data.lastVisitDate}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="w-4 h-4 text-gray-400" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem asChild>
                                      <Link to={`/admin/customers/${customer.id}`} className="flex items-center">
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Profile
                                      </Link>
                                    </DropdownMenuItem>
                                    {isAdmin && (
                                      <>
                                        <DropdownMenuItem onClick={() => navigate(`/admin/customers/edit/${customer.id}`)}>
                                          <Edit className="w-4 h-4 mr-2" />
                                          Edit Customer
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteCustomer(customer.id)}>
                                          <Trash2 className="w-4 h-4 mr-2" />
                                          Delete Customer
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {filteredCustomers.length === 0 && (
                          <TableRow><TableCell colSpan={7} className="text-center py-10 text-gray-500">No customers found.</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-4">
                    {filteredCustomers.map((customer) => {
                      const data = getCustomerData(customer);
                      return (
                        <Card key={customer.id} className="border border-gray-100 shadow-sm">
                          <CardContent className="p-4 space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full gradient-coral flex items-center justify-center shrink-0">
                                  <span className="text-white font-semibold text-sm">
                                    {customer.firstName[0]}{customer.lastName[0]}
                                  </span>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-gray-800">{customer.firstName} {customer.lastName}</h3>
                                  </div>
                                  <p className="text-xs text-gray-500">{data.customerCode}</p>
                                </div>
                              </div>
                              {getSegmentBadge(customer)}
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-gray-50">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                                  <span className="truncate max-w-[120px]">{customer.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                                  {customer.phone}
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-xs text-gray-900 font-medium">
                                  <DollarSign className="w-3.5 h-3.5 text-green-500" />
                                  ${data.lifetimeValue.toLocaleString()}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                  Last: {data.lastVisitDate}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </Tabs>
        </CardHeader>
      </Card>

      {/* Featured Customers / Recent Customers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.slice(0, 3).map((customer) => {
          const data = getCustomerData(customer);
          return (
            <Card key={customer.id} className="border-0 shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full gradient-coral flex items-center justify-center flex-shrink-0 text-white font-bold text-xl">
                    {customer.firstName[0]}{customer.lastName[0]}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{customer.firstName} {customer.lastName}</h3>
                    <p className="text-gray-500 text-sm truncate">{customer.email}</p>
                    <div className="mt-2">
                      {getSegmentBadge(customer)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-2 bg-gray-50 rounded-xl">
                    <p className="text-lg font-bold text-coral-500">
                      ${data.lifetimeValue.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">LTV</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-xl">
                    <p className="text-lg font-bold text-blue-500">
                      {data.totalVisits}
                    </p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Visits</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-xl">
                    <p className="text-lg font-bold text-green-500">
                      ${data.averageOrderValue}
                    </p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Avg</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link to={`/admin/customers/${customer.id}`}>Details</Link>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link to={`/admin/bookings/new?customer=${customer.id}`}>Book</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
