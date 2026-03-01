import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DoorOpen, Plus, Users, Sparkles, Wrench, Calendar, Clock,
  CheckCircle, Loader2, Info, Hash, Wand2, Edit, ChevronLeft, ChevronRight,
  Ban, Unlock, AlertTriangle, X
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { roomService, type Room } from '@/services/roomService';
import api from '@/lib/api';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, parseISO } from 'date-fns';

// ── Types ──────────────────────────────────────────────────────────────────
interface RoomBlock { id: number; date: string; reason: string | null; }
interface BookingSlot {
  id: number; bookingDate: string; startTime: string; endTime: string;
  status: string;
  customer?: { firstName: string; lastName: string };
  Service?: { name: string };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; bg: string }> = {
  available: { label: 'Available', color: 'text-green-600', icon: CheckCircle, bg: 'bg-green-100' },
  occupied: { label: 'Occupied', color: 'text-blue-600', icon: Clock, bg: 'bg-blue-100' },
  maintenance: { label: 'Maintenance', color: 'text-yellow-600', icon: Wrench, bg: 'bg-yellow-100' },
  cleaning: { label: 'Cleaning', color: 'text-purple-600', icon: Sparkles, bg: 'bg-purple-100' },
};

function getStatusBadge(status: string) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.available;
  const Icon = cfg.icon;
  return (
    <Badge className={cn(cfg.bg, cfg.color, 'gap-1')}>
      <Icon className="w-3 h-3" />{cfg.label}
    </Badge>
  );
}

