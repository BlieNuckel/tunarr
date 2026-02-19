interface WelcomeStepProps {
  onGetStarted: () => void;
}

export default function WelcomeStep({ onGetStarted }: WelcomeStepProps) {
  return (
    <div className="text-center py-4">
      <h1 className="text-3xl font-bold text-white mb-4">
        Welcome to Music Requester
      </h1>
      <p className="text-gray-400 mb-8 max-w-md mx-auto">
        Music Requester helps you discover and add music to your Lidarr library.
        Let's get your integrations set up so you can start requesting albums.
      </p>
      <button
        type="button"
        onClick={onGetStarted}
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors"
      >
        Get Started
      </button>
    </div>
  );
}
