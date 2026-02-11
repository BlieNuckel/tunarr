import { useState, useEffect, useCallback } from "react";

interface Settings {
  lidarrUrl: string;
  lidarrApiKey: string;
}

interface TestResult {
  success: boolean;
  version?: string;
  error?: string;
}

export default function useSettings() {
  const [settings, setSettings] = useState<Settings>({ lidarrUrl: "", lidarrApiKey: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const save = useCallback(async (values: Settings) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }
      setSettings({ lidarrUrl: values.lidarrUrl, lidarrApiKey: "••••" + values.lidarrApiKey.slice(-4) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }, []);

  const testConnection = useCallback(async (values: Settings) => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/settings/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Connection failed");
      setTestResult({ success: true, version: data.version });
    } catch (err) {
      setTestResult({ success: false, error: err instanceof Error ? err.message : "Connection failed" });
    } finally {
      setTesting(false);
    }
  }, []);

  return { settings, loading, saving, testing, testResult, error, save, testConnection };
}
