import { ApproveIcon, DeclineIcon } from "@/components/icons";

interface RequestCardActionsProps {
  requestId: number;
  onApprove?: (id: number) => void;
  onDecline?: (id: number) => void;
}

export default function RequestCardActions({
  requestId,
  onApprove,
  onDecline,
}: RequestCardActionsProps) {
  return (
    <>
      <button
        onClick={() => onDecline?.(requestId)}
        aria-label="Decline request"
        className="w-9 h-9 flex items-center justify-center bg-gray-200 dark:bg-gray-700 hover:bg-rose-100 dark:hover:bg-rose-900 text-gray-700 dark:text-gray-300 hover:text-rose-600 rounded-lg border-2 border-black shadow-cartoon-sm hover:-translate-y-px hover:shadow-cartoon-md active:translate-y-px active:shadow-cartoon-pressed transition-all"
      >
        <DeclineIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => onApprove?.(requestId)}
        aria-label="Approve request"
        className="w-9 h-9 flex items-center justify-center bg-emerald-400 hover:bg-emerald-300 text-black rounded-lg border-2 border-black shadow-cartoon-sm hover:-translate-y-px hover:shadow-cartoon-md active:translate-y-px active:shadow-cartoon-pressed transition-all"
      >
        <ApproveIcon className="w-4 h-4" />
      </button>
    </>
  );
}
