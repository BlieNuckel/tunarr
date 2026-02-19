import { renderHook } from "@testing-library/react";
import { useLidarrContext } from "../useLidarrContext";

describe("useLidarrContext", () => {
  it("throws when used outside LidarrContextProvider", () => {
    expect(() => {
      renderHook(() => useLidarrContext());
    }).toThrow("useLidarrContext must be used within LidarrContextProvider");
  });
});
