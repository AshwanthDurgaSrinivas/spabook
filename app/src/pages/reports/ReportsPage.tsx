import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText, Download, Calendar, Clock, Mail, Plus, Filter,
  TrendingUp, DollarSign, Users, Star, BarChart3, PieChart,
  CheckCircle, Clock as ClockIcon, Eye, Loader2, Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { reportService, type Report } from '@/services/reportService';
import { analyticsService } from '@/services/analyticsService';
import { bookingService } from '@/services/bookingService';
import { customerService } from '@/services/customerService';
import { productService } from '@/services/productService';
import { employeeService } from '@/services/employeeService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState('scheduled');
  const [isCreateReportOpen, setIsCreateReportOpen] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Form State
  const [reportType, setReportType] = useState('revenue');
  const [fromDate, setFromDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [format, setFormat] = useState('pdf');
  const [frequency, setFrequency] = useState('none');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await reportService.getReports();
      setReports(data);
    } catch (error) {
      console.error('Failed to fetch reports', error);
      toast.error('Failed to load reports history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const reportTemplates = [
    { id: 'revenue', name: 'Revenue Summary', category: 'Financial', icon: DollarSign },
    { id: 'bookings', name: 'Booking Analytics', category: 'Operations', icon: BarChart3 },
    { id: 'customers', name: 'Customer Report', category: 'CRM', icon: Users },
    { id: 'employees', name: 'Employee Performance', category: 'HR', icon: Star },
    { id: 'inventory', name: 'Inventory Status', category: 'Inventory', icon: PieChart },
  ];

  const fetchDataForReport = async (type: string) => {
    switch (type) {
      case 'revenue': {
        const { stats, revenueData } = await analyticsService.getDashboardStats();
        return {
          summary: [
            ['Total Revenue', `$${stats.totalRevenue.toLocaleString()}`],
            ['Today\'s Revenue', `$${stats.todayRevenue.toLocaleString()}`],
            ['Average Rating', stats.averageRating.toString()],
            ['Total Bookings', stats.totalBookings.toString()]
          ],
          table: revenueData.map(d => [d.date, `$${d.revenue}`, d.bookings])
        };
      }
      case 'bookings': {
        const data = await bookingService.getBookings();
        const filtered = data.filter(b => b.bookingDate >= fromDate && b.bookingDate <= toDate);
        return {
          summary: [['Total Bookings', filtered.length.toString()]],
          table: filtered.map(b => [
            b.id.toString(),
            (b.customer?.firstName || 'Unknown') + ' ' + (b.customer?.lastName || ''),
            b.service?.name || 'Unknown',
            b.bookingDate,
            b.startTime,
            b.status,
            `$${b.totalPrice}`
          ])
        };
      }
      case 'customers': {
        const data = await customerService.getCustomers();
        const filtered = data.filter(c => c.lastVisitDate ? (c.lastVisitDate >= fromDate && c.lastVisitDate <= toDate) : true);
        return {
          summary: [['Total Customers', filtered.length.toString()]],
          table: filtered.map(c => [
            c.id.toString(),
            `${c.firstName} ${c.lastName}`,
            c.email,
            c.phone || '-',
            c.segment || 'new',
            `$${c.totalSpent || 0}`
          ])
        };
      }
      case 'employees': {
        const data = await employeeService.getEmployees();
        return {
          summary: [['Total Staff Members', data.length.toString()]],
          table: data.map(e => [
            e.id.toString(),
            `${e.user?.firstName || e.firstName || ''} ${e.user?.lastName || e.lastName || ''}`,
            e.role || e.designation || '-',
            e.status || '-',
            e.department || '-'
          ])
        };
      }
      case 'inventory': {
        const data = await productService.getProducts();
        return {
          summary: [
            ['Total Products', data.length.toString()],
            ['Low Stock Items', data.filter(p => p.stock <= p.minStock).length.toString()]
          ],
          table: data.map(p => [
            p.sku,
            p.name,
            p.category,
            p.stock.toString(),
            p.minStock.toString(),
            `$${p.price}`
          ])
        };
      }
      default: return null;
    }
  };

  const generatePDF = async (type: string, name: string) => {
    const doc = new jsPDF();
    const data = await fetchDataForReport(type);

    // Header styling
    doc.setFillColor(79, 70, 229); // Indigo-600
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('SPARKLE BEAUTY LOUNGE', 20, 20);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(`${name.toUpperCase()}`, 20, 30);

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 150, 50);
    doc.text(`Report Period: ${fromDate} to ${toDate}`, 20, 50);

    if (data) {
      // Summary Box
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(20, 55, 170, 30, 3, 3, 'F');
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(11);
      let y = 65;
      data.summary.forEach(([label, value]) => {
        doc.text(`${label}:`, 30, y);
        doc.setFont('helvetica', 'bold');
        doc.text(value, 150, y);
        doc.setFont('helvetica', 'normal');
        y += 7;
      });

      // Main Table
      const headers = {
        revenue: ['Date', 'Revenue', 'Bookings'],
        bookings: ['ID', 'Customer', 'Service', 'Date', 'Time', 'Status', 'Amount'],
        customers: ['ID', 'Name', 'Email', 'Phone', 'Segment', 'Total Spent'],
        employees: ['ID', 'Name', 'Role', 'Status', 'Specialties'],
        inventory: ['SKU', 'Product', 'Category', 'Stock', 'Min', 'Price']
      }[type] || [];

      autoTable(doc, {
        startY: 95,
        head: [headers],
        body: data.table,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        styles: { fontSize: 9, cellPadding: 4 }
      });
    } else {
      doc.text('Detailed data coming soon...', 20, 100);
    }

    doc.save(`${name.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
    return true;
  };

  const generateExcel = async (type: string, name: string) => {
    const data = await fetchDataForReport(type);
    if (!data) return false;

    const headers = {
      revenue: ['Date', 'Revenue', 'Bookings'],
      bookings: ['ID', 'Customer', 'Service', 'Date', 'Time', 'Status', 'Amount'],
      customers: ['ID', 'Name', 'Email', 'Phone', 'Segment', 'Total Spent'],
      employees: ['ID', 'Name', 'Role', 'Status', 'Specialties'],
      inventory: ['SKU', 'Product', 'Category', 'Stock', 'Min', 'Price']
    }[type] || [];

    const wsData = [headers, ...data.table];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `${name.replace(/\s+/g, '_')}_${Date.now()}.xlsx`);
    return true;
  };

  const generateCSV = async (type: string, name: string) => {
    const data = await fetchDataForReport(type);
    if (!data) return false;

    const headers = {
      revenue: ['Date', 'Revenue', 'Bookings'],
      bookings: ['ID', 'Customer', 'Service', 'Date', 'Time', 'Status', 'Amount'],
      customers: ['ID', 'Name', 'Email', 'Phone', 'Segment', 'Total Spent'],
      employees: ['ID', 'Name', 'Role', 'Status', 'Specialties'],
      inventory: ['SKU', 'Product', 'Category', 'Stock', 'Min', 'Price']
    }[type] || [];

    const csvContent = [
      headers.join(','),
      ...data.table.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${name.replace(/\s+/g, '_')}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  };

  const handleCreateReport = async () => {
    setGenerating(true);
    try {
      const template = reportTemplates.find(t => t.id === reportType);
      const name = template ? template.name : 'Custom Report';

      // 1. Generate local file based on format
      if (format === 'pdf') {
        await generatePDF(reportType, name);
      } else if (format === 'excel') {
        await generateExcel(reportType, name);
      } else if (format === 'csv') {
        await generateCSV(reportType, name);
      }

      // 2. Save to backend history
      await reportService.createReport({
        name: name,
        type: reportType,
        format: format,
        scheduleFrequency: frequency as any,
        parameters: { fromDate, toDate }
      });

      toast.success(frequency === 'none' ? 'Report generated and saved' : 'Report scheduled successfully');
      setIsCreateReportOpen(false);
      fetchReports();
    } catch (error) {
      toast.error('Could not create report');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await reportService.deleteReport(id);
      toast.success('Report history removed');
      fetchReports();
    } catch (error) {
      toast.error('Failed to delete report');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-800">Reports</h1>
          <p className="text-gray-500 mt-1">Generate and schedule business reports</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isCreateReportOpen} onOpenChange={setIsCreateReportOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-coral hover:opacity-90 text-white shadow-md">
                <Plus className="w-4 h-4 mr-2" />
                Create Report
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Generate Business Report</DialogTitle>
                <DialogDescription>Select specific parameters to generate your custom report.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Report Template</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger><SelectValue placeholder="Select report type" /></SelectTrigger>
                    <SelectContent>
                      {reportTemplates.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>From Date</Label>
                    <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>To Date</Label>
                    <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Format</Label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                      <SelectItem value="csv">CSV File</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Schedule Frequency</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">One-time Generation</SelectItem>
                      <SelectItem value="daily">Daily Auto-generate</SelectItem>
                      <SelectItem value="weekly">Weekly Auto-generate</SelectItem>
                      <SelectItem value="monthly">Monthly Auto-generate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateReportOpen(false)}>Cancel</Button>
                <Button className="gradient-coral text-white" onClick={handleCreateReport} disabled={generating}>
                  {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <BarChart3 className="w-4 h-4 mr-2" />}
                  Generate
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Scheduled', value: reports.filter(r => r.scheduleFrequency !== 'none').length.toString(), icon: Clock, color: 'coral' },
          { label: 'Generated', value: reports.length.toString(), icon: FileText, color: 'blue' },
          { label: 'Recipients', value: '12', icon: Mail, color: 'green' },
          { label: 'Storage', value: '14.2MB', icon: BarChart3, color: 'purple' },
        ].map((stat, index) => (
          <Card key={index} className="border-0 shadow-soft">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', `bg-${stat.color}-50`)}>
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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100">
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="scheduled" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reports.filter(r => r.scheduleFrequency !== 'none').map((report) => (
              <Card key={report.id} className="border-0 shadow-soft overflow-hidden group">
                <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 transition-transform group-hover:scale-110">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{report.name}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Download className="w-3 h-3" /> Auto-generate as {report.format.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-600 border-0">ACTIVE TASK</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Frequency</p>
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-3 h-3 text-indigo-500" />
                        <p className="font-semibold text-gray-700 capitalize">{report.scheduleFrequency}</p>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Next Run Date</p>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <p className="font-semibold text-gray-700">
                          {report.nextRunAt ? new Date(report.nextRunAt).toLocaleDateString() : 'Pending'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl border-indigo-100 text-indigo-600 hover:bg-indigo-50"
                      onClick={() => {
                        if (report.format === 'pdf') generatePDF(report.type, report.name);
                        else if (report.format === 'excel') generateExcel(report.type, report.name);
                        else generateCSV(report.type, report.name);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Run Manual Task
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50" onClick={() => handleDelete(report.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {reports.filter(r => r.scheduleFrequency !== 'none').length === 0 && (
              <div className="col-span-2 text-center py-20 bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Clock className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-gray-900 font-bold">No Scheduled Tasks</h3>
                <p className="text-gray-500 text-sm mt-1 max-w-xs mx-auto">
                  Create a new report and set a "Schedule Frequency" to automate your business reporting.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTemplates.map((template, index) => (
              <Card key={index} className="border-0 shadow-soft hover-lift cursor-pointer" onClick={() => {
                setReportType(template.id);
                setIsCreateReportOpen(true);
              }}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-coral-100 flex items-center justify-center">
                      <template.icon className="w-6 h-6 text-coral-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{template.name}</h3>
                      <Badge variant="secondary">{template.category}</Badge>
                    </div>
                  </div>
                  <Button className="w-full gradient-coral text-white">
                    Configure & Generate
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6 mt-6">
          <Card className="border-0 shadow-soft">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-4 px-6 font-semibold text-gray-600">Report Name</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-600">Type</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-600">Generated At</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-600">Format</th>
                      <th className="text-right py-4 px-6 font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={5} className="py-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-coral-500" /></td></tr>
                    ) : reports.length === 0 ? (
                      <tr><td colSpan={5} className="py-12 text-center text-gray-400">No report history found</td></tr>
                    ) : reports.map((report) => (
                      <tr key={report.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-coral-500" />
                            <span className="font-medium">{report.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant="outline" className="capitalize">{report.type}</Badge>
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          {new Date(report.createdAt).toLocaleString()}
                        </td>
                        <td className="py-4 px-6">
                          <span className="uppercase text-xs font-bold text-gray-400">{report.format}</span>
                        </td>
                        <td className="py-4 px-6 text-right space-x-2">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="h-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50" onClick={() => {
                              if (report.format === 'pdf') generatePDF(report.type, report.name);
                              else if (report.format === 'excel') generateExcel(report.type, report.name);
                              else generateCSV(report.type, report.name);
                            }}>
                              <Download className="w-4 h-4 mr-2" />
                              Re-download
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 text-red-500 hover:bg-red-50" onClick={() => handleDelete(report.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
