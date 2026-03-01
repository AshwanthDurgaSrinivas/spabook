import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Calendar as CalendarIcon,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Plus,
    Loader2,
    Filter,
    MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { leaveService, type LeaveRequest } from '@/services/leaveService';

export function LeaveManagementPage({ forcePersonal = false }: { forcePersonal?: boolean }) {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [isApplying, setIsApplying] = useState(false);
    const [applyData, setApplyData] = useState({ startDate: '', endDate: '', reason: '' });

    const isAdmin = (user?.role === 'admin' || user?.role === 'manager' || user?.role === 'super_admin') && !forcePersonal;

    const fetchLeaves = async () => {
        try {
            setLoading(true);
            const data = await (isAdmin ? leaveService.getAllLeaves() : leaveService.getMyLeaves());
            setLeaves(data);
        } catch (error) {
            toast.error('Failed to load leave requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, [isAdmin]);

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await leaveService.applyLeave(applyData);
            toast.success('Leave application submitted');
            setIsApplying(false);
            setApplyData({ startDate: '', endDate: '', reason: '' });
            fetchLeaves();
        } catch (error) {
            toast.error('Failed to submit application');
        }
    };

    const handleStatusUpdate = async (id: number, status: 'approved' | 'rejected') => {
        const comment = prompt(`Enter a comment for ${status}:`);
        if (comment === null) return;

        try {
            await leaveService.updateLeaveStatus(id, status, comment);
            toast.success(`Leave request ${status}`);
            fetchLeaves();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Update failed');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <Badge className="bg-green-100 text-green-700 border-green-200">Approved</Badge>;
            case 'rejected': return <Badge className="bg-red-100 text-red-700 border-red-200">Rejected</Badge>;
            default: return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-800">Leave Management</h1>
                    <p className="text-gray-500 mt-1">
                        {isAdmin ? 'Review and manage staff leave requests' : 'Request time off and view your application status'}
                    </p>
                </div>
                {!isAdmin && (
                    <Button
                        className="gradient-coral text-white rounded-xl shadow-md"
                        onClick={() => setIsApplying(!isApplying)}
                    >
                        {isApplying ? 'Cancel' : (
                            <>
                                <Plus className="w-4 h-4 mr-2" />
                                Apply for Leave
                            </>
                        )}
                    </Button>
                )}
            </div>

            {isApplying && !isAdmin && (
                <Card className="border-coral-100 shadow-coral-soft animate-in slide-in-from-top-4 duration-300">
                    <CardHeader>
                        <CardTitle className="text-lg">Apply for Leave</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleApply} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Start Date</label>
                                    <Input
                                        type="date"
                                        required
                                        value={applyData.startDate}
                                        onChange={e => setApplyData({ ...applyData, startDate: e.target.value })}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">End Date</label>
                                    <Input
                                        type="date"
                                        required
                                        value={applyData.endDate}
                                        onChange={e => setApplyData({ ...applyData, endDate: e.target.value })}
                                        className="rounded-xl"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Reason</label>
                                <Textarea
                                    required
                                    placeholder="Explain why you need time off..."
                                    value={applyData.reason}
                                    onChange={e => setApplyData({ ...applyData, reason: e.target.value })}
                                    className="rounded-xl min-h-[100px]"
                                />
                            </div>
                            <Button type="submit" className="w-full gradient-coral text-white h-11">
                                Submit Request
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card className="border-0 shadow-soft overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-semibold">
                        {isAdmin ? 'Service Queue' : 'My Leave History'}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="rounded-lg h-9">
                            <Filter className="w-4 h-4 mr-2" />
                            Filter
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-coral-500" />
                            <p className="text-gray-500">Loading leave requests...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        {isAdmin && <th className="text-left py-4 px-6 font-semibold text-xs uppercase tracking-wider text-gray-400">Employee</th>}
                                        <th className="text-left py-4 px-6 font-semibold text-xs uppercase tracking-wider text-gray-400">Duration</th>
                                        <th className="text-left py-4 px-6 font-semibold text-xs uppercase tracking-wider text-gray-400">Reason</th>
                                        <th className="text-left py-4 px-6 font-semibold text-xs uppercase tracking-wider text-gray-400">Status</th>
                                        {isAdmin && <th className="text-right py-4 px-6 font-semibold text-xs uppercase tracking-wider text-gray-400">Actions</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {leaves.map((leave) => (
                                        <tr key={leave.id} className="hover:bg-gray-50/30 transition-colors">
                                            {isAdmin && (
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                                            {leave.employee?.firstName?.[0]}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-800">{leave.employee?.firstName} {leave.employee?.lastName}</p>
                                                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">{leave.employee?.role}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                            )}
                                            <td className="py-4 px-6">
                                                <div className="text-sm">
                                                    <p className="font-medium text-gray-700">{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">Applied on {new Date(leave.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="text-sm text-gray-600 max-w-xs truncate" title={leave.reason}>
                                                    {leave.reason}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                {getStatusBadge(leave.status)}
                                                {leave.comment && (
                                                    <p className="text-[10px] text-gray-400 mt-1 bg-gray-50 p-1 rounded italic">
                                                        "{leave.comment}"
                                                    </p>
                                                )}
                                            </td>
                                            {isAdmin && (
                                                <td className="py-4 px-6 text-right">
                                                    {leave.status === 'pending' ? (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                size="sm"
                                                                className="bg-green-500 hover:bg-green-600 text-white h-8 px-3 rounded-lg text-xs"
                                                                onClick={() => handleStatusUpdate(leave.id, 'approved')}
                                                            >
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="border-red-200 text-red-600 hover:bg-red-50 h-8 px-3 rounded-lg text-xs"
                                                                onClick={() => handleStatusUpdate(leave.id, 'rejected')}
                                                            >
                                                                Reject
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">Processed</span>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    {leaves.length === 0 && (
                                        <tr>
                                            <td colSpan={isAdmin ? 5 : 4} className="text-center py-20 text-gray-400">
                                                No leave requests found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
