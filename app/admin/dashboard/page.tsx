'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import {
  adminLogout,
  getInventory, upsertVehicle, deleteVehicle, newVehicleId,
  getSales, getSellRequests, updateSellStatus,
  getCareers, upsertCareer, deleteCareer, newCareerId,
  getPartners, upsertPartner, deletePartner, newPartnerId,
  getMessages, markMessageRead,
} from '@/lib/storage';
import {
  Vehicle, VehicleClass, VehicleStatus, ModLevel, VehicleCondition,
  SaleRecord, SellRequest, Career, Partner, ContactMessage, AdminSession
} from '@/lib/types';
import {
  LayoutDashboard, Car, ShoppingBag, FileText, Briefcase,
  Handshake, MessageSquare, Users, LogOut, Plus, Pencil,
  Trash2, CheckCircle, XCircle, Eye, AlertCircle, ChevronRight
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(n: number) { return '$' + n.toLocaleString('en-US'); }
function fmtDate(s: string) { return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }

type Section =
  | 'overview' | 'inventory' | 'sales' | 'sell-requests'
  | 'careers' | 'partners' | 'messages' | 'users';

const NAV_ITEMS: { id: Section; label: string; icon: React.ReactNode; ownerOnly?: boolean }[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} /> },
  { id: 'inventory', label: 'Inventory', icon: <Car size={16} /> },
  { id: 'sales', label: 'Sales Log', icon: <ShoppingBag size={16} /> },
  { id: 'sell-requests', label: 'Sell Requests', icon: <FileText size={16} /> },
  { id: 'careers', label: 'Careers', icon: <Briefcase size={16} /> },
  { id: 'partners', label: 'Partners', icon: <Handshake size={16} /> },
  { id: 'messages', label: 'Messages', icon: <MessageSquare size={16} /> },
  { id: 'users', label: 'User Mgmt', icon: <Users size={16} />, ownerOnly: true },
];

