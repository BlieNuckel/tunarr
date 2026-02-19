import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLidarrContext } from "@/context/useLidarrContext";

export const STEPS = [
  "welcome",
  "lidarrConnection",
  "lidarrOptions",
  "lastfm",
  "plex",
  "import",
  "complete",
] as const;

export type StepId = (typeof STEPS)[number];

export interface OnboardingFields {
  lidarrUrl: string;
  lidarrApiKey: string;
  qualityProfileId: number;
  rootFolderPath: string;
  metadataProfileId: number;
  lastfmApiKey: string;
  plexUrl: string;
  plexToken: string;
  importPath: string;
}

export interface TestResult {
  success: boolean;
  version?: string;
  error?: string;
  qualityProfiles?: { id: number; name: string }[];
  metadataProfiles?: { id: number; name: string }[];
  rootFolderPaths?: { id: number; path: string }[];
}

const OPTIONAL_STEPS: StepId[] = ["lastfm", "plex", "import"];

export function useOnboarding() {
  const { testConnection, saveSettings } = useLidarrContext();
  const navigate = useNavigate();

  const [stepIndex, setStepIndex] = useState(0);
  const [fields, setFields] = useState<OnboardingFields>({
    lidarrUrl: "",
    lidarrApiKey: "",
    qualityProfileId: 0,
    rootFolderPath: "",
    metadataProfileId: 0,
    lastfmApiKey: "",
    plexUrl: "",
    plexToken: "",
    importPath: "",
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentStep = STEPS[stepIndex];
  const isOptional = OPTIONAL_STEPS.includes(currentStep);

  const updateField = <K extends keyof OnboardingFields>(
    key: K,
    value: OnboardingFields[K]
  ) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const next = () => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
      setError(null);
    }
  };

  const back = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
      setError(null);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    setError(null);

    try {
      const result = await testConnection({
        lidarrUrl: fields.lidarrUrl,
        lidarrApiKey: fields.lidarrApiKey,
        lidarrQualityProfileId: fields.qualityProfileId,
        lidarrRootFolderPath: fields.rootFolderPath,
        lidarrMetadataProfileId: fields.metadataProfileId,
        lastfmApiKey: "",
        plexUrl: "",
        plexToken: "",
        importPath: "",
      });

      setTestResult(result);

      if (result.success) {
        if (result.qualityProfiles?.length) {
          updateField("qualityProfileId", result.qualityProfiles[0].id);
        }
        if (result.rootFolderPaths?.length) {
          updateField("rootFolderPath", result.rootFolderPaths[0].path);
        }
        if (result.metadataProfiles?.length) {
          updateField("metadataProfileId", result.metadataProfiles[0].id);
        }
      }
    } catch {
      setError("Failed to test connection");
    } finally {
      setTesting(false);
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    setError(null);

    try {
      await saveSettings({
        lidarrUrl: fields.lidarrUrl,
        lidarrApiKey: fields.lidarrApiKey,
        lidarrQualityProfileId: fields.qualityProfileId,
        lidarrRootFolderPath: fields.rootFolderPath,
        lidarrMetadataProfileId: fields.metadataProfileId,
        lastfmApiKey: fields.lastfmApiKey,
        plexUrl: fields.plexUrl,
        plexToken: fields.plexToken,
        importPath: fields.importPath,
      });
      navigate("/");
    } catch {
      setError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return {
    stepIndex,
    currentStep,
    totalSteps: STEPS.length,
    isOptional,
    fields,
    testing,
    testResult,
    saving,
    error,
    updateField,
    next,
    back,
    handleTestConnection,
    handleFinish,
  };
}
