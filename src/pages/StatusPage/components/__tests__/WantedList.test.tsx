import { render, screen, fireEvent } from "@testing-library/react";
import WantedList from "../WantedList";
import type { WantedItem } from "@/types";

describe("WantedList", () => {
  it("shows empty state", () => {
    render(<WantedList items={[]} onSearch={vi.fn()} />);
    expect(screen.getByText("No missing albums.")).toBeInTheDocument();
  });

  it("renders items with title and artist", () => {
    const items: WantedItem[] = [
      { id: 1, title: "Kid A", artist: { artistName: "Radiohead" } },
    ];
    render(<WantedList items={items} onSearch={vi.fn()} />);
    expect(screen.getByText("Kid A")).toBeInTheDocument();
    expect(screen.getByText("Radiohead")).toBeInTheDocument();
  });

  it("calls onSearch with album id when Search is clicked", () => {
    const onSearch = vi.fn();
    const items: WantedItem[] = [
      { id: 42, title: "Test", artist: { artistName: "Artist" } },
    ];
    render(<WantedList items={items} onSearch={onSearch} />);

    fireEvent.click(screen.getByText("Search"));
    expect(onSearch).toHaveBeenCalledWith(42);
  });
});
