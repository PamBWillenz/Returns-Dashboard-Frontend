import React, { act } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Dashboard from "./components/Dashboard";
import "@testing-library/jest-dom/extend-expect";
import * as api from "./services/api"; // Mock the API calls

// Mock the API calls
jest.mock("./services/api");

const mockCustomerReturns = [
  {
    id: 1,
    status: "pending",
    items: [{ name: "Items 1", price: "10.00" }],
    order_date: "2024-11-01T00:00:00.000Z",
    registered_date: "2024-11-05T00:00:00.000Z",
    merchant_id: 1,
  },
  {
    id: 2,
    status: "approved",
    items: [{ name: "Items 2", price: "20.00" }],
    order_date: "2024-11-02T00:00:00.000Z",
    registered_date: "2024-11-06T00:00:00.000Z",
    merchant_id: 1,
  },
];

const mockMerchants = [
  { id: 1, name: "Merchant One" },
  { id: 2, name: "Merchant Two" },
];

describe("Dashboard", () => {
  beforeEach(() => {
    api.fetchCustomerReturns.mockResolvedValue(mockCustomerReturns);
    api.updateCustomerReturn.mockResolvedValue(mockCustomerReturns[0]);
    api.fetchMerchantData.mockResolvedValue(mockMerchants);
  });

  test("renders the dashboard with customer returns and merchants", async () => {
    await act(async () => {
      render(<Dashboard />);
    });

    // Wait for the data to be loaded
    await waitFor(() => {
      expect(screen.getByText(/Returns Dashboard/i)).toBeInTheDocument();
    });

    // Check if the customer returns are displayed
    await waitFor(() => {
      expect(screen.getByText(/Items 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Items 2/i)).toBeInTheDocument();
    });

    // Check if the merchants are displayed in the select dropdown
    fireEvent.change(screen.getByLabelText(/Select Merchant/i), {
      target: { value: "1" },
    });
    expect(screen.getByText(/Merchant One/i)).toBeInTheDocument();
  });

  test("updates the status of a customer return", async () => {
    await act(async () => {
      render(<Dashboard />);
    });

    // Wait for the data to be loaded
    await waitFor(() => {
      expect(screen.getByText(/Returns Dashboard/i)).toBeInTheDocument();
    });

    // Mock the updateCustomerReturn API call
    api.updateCustomerReturn.mockResolvedValue({
      ...mockCustomerReturns[0],
      status: "approved",
    });

    // Click the "Approved" button for the first customer return
    await act(async () => {
      fireEvent.click(screen.getAllByRole("button", { name: /approved/i })[0]);
    });

    // Wait for the status to be updated
    await waitFor(() => {
      expect(screen.getAllByText(/approved/i).length).toBeGreaterThanOrEqual(2);
    });
  });

  test("initiates a refund for a customer return", async () => {
    await act(async () => {
      render(<Dashboard />);
    });

    // Wait for the data to be loaded
    await waitFor(() => {
      expect(screen.getByText(/returns dashboard/i)).toBeInTheDocument();
    });

    // Mock the initiateRefund API call
    api.initiateRefund.mockResolvedValue({ message: "Refund successful" });

    // Click the "Initiate Refund" button for the first customer return
    await act(async () => {
      fireEvent.click(
        screen.getAllByRole("button", { name: /initiate refund/i })[0]
      );
    });

    // Wait for the success message to be displayed
    await waitFor(() => {
      expect(
        screen.getByText(/refund of \$10.00 initiated successfully/i)
      ).toBeInTheDocument();
    });
  });
});