const VEHICLE_CLASSES: VehicleClass[] = ['Super', 'Sports', 'Muscle', 'SUV', 'Motorcycle'];
const MOD_LEVELS: ModLevel[] = ['None', 'Partial', 'Complete'];
const CONDITIONS: VehicleCondition[] = ['Poor', 'Fair', 'Good', 'Excellent'];
const STATUSES: VehicleStatus[] = ['available', 'reserved', 'sold'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
const DRIVETRAINS = ['RWD', 'FWD', 'AWD', '4WD'];

// ─── Vehicle Form ─────────────────────────────────────────────────────────────
type VForm = {
  brand: string; model: string; class: VehicleClass; price: string;
  plate: string; mileage: string; fuelType: string; drivetrain: string;
  performanceMods: ModLevel; securityMods: ModLevel; handlingMods: ModLevel;
  condition: VehicleCondition; subwoofer: boolean; cargoSpace: string;
  insurancePerDay: string; status: VehicleStatus; featured: boolean; imageUrl: string;
};

const EMPTY_VFORM: VForm = {
  brand: '', model: '', class: 'Super', price: '',
  plate: '', mileage: '', fuelType: 'Petrol', drivetrain: 'RWD',
  performanceMods: 'None', securityMods: 'None', handlingMods: 'None',
  condition: 'Good', subwoofer: false, cargoSpace: '0',
  insurancePerDay: '', status: 'available', featured: false,
  imageUrl: '',
};

function vehicleToForm(v: Vehicle): VForm {
  return {
    brand: v.brand, model: v.model, class: v.class, price: String(v.price),
    plate: v.plate, mileage: String(v.mileage), fuelType: v.fuelType,
    drivetrain: v.drivetrain, performanceMods: v.performanceMods,
    securityMods: v.securityMods, handlingMods: v.handlingMods,
    condition: v.condition, subwoofer: v.subwoofer,
    cargoSpace: String(v.cargoSpace), insurancePerDay: String(v.insurancePerDay),
    status: v.status, featured: v.featured, imageUrl: v.imageUrl,
  };
}

function formToVehicle(form: VForm, existing?: Vehicle): Vehicle {
  return {
    id: existing?.id ?? newVehicleId(),
    brand: form.brand.trim(),
    model: form.model.trim(),
    class: form.class,
    price: Number(form.price),
    plate: form.plate.trim().toUpperCase(),
    mileage: Number(form.mileage),
    fuelType: form.fuelType,
    drivetrain: form.drivetrain,
    performanceMods: form.performanceMods,
    securityMods: form.securityMods,
    handlingMods: form.handlingMods,
    condition: form.condition,
    subwoofer: form.subwoofer,
    cargoSpace: Number(form.cargoSpace),
    insurancePerDay: Number(form.insurancePerDay),
    status: form.status,
    featured: form.featured,
    imageUrl: form.imageUrl.trim() || `https://placehold.co/800x450/1a1a1a/c0392b?text=${encodeURIComponent(form.brand + ' ' + form.model)}`,
    soldCount: existing?.soldCount ?? 0,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
}

// ─── Reusable Modal Wrapper ───────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        className="bg-[#111] rounded-2xl p-6 w-full max-w-2xl crown-border shadow-2xl my-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-lg uppercase tracking-wide">{title}</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-white"><XCircle size={20} /></button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

// ─── Vehicle Modal ─────────────────────────────────────────────────────────────
function VehicleModal({ existing, onClose, onSave }: { existing: Vehicle | null; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState<VForm>(existing ? vehicleToForm(existing) : EMPTY_VFORM);

  function setF<K extends keyof VForm>(k: K, v: VForm[K]) { setForm((f) => ({ ...f, [k]: v })); }

  function handleSave() {
    if (!form.brand.trim() || !form.model.trim() || !form.price || !form.plate.trim()) return;
    upsertVehicle(formToVehicle(form, existing ?? undefined));
    onSave();
    onClose();
  }

  const inputCls = 'lux-input';
  const selectCls = 'lux-input';

  return (
    <Modal title={existing ? 'Edit Vehicle' : 'Add Vehicle'} onClose={onClose}>
      <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
        {([
          ['Brand', 'brand', 'text'],
          ['Model', 'model', 'text'],
          ['Price ($)', 'price', 'number'],
          ['Plate', 'plate', 'text'],
          ['Mileage', 'mileage', 'number'],
          ['Insurance $/day', 'insurancePerDay', 'number'],
          ['Cargo Slots', 'cargoSpace', 'number'],
          ['Image URL', 'imageUrl', 'text'],
        ] as [string, keyof VForm, string][]).map(([label, key, type]) => (
          <div key={key} className={key === 'imageUrl' ? 'col-span-2' : ''}>
            <label className="block text-gray-500 text-xs uppercase tracking-wider mb-1">{label}</label>
            <input
              type={type}
              value={form[key] as string}
              onChange={(e) => setF(key, e.target.value as never)}
              className={inputCls}
            />
          </div>
        ))}

        {([
          ['Class', 'class', VEHICLE_CLASSES],
          ['Fuel Type', 'fuelType', FUEL_TYPES],
          ['Drivetrain', 'drivetrain', DRIVETRAINS],
          ['Status', 'status', STATUSES],
          ['Condition', 'condition', CONDITIONS],
          ['Performance Mods', 'performanceMods', MOD_LEVELS],
          ['Security Mods', 'securityMods', MOD_LEVELS],
          ['Handling Mods', 'handlingMods', MOD_LEVELS],
        ] as [string, keyof VForm, string[]][]).map(([label, key, opts]) => (
          <div key={key}>
            <label className="block text-gray-500 text-xs uppercase tracking-wider mb-1">{label}</label>
            <select value={form[key] as string} onChange={(e) => setF(key, e.target.value as never)} className={selectCls}>
              {opts.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ))}

        <div className="flex items-center gap-3 col-span-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.subwoofer} onChange={(e) => setF('subwoofer', e.target.checked)} className="accent-[#c0392b] w-4 h-4" />
            <span className="text-sm text-gray-400">Subwoofer</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer ml-4">
            <input type="checkbox" checked={form.featured} onChange={(e) => setF('featured', e.target.checked)} className="accent-[#c0392b] w-4 h-4" />
            <span className="text-sm text-gray-400">Featured</span>
          </label>
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={handleSave} className="btn-crown flex-1 py-3">Save Vehicle</button>
        <button onClick={onClose} className="btn-ghost flex-1 py-3">Cancel</button>
      </div>
    </Modal>
  );
}

// ─── Career Modal ─────────────────────────────────────────────────────────────
function CareerModal({ existing, onClose, onSave }: { existing: Career | null; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    title: existing?.title ?? '',
    department: existing?.department ?? '',
    description: existing?.description ?? '',
    requirements: existing?.requirements ?? '',
    active: existing?.active ?? true,
  });

  function handleSave() {
    if (!form.title.trim() || !form.department.trim()) return;
    upsertCareer({
      id: existing?.id ?? newCareerId(),
      title: form.title.trim(),
      department: form.department.trim(),
      description: form.description.trim(),
      requirements: form.requirements.trim(),
      active: form.active,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    });
    onSave(); onClose();
  }

  return (
    <Modal title={existing ? 'Edit Position' : 'Add Position'} onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-500 text-xs uppercase tracking-wider mb-1">Title</label>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="lux-input" />
          </div>
          <div>
            <label className="block text-gray-500 text-xs uppercase tracking-wider mb-1">Department</label>
            <input value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} className="lux-input" />
          </div>
        </div>
        <div>
          <label className="block text-gray-500 text-xs uppercase tracking-wider mb-1">Description</label>
          <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="lux-input resize-none" />
        </div>
        <div>
          <label className="block text-gray-500 text-xs uppercase tracking-wider mb-1">Requirements</label>
          <textarea rows={3} value={form.requirements} onChange={(e) => setForm((f) => ({ ...f, requirements: e.target.value }))} className="lux-input resize-none" />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="accent-[#c0392b] w-4 h-4" />
          <span className="text-sm text-gray-400">Active (visible on public page)</span>
        </label>
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={handleSave} className="btn-crown flex-1 py-3">Save</button>
        <button onClick={onClose} className="btn-ghost flex-1 py-3">Cancel</button>
      </div>
    </Modal>
  );
}

// ─── Partner Modal ────────────────────────────────────────────────────────────
function PartnerModal({ existing, onClose, onSave }: { existing: Partner | null; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    name: existing?.name ?? '',
    logoUrl: existing?.logoUrl ?? '',
    description: existing?.description ?? '',
    website: existing?.website ?? '',
    active: existing?.active ?? true,
  });

  function handleSave() {
    if (!form.name.trim()) return;
    upsertPartner({
      id: existing?.id ?? newPartnerId(),
      name: form.name.trim(),
      logoUrl: form.logoUrl.trim() || `https://placehold.co/120x60/1a1a1a/c0392b?text=${encodeURIComponent(form.name)}`,
      description: form.description.trim(),
      website: form.website.trim() || '#',
      active: form.active,
    });
    onSave(); onClose();
  }

  return (
    <Modal title={existing ? 'Edit Partner' : 'Add Partner'} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-gray-500 text-xs uppercase tracking-wider mb-1">Name</label>
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="lux-input" />
        </div>
        <div>
          <label className="block text-gray-500 text-xs uppercase tracking-wider mb-1">Logo URL</label>
          <input value={form.logoUrl} onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))} className="lux-input" placeholder="https://..." />
        </div>
        <div>
          <label className="block text-gray-500 text-xs uppercase tracking-wider mb-1">Description</label>
          <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="lux-input resize-none" />
        </div>
        <div>
          <label className="block text-gray-500 text-xs uppercase tracking-wider mb-1">Website</label>
          <input value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} className="lux-input" placeholder="https://..." />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="accent-[#c0392b] w-4 h-4" />
          <span className="text-sm text-gray-400">Active (visible on public page)</span>
        </label>
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={handleSave} className="btn-crown flex-1 py-3">Save</button>
        <button onClick={onClose} className="btn-ghost flex-1 py-3">Cancel</button>
      </div>
    </Modal>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<AdminSession | null>(null);
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Data
  const [inventory, setInventory] = useState<Vehicle[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [sellRequests, setSellRequests] = useState<SellRequest[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  // Modal state
  const [vehicleModal, setVehicleModal] = useState<{ open: boolean; editing: Vehicle | null }>({ open: false, editing: null });
  const [careerModal, setCareerModal] = useState<{ open: boolean; editing: Career | null }>({ open: false, editing: null });
  const [partnerModal, setPartnerModal] = useState<{ open: boolean; editing: Partner | null }>({ open: false, editing: null });
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string; label: string } | null>(null);

  const refresh = useCallback(() => {
    setInventory(getInventory());
    setSales(getSales());
    setSellRequests(getSellRequests());
    setCareers(getCareers());
    setPartners(getPartners());
    setMessages(getMessages());
  }, []);

  useEffect(() => {
    const s = typeof window !== 'undefined'
      ? (JSON.parse(localStorage.getItem('lux2_admin_session') || 'null') as AdminSession | null)
      : null;
    if (!s) { router.replace('/admin/login'); return; }
    setSession(s);
    refresh();
  }, [router, refresh]);

  function handleLogout() {
    adminLogout();
    router.push('/admin/login');
  }

  function confirmDelete(type: string, id: string, label: string) {
    setDeleteConfirm({ type, id, label });
  }

  function executeDelete() {
    if (!deleteConfirm) return;
    const { type, id } = deleteConfirm;
    if (type === 'vehicle') deleteVehicle(id);
    if (type === 'career') deleteCareer(id);
    if (type === 'partner') deletePartner(id);
    setDeleteConfirm(null);
    refresh();
  }

  // ── Chart data
  const chartData = VEHICLE_CLASSES.map((cls) => ({
    name: cls,
    count: inventory.filter((v) => v.class === cls).length,
    sold: inventory.filter((v) => v.class === cls && v.status === 'sold').length,
  }));

  const totalRevenue = sales.reduce((s, r) => s + r.price, 0);
  const available = inventory.filter((v) => v.status === 'available').length;
  const reserved = inventory.filter((v) => v.status === 'reserved').length;
  const unread = messages.filter((m) => !m.read).length;
  const pending = sellRequests.filter((r) => r.status === 'pending').length;

  if (!session) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#c0392b] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const navItems = NAV_ITEMS.filter((n) => !n.ownerOnly || session.role === 'owner');

  // ── Sections ─────────────────────────────────────────────────────────────────

  const OverviewSection = () => (
    <div className="space-y-8">
      <div>
        <h2 className="font-bold text-xl uppercase tracking-wide mb-6">Dashboard Overview</h2>
        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Inventory', value: inventory.length, color: 'text-white' },
            { label: 'Available', value: available, color: 'text-green-400' },
            { label: 'Total Revenue', value: fmt(totalRevenue), color: 'text-[#c0392b]' },
            { label: 'Total Sales', value: sales.length, color: 'text-yellow-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card p-5">
              <p className="text-gray-600 text-xs uppercase tracking-wider mb-2">{label}</p>
              <p className={`font-black text-3xl ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="card p-6">
        <p className="text-gray-500 text-xs uppercase tracking-wider mb-4">Inventory by Class</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }}
              labelStyle={{ color: '#999' }}
              itemStyle={{ color: '#eee' }}
            />
            <Bar dataKey="count" name="Total" radius={[4, 4, 0, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={i % 2 === 0 ? '#c0392b' : '#8b2020'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: <AlertCircle size={16} />, label: 'Pending Sell Requests', value: pending, color: 'text-yellow-400', section: 'sell-requests' as Section },
          { icon: <MessageSquare size={16} />, label: 'Unread Messages', value: unread, color: 'text-blue-400', section: 'messages' as Section },
          { icon: <Car size={16} />, label: 'Reserved Vehicles', value: reserved, color: 'text-orange-400', section: 'inventory' as Section },
        ].map(({ icon, label, value, color, section }) => (
          <button
            key={label}
            onClick={() => setActiveSection(section)}
            className="card p-4 flex items-center gap-4 hover:border-[#c0392b]/40 transition-all text-left"
          >
            <span className={color}>{icon}</span>
            <div>
              <p className={`font-bold text-xl ${color}`}>{value}</p>
              <p className="text-gray-600 text-xs">{label}</p>
            </div>
            <ChevronRight size={14} className="ml-auto text-gray-700" />
          </button>
        ))}
      </div>
    </div>
  );

  const InventorySection = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-xl uppercase tracking-wide">Inventory</h2>
        <button onClick={() => setVehicleModal({ open: true, editing: null })} className="btn-crown py-2 px-4 text-xs">
          <Plus size={14} /> Add Vehicle
        </button>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e1e1e]">
                {['Vehicle', 'Plate', 'Price', 'Status', 'Condition', 'Featured', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-gray-600 uppercase tracking-wider font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inventory.map((v) => (
                <tr key={v.id} className="border-b border-[#1a1a1a] hover:bg-[#151515] transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">{v.brand} {v.model}</p>
                    <p className="text-gray-600 text-xs">{v.class}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs font-mono">{v.plate}</td>
                  <td className="px-4 py-3 text-[#c0392b] font-semibold">{fmt(v.price)}</td>
                  <td className="px-4 py-3">
                    <span className={`status-${v.status}`}>{v.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{v.condition}</td>
                  <td className="px-4 py-3">
                    {v.featured ? <CheckCircle size={14} className="text-[#c0392b]" /> : <span className="text-gray-700">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setVehicleModal({ open: true, editing: v })} className="text-gray-500 hover:text-white transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => confirmDelete('vehicle', v.id, `${v.brand} ${v.model}`)} className="text-gray-500 hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const SalesSection = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-xl uppercase tracking-wide">Sales Log</h2>
        <div className="card px-4 py-2 text-sm">
          Revenue: <span className="text-[#c0392b] font-bold">{fmt(totalRevenue)}</span>
        </div>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e1e1e]">
                {['Vehicle', 'Buyer', 'Price', 'Date'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-gray-600 uppercase tracking-wider font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-600">No sales recorded yet.</td></tr>
              ) : sales.map((s) => (
                <tr key={s.id} className="border-b border-[#1a1a1a] hover:bg-[#151515]">
                  <td className="px-4 py-3 font-medium">{s.vehicleLabel}</td>
                  <td className="px-4 py-3 text-gray-400">{s.buyerName}</td>
                  <td className="px-4 py-3 text-[#c0392b] font-semibold">{fmt(s.price)}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(s.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const SellRequestsSection = () => (
    <div>
      <h2 className="font-bold text-xl uppercase tracking-wide mb-6">Sell Requests</h2>
      {sellRequests.length === 0 ? (
        <div className="card p-12 text-center text-gray-600">No sell requests yet.</div>
      ) : (
        <div className="space-y-4">
          {sellRequests.map((req) => (
            <div key={req.id} className="card p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold">{req.brand} {req.model} ({req.year})</p>
                    <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded ${
                      req.status === 'pending' ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30' :
                      req.status === 'reviewed' ? 'bg-green-500/15 text-green-400 border border-green-500/30' :
                      'bg-red-500/15 text-red-400 border border-red-500/30'
                    }`}>{req.status}</span>
                  </div>
                  <p className="text-gray-500 text-sm">{req.name} &bull; {req.phone} &bull; Plate: {req.plate}</p>
                  <p className="text-[#c0392b] text-sm font-semibold mt-1">{fmt(req.askingPrice)} &bull; {req.condition} &bull; {req.color}</p>
                  {req.notes && <p className="text-gray-600 text-xs mt-2 italic">&ldquo;{req.notes}&rdquo;</p>}
                  <p className="text-gray-700 text-xs mt-2">{fmtDate(req.date)}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => { updateSellStatus(req.id, 'reviewed'); refresh(); }}
                    className="btn-ghost py-1.5 px-3 text-xs text-green-400 border-green-500/30 hover:bg-green-500/10"
                  >
                    <CheckCircle size={12} /> Reviewed
                  </button>
                  <button
                    onClick={() => { updateSellStatus(req.id, 'rejected'); refresh(); }}
                    className="btn-ghost py-1.5 px-3 text-xs text-red-400 border-red-500/30 hover:bg-red-500/10"
                  >
                    <XCircle size={12} /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const CareersSection = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-xl uppercase tracking-wide">Careers</h2>
        <button onClick={() => setCareerModal({ open: true, editing: null })} className="btn-crown py-2 px-4 text-xs">
          <Plus size={14} /> Add Position
        </button>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e1e]">
              {['Title', 'Department', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs text-gray-600 uppercase tracking-wider font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {careers.map((c) => (
              <tr key={c.id} className="border-b border-[#1a1a1a] hover:bg-[#151515]">
                <td className="px-4 py-3 font-medium">{c.title}</td>
                <td className="px-4 py-3 text-gray-500">{c.department}</td>
                <td className="px-4 py-3">
                  {c.active
                    ? <span className="status-available">Active</span>
                    : <span className="status-sold">Inactive</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => setCareerModal({ open: true, editing: c })} className="text-gray-500 hover:text-white"><Pencil size={14} /></button>
                    <button onClick={() => confirmDelete('career', c.id, c.title)} className="text-gray-500 hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const PartnersSection = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-xl uppercase tracking-wide">Partners</h2>
        <button onClick={() => setPartnerModal({ open: true, editing: null })} className="btn-crown py-2 px-4 text-xs">
          <Plus size={14} /> Add Partner
        </button>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e1e]">
              {['Name', 'Website', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs text-gray-600 uppercase tracking-wider font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {partners.map((p) => (
              <tr key={p.id} className="border-b border-[#1a1a1a] hover:bg-[#151515]">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{p.website}</td>
                <td className="px-4 py-3">
                  {p.active
                    ? <span className="status-available">Active</span>
                    : <span className="status-sold">Inactive</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => setPartnerModal({ open: true, editing: p })} className="text-gray-500 hover:text-white"><Pencil size={14} /></button>
                    <button onClick={() => confirmDelete('partner', p.id, p.name)} className="text-gray-500 hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const MessagesSection = () => (
    <div>
      <h2 className="font-bold text-xl uppercase tracking-wide mb-6">Contact Messages</h2>
      {messages.length === 0 ? (
        <div className="card p-12 text-center text-gray-600">No messages yet.</div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`card p-5 ${!msg.read ? 'border-[#c0392b]/30' : ''}`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {!msg.read && <span className="w-2 h-2 rounded-full bg-[#c0392b] flex-shrink-0" />}
                    <p className="font-bold text-sm">{msg.subject}</p>
                  </div>
                  <p className="text-gray-500 text-xs">{msg.name} &bull; {msg.phone} &bull; {fmtDate(msg.date)}</p>
                  <p className="text-gray-300 text-sm mt-2 leading-relaxed">{msg.message}</p>
                </div>
                {!msg.read && (
                  <button
                    onClick={() => { markMessageRead(msg.id); refresh(); }}
                    className="btn-ghost py-1.5 px-3 text-xs flex-shrink-0"
                  >
                    <Eye size={12} /> Mark Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const UsersSection = () => (
    <div>
      <h2 className="font-bold text-xl uppercase tracking-wide mb-6">User Management</h2>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e1e]">
              {['Username', 'Role', 'Password', 'Note'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs text-gray-600 uppercase tracking-wider font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { username: 'admin', role: 'Owner', password: 'lux2025', note: 'Full access — all sections' },
              { username: 'manager', role: 'Manager', password: 'lux2025', note: 'No user management access' },
            ].map((u) => (
              <tr key={u.username} className="border-b border-[#1a1a1a]">
                <td className="px-4 py-3 font-mono font-medium">{u.username}</td>
                <td className="px-4 py-3">
                  <span className={u.role === 'Owner' ? 'text-[#c0392b] font-semibold' : 'text-gray-400'}>{u.role}</span>
                </td>
                <td className="px-4 py-3 font-mono text-gray-500">{u.password}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{u.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 bg-[#0d0d0d] border-t border-[#1a1a1a]">
          <p className="text-gray-600 text-xs">Credentials are hardcoded in <code className="text-gray-500">lib/storage.ts</code>. Change passwords there directly.</p>
        </div>
      </div>
    </div>
  );

  const SECTION_MAP: Record<Section, React.ReactNode> = {
    overview: <OverviewSection />,
    inventory: <InventorySection />,
    sales: <SalesSection />,
    'sell-requests': <SellRequestsSection />,
    careers: <CareersSection />,
    partners: <PartnersSection />,
    messages: <MessagesSection />,
    users: <UsersSection />,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0a]">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-56' : 'w-16'} flex-shrink-0 border-r border-[#1a1a1a] bg-[#0d0d0d] flex flex-col transition-all duration-200`}>
        {/* Logo */}
        <div className="min-h-[100px] flex items-center px-4 border-b border-[#1a1a1a] gap-2">
          {sidebarOpen && (
            <div className="flex flex-col gap-0.5 min-w-0">
              <Image
                src="/images/logo.png"
                alt="Lux Automotive"
                width={100}
                height={26}
                className="object-contain h-auto max-w-[100px]"
              />
              <p className="text-[10px] text-gray-600 capitalize">{session.role} Portal</p>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="ml-auto flex-shrink-0 text-gray-600 hover:text-white">
            <ChevronRight size={16} className={`transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map(({ id, label, icon }) => {
            const badge = id === 'messages' && unread > 0 ? unread : id === 'sell-requests' && pending > 0 ? pending : null;
            return (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`sidebar-link w-full ${activeSection === id ? 'active' : ''}`}
                title={!sidebarOpen ? label : undefined}
              >
                <span className="flex-shrink-0">{icon}</span>
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left">{label}</span>
                    {badge && (
                      <span className="text-xs font-bold bg-[#c0392b] text-white rounded-full w-5 h-5 flex items-center justify-center">
                        {badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-[#1a1a1a] p-2">
          <button onClick={handleLogout} className="sidebar-link w-full hover:text-red-400">
            <LogOut size={16} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {/* Topbar */}
        <div className="sticky top-0 z-10 h-14 flex items-center justify-between px-6 border-b border-[#1a1a1a] bg-[#0a0a0a]/95 backdrop-blur-sm">
          <h1 className="font-bold text-sm uppercase tracking-widest text-gray-400">
            {NAV_ITEMS.find((n) => n.id === activeSection)?.label}
          </h1>
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <span className="capitalize">{session.username}</span>
            <span className="px-2 py-0.5 rounded bg-[#c0392b]/15 text-[#c0392b] border border-[#c0392b]/30 font-semibold uppercase">
              {session.role}
            </span>
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {SECTION_MAP[activeSection]}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {vehicleModal.open && (
          <VehicleModal
            existing={vehicleModal.editing}
            onClose={() => setVehicleModal({ open: false, editing: null })}
            onSave={refresh}
          />
        )}
        {careerModal.open && (
          <CareerModal
            existing={careerModal.editing}
            onClose={() => setCareerModal({ open: false, editing: null })}
            onSave={refresh}
          />
        )}
        {partnerModal.open && (
          <PartnerModal
            existing={partnerModal.editing}
            onClose={() => setPartnerModal({ open: false, editing: null })}
            onSave={refresh}
          />
        )}
        {deleteConfirm && (
          <Modal title="Confirm Delete" onClose={() => setDeleteConfirm(null)}>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete <span className="text-white font-semibold">{deleteConfirm.label}</span>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={executeDelete} className="btn-crown flex-1 py-3 bg-red-600 hover:bg-red-500">
                Delete
              </button>
              <button onClick={() => setDeleteConfirm(null)} className="btn-ghost flex-1 py-3">
                Cancel
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
