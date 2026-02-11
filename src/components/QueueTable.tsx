import StatusBadge from "./StatusBadge";
import { QueueItem } from "../types";

interface QueueTableProps {
  items: QueueItem[];
}

export default function QueueTable({ items }: QueueTableProps) {
  if (items.length === 0) {
    return <p className="text-gray-500 text-sm">No active downloads.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-400 border-b border-gray-700">
            <th className="pb-2 font-medium">Artist</th>
            <th className="pb-2 font-medium">Album</th>
            <th className="pb-2 font-medium">Quality</th>
            <th className="pb-2 font-medium">Progress</th>
            <th className="pb-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {items.map((item: QueueItem) => (
            <tr key={item.id}>
              <td className="py-2 text-gray-300">
                {(item as any).artist?.artistName || "Unknown"}
              </td>
              <td className="py-2 text-white">
                {(item as any).album?.title || (item as any).title || "Unknown"}
              </td>
              <td className="py-2 text-gray-400">
                {(item as any).quality?.quality?.name || "—"}
              </td>
              <td className="py-2 text-gray-300">
                {(item as any).sizeleft != null && (item as any).size
                  ? `${Math.round((((item as any).size - (item as any).sizeleft) / (item as any).size) * 100)}%`
                  : "—"}
              </td>
              <td className="py-2">
                <StatusBadge
                  status={(item as any).trackedDownloadStatus?.toLowerCase() || "downloading"}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
