import { render, screen, waitFor } from "@testing-library/react";
import Dashboard from "./components/Dashboard";
import { act } from "react";

test("renders Returns Dashboard", async () => {
  await act(async () => {
    render(<Dashboard />);
  });

  await waitFor(() => {
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  await waitFor(() => {
    const element = screen.getByRole("heading", { name: /Returns Dashboard/i });
    expect(element).toBeInTheDocument();
  });
});
