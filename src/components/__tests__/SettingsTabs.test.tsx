import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SettingsTabs from "../SettingsTabs";
import type { SettingsRoute } from "../SettingsTabs";
import { Permission } from "@shared/permissions";

let mockIsMobile = false;

vi.mock("@/hooks/useIsMobile", () => ({
  default: () => mockIsMobile,
}));

vi.mock("@/context/useAuth", () => ({
  useAuth: () => ({
    user: { id: 1, permissions: Permission.ADMIN },
  }),
}));

const testRoutes: SettingsRoute[] = [
  {
    text: "General",
    route: "/settings/general",
    regex: /^\/settings\/general/,
  },
  { text: "Users", route: "/settings/users", regex: /^\/settings\/users/ },
  {
    text: "Secret",
    route: "/settings/secret",
    regex: /^\/settings\/secret/,
    hidden: true,
  },
];

type RenderOptions = {
  parentRoute?: string;
  mobileBackLabel?: string;
  mobileListHeader?: {
    backTo: string;
    backLabel: string;
    title: string;
    subtitle?: string;
  };
  routes?: SettingsRoute[];
};

function renderTabs(path: string, options: RenderOptions = {}) {
  const {
    parentRoute,
    mobileBackLabel,
    mobileListHeader,
    routes = testRoutes,
  } = options;
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SettingsTabs
        settingsRoutes={routes}
        parentRoute={parentRoute}
        mobileBackLabel={mobileBackLabel}
        mobileListHeader={mobileListHeader}
      >
        <div data-testid="tab-content">Content here</div>
      </SettingsTabs>
    </MemoryRouter>
  );
}

