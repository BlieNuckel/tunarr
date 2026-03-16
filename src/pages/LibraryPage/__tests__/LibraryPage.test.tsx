import { render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import LibraryPage from "../LibraryPage";
import { AuthContext, type AuthContextValue } from "@/context/authContextDef";
import { Permission } from "@shared/permissions";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
  vi.mocked(fetch).mockImplementation(() =>
    Promise.resolve(new Response(JSON.stringify([]), { status: 200 }))
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

function makeAuthContext(permissions: number): AuthContextValue {
  return {
    status: "authenticated",
    user: {
      id: 1,
      username: "testuser",
      userType: "local",
      permissions,
      theme: "system",
      thumb: null,
      hasPlexToken: false,
    },
    login: vi.fn(),
    plexLogin: vi.fn(),
    logout: vi.fn(),
    setup: vi.fn(),
    plexSetup: vi.fn(),
    linkPlex: vi.fn(),
    updatePreferences: vi.fn(),
    refreshUser: vi.fn(),
  };
}

function renderWithAuth(permissions: number) {
  return render(
    <AuthContext.Provider value={makeAuthContext(permissions)}>
      <LibraryPage />
    </AuthContext.Provider>
  );
}

function getFilterGroup(label: string) {
  const groupLabel = screen.getByText(label);
  return within(groupLabel.parentElement!);
}

describe("LibraryPage", () => {
  it("renders page title", async () => {
    renderWithAuth(Permission.REQUEST);

    expect(screen.getByText("Library")).toBeInTheDocument();
  });

  it("shows requester and status filter groups", async () => {
    renderWithAuth(Permission.REQUEST);

    expect(screen.getByText("Requester")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
  });

  it("shows all filter options", async () => {
    renderWithAuth(Permission.REQUEST);

    const requesterGroup = getFilterGroup("Requester");
    expect(
      requesterGroup.getByRole("button", { name: "All" })
    ).toBeInTheDocument();
    expect(
      requesterGroup.getByRole("button", { name: "Mine" })
    ).toBeInTheDocument();

    const statusGroup = getFilterGroup("Status");
    expect(
      statusGroup.getByRole("button", { name: "Pending" })
    ).toBeInTheDocument();
    expect(
      statusGroup.getByRole("button", { name: "Approved" })
    ).toBeInTheDocument();
    expect(
      statusGroup.getByRole("button", { name: "Declined" })
    ).toBeInTheDocument();
  });

  it("defaults to showing all requests with 'All' filter active", async () => {
    renderWithAuth(Permission.ADMIN);

    await waitFor(() => {
      expect(vi.mocked(fetch)).toHaveBeenCalledWith("/api/requests");
    });
  });

  it("fetches only user requests for basic users even with 'All' filter", async () => {
    renderWithAuth(Permission.REQUEST);

    await waitFor(() => {
      expect(vi.mocked(fetch)).toHaveBeenCalledWith("/api/requests?userId=1");
    });
  });

  it("fetches user requests when clicking 'Mine' filter", async () => {
    renderWithAuth(Permission.ADMIN);
    const user = userEvent.setup();
    const requesterGroup = getFilterGroup("Requester");

    await user.click(requesterGroup.getByRole("button", { name: "Mine" }));

    await waitFor(() => {
      expect(vi.mocked(fetch)).toHaveBeenCalledWith("/api/requests?userId=1");
    });
  });

  it("fetches all requests when clicking 'All' filter as admin", async () => {
    renderWithAuth(Permission.ADMIN);
    const user = userEvent.setup();
    const requesterGroup = getFilterGroup("Requester");

    await user.click(requesterGroup.getByRole("button", { name: "Mine" }));
    await user.click(requesterGroup.getByRole("button", { name: "All" }));

    await waitFor(() => {
      expect(vi.mocked(fetch)).toHaveBeenLastCalledWith("/api/requests");
    });
  });

  it("fetches filtered requests when selecting a status", async () => {
    renderWithAuth(Permission.ADMIN);
    const user = userEvent.setup();
    const statusGroup = getFilterGroup("Status");

    await user.click(statusGroup.getByRole("button", { name: "Pending" }));

    await waitFor(() => {
      expect(vi.mocked(fetch)).toHaveBeenCalledWith(
        "/api/requests?status=pending"
      );
    });
  });

  it("combines requester and status filters", async () => {
    renderWithAuth(Permission.ADMIN);
    const user = userEvent.setup();
    const requesterGroup = getFilterGroup("Requester");
    const statusGroup = getFilterGroup("Status");

    await user.click(requesterGroup.getByRole("button", { name: "Mine" }));
    await user.click(statusGroup.getByRole("button", { name: "Approved" }));

    await waitFor(() => {
      expect(vi.mocked(fetch)).toHaveBeenCalledWith(
        "/api/requests?userId=1&status=approved"
      );
    });
  });

  it("shows empty state for user's requests when 'Mine' filter active", async () => {
    renderWithAuth(Permission.ADMIN);
    const user = userEvent.setup();
    const requesterGroup = getFilterGroup("Requester");

    await user.click(requesterGroup.getByRole("button", { name: "Mine" }));

    await waitFor(() => {
      expect(
        screen.getByText("You haven't made any requests yet")
      ).toBeInTheDocument();
    });
  });

  it("shows empty state for all requests when 'All' filter active", async () => {
    renderWithAuth(Permission.ADMIN);

    await waitFor(() => {
      expect(screen.getByText("No requests yet")).toBeInTheDocument();
    });
  });

  it("renders request cards when data is loaded", async () => {
    vi.mocked(fetch).mockImplementation(() =>
      Promise.resolve(
        new Response(
          JSON.stringify([
            {
              id: 1,
              albumMbid: "abc",
              artistName: "Radiohead",
              albumTitle: "OK Computer",
              status: "pending",
              createdAt: "2024-01-01T00:00:00Z",
              updatedAt: "2024-01-01T00:00:00Z",
              approvedAt: null,
              user: { id: 1, username: "testuser", thumb: null },
              lidarr: null,
            },
          ]),
          { status: 200 }
        )
      )
    );

    renderWithAuth(Permission.REQUEST);

    await waitFor(() => {
      expect(screen.getByText("OK Computer")).toBeInTheDocument();
    });
    expect(screen.getByText("Radiohead")).toBeInTheDocument();
  });
});
