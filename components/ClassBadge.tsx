import { VehicleClass } from '@/lib/types';

const MAP: Record<VehicleClass, string> = {
  Super: 'badge-super',
  Sports: 'badge-sports',
  Muscle: 'badge-muscle',
  SUV: 'badge-suv',
  Motorcycle: 'badge-motorcycle',
};

export default function ClassBadge({ cls }: { cls: VehicleClass }) {
  return <span className={`class-badge ${MAP[cls]}`}>{cls}</span>;
}