describe("SettingsTabs", () => {
  afterEach(() => {
    mockIsMobile = false;
  });

  describe("desktop", () => {
    it("renders desktop tab nav", () => {
      renderTabs("/settings/general", { parentRoute: "/settings" });
      expect(screen.getByTestId("settings-nav-desktop")).toBeInTheDocument();
    });

    it("hides hidden routes", () => {
      renderTabs("/settings/general", { parentRoute: "/settings" });
      const nav = screen.getByTestId("settings-nav-desktop");
      expect(within(nav).queryByText("Secret")).not.toBeInTheDocument();
    });

    it("marks active tab with aria-current", () => {
      renderTabs("/settings/general", { parentRoute: "/settings" });
      const nav = screen.getByTestId("settings-nav-desktop");
      expect(within(nav).getByText("General").closest("a")).toHaveAttribute(
        "aria-current",
        "page"
      );
      expect(within(nav).getByText("Users").closest("a")).not.toHaveAttribute(
        "aria-current"
      );
    });

    it("renders children", () => {
      renderTabs("/settings/general", { parentRoute: "/settings" });
      expect(screen.getByTestId("tab-content")).toBeInTheDocument();
    });

    it("does not render mobile drill-down nav", () => {
      renderTabs("/settings/general", { parentRoute: "/settings" });
      expect(screen.queryByTestId("mobile-drill-down")).not.toBeInTheDocument();
    });
  });

  describe("mobile with parentRoute (drill-down mode)", () => {
    beforeEach(() => {
      mockIsMobile = true;
    });

    it("shows navigation list at parent route", () => {
      renderTabs("/settings", { parentRoute: "/settings" });
      const mobileNav = screen.getByTestId("mobile-drill-down");
      expect(within(mobileNav).getByText("General")).toBeInTheDocument();
      expect(within(mobileNav).getByText("Users")).toBeInTheDocument();
    });

    it("hides children at parent route", () => {
      renderTabs("/settings", { parentRoute: "/settings" });
      expect(screen.queryByTestId("tab-content")).not.toBeInTheDocument();
    });

    it("hides hidden routes in navigation list", () => {
      renderTabs("/settings", { parentRoute: "/settings" });
      const mobileNav = screen.getByTestId("mobile-drill-down");
      expect(within(mobileNav).queryByText("Secret")).not.toBeInTheDocument();
    });

    it("shows mobile sub-page header at child route", () => {
      renderTabs("/settings/general", {
        parentRoute: "/settings",
        mobileBackLabel: "Settings",
      });
      const mobileNav = screen.getByTestId("mobile-drill-down");
      const backLink = within(mobileNav).getByRole("link");
      expect(backLink).toHaveAttribute("href", "/settings");
      expect(backLink).toHaveTextContent("Settings");
      expect(
        within(mobileNav).getByRole("heading", { name: "General" })
      ).toBeInTheDocument();
    });

    it("uses route title for header when provided", () => {
      const routes: SettingsRoute[] = [
        {
          text: "General",
          title: "General Settings",
          subtitle: "Manage general preferences",
          route: "/settings/general",
          regex: /^\/settings\/general/,
        },
      ];
      renderTabs("/settings/general", {
        parentRoute: "/settings",
        mobileBackLabel: "Settings",
        routes,
      });
      const mobileNav = screen.getByTestId("mobile-drill-down");
      expect(
        within(mobileNav).getByRole("heading", { name: "General Settings" })
      ).toBeInTheDocument();
      expect(
        within(mobileNav).getByText("Manage general preferences")
      ).toBeInTheDocument();
    });

    it("defaults back label to 'Back' when mobileBackLabel not provided", () => {
      renderTabs("/settings/general", { parentRoute: "/settings" });
      const mobileNav = screen.getByTestId("mobile-drill-down");
      expect(within(mobileNav).getByRole("link")).toHaveTextContent("Back");
    });

    it("shows children at child route", () => {
      renderTabs("/settings/general", { parentRoute: "/settings" });
      expect(screen.getByTestId("tab-content")).toBeInTheDocument();
    });

    it("navigation list items link to correct routes", () => {
      renderTabs("/settings", { parentRoute: "/settings" });
      const mobileNav = screen.getByTestId("mobile-drill-down");
      expect(
        within(mobileNav).getByText("General").closest("a")
      ).toHaveAttribute("href", "/settings/general");
      expect(within(mobileNav).getByText("Users").closest("a")).toHaveAttribute(
        "href",
        "/settings/users"
      );
    });

    it("skips mobile header when skipMobileHeader is set", () => {
      const routes: SettingsRoute[] = [
        {
          text: "Nested",
          route: "/settings/nested",
          regex: /^\/settings\/nested/,
          skipMobileHeader: true,
        },
      ];
      renderTabs("/settings/nested", { parentRoute: "/settings", routes });
      expect(screen.queryByTestId("mobile-drill-down")).not.toBeInTheDocument();
      expect(screen.getByTestId("tab-content")).toBeInTheDocument();
    });

    it("shows mobileListHeader at parent route when provided", () => {
      renderTabs("/settings/notifications", {
        parentRoute: "/settings/notifications",
        mobileBackLabel: "Notifications",
        mobileListHeader: {
          backTo: "/settings",
          backLabel: "Settings",
          title: "Notifications",
          subtitle: "Configure agents.",
        },
        routes: [
          {
            text: "Email",
            route: "/settings/notifications/email",
            regex: /^\/settings\/notifications\/email/,
          },
        ],
      });
      const mobileNav = screen.getByTestId("mobile-drill-down");
      expect(
        within(mobileNav).getByRole("link", { name: /Settings/ })
      ).toBeInTheDocument();
      expect(
        within(mobileNav).getByRole("heading", { name: "Notifications" })
      ).toBeInTheDocument();
      expect(
        within(mobileNav).getByText("Configure agents.")
      ).toBeInTheDocument();
      expect(within(mobileNav).getByText("Email")).toBeInTheDocument();
    });
  });

  describe("mobile without parentRoute (fallback select)", () => {
    beforeEach(() => {
      mockIsMobile = true;
    });

    it("renders select dropdown when no parentRoute", () => {
      renderTabs("/settings/general");
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("shows children with fallback select", () => {
      renderTabs("/settings/general");
      expect(screen.getByTestId("tab-content")).toBeInTheDocument();
    });
  });

  describe("button tab type", () => {
    it("renders button-style tabs on desktop", () => {
      render(
        <MemoryRouter initialEntries={["/settings/general"]}>
          <SettingsTabs
            tabType="button"
            settingsRoutes={testRoutes}
            parentRoute="/settings"
          >
            <div data-testid="tab-content">Content</div>
          </SettingsTabs>
        </MemoryRouter>
      );
      expect(
        screen.getByRole("navigation", { name: "Tabs" })
      ).toBeInTheDocument();
    });
  });
});
