// src/pages/admin/pages/Orders.jsx
import React, { useState, useEffect } from "react";

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/orders/getAllOrders", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders);
        console.log(data);
      });
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Orders</h2>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">ID</th>
              <th scope="col" className="px-6 py-3">User ID</th>
              <th scope="col" className="px-6 py-3">Total Value</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Created At</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr
                key={o.id}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <td className="px-6 py-4">{o.id}</td>
                <td className="px-6 py-4">{o.user_id}</td>
                <td className="px-6 py-4">{o.total_amount}</td>
                <td className="px-6 py-4">{o.status}</td>
                <td className="px-6 py-4">{o.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
