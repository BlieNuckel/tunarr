import { render, screen } from "@testing-library/react";
import LidarrOptionsSection from "../LidarrOptionsSection";

vi.mock("@/components/Dropdown", () => ({
  default: ({ value }: { value: string }) => (
    <div data-testid="dropdown">{value}</div>
  ),
}));

const defaultProps = {
  rootFolders: [{ id: 1, path: "/music" }],
  rootFolderPath: "/music",
  qualityProfiles: [{ id: 1, name: "Any" }],
  qualityProfileId: 1,
  metadataProfiles: [{ id: 1, name: "Standard" }],
  metadataProfileId: 1,
  onRootFolderChange: vi.fn(),
  onQualityProfileChange: vi.fn(),
  onMetadataProfileChange: vi.fn(),
};

describe("LidarrOptionsSection", () => {
  it("renders labels", () => {
    render(<LidarrOptionsSection {...defaultProps} />);
    expect(screen.getByText("Lidarr Root Path")).toBeInTheDocument();
    expect(screen.getByText("Quality Profile")).toBeInTheDocument();
    expect(screen.getByText("Metadata Profile")).toBeInTheDocument();
  });

  it("renders three dropdowns", () => {
    render(<LidarrOptionsSection {...defaultProps} />);
    const dropdowns = screen.getAllByTestId("dropdown");
    expect(dropdowns).toHaveLength(3);
  });
});
