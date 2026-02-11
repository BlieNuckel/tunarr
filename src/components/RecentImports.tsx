import StatusBadge from "./StatusBadge";
import { RecentImport } from "../types";

interface RecentImportsProps {
  items: RecentImport[];
}

export default function RecentImports({ items }: RecentImportsProps) {
  if (items.length === 0) {
    return <p className="text-gray-500 text-sm">No recent imports.</p>;
  }

  return (
    <div className="space-y-2">
      {items.map((item: RecentImport) => (
        <div
          key={item.id}
          className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3 border border-gray-700"
        >
          <div>
            <p className="text-white font-medium">
              {(item as any).album?.title || "Unknown Album"}
            </p>
            <p className="text-gray-400 text-sm">
              {(item as any).artist?.artistName || "Unknown Artist"}
            </p>
            <p className="text-gray-500 text-xs mt-1">
              {new Date((item as any).date).toLocaleString()}
            </p>
          </div>
          <StatusBadge status="imported" />
        </div>
      ))}
    </div>
  );
}
