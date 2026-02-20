import { render, screen, waitFor } from "@testing-library/react";
import { LidarrContextProvider } from "../LidarrContext";
import { useLidarrContext } from "../useLidarrContext";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
});

function TestConsumer() {
  const ctx = useLidarrContext();
  return (
    <div>
      <span data-testid="loading">{String(ctx.isLoading)}</span>
      <span data-testid="connected">{String(ctx.isConnected)}</span>
      <span data-testid="url">{ctx.settings.lidarrUrl}</span>
    </div>
  );
}

describe("LidarrContextProvider", () => {
  it("provides initial loading state", () => {
    vi.mocked(fetch).mockReturnValue(new Promise(() => {}));

    render(
      <LidarrContextProvider>
        <TestConsumer />
      </LidarrContextProvider>
    );

    expect(screen.getByTestId("loading")).toHaveTextContent("true");
    expect(screen.getByTestId("connected")).toHaveTextContent("false");
  });

  it("loads settings on mount", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          lidarrUrl: "http://lidarr:8686",
          lidarrApiKey: "key1",
        }),
        { status: 200 }
      )
    );

    render(
      <LidarrContextProvider>
        <TestConsumer />
      </LidarrContextProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });
    expect(screen.getByTestId("url")).toHaveTextContent("http://lidarr:8686");
  });

  it("tests connection when settings have url and key", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            lidarrUrl: "http://lidarr:8686",
            lidarrApiKey: "key1",
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );

    render(
      <LidarrContextProvider>
        <TestConsumer />
      </LidarrContextProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("connected")).toHaveTextContent("true");
    });
  });

  it("handles settings load failure gracefully", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("Network error"));

    render(
      <LidarrContextProvider>
        <TestConsumer />
      </LidarrContextProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });
    expect(screen.getByTestId("connected")).toHaveTextContent("false");
  });

  it("sets isConnected false when test fails", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            lidarrUrl: "http://lidarr:8686",
            lidarrApiKey: "key1",
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: false }), { status: 200 })
      );

    render(
      <LidarrContextProvider>
        <TestConsumer />
      </LidarrContextProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });
    expect(screen.getByTestId("connected")).toHaveTextContent("false");
  });
});
