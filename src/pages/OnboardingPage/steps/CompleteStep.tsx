interface CompleteStepProps {
  saving: boolean;
  onFinish: () => void;
}

export default function CompleteStep({ saving, onFinish }: CompleteStepProps) {
  return (
    <div className="text-center py-4">
      <div className="text-4xl mb-4">&#10003;</div>
      <h3 className="text-xl font-bold text-white mb-2">You're all set!</h3>
      <p className="text-gray-400 mb-8">
        Your integrations are configured. You can always change these later in
        Settings.
      </p>
      <button
        type="button"
        onClick={onFinish}
        disabled={saving}
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-md text-sm font-medium transition-colors"
      >
        {saving ? "Saving..." : "Go to App"}
      </button>
    </div>
  );
}