// ── Edit Status Dialog ─────────────────────────────────────────────────────
function EditRoomDialog({ room, onSaved }: { room: Room; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(room.status);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (open) setStatus(room.status); }, [open, room.status]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await roomService.updateRoom(room.id, { status });
      toast.success(`Room status updated to "${status}"`);
      setOpen(false);
      onSaved();
    } catch {
      toast.error('Failed to update room status');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-1" id={`edit-room-${room.id}`}>
          <Edit className="w-4 h-4 mr-2" />Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle>Edit Room Status</DialogTitle>
          <DialogDescription>{room.name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Current Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_CONFIG).map(([val, cfg]) => {
                  const Icon = cfg.icon;
                  return (
                    <SelectItem key={val} value={val}>
                      <span className="flex items-center gap-2">
                        <Icon className={cn('w-4 h-4', cfg.color)} />
                        {cfg.label}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          {status === 'maintenance' && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-700">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>Setting to Maintenance will prevent auto-assignment for new bookings.</span>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button className="gradient-coral text-white" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Schedule / Block Dialog ────────────────────────────────────────────────
function ScheduleDialog({ room, onChanged }: { room: Room; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookings, setBookings] = useState<BookingSlot[]>([]);
  const [blocks, setBlocks] = useState<RoomBlock[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [blocking, setBlocking] = useState(false);

  const monthKey = format(currentMonth, 'yyyy-MM');

  const fetchSchedule = useCallback(async () => {
    try {
      setLoadingSchedule(true);
      const res = await api.get(`/rooms/${room.id}/schedule?month=${monthKey}`);
      setBookings(res.data.bookings ?? []);
      setBlocks(res.data.blocks ?? []);
    } catch {
      toast.error('Failed to load room schedule');
    } finally {
      setLoadingSchedule(false);
    }
  }, [room.id, monthKey]);

  useEffect(() => { if (open) fetchSchedule(); }, [open, fetchSchedule]);

  // Calendar helpers
  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const startWeekday = getDay(days[0]); // 0=Sun … 6=Sat

  const isBlockedDay = (d: Date) => blocks.some(b => b.date === format(d, 'yyyy-MM-dd'));
  const hasBooking = (d: Date) => bookings.some(b => b.bookingDate === format(d, 'yyyy-MM-dd'));
  const isToday = (d: Date) => isSameDay(d, new Date());

  const bookingsOnDate = selectedDate
    ? bookings.filter(b => b.bookingDate === format(selectedDate, 'yyyy-MM-dd'))
    : [];
  const blockOnDate = selectedDate
    ? blocks.find(b => b.date === format(selectedDate, 'yyyy-MM-dd'))
    : undefined;

  const handleBlock = async () => {
    if (!selectedDate) return;
    try {
      setBlocking(true);
      await api.post(`/rooms/${room.id}/blocks`, {
        date: format(selectedDate, 'yyyy-MM-dd'),
        reason: blockReason || null,
      });
      toast.success(`Blocked ${format(selectedDate, 'MMMM d, yyyy')}`);
      setBlockReason('');
      fetchSchedule();
      onChanged();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to block date');
    } finally {
      setBlocking(false);
    }
  };

  const handleUnblock = async () => {
    if (!selectedDate || !blockOnDate) return;
    try {
      setBlocking(true);
      await api.delete(`/rooms/${room.id}/blocks/${format(selectedDate, 'yyyy-MM-dd')}`);
      toast.success(`Unblocked ${format(selectedDate, 'MMMM d, yyyy')}`);
      fetchSchedule();
      onChanged();
    } catch {
      toast.error('Failed to unblock date');
    } finally {
      setBlocking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-1" id={`schedule-room-${room.id}`}>
          <Calendar className="w-4 h-4 mr-2" />Schedule
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DoorOpen className="w-5 h-5 text-indigo-500" />
            {room.name} — Schedule & Blocks
          </DialogTitle>
          <DialogDescription>
            View bookings and block dates to prevent new reservations.
          </DialogDescription>
        </DialogHeader>

        {/* ── Legend ── */}
        <div className="flex flex-wrap gap-3 text-xs">
          {[
            { color: 'bg-indigo-100 border-indigo-300', label: 'Has Bookings' },
            { color: 'bg-red-100 border-red-300', label: 'Blocked' },
            { color: 'bg-gray-100 border-gray-200', label: 'Available' },
          ].map(l => (
            <span key={l.label} className="flex items-center gap-1.5">
              <span className={cn('w-3 h-3 rounded border', l.color)} />
              {l.label}
            </span>
          ))}
        </div>

        {/* ── Month nav ── */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => { setCurrentMonth(m => subMonths(m, 1)); setSelectedDate(null); }}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-semibold text-gray-800">{format(currentMonth, 'MMMM yyyy')}</span>
          <Button variant="ghost" size="icon" onClick={() => { setCurrentMonth(m => addMonths(m, 1)); setSelectedDate(null); }}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* ── Calendar grid ── */}
        {loadingSchedule ? (
          <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
        ) : (
          <div className="rounded-xl border overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-7 bg-gray-50 border-b">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="py-2 text-center text-xs font-medium text-gray-500">{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7">
              {/* Empty cells before month starts */}
              {Array.from({ length: startWeekday }).map((_, i) => (
                <div key={`empty-${i}`} className="h-12 border-b border-r bg-gray-50/50" />
              ))}
              {days.map(day => {
                const blocked = isBlockedDay(day);
                const booked = hasBooking(day);
                const today = isToday(day);
                const selected = selectedDate && isSameDay(day, selectedDate);
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(prev => prev && isSameDay(prev, day) ? null : day)}
                    className={cn(
                      'h-12 border-b border-r flex flex-col items-center justify-center text-sm transition-colors hover:bg-indigo-50 relative',
                      blocked && 'bg-red-50',
                      booked && !blocked && 'bg-indigo-50',
                      today && 'font-bold text-indigo-700',
                      selected && 'ring-2 ring-indigo-500 ring-inset',
                    )}
                  >
                    <span>{day.getDate()}</span>
                    <div className="flex gap-0.5 mt-0.5">
                      {booked && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                      {blocked && <span className="w-1.5 h-1.5 rounded-full bg-red-400" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Selected day panel ── */}
        {selectedDate && (
          <div className="border rounded-xl p-4 space-y-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h3>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedDate(null)}>
                <X className="w-3 h-3" />
              </Button>
            </div>

            {/* Bookings on this day */}
            {bookingsOnDate.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bookings</p>
                {bookingsOnDate.map(b => (
                  <div key={b.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border text-sm">
                    <span className="font-medium text-gray-700">
                      {b.customer ? `${b.customer.firstName} ${b.customer.lastName}` : 'Customer'}
                    </span>
                    <span className="text-gray-500">{b.startTime?.slice(0, 5)} – {b.endTime?.slice(0, 5)}</span>
                    <Badge variant="outline" className="text-xs">{b.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No bookings on this day.</p>
            )}

            {/* Block / Unblock */}
            {blockOnDate ? (
              <div className="space-y-2">
                <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg text-sm text-red-700 border border-red-200">
                  <Ban className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>
                    <strong>Blocked</strong>
                    {blockOnDate.reason ? ` — ${blockOnDate.reason}` : ''}
                  </span>
                </div>
                <Button
                  variant="outline"
                  className="w-full text-green-600 border-green-300 hover:bg-green-50"
                  onClick={handleUnblock}
                  disabled={blocking}
                >
                  {blocking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Unlock className="w-4 h-4 mr-2" />}
                  Unblock This Date
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Block This Date</p>
                <Textarea
                  placeholder="Reason (optional — e.g. Deep cleaning)"
                  value={blockReason}
                  onChange={e => setBlockReason(e.target.value)}
                  className="h-16 resize-none text-sm"
                />
                <Button
                  variant="outline"
                  className="w-full text-red-600 border-red-300 hover:bg-red-50"
                  onClick={handleBlock}
                  disabled={blocking}
                >
                  {blocking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Ban className="w-4 h-4 mr-2" />}
                  Block This Date
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export function RoomManagementPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [provisioning, setProvisioning] = useState(false);

  // Add room form state
  const [name, setName] = useState('');
  const [type, setType] = useState('single');
  const [capacity, setCapacity] = useState('1');
  const [hourlyRate, setHourlyRate] = useState('0');
  const [isVip, setIsVip] = useState(false);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await roomService.getRooms();
      setRooms(data);
    } catch {
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  const handleCreateRoom = async () => {
    try {
      if (!name) { toast.error('Please enter a room name'); return; }
      await roomService.createRoom({ name, type, capacity: parseInt(capacity), hourlyRate: parseFloat(hourlyRate), isVip, status: 'available' });
      toast.success('Room created successfully!');
      setIsAddRoomOpen(false);
      setName(''); setType('single'); setCapacity('1'); setHourlyRate('0'); setIsVip(false);
      fetchRooms();
    } catch {
      toast.error('Failed to create room');
    }
  };

  const handleProvisionAll = async () => {
    try {
      setProvisioning(true);
      const response = await api.post('/rooms/provision-all');
      const json = response.data;
      const summary = (json.summary as { service?: string; category?: string; roomsCreated: number }[]);
      const totalCreated = summary.reduce((acc, s) => acc + s.roomsCreated, 0);
      const removed = json.removedManualRooms ?? 0;
      const detail = summary.filter(s => s.roomsCreated > 0).map(s => `${s.service || s.category}: +${s.roomsCreated}`).join(' | ');
      const parts: string[] = [];
      if (removed > 0) parts.push(`Removed ${removed} unlinked room(s)`);
      if (totalCreated > 0) parts.push(`Created ${totalCreated} room(s)${detail ? ': ' + detail : ''}`);
      if (parts.length === 0) parts.push('All rooms are already up to date!');
      toast.success(parts.join(' · '));
      fetchRooms();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate rooms');
    } finally {
      setProvisioning(false);
    }
  };

  const filteredRooms = activeTab === 'all' ? rooms : rooms.filter(r => r.type.toLowerCase() === activeTab.toLowerCase());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-800">Room Management</h1>
          <p className="text-gray-500 mt-1">Manage treatment rooms, cabins, and facilities</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="outline" className="border-coral-200 hover:bg-coral-50" onClick={fetchRooms}>
            <Loader2 className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />Refresh
          </Button>
          <Button variant="outline" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50" onClick={handleProvisionAll} disabled={provisioning}>
            {provisioning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
            Generate Rooms
          </Button>
          <Dialog open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-coral hover:opacity-90 text-white">
                <Plus className="w-4 h-4 mr-2" />Add Room
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Treatment Room</DialogTitle>
                <DialogDescription>Create a new space for spa services and treatments.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Room Name</Label>
                  <Input placeholder="e.g. Zen Suite" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="couple">Couple</SelectItem>
                        <SelectItem value="suite">Suite</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Capacity</Label>
                    <Input type="number" placeholder="1" value={capacity} onChange={e => setCapacity(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Hourly Rate ($)</Label>
                    <Input type="number" placeholder="0" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} />
                  </div>
                  <div className="flex items-center space-x-2 mt-8">
                    <input type="checkbox" id="vip" checked={isVip} onChange={e => setIsVip(e.target.checked)} className="w-4 h-4 text-coral-600 border-gray-300 rounded focus:ring-coral-500" />
                    <Label htmlFor="vip">VIP Room</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddRoomOpen(false)}>Cancel</Button>
                <Button className="gradient-coral text-white" onClick={handleCreateRoom}>Save Room</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-sm text-indigo-700">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <span>
          <strong>Rooms are auto-provisioned per service.</strong> Use <em>Generate Rooms</em> to sync rooms with current service capacities.
          Use the <strong>Schedule</strong> button on any room to view bookings and block dates.
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Rooms', value: rooms.length, color: 'text-coral-500' },
          { label: 'Available', value: rooms.filter(r => r.status === 'available').length, color: 'text-green-500' },
          { label: 'In Use', value: rooms.filter(r => r.status === 'occupied').length, color: 'text-blue-500' },
          { label: 'Maintenance', value: rooms.filter(r => r.status === 'maintenance').length, color: 'text-yellow-500' },
          { label: 'Cleaning', value: rooms.filter(r => r.status === 'cleaning').length, color: 'text-purple-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl shadow-soft p-4 text-center border-0">
            <p className={cn('text-2xl font-bold', stat.color)}>{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs + Room Grid */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100">
          <TabsTrigger value="all">All Rooms</TabsTrigger>
          <TabsTrigger value="single">Single</TabsTrigger>
          <TabsTrigger value="couple">Couple</TabsTrigger>
          <TabsTrigger value="suite">Suite</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6 mt-6">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-coral-500" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map(room => (
                <Card key={room.id} className="border-0 shadow-soft overflow-hidden">
                  <div className="relative h-48 overflow-hidden bg-gray-100 flex items-center justify-center">
                    <div className="text-gray-300"><DoorOpen className="w-20 h-20" /></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-4 left-4 flex gap-2">
                      {getStatusBadge(room.status)}
                      {room.roomNumber && (
                        <Badge className="bg-white/90 text-gray-700">
                          <Hash className="w-3 h-3 mr-0.5" />{room.roomNumber}
                        </Badge>
                      )}
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        {room.name}
                        {room.isVip && <Sparkles className="w-4 h-4 text-yellow-400" />}
                      </h3>
                      {room.serviceCategory ? (
                        <p className="text-xs opacity-90 font-medium bg-white/20 rounded px-2 py-0.5 inline-block mt-1">
                          {room.serviceCategory.name}
                        </p>
                      ) : (
                        <p className="text-sm opacity-80 capitalize">{room.type} Room</p>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Capacity: {room.capacity}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">${room.hourlyRate}/hr</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <EditRoomDialog room={room} onSaved={fetchRooms} />
                      <ScheduleDialog room={room} onChanged={fetchRooms} />
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredRooms.length === 0 && (
                <div className="col-span-full text-center py-10 text-gray-500">No rooms found.</div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
