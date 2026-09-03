import { beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PropertyCataloguePage from "./PropertyCataloguePage";
import { getProperties } from "../api/propertyApi";

vi.mock("../api/propertyApi", () => ({
  getProperties: vi.fn(),
}));

const demonstrationProperty = {
  id: "10000000-0000-4000-8000-000000000001",
  slug: "demo-green-view-residence-10000000-000",
  title: "Demo Green View Residence",
  description: "A verified demonstration rental property.",
  propertyType: "apartment_building",
  verificationStatus: "verified",
  location: {
    countryCode: "NG",
    stateRegion: "Borno",
    city: "Maiduguri",
    area: "Bolori",
    approximateLatitude: 11.847,
    approximateLongitude: 13.157,
    isLocationVerified: true,
  },
  startingPrices: [
    {
      amount: 300000,
      currency: "NGN",
      billingPeriod: "yearly",
    },
  ],
  availableUnitCount: 1,
  coverMedia: null,
  createdAt: "2026-08-25T23:00:21.06704+00:00",
  updatedAt: "2026-08-25T23:00:21.06704+00:00",
};

describe("PropertyCataloguePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("loads and displays verified properties", async () => {
    getProperties.mockResolvedValue({
      properties: [demonstrationProperty],
      pagination: {
        page: 1,
        limit: 12,
        totalItems: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });

    render(<PropertyCataloguePage />);

    expect(
      screen.getByText("Loading verified properties…")
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("heading", {
        name: "Demo Green View Residence",
      })
    ).toBeInTheDocument();

    expect(screen.getByText("Bolori, Maiduguri, Borno")).toBeInTheDocument();
    expect(screen.getByText("₦300,000 / yearly")).toBeInTheDocument();
    expect(screen.getByText("1 unit available")).toBeInTheDocument();

    expect(getProperties).toHaveBeenCalledOnce();
    expect(getProperties).toHaveBeenCalledWith(
      {
        page: 1,
        limit: 12,
        sort: "newest",
      },
      {
        signal: expect.any(AbortSignal),
      }
    );
  });

  test("displays a helpful empty state", async () => {
    getProperties.mockResolvedValue({
      properties: [],
      pagination: {
        page: 1,
        limit: 12,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });

    render(<PropertyCataloguePage />);

    expect(
      await screen.findByRole("heading", {
        name: "No properties found",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText("Try another city or property type.")
    ).toBeInTheDocument();
  });

  test("displays a safe error message when loading fails", async () => {
    getProperties.mockRejectedValue(
      new Error("Unable to connect to the property service.")
    );

    render(<PropertyCataloguePage />);

    expect(
      await screen.findByRole("heading", {
        name: "We couldn’t load the properties",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText("Unable to connect to the property service.")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Demo Green View Residence")
    ).not.toBeInTheDocument();
  });
});