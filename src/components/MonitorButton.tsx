import { MonitorState } from "../types";
import { states } from "./states";

interface MonitorButtonProps {
  state: MonitorState;
  onClick: () => void;
  errorMsg?: string;
}

export default function MonitorButton({
  state,
  onClick,
  errorMsg,
}: MonitorButtonProps) {
  const config = states[state] || states.idle;
  const disabled =
    state === "adding" || state === "success" || state === "already_monitored";

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${config.className}`}
      >
        {config.label}
      </button>
      {state === "error" && errorMsg && (
        <p className="text-red-400 text-xs max-w-48 text-right">{errorMsg}</p>
      )}
    </div>
  );
}
