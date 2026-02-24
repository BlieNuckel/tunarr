import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetEnrichedHistory = vi.fn();

vi.mock("../../services/lidarr/history", () => ({
  getEnrichedHistory: (...args: unknown[]) => mockGetEnrichedHistory(...args),
}));

import express from "express";
import request from "supertest";
import historyRouter from "./history";

const app = express();
app.use("/", historyRouter);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /history", () => {
  it("calls getEnrichedHistory with default page and pageSize", async () => {
    mockGetEnrichedHistory.mockResolvedValue({
      status: 200,
      data: { page: 1, pageSize: 20, totalRecords: 0, records: [] },
    });

    const res = await request(app).get("/history");

    expect(res.status).toBe(200);
    expect(mockGetEnrichedHistory).toHaveBeenCalledWith(1, 20);
  });

  it("forwards page and pageSize query params", async () => {
    mockGetEnrichedHistory.mockResolvedValue({
      status: 200,
      data: { page: 3, pageSize: 50, totalRecords: 0, records: [] },
    });

    await request(app).get("/history?page=3&pageSize=50");

    expect(mockGetEnrichedHistory).toHaveBeenCalledWith("3", "50");
  });

  it("proxies status code from service result", async () => {
    mockGetEnrichedHistory.mockResolvedValue({
      status: 404,
      data: { page: 1, pageSize: 20, totalRecords: 0, records: [] },
    });

    const res = await request(app).get("/history");
    expect(res.status).toBe(404);
  });

  it("returns enriched records from service", async () => {
    mockGetEnrichedHistory.mockResolvedValue({
      status: 200,
      data: {
        page: 1,
        pageSize: 20,
        totalRecords: 1,
        records: [
          {
            id: 1,
            albumId: 100,
            date: "2025-01-01",
            sourceIndexer: "Prowlarr",
            artist: { id: 1, artistName: "Test Artist" },
            album: { id: 100, title: "Test Album" },
          },
        ],
      },
    });

    const res = await request(app).get("/history");

    expect(res.status).toBe(200);
    expect(res.body.records[0].sourceIndexer).toBe("Prowlarr");
    expect(res.body.records[0]).not.toHaveProperty("downloadId");
    expect(res.body.records[0]).not.toHaveProperty("data");
  });
});
