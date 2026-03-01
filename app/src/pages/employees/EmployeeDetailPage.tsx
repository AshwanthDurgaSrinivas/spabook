import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    ChevronLeft, Mail, Phone, Calendar,
    Award, Star, Clock, DollarSign,
    Target, History, Settings, Edit,
    Loader2, User, MapPin
} from 'lucide-react';
import { employeeService, type Employee } from '@/services/employeeService';
import { toast } from 'sonner';

export function EmployeeDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEmployee = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await employeeService.getEmployeeById(parseInt(id));
                setEmployee(data);
            } catch (error) {
                toast.error('Failed to load employee details');
                navigate('/admin/employees');
            } finally {
                setLoading(false);
            }
        };
        fetchEmployee();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (!employee) return null;

    const profileImage = employee.profileImage
        ? (employee.profileImage.startsWith('http') ? employee.profileImage : `http://localhost:5000${employee.profileImage}`)
        : null;

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-12">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-display font-bold text-gray-800">
                            {(employee.firstName || employee.user?.firstName) ? `${employee.firstName || employee.user?.firstName} ${employee.lastName || employee.user?.lastName}` : 'Unknown Employee'}
                        </h1>
                        <p className="text-gray-500">{employee.designation} • {employee.department}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => toast.info('Edit drawer usually opens from list, or implement here')}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Column: Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-0 shadow-soft overflow-hidden">
                        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600" />
                        <CardContent className="pt-0 px-6 pb-6 mt-[-64px] text-center">
                            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden shadow-xl mx-auto bg-gray-100 flex items-center justify-center">
                                {profileImage ? (
                                    <img src={profileImage} alt="profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-16 h-16 text-gray-300" />
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 mt-4">
                                {(employee.firstName || employee.user?.firstName) ? `${employee.firstName || employee.user?.firstName} ${employee.lastName || employee.user?.lastName}` : 'Unknown'}
                            </h2>
                            <Badge className={(employee.user?.status === 'active' || !employee.user) ? 'bg-green-100 text-green-600 mt-2' : 'bg-gray-100 text-gray-600 mt-2'}>
                                {employee.user?.status || 'Active'}
                            </Badge>

                            <div className="mt-8 space-y-4 pt-6 border-t border-gray-100 text-left">
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="w-4 h-4 text-indigo-500" />
                                    <span className="text-gray-600 truncate">{employee.email || employee.user?.email || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="w-4 h-4 text-indigo-500" />
                                    <span className="text-gray-600">{employee.phone || employee.user?.phone || 'No phone provided'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <MapPin className="w-4 h-4 text-indigo-500" />
                                    <span className="text-gray-600">Headquarters, Office 302</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-soft">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold uppercase text-gray-400 tracking-wider">Employment info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Commission Rate</span>
                                <span className="font-bold text-gray-800">{employee.commissionRate}%</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-gray-50 pt-3">
                                <span className="text-sm text-gray-500">Daily Target</span>
                                <span className="font-bold text-gray-800">{employee.requiredHours || 9} hrs</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Performance & History */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="border-0 shadow-soft">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <Star className="w-5 h-5 text-yellow-500" />
                                    <span className="text-sm font-medium text-gray-500">Avg. Rating</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-800">4.9</p>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-soft">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <Clock className="w-5 h-5 text-blue-500" />
                                    <span className="text-sm font-medium text-gray-500">Utilization</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-800">88%</p>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-soft">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <DollarSign className="w-5 h-5 text-green-500" />
                                    <span className="text-sm font-medium text-gray-500">Monthly Rev</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-800">$4,250</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border-0 shadow-soft">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-bold">Key Performance Indicators</CardTitle>
                            <Button variant="ghost" size="sm" className="text-indigo-600">View Detailed Analytics</Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Customer Retention</span>
                                    <span className="font-bold text-gray-800">76%</span>
                                </div>
                                <Progress value={76} className="h-2 bg-gray-100" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Sales Target</span>
                                    <span className="font-bold text-gray-800">92%</span>
                                </div>
                                <Progress value={92} className="h-2 bg-gray-100" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Attendance Rate</span>
                                    <span className="font-bold text-gray-800">100%</span>
                                </div>
                                <Progress value={100} className="h-2 bg-gray-100" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-soft">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Upcoming Schedule</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-gray-100">
                                {[1, 2, 3].map((_, i) => (
                                    <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">Swedish Massage</p>
                                                <p className="text-sm text-gray-500">Feb 24, 2024 • 10:00 AM - 11:30 AM</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="text-indigo-600 border-indigo-100 bg-indigo-50">Confirmed</Badge>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 bg-gray-50 text-center">
                                <Button variant="link" className="text-indigo-600 font-bold">View Full Calendar</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
