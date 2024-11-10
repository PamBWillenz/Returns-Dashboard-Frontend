import axios from "axios";
import React, { useEffect, useState } from "react";
import "./Dashboard.css";

const Dashboard = () => {
  const [customerReturns, setCustomerReturns] = useState([]);
  const [merchantData, setMerchantData] = useState({});
  const [totalReturnAmount, setTotalReturnAmount] = useState(0);
  const [averageReturnWindow, setAverageReturnWindow] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const API_URL = "http://localhost:3001/api/v1";

  useEffect(() => {
    const fetchCustomerReturns = async () => {
      try {
        const response = await axios.get(`${API_URL}/customer_returns`);
        setCustomerReturns(response.data);
        calculateSummary(response.data);
      } catch (error) {
        console.error("Error fetching customer returns:", error);
      }
    };

    const fetchMerchantData = async () => {
      try {
        const response = await axios.get(`${API_URL}/merchants`);
        console.log("Merchant Data:", response.data); // Debugging log
        setMerchantData(response.data);
      } catch (error) {
        console.error("Error fetching merchant data:", error);
      }
    };

    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchCustomerReturns(), fetchMerchantData()]);
      setLoading(false);
    };

    fetchData();
  }, []);

  // Added calculateSummary function to compute totalReturnAmount and averageReturnWindow from the customerReturns data.
  // Called calculateSummary after setting the customerReturns state in the fetchCustomerReturns function.
  const calculateSummary = (returns) => {
    const totalAmount = returns.reduce((sum, ret) => sum + ret.amount, 0);
    const averageWindow =
      returns.reduce((sum, ret) => sum + ret.daysToReturn, 0) / returns.length;
    setTotalReturnAmount(totalAmount);
    setAverageReturnWindow(averageWindow);
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(`/api/customer-returns/${id}`, { status });
      // Update the state or refetch data as needed
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const filteredReturns = customerReturns.filter((customerReturn) =>
    customerReturn.items.some(
      (item) =>
        item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="dashboard-container">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <h1>Returns Dashboard</h1>
          <div className="summary">
            <h2>Summary</h2>
            <p>Total Return Amounts: ${totalReturnAmount.toFixed(2)}</p>
            <p>
              Average Return Window (Last 14 Days):{" "}
              {averageReturnWindow.toFixed(2)} days
            </p>
          </div>
          <div className="merchants">
            <h2>Merchants</h2>
            {merchantData.map((merchant) => (
              <div key={merchant.id}>
                <p>Name: {merchant.name}</p>
              </div>
            ))}
          </div>
          <div className="search">
            <input
              type="text"
              placeholder="Search customer returns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <h2>Customer Returns</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Status</th>
                <th>Items</th>
                <th>Order Date</th>
                <th>Registered Date</th>
                <th>Days to Return</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReturns.map((customerReturn) => (
                <tr key={customerReturn.id}>
                  <td>{customerReturn.id}</td>
                  <td>{customerReturn.status}</td>
                  <td>
                    {customerReturn.items.map((item) => item.name).join(", ")}
                  </td>
                  <td>
                    {new Date(customerReturn.order_date).toLocaleDateString()}
                  </td>
                  <td>
                    {new Date(
                      customerReturn.registered_date
                    ).toLocaleDateString()}
                  </td>
                  <td>
                    {Math.round(
                      (new Date(customerReturn.registered_date) -
                        new Date(customerReturn.order_date)) /
                        (1000 * 60 * 60 * 24)
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() =>
                        handleUpdateStatus(customerReturn.id, "pending")
                      }
                    >
                      Pending
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateStatus(customerReturn.id, "approved")
                      }
                    >
                      Approved
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateStatus(customerReturn.id, "rejected")
                      }
                    >
                      Rejected
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      <div className="dashboard-footer">the end</div>
    </div>
  );
};

export default Dashboard;
