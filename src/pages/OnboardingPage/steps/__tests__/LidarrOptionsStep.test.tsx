import { render, screen } from "@testing-library/react";
import LidarrOptionsStep from "../LidarrOptionsStep";

vi.mock("@/components/Dropdown", () => ({
  default: ({ value }: { value: string }) => (
    <div data-testid="dropdown">{value}</div>
  ),
}));

const defaultProps = {
  qualityProfiles: [{ id: 1, name: "Any" }],
  qualityProfileId: 1,
  metadataProfiles: [{ id: 1, name: "Standard" }],
  metadataProfileId: 1,
  rootFolderPaths: [{ id: 1, path: "/music" }],
  rootFolderPath: "/music",
  onQualityProfileChange: vi.fn(),
  onMetadataProfileChange: vi.fn(),
  onRootFolderChange: vi.fn(),
};

describe("LidarrOptionsStep", () => {
  it("renders step description", () => {
    render(<LidarrOptionsStep {...defaultProps} />);
    expect(
      screen.getByText(/Choose your default Lidarr settings/)
    ).toBeInTheDocument();
  });

  it("renders Root Folder label", () => {
    render(<LidarrOptionsStep {...defaultProps} />);
    expect(screen.getByText("Root Folder")).toBeInTheDocument();
  });

  it("renders Quality Profile label", () => {
    render(<LidarrOptionsStep {...defaultProps} />);
    expect(screen.getByText("Quality Profile")).toBeInTheDocument();
  });

  it("renders Metadata Profile label", () => {
    render(<LidarrOptionsStep {...defaultProps} />);
    expect(screen.getByText("Metadata Profile")).toBeInTheDocument();
  });

  it("renders three dropdowns", () => {
    render(<LidarrOptionsStep {...defaultProps} />);
    const dropdowns = screen.getAllByTestId("dropdown");
    expect(dropdowns).toHaveLength(3);
  });
});
