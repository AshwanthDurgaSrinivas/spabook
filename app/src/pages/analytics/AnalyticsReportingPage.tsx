import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Users, DollarSign, Calendar,
  Star, Download, ArrowUpRight, ArrowDownRight, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Line
} from 'recharts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import { analyticsService } from '@/services/analyticsService';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { type DashboardStats, type RevenueData, type ServicePerformance, type EmployeePerformance } from '@/types';

export function AnalyticsReportingPage() {
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<RevenueData[]>([]);
  const [services, setServices] = useState<ServicePerformance[]>([]);
  const [employees, setEmployees] = useState<EmployeePerformance[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashboardData, servicesData, employeesData] = await Promise.all([
          analyticsService.getDashboardStats(),
          analyticsService.getServicePerformance(),
          analyticsService.getEmployeePerformance()
        ]);

        setStats(dashboardData.stats);

        // Format date to local string or month
        const formattedRevenue = dashboardData.revenueData.map(item => ({
          ...item,
          displayName: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        }));
        setRevenueTrend(formattedRevenue as any);
        setServices(servicesData);
        setEmployees(employeesData);
      } catch (error) {
        console.error('Failed to fetch analytics', error);
        toast.error('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [timeRange]);

  const exportPDF = async () => {
    if (!stats) return;

    try {
      const toastId = toast.loading('Generating premium PDF report...');
      const element = document.getElementById('analytics-dashboard');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // Header
      pdf.setFillColor(240, 128, 128); // Coral color
      pdf.rect(0, 0, pdfWidth, 40, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.text('Sparkle Lounge Analytics Report', 15, 25);
      pdf.setFontSize(10);
      pdf.text(`Generated on: ${new Date().toLocaleString()} | Period: ${timeRange}`, 15, 33);

      // Dashboard Content
      pdf.addImage(imgData, 'PNG', 0, 45, pdfWidth, pdfHeight);

      // Footer
      const pageCount = pdf.internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setTextColor(150);
        pdf.setFontSize(8);
        pdf.text(`Page ${i} of ${pageCount} | Sparkle Beauty Lounge Business Intelligence`, pdfWidth / 2, pdf.internal.pageSize.getHeight() - 10, { align: 'center' });
      }

      pdf.save(`Sparkle_Lounge_Report_${timeRange}_${new Date().getTime()}.pdf`);
      toast.dismiss(toastId);
      toast.success('Professional PDF report generated!');
    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast.error('Failed to generate PDF report');
    }
  };

  const exportCSV = () => {
    if (!stats) return;

    let csv = 'Metric,Value\n';
    csv += `Total Revenue,${stats.totalRevenue}\n`;
    csv += `Total Bookings,${stats.totalBookings}\n`;
    csv += `New Customers,${stats.newCustomers}\n`;
    csv += `Average Rating,${stats.averageRating}\n`;
    csv += '\nRevenue Breakdown\nDate,Revenue,Bookings\n';
    revenueTrend.forEach(row => {
      csv += `${row.date},${row.revenue},${row.bookings}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `analytics_report_${timeRange}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Report exported as CSV');
  };

  const kpiCards = stats ? [
    { label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, change: `+${stats.revenueChange}%`, trend: stats.revenueChange >= 0 ? 'up' : 'down', icon: DollarSign },
    { label: 'Total Bookings', value: stats.totalBookings.toString(), change: `+${stats.bookingsChange}%`, trend: stats.bookingsChange >= 0 ? 'up' : 'down', icon: Calendar },
    { label: 'New Customers', value: stats.newCustomers.toString(), change: `+${stats.customersChange}%`, trend: stats.customersChange >= 0 ? 'up' : 'down', icon: Users },
    { label: 'Avg. Rating', value: stats.averageRating.toString(), change: stats.ratingChange >= 0 ? `+${stats.ratingChange}` : stats.ratingChange.toString(), trend: stats.ratingChange >= 0 ? 'up' : 'down', icon: Star },
  ] : [];

  const servicePieData = services.map((s, i) => ({
    name: s.serviceName,
    value: s.totalRevenue,
    color: ['#F08080', '#F4978E', '#F8AD9D', '#FBC4AB', '#FFDAB9'][i % 5]
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-800">Analytics & Reporting</h1>
          <p className="text-gray-500 mt-1">Track performance metrics and business insights</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-coral-200"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-coral-200 hover:bg-coral-50">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={exportPDF} className="cursor-pointer">
                <Download className="w-4 h-4 mr-2 text-coral-500" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportCSV} className="cursor-pointer">
                <Download className="w-4 h-4 mr-2 text-blue-500" />
                Export as CSV (Excel)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Container for PDF capture */}
      <div id="analytics-dashboard" className="space-y-6 pt-2">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpiCards.map((kpi, index) => (
            <Card key={index} className="border-0 shadow-soft cursor-pointer hover:bg-gray-50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{kpi.label}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{kpi.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {kpi.trend === 'up' ? (
                        <ArrowUpRight className="w-3 h-3 text-green-500" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 text-red-500" />
                      )}
                      <span className={cn(
                        'text-xs',
                        kpi.trend === 'up' ? 'text-green-500' : 'text-red-500'
                      )}>
                        {kpi.change}
                      </span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-coral-100 flex items-center justify-center">
                    <kpi.icon className="w-5 h-5 text-coral-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="revenue">
          <TabsList className="bg-white p-1 rounded-xl border shadow-sm inline-flex">
            <TabsTrigger value="revenue" className="rounded-lg data-[state=active]:bg-coral-50 data-[state=active]:text-coral-600">Revenue</TabsTrigger>
            <TabsTrigger value="services" className="rounded-lg data-[state=active]:bg-coral-50 data-[state=active]:text-coral-600">Services</TabsTrigger>
            <TabsTrigger value="employees" className="rounded-lg data-[state=active]:bg-coral-50 data-[state=active]:text-coral-600">Employees</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue Chart */}
              <Card className="lg:col-span-2 border-0 shadow-soft">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-lg font-semibold">Revenue Trend</CardTitle>
                    <p className="text-sm text-gray-500">Earnings over the selected period</p>
                  </div>
                  <Badge className="bg-green-100 text-green-600 hover:bg-green-100 border-0">Live Data</Badge>
                </CardHeader>
                <CardContent>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueTrend}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F08080" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#F08080" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                        <XAxis dataKey="displayName" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#F08080"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorRevenue)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Breakdown */}
              <Card className="border-0 shadow-soft">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Revenue by Service</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={servicePieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {servicePieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3 mt-4">
                    {servicePieData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm text-gray-600 truncate max-w-[150px]">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium">${item.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-6 mt-6">
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Service Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {services.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">No service data available</p>
                  ) : services.map((service, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-coral-500 font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-800">{service.serviceName}</h4>
                          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs font-bold text-yellow-700">{service.averageRating}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {service.totalBookings} entries</span>
                          <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> ${service.totalRevenue.toLocaleString()} generated</span>
                        </div>
                      </div>
                      <Progress value={Math.min(100, (service.totalBookings / 100) * 100)} className="w-20 h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {employees.map((emp) => (
                <Card key={emp.employeeId} className="border-0 shadow-soft">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-coral-100 flex items-center justify-center text-coral-600 font-bold text-lg">
                        {emp.employeeName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{emp.employeeName}</h3>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-medium">{emp.averageRating} Rating</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Bookings</p>
                        <p className="font-bold">{emp.completedBookings}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Revenue</p>
                        <p className="font-bold">${emp.totalRevenue.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
