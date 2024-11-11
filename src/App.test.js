import { render, screen } from "@testing-library/react";
import Dashboard from "./components/Dashboard";

test("renders Returns Dashboard", () => {
  render(<Dashboard />);
  const Element = screen.getByText(/Returns Dashboard/i);
  expect(Element).toBeInTheDocument();
});
