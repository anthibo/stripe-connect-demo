// ./pages/admin/dashboard.js
import React, { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [connectedAccountId, setConnectedAccountId] = useState("");

  useEffect(() => {
    if (connectedAccountId) {
      fetch(`/api/transactions?connectedAccountId=${connectedAccountId}`)
        .then((response) => response.json())
        .then((data) => setTransactions(data.transactions))
        .catch((error) => console.error(error));
    }
  }, [connectedAccountId]);

  return (
    <div className="dashboard">
      <h2>Admin Dashboard</h2>
      <input
        type="text"
        placeholder="Enter Connected Account ID"
        value={connectedAccountId}
        onChange={(e) => setConnectedAccountId(e.target.value)}
      />
      <button onClick={() => setConnectedAccountId("")}>Clear</button>
      {transactions.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Amount</th>
              <th>Fee</th>
              <th>Net</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => (
              <tr key={txn.id}>
                <td>{txn.id}</td>
                <td>{txn.amount / 100} {txn.currency.toUpperCase()}</td>
                <td>{txn.fee / 100} {txn.currency.toUpperCase()}</td>
                <td>{txn.net / 100} {txn.currency.toUpperCase()}</td>
                <td>{txn.description || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
