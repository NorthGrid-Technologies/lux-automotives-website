import {
  Vehicle, SaleRecord, SellRequest, Career, Partner, ContactMessage, AdminSession
} from './types';
import { SEED_VEHICLES, SEED_CAREERS, SEED_PARTNERS } from './seedData';

const isBrowser = () => typeof window !== 'undefined';

// ─── Keys ─────────────────────────────────────────────────────────────────────
const K = {
  inventory: 'lux2_inventory',
  sales: 'lux2_sales',
  sellRequests: 'lux2_sell_requests',
  careers: 'lux2_careers',
  partners: 'lux2_partners',
  messages: 'lux2_messages',
  session: 'lux2_admin_session',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (!isBrowser()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// ─── Inventory ────────────────────────────────────────────────────────────────
export function getInventory(): Vehicle[] {
  if (!isBrowser()) return SEED_VEHICLES;
  const stored = read<Vehicle[] | null>(K.inventory, null);
  if (!stored) {
    write(K.inventory, SEED_VEHICLES);
    return SEED_VEHICLES;
  }
  return stored;
}

export function saveInventory(vehicles: Vehicle[]) {
  write(K.inventory, vehicles);
}

export function getVehicleById(id: string): Vehicle | undefined {
  return getInventory().find((v) => v.id === id);
}

export function upsertVehicle(vehicle: Vehicle) {
  const all = getInventory();
  const idx = all.findIndex((v) => v.id === vehicle.id);
  if (idx >= 0) all[idx] = vehicle;
  else all.unshift(vehicle);
  saveInventory(all);
}

export function deleteVehicle(id: string) {
  saveInventory(getInventory().filter((v) => v.id !== id));
}

export function newVehicleId() {
  return 'v' + uid();
}

// ─── Sales ────────────────────────────────────────────────────────────────────
export function getSales(): SaleRecord[] {
  return read<SaleRecord[]>(K.sales, []);
}

export function recordSale(vehicleId: string, buyerName: string): void {
  const vehicles = getInventory();
  const idx = vehicles.findIndex((v) => v.id === vehicleId);
  if (idx < 0) throw new Error('Vehicle not found');
  const v = vehicles[idx];
  v.status = 'sold';
  v.soldCount = (v.soldCount ?? 0) + 1;
  vehicles[idx] = v;
  saveInventory(vehicles);

  const sales = getSales();
  const record: SaleRecord = {
    id: uid(),
    vehicleId,
    vehicleLabel: `${v.brand} ${v.model}`,
    price: v.price,
    buyerName,
    date: new Date().toISOString(),
  };
  write(K.sales, [record, ...sales]);
}

// ─── Sell Requests ────────────────────────────────────────────────────────────
export function getSellRequests(): SellRequest[] {
  return read<SellRequest[]>(K.sellRequests, []);
}

export function saveSellRequest(req: Omit<SellRequest, 'id' | 'date' | 'status'>) {
  const requests = getSellRequests();
  const full: SellRequest = { ...req, id: uid(), date: new Date().toISOString(), status: 'pending' };
  write(K.sellRequests, [full, ...requests]);
}

export function updateSellStatus(id: string, status: SellRequest['status']) {
  const all = getSellRequests().map((r) => r.id === id ? { ...r, status } : r);
  write(K.sellRequests, all);
}

// ─── Careers ──────────────────────────────────────────────────────────────────
export function getCareers(): Career[] {
  if (!isBrowser()) return SEED_CAREERS;
  const stored = read<Career[] | null>(K.careers, null);
  if (!stored) {
    write(K.careers, SEED_CAREERS);
    return SEED_CAREERS;
  }
  return stored;
}

export function upsertCareer(career: Career) {
  const all = getCareers();
  const idx = all.findIndex((c) => c.id === career.id);
  if (idx >= 0) all[idx] = career;
  else all.unshift(career);
  write(K.careers, all);
}

export function deleteCareer(id: string) {
  write(K.careers, getCareers().filter((c) => c.id !== id));
}

export function newCareerId() {
  return 'c' + uid();
}

// ─── Partners ─────────────────────────────────────────────────────────────────
export function getPartners(): Partner[] {
  if (!isBrowser()) return SEED_PARTNERS;
  const stored = read<Partner[] | null>(K.partners, null);
  if (!stored) {
    write(K.partners, SEED_PARTNERS);
    return SEED_PARTNERS;
  }
  return stored;
}

export function upsertPartner(partner: Partner) {
  const all = getPartners();
  const idx = all.findIndex((p) => p.id === partner.id);
  if (idx >= 0) all[idx] = partner;
  else all.unshift(partner);
  write(K.partners, all);
}

export function deletePartner(id: string) {
  write(K.partners, getPartners().filter((p) => p.id !== id));
}

export function newPartnerId() {
  return 'p' + uid();
}

// ─── Contact Messages ─────────────────────────────────────────────────────────
export function getMessages(): ContactMessage[] {
  return read<ContactMessage[]>(K.messages, []);
}

export function saveMessage(msg: Omit<ContactMessage, 'id' | 'date' | 'read'>) {
  const all = getMessages();
  const full: ContactMessage = { ...msg, id: uid(), date: new Date().toISOString(), read: false };
  write(K.messages, [full, ...all]);
}

export function markMessageRead(id: string) {
  write(K.messages, getMessages().map((m) => m.id === id ? { ...m, read: true } : m));
}

// ─── Admin Session ────────────────────────────────────────────────────────────
const CREDENTIALS: Record<string, { password: string; role: 'owner' | 'manager' }> = {
  admin: { password: 'lux2025', role: 'owner' },
  manager: { password: 'lux2025', role: 'manager' },
};

export function adminLogin(username: string, password: string): AdminSession | null {
  const cred = CREDENTIALS[username.toLowerCase()];
  if (!cred || cred.password !== password) return null;
  const session: AdminSession = { username, role: cred.role, loginTime: new Date().toISOString() };
  write(K.session, session);
  return session;
}

export function getAdminSession(): AdminSession | null {
  return read<AdminSession | null>(K.session, null);
}

export function adminLogout() {
  if (isBrowser()) localStorage.removeItem(K.session);
}
