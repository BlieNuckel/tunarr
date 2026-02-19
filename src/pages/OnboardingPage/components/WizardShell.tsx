import type { ReactNode } from "react";
import type { StepId } from "@/hooks/useOnboarding";
import { STEPS } from "@/hooks/useOnboarding";

interface WizardShellProps {
  stepIndex: number;
  currentStep: StepId;
  isOptional: boolean;
  children: ReactNode;
  onBack: () => void;
  onNext: () => void;
  onSkip?: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  showNav?: boolean;
}

const STEP_LABELS: Record<StepId, string> = {
  welcome: "Welcome",
  lidarrConnection: "Lidarr Connection",
  lidarrOptions: "Lidarr Options",
  lastfm: "Last.fm",
  plex: "Plex",
  import: "Import Path",
  complete: "Complete",
};

export default function WizardShell({
  stepIndex,
  currentStep,
  isOptional,
  children,
  onBack,
  onNext,
  onSkip,
  nextDisabled = false,
  nextLabel = "Next",
  showNav = true,
}: WizardShellProps) {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="flex gap-1 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${
                i <= stepIndex ? "bg-indigo-500" : "bg-gray-700"
              }`}
            />
          ))}
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <p className="text-sm text-gray-400 mb-1">
            Step {stepIndex + 1} of {STEPS.length}
            {isOptional && " (Optional)"}
          </p>
          <h2 className="text-xl font-bold text-white mb-6">
            {STEP_LABELS[currentStep]}
          </h2>

          {children}

          {showNav && (
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={onBack}
                disabled={stepIndex === 0}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
              >
                Back
              </button>
              <div className="flex gap-2">
                {isOptional && onSkip && (
                  <button
                    type="button"
                    onClick={onSkip}
                    className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Skip
                  </button>
                )}
                <button
                  type="button"
                  onClick={onNext}
                  disabled={nextDisabled}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-md text-sm transition-colors"
                >
                  {nextLabel}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
