// src/pages/admin/pages/Orders.jsx
import React, { useState, useEffect } from "react";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [paidOrders, setPaidOrders] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/orders/getAllOrders", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders);
        console.log(data);
      });

    fetch("http://localhost:4000/api/orders/getAllPaidOrdersWithPayments", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setPaidOrders(data.orders);
        console.log(data);
      });
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Orders</h2>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <h2 className="p-1 mt-5 text-2xl font-bold dark:text-gray-200">Pending Orders</h2>
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
      <h2 className="p-1 mt-5 text-2xl font-bold dark:text-gray-200">Paid Orders</h2>
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">ID</th>
              <th scope="col" className="px-6 py-3">User ID</th>
              <th scope="col" className="px-6 py-3">Total Value</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Provider</th>
              <th scope="col" className="px-6 py-3">Payment Intent Id</th>
              <th scope="col" className="px-6 py-3">Strip Session Id</th>
              <th scope="col" className="px-6 py-3">Created At</th>
            </tr>
          </thead>
          <tbody>
            {paidOrders.map((o) => (
              <tr
                key={o.order_id}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <td className="px-6 py-4">{o.order_id}</td>
                <td className="px-6 py-4">{o.user_id}</td>
                <td className="px-6 py-4">{o.total_amount}</td>
                <td className="px-6 py-4">{o.status}</td>
                <td className="px-6 py-4">{o.provider}</td>
                <td className="px-6 py-4">{o.payment_intent_id}</td>
                <td className="px-6 py-4" title={o.session_id}>{o.session_id.length > 9 ? o.session_id.slice(0, 9) + "..." : o.session_id}</td>
                <td className="px-6 py-4">{o.CREATED_AT}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
