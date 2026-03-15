import { useState, useCallback, useEffect, useMemo } from "react";
import { useLidarrContext } from "@/context/useLidarrContext";
import { useAutoSave } from "@/hooks/useAutoSave";
import useAutoSetupStatus from "@/hooks/useAutoSetupStatus";
import useActiveSectionObserver from "@/hooks/useActiveSectionObserver";
import { useAuth } from "@/context/useAuth";
import LidarrConnectionSection from "./components/LidarrConnectionSection";
import LidarrOptionsSection from "./components/LidarrOptionsSection";
import LastfmSection from "./components/LastfmSection";
import PlexSection from "./components/PlexSection";
import SlskdSection from "./components/SlskdSection";
import AutoSetupModal from "./components/AutoSetupModal";
import ImportSection from "./components/ImportSection";
import RecommendationsSection from "./components/RecommendationsSection";
import UsersSection from "./components/UsersSection";
import LogsSection from "./components/LogsSection";
import { DEFAULT_PROMOTED_ALBUM } from "@/context/promotedAlbumDefaults";
import AccountSection from "./components/AccountSection";
import ThemeToggle from "@/components/ThemeToggle";
import Skeleton from "@/components/Skeleton";
import SettingsSearch from "./components/SettingsSearch";
import SaveStatusIndicator from "./components/SaveStatusIndicator";
import { DesktopToc, MobileTocBar } from "@/components/TableOfContents";
import type { TocSection } from "@/components/TableOfContents";
import type { LidarrSettings, LidarrOptions } from "@/context/lidarrContextDef";
import {
  filterSections,
  getVisibleSections,
  SECTION_META,
  TAB_LABELS,
  type SettingsSection,
} from "./settingsSearchConfig";

type TestResult = {
  success: boolean;
  version?: string;
  error?: string;
};

type AutoSetupStatus = {
  indexerExists: boolean;
  downloadClientExists: boolean;
} | null;

function SectionBadge({ section }: { section: SettingsSection }) {
  const meta = SECTION_META[section];
  return (
    <span className="inline-block text-xs font-medium px-2 py-0.5 mb-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
      {TAB_LABELS[meta.tab]}
    </span>
  );
}

function sectionToTocItem(section: SettingsSection): TocSection {
  return { id: section, label: SECTION_META[section].label };
}

