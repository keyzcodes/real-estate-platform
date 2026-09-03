import { beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  MemoryRouter,
  Route,
  Routes,
} from "react-router-dom";
import PropertyDetailPage from "./PropertyDetailPage";
import { getPropertyBySlug } from "../api/propertyApi";

vi.mock("../api/propertyApi", () => ({
  getPropertyBySlug: vi.fn(),
}));

const property = {
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
  amenities: [
    {
      id: "amenity-1",
      name: "Running Water",
      slug: "running-water",
      category: "utilities",
      description: "Regular water supply is available.",
      allowedScope: "both",
    },
  ],
  units: [
    {
      id: "unit-1",
      unitName: "Room A12",
      unitType: "self_contained",
      description: "Private self-contained room.",
      bedrooms: 1,
      bathrooms: 1,
      maximumOccupants: 2,
      baseRent: {
        amount: 300000,
        currency: "NGN",
        billingPeriod: "yearly",
      },
      availability: {
        status: "available",
        availableFrom: "2026-09-01",
      },
      fees: [
        {
          id: "fee-1",
          feeType: "caution",
          feeName: "Refundable caution deposit",
          description: "Refundable under the tenancy conditions.",
          amount: 30000,
          currency: "NGN",
          paymentFrequency: "one_time",
          isMandatory: true,
          isRefundable: true,
        },
      ],
      amenities: [],
    },
  ],
  media: [],
  createdAt: "2026-08-25T23:00:21.06704+00:00",
  updatedAt: "2026-08-25T23:00:21.06704+00:00",
};

function renderPropertyDetailPage() {
  return render(
    <MemoryRouter
      initialEntries={[
        "/properties/demo-green-view-residence-10000000-000",
      ]}
    >
      <Routes>
        <Route
          path="/properties/:slug"
          element={<PropertyDetailPage />}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("PropertyDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("displays property details and transparent pricing", async () => {
    getPropertyBySlug.mockResolvedValue(property);

    renderPropertyDetailPage();

    expect(
      screen.getByText("Loading property details…")
    ).toBeInTheDocument();

    expect(
  await screen.findByRole("heading", {
    name: "Demo Green View Residence",
  })
).toBeInTheDocument();
    expect(screen.getByText("Bolori, Maiduguri, Borno")).toBeInTheDocument();
    expect(screen.getByText("Running Water")).toBeInTheDocument();
    expect(screen.getByText("Room A12")).toBeInTheDocument();
    expect(screen.getByText("₦300,000 / yearly")).toBeInTheDocument();
    expect(
      screen.getByText("Refundable caution deposit")
    ).toBeInTheDocument();
    expect(screen.getByText("₦30,000")).toBeInTheDocument();
    expect(
      screen.getByText("One Time · Mandatory · Refundable")
    ).toBeInTheDocument();

    expect(
      screen.getByText(/exact address and coordinates remain protected/i)
    ).toBeInTheDocument();

    expect(screen.queryByText("Exact street address")).not.toBeInTheDocument();

    expect(getPropertyBySlug).toHaveBeenCalledOnce();
    expect(getPropertyBySlug).toHaveBeenCalledWith(
      "demo-green-view-residence-10000000-000",
      {
        signal: expect.any(AbortSignal),
      }
    );
  });

  test("displays a privacy-preserving not-found state", async () => {
    const notFoundError = Object.assign(
      new Error("The requested property was not found."),
      {
        status: 404,
      }
    );

    getPropertyBySlug.mockRejectedValue(notFoundError);

    renderPropertyDetailPage();

    expect(
      await screen.findByRole("heading", {
        name: "Property not found",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /unavailable or is not published for public viewing/i
      )
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Demo Green View Residence")
    ).not.toBeInTheDocument();
  });

  test("displays a controlled error when the request fails", async () => {
    getPropertyBySlug.mockRejectedValue(
      new Error("Unable to connect to the property service.")
    );

    renderPropertyDetailPage();

    expect(
      await screen.findByRole("heading", {
        name: "We couldn’t load this property",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText("Unable to connect to the property service.")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Try again",
      })
    ).toBeInTheDocument();
  });
});