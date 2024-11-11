import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import {
  fetchCustomerReturns,
  updateCustomerReturn,
  fetchMerchantData,
  initiateRefund,
} from "../services/api";

const Dashboard = () => {
  const [customerReturns, setCustomerReturns] = useState([]);
  const [merchantData, setMerchantData] = useState([]);
  const [selectedMerchant, setSelectedMerchant] = useState("");
  const [totalReturnAmount, setTotalReturnAmount] = useState(0);
  const [averageReturnWindow, setAverageReturnWindow] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [customerReturnsData, merchantData] = await Promise.all([
          fetchCustomerReturns(),
          fetchMerchantData(),
        ]);
        setCustomerReturns(customerReturnsData);
        setMerchantData(merchantData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedMerchant) {
      const filteredReturns = customerReturns.filter(
        (customerReturn) =>
          customerReturn.merchant_id === parseInt(selectedMerchant)
      );
      calculateSummary(filteredReturns);
    }
  }, [selectedMerchant, customerReturns]);

  const calculateSummary = (returns) => {
    if (returns.length === 0) {
      setTotalReturnAmount(0);
      setAverageReturnWindow(0);
      return;
    }

    const totalAmount = returns.reduce((sum, ret) => {
      const itemTotal = ret.items.reduce(
        (itemSum, item) => itemSum + parseFloat(item.price),
        0
      );
      return sum + itemTotal;
    }, 0);

    const averageWindow =
      returns.reduce((sum, ret) => {
        const orderDate = new Date(ret.order_date);
        const registeredDate = new Date(ret.registered_date);
        const daysToReturn =
          (registeredDate - orderDate) / (1000 * 60 * 60 * 24);
        return sum + daysToReturn;
      }, 0) / returns.length;

    setTotalReturnAmount(totalAmount);
    setAverageReturnWindow(averageWindow);
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateCustomerReturn(id, status);
      // Update the state directly instead of fetching the data again
      setCustomerReturns((prevReturns) =>
        prevReturns.map((customerReturn) =>
          customerReturn.id === id
            ? { ...customerReturn, status }
            : customerReturn
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleInitiateRefund = async (id) => {
    try {
      const customerReturn = customerReturns.find((ret) => ret.id === id);
      const totalAmount = customerReturn.items.reduce(
        (sum, item) => sum + parseFloat(item.price),
        0
      );

      const response = await initiateRefund(id);
      // Handle the response as needed
      console.log("Refund initiated:", response.data);
      setSuccessMessage(`Refund of $${totalAmount.toFixed(
        2
      )} initiated successfully for the items: 
        ${customerReturn.items.map((item) => item.name).join(", ")}`);
      setCustomerReturns((prevReturns) =>
        prevReturns.map((customerReturn) =>
          customerReturn.id === id
            ? { ...customerReturn, status: "refunded" }
            : customerReturn
        )
      );

      setTimeout(() => {
        setSuccessMessage("");
      }, 15000); // Clear the success message after 15 seconds
    } catch (error) {
      console.error("Error initiating refund:", error.response.data.errors);
      alert(
        `Error initiating refund: ${error.response.data.errors.join(", ")}`
      );
    }
  };

  const filteredReturns = customerReturns.filter(
    (customerReturn) =>
      customerReturn.merchant_id === parseInt(selectedMerchant) &&
      customerReturn.items.some(
        (item) =>
          item.name &&
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  return (
    <div className="dashboard-container">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <h1>Returns Dashboard</h1>
          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}
          <div className="merchant-select">
            <label htmlFor="merchant">Select Merchant:</label>
            <select
              id="merchant"
              value={selectedMerchant}
              onChange={(e) => setSelectedMerchant(e.target.value)}
            >
              <option value="">Select a Merchant</option>
              {merchantData.map((merchant) => (
                <option key={merchant.id} value={merchant.id}>
                  {merchant.name}
                </option>
              ))}
            </select>
          </div>
          <div className="summary">
            <h2>Summary</h2>
            <p>Total Return Amounts: ${totalReturnAmount.toFixed(2)}</p>
            <p>
              Average Return Window (Last 14 Days):{" "}
              {averageReturnWindow.toFixed(2)} days
            </p>
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
                      className="pending"
                      onClick={() =>
                        handleUpdateStatus(customerReturn.id, "pending")
                      }
                    >
                      Pending
                    </button>
                    <button
                      className="approved"
                      onClick={() =>
                        handleUpdateStatus(customerReturn.id, "approved")
                      }
                    >
                      Approved
                    </button>
                    <button
                      className="rejected"
                      onClick={() =>
                        handleUpdateStatus(customerReturn.id, "rejected")
                      }
                    >
                      Rejected
                    </button>
                    <button
                      className="refunded"
                      onClick={() =>
                        handleInitiateRefund(customerReturn.id, "refunded")
                      }
                    >
                      Initiate Refund
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default Dashboard;