function scrollToSection(id: string) {
  document.getElementById(`settings-${id}`)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export default function SettingsPage() {
  const {
    options,
    settings,
    isLoading,
    isConnected,
    savePartialSettings,
    testConnection,
    loadLidarrOptionValues,
  } = useLidarrContext();

  const { user } = useAuth();

  const { fields, saveStatus, saveError, updateField, updateFields } =
    useAutoSave(settings, savePartialSettings);

  const {
    status: autoSetupStatus,
    loading: autoSetupLoading,
    refetch: refetchAutoSetup,
  } = useAutoSetupStatus();

  const [searchQuery, setSearchQuery] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [autoSetupModalOpen, setAutoSetupModalOpen] = useState(false);

  const allSections = useMemo(
    () => getVisibleSections(user?.permissions),
    [user]
  );

  const matchingSections = searchQuery
    ? filterSections(searchQuery, user?.permissions)
    : [];
  const isSearching = searchQuery.length > 0;

  const visibleSections = isSearching ? matchingSections : allSections;

  const tocSections = useMemo(
    () => visibleSections.map(sectionToTocItem),
    [visibleSections]
  );

  const sectionIds = useMemo(
    () => visibleSections.map((s) => `settings-${s}`),
    [visibleSections]
  );

  const { activeSection: activeObservedId, sectionRefs } =
    useActiveSectionObserver(sectionIds);

  const activeSection = activeObservedId?.replace("settings-", "") ?? null;

  const handleAutoSetupSuccess = useCallback(() => {
    refetchAutoSetup();
  }, [refetchAutoSetup]);

  useEffect(() => {
    loadLidarrOptionValues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTest = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setTesting(true);
      setTestResult(null);

      try {
        const result = await testConnection({
          ...fields,
          lidarrUrl: fields.lidarrUrl,
          lidarrApiKey: fields.lidarrApiKey,
        });
        setTestResult(result);
        if (result.success) {
          await loadLidarrOptionValues();
        }
      } catch (err) {
        setTestResult({
          success: false,
          error: err instanceof Error ? err.message : "Test failed",
        });
      } finally {
        setTesting(false);
      }
    },
    [fields, testConnection, loadLidarrOptionValues]
  );

  const handlePlexLoginComplete = useCallback(
    (serverUrl: string) => {
      updateFields({ plexUrl: serverUrl });
    },
    [updateFields]
  );

  const handlePlexSignOut = useCallback(() => {
    updateFields({ plexUrl: "" });
  }, [updateFields]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Settings
        </h1>
        <SaveStatusIndicator status={saveStatus} error={saveError} />
      </div>

      <SettingsSearch query={searchQuery} onQueryChange={setSearchQuery} />

      <div className="flex gap-8">
        <div className="flex-1 min-w-0 divide-y divide-gray-200 dark:divide-gray-700">
          {visibleSections.map((section) => (
            <div
              key={section}
              id={`settings-${section}`}
              ref={sectionRefs[`settings-${section}`]}
              className="py-8 first:pt-0"
            >
              {isSearching && <SectionBadge section={section} />}
              <SettingsSectionContent
                section={section}
                fields={fields}
                options={options}
                testing={testing}
                isConnected={isConnected}
                autoSetupStatus={autoSetupStatus}
                autoSetupLoading={autoSetupLoading}
                updateField={updateField}
                onTest={handleTest}
                onPlexLoginComplete={handlePlexLoginComplete}
                onPlexSignOut={handlePlexSignOut}
                onAutoSetup={() => setAutoSetupModalOpen(true)}
              />
            </div>
          ))}
        </div>

        <DesktopToc
          sections={tocSections}
          activeSection={activeSection}
          onSelect={scrollToSection}
        />
      </div>

      <MobileTocBar
        sections={tocSections}
        activeSection={activeSection}
        onSelect={scrollToSection}
      />

      {testResult && (
        <div
          className={`mt-4 p-3 rounded-xl text-sm font-medium border-2 border-black shadow-cartoon-sm animate-slide-up ${
            testResult.success
              ? "bg-emerald-400 text-black"
              : "bg-rose-400 text-white"
          }`}
        >
          {testResult.success
            ? `Connected! Lidarr v${testResult.version}`
            : `Connection failed: ${testResult.error}`}
        </div>
      )}

      <AutoSetupModal
        isOpen={autoSetupModalOpen}
        onClose={() => setAutoSetupModalOpen(false)}
        onSuccess={handleAutoSetupSuccess}
      />
    </div>
  );
}

interface SettingsSectionContentProps {
  section: SettingsSection;
  fields: LidarrSettings;
  options: LidarrOptions;
  testing: boolean;
  isConnected: boolean;
  autoSetupStatus: AutoSetupStatus;
  autoSetupLoading: boolean;
  updateField: <K extends keyof LidarrSettings>(
    key: K,
    value: LidarrSettings[K]
  ) => void;
  onTest: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onPlexLoginComplete: (serverUrl: string) => void;
  onPlexSignOut: () => void;
  onAutoSetup: () => void;
}

function SettingsSectionContent({
  section,
  fields,
  options,
  testing,
  isConnected,
  autoSetupStatus,
  autoSetupLoading,
  updateField,
  onTest,
  onPlexLoginComplete,
  onPlexSignOut,
  onAutoSetup,
}: SettingsSectionContentProps) {
  switch (section) {
    case "account":
      return <AccountSection />;
    case "theme":
      return (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Theme
          </h2>
          <ThemeToggle />
        </div>
      );
    case "import":
      return (
        <ImportSection
          importPath={fields.importPath}
          onImportPathChange={(v) => updateField("importPath", v)}
        />
      );
    case "lidarrConnection":
      return (
        <LidarrConnectionSection
          url={fields.lidarrUrl}
          apiKey={fields.lidarrApiKey}
          testing={testing}
          onUrlChange={(v) => updateField("lidarrUrl", v)}
          onApiKeyChange={(v) => updateField("lidarrApiKey", v)}
          onTest={onTest}
        />
      );
    case "lidarrOptions":
      return (
        <LidarrOptionsSection
          rootFolders={options.rootFolderPaths}
          rootFolderPath={fields.lidarrRootFolderPath}
          qualityProfiles={options.qualityProfiles}
          qualityProfileId={fields.lidarrQualityProfileId}
          metadataProfiles={options.metadataProfiles}
          metadataProfileId={fields.lidarrMetadataProfileId}
          onRootFolderChange={(v) => updateField("lidarrRootFolderPath", v)}
          onQualityProfileChange={(v) =>
            updateField("lidarrQualityProfileId", v)
          }
          onMetadataProfileChange={(v) =>
            updateField("lidarrMetadataProfileId", v)
          }
        />
      );
    case "lastfm":
      return (
        <LastfmSection
          apiKey={fields.lastfmApiKey}
          onApiKeyChange={(v) => updateField("lastfmApiKey", v)}
        />
      );
    case "plex":
      return (
        <PlexSection
          url={fields.plexUrl}
          onUrlChange={(v) => updateField("plexUrl", v)}
          onSignOut={onPlexSignOut}
          onLoginComplete={onPlexLoginComplete}
        />
      );
    case "slskd":
      return (
        <SlskdSection
          url={fields.slskdUrl}
          apiKey={fields.slskdApiKey}
          downloadPath={fields.slskdDownloadPath}
          onUrlChange={(v) => updateField("slskdUrl", v)}
          onApiKeyChange={(v) => updateField("slskdApiKey", v)}
          onDownloadPathChange={(v) => updateField("slskdDownloadPath", v)}
          isConnected={isConnected}
          autoSetupStatus={autoSetupStatus}
          autoSetupLoading={autoSetupLoading}
          onAutoSetup={onAutoSetup}
        />
      );
    case "recommendations":
      return (
        <RecommendationsSection
          config={fields.promotedAlbum ?? DEFAULT_PROMOTED_ALBUM}
          onConfigChange={(updated) => updateField("promotedAlbum", updated)}
        />
      );
    case "users":
      return <UsersSection />;
    case "logs":
      return <LogsSection />;
  }
}
