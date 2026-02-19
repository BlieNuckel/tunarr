import { renderHook, act } from "@testing-library/react";
import { useOnboarding, STEPS } from "../useOnboarding";

const mockNavigate = vi.fn();
const mockTestConnection = vi.fn();
const mockSaveSettings = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("@/context/useLidarrContext", () => ({
  useLidarrContext: () => ({
    testConnection: mockTestConnection,
    saveSettings: mockSaveSettings,
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useOnboarding", () => {
  it("starts at step 0 (welcome)", () => {
    const { result } = renderHook(() => useOnboarding());
    expect(result.current.stepIndex).toBe(0);
    expect(result.current.currentStep).toBe("welcome");
  });

  it("navigates forward and backward", () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => result.current.next());
    expect(result.current.stepIndex).toBe(1);
    expect(result.current.currentStep).toBe("lidarrConnection");

    act(() => result.current.back());
    expect(result.current.stepIndex).toBe(0);
    expect(result.current.currentStep).toBe("welcome");
  });

  it("does not go below step 0", () => {
    const { result } = renderHook(() => useOnboarding());
    act(() => result.current.back());
    expect(result.current.stepIndex).toBe(0);
  });

  it("does not go above last step", () => {
    const { result } = renderHook(() => useOnboarding());
    for (let i = 0; i < STEPS.length + 2; i++) {
      act(() => result.current.next());
    }
    expect(result.current.stepIndex).toBe(STEPS.length - 1);
  });

  it("identifies optional steps", () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => result.current.next());
    act(() => result.current.next());
    act(() => result.current.next());
    expect(result.current.currentStep).toBe("lastfm");
    expect(result.current.isOptional).toBe(true);

    act(() => result.current.next());
    expect(result.current.currentStep).toBe("plex");
    expect(result.current.isOptional).toBe(true);

    act(() => result.current.next());
    expect(result.current.currentStep).toBe("import");
    expect(result.current.isOptional).toBe(true);
  });

  it("updates fields", () => {
    const { result } = renderHook(() => useOnboarding());
    act(() => result.current.updateField("lidarrUrl", "http://test:8686"));
    expect(result.current.fields.lidarrUrl).toBe("http://test:8686");
  });

  it("tests connection and populates defaults from response", async () => {
    mockTestConnection.mockResolvedValue({
      success: true,
      version: "2.0.0",
      qualityProfiles: [{ id: 5, name: "FLAC" }],
      metadataProfiles: [{ id: 3, name: "Standard" }],
      rootFolderPaths: [{ id: 1, path: "/music" }],
    });

    const { result } = renderHook(() => useOnboarding());

    act(() => result.current.updateField("lidarrUrl", "http://test:8686"));
    act(() => result.current.updateField("lidarrApiKey", "key123"));

    await act(async () => {
      await result.current.handleTestConnection();
    });

    expect(result.current.testResult?.success).toBe(true);
    expect(result.current.fields.qualityProfileId).toBe(5);
    expect(result.current.fields.metadataProfileId).toBe(3);
    expect(result.current.fields.rootFolderPath).toBe("/music");
    expect(result.current.testing).toBe(false);
  });

  it("handles test connection failure", async () => {
    mockTestConnection.mockResolvedValue({
      success: false,
      error: "Connection refused",
    });

    const { result } = renderHook(() => useOnboarding());

    await act(async () => {
      await result.current.handleTestConnection();
    });

    expect(result.current.testResult?.success).toBe(false);
    expect(result.current.fields.qualityProfileId).toBe(0);
  });

  it("handles test connection exception", async () => {
    mockTestConnection.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useOnboarding());

    await act(async () => {
      await result.current.handleTestConnection();
    });

    expect(result.current.error).toBe("Failed to test connection");
    expect(result.current.testing).toBe(false);
  });

  it("saves settings and navigates on finish", async () => {
    mockSaveSettings.mockResolvedValue(undefined);

    const { result } = renderHook(() => useOnboarding());
    act(() => result.current.updateField("lidarrUrl", "http://test:8686"));
    act(() => result.current.updateField("lidarrApiKey", "key123"));

    await act(async () => {
      await result.current.handleFinish();
    });

    expect(mockSaveSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        lidarrUrl: "http://test:8686",
        lidarrApiKey: "key123",
      })
    );
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("handles save failure", async () => {
    mockSaveSettings.mockRejectedValue(new Error("Save failed"));

    const { result } = renderHook(() => useOnboarding());

    await act(async () => {
      await result.current.handleFinish();
    });

    expect(result.current.error).toBe("Failed to save settings");
    expect(result.current.saving).toBe(false);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("clears error on navigation", () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => result.current.next());
    expect(result.current.error).toBeNull();
  });
});
