// src/pages/admin/pages/DashboardHome.jsx
import React, { useEffect, useState } from "react";
import { FaUsers, FaBox, FaShoppingCart, FaChartLine } from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DashboardHome = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalPendingOrders: 0,
    totalIncome: 0,
    topSpender: { userId: null, amount: 0 },
    salesByDate: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/stats/getStats", {
          credentials: "include",
        });
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Error fetching stats", err);
      }
    };
    fetchStats();
  }, []);


  useEffect(() => {
  const getCurrrentUser = async () => {
    try {
      const currentUser = await fetch("http://localhost:4000/api/users/getUserProfile", {
        credentials: "include",
      });
      const data = await currentUser.json();
      setCurrentUser(data);
    } catch (error) {
      console.error("Error fetching current User: ", error);
    } finally {
      setLoadingUser(false);
    }
  };
  getCurrrentUser();
}, []);

  const cards = [
    { title: "Users", value: stats.totalUsers, icon: <FaUsers />, color: "bg-blue-500" },
    { title: "Products", value: stats.totalProducts, icon: <FaBox />, color: "bg-green-500" },
    { title: "Pending Orders", value: stats.totalPendingOrders, icon: <FaShoppingCart />, color: "bg-yellow-500" },
    { title: "Income", value: `$${stats.totalIncome}`, icon: <FaChartLine />, color: "bg-purple-500" },
  ];

  return (
    <div>
      {loadingUser ? (
  <h1 className="text-2xl font-bold mb-6">Loading user...</h1>
) : (
  <h1 className="text-2xl font-bold mb-6">
    Welcome {currentUser?.name || "Guest"} to dashboard
  </h1>
)}

      <h2 className="text-2xl font-semibold mb-6">Dashboard Overview</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, i) => (
          <div key={i} className={`p-6 rounded-lg shadow text-white ${card.color}`}>
            <div className="text-3xl mb-2">{card.icon}</div>
            <div className="text-xl font-semibold">{card.value}</div>
            <div>{card.title}</div>
          </div>
        ))}
      </div>

      {/* Top spender */}
      {stats.topSpender?.userId && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold">Top Spender</h3>
          <p>
            User ID: <span className="font-bold">{stats.topSpender.userId}</span> <br />
            Amount Spent: <span className="font-bold">${stats.topSpender.amount}</span>
          </p>
        </div>
      )}

      {/* Sales Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Sales Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stats.salesByDate}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total_sales" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardHome;
