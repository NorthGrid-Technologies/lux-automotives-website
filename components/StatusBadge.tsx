import { VehicleStatus } from '@/lib/types';

export default function StatusBadge({ status }: { status: VehicleStatus }) {
  return <span className={`status-${status}`}>{status}</span>;
}
