// src/pages/admin/pages/DashboardHome.jsx
import React, { useEffect, useState } from "react";
import { FaUsers, FaBox, FaShoppingCart, FaChartLine } from "react-icons/fa";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
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

  const [revenueData, setRevenueData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [topProductsData, setTopProductsData] = useState([]);
  const [categorySalesData, setCategorySalesData] = useState([]);
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [stockData, setStockData] = useState([]);
  
  // new states for monthly product trends
  const [availableMonths, setAvailableMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [monthlyTopProducts, setMonthlyTopProducts] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/stats/getStats", {
          credentials: "include",
        });
        const data = await res.json();
        console.log(data)
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

  // 🎯 Replace these fetches with your APIs
  useEffect(() => {
    fetch("http://localhost:4000/api/stats/revenue-trend", { credentials: "include" })
      .then(res => res.json())
      .then(data => setRevenueData(data));

    fetch("http://localhost:4000/api/stats/status-summary", { credentials: "include" })
      .then(res => res.json())
      .then(data => setOrderStatusData(data));

    fetch("http://localhost:4000/api/stats/top-selling", { credentials: "include" })
      .then(res => res.json())
      .then(data => setTopProductsData(data));

    fetch("http://localhost:4000/api/stats/sales-summary", { credentials: "include" })
      .then(res => res.json())
      .then(data => setCategorySalesData(data));

    fetch("http://localhost:4000/api/stats/growth", { credentials: "include" })
      .then(res => res.json())
      .then(data => setUserGrowthData(data));

    fetch("http://localhost:4000/api/stats/low-stock", { credentials: "include" })
      .then(res => res.json())
      .then(data => setStockData(data));
  }, []);

  // 📌 Fetch available months for dropdown
  useEffect(() => {
    fetch("http://localhost:4000/api/stats/available-months", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        setAvailableMonths(data);
        if (data.length > 0) setSelectedMonth(data[0]); // default to latest month
      });
  }, []);

  const practice = [
    {
      name: 'ali',
      age: 53,
      income: '54000'
    },
    {
      name: 'asd',
      age: 12,
      income: '55000'
    },
    {
      name: 'dfg',
      age: 52,
      income: '16000'
    },
    {
      name: 'hjl',
      age: 24,
      income: '76000'
    }
  ]

  // 📌 Fetch top products when selectedMonth changes
  useEffect(() => {
    if (!selectedMonth) return;
    fetch(`http://localhost:4000/api/stats/top-products?month=${selectedMonth}`, { credentials: "include" })
      .then(res => res.json())
      .then(data => setMonthlyTopProducts(data));
      console.log("monthlyTopProducts:", monthlyTopProducts)
  }, [selectedMonth]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A020F0", "#DC143C"];

  const cards = [
  { title: "Users", value: stats.totalUsers, icon: <FaUsers />, color: "bg-blue-500 hover:bg-blue-500/45" },
  { title: "Products", value: stats.totalProducts, icon: <FaBox />, color: "bg-green-500 hover:bg-green-500/45" },
  { title: "Pending Orders", value: stats.totalPendingOrders, icon: <FaShoppingCart />, color: "bg-yellow-500 hover:bg-yellow-500/45" },
  { title: "Income", value: `$${stats.totalIncome}`, icon: <FaChartLine />, color: "bg-purple-500 hover:bg-purple-500/45" },
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
          <div key={i} className={`p-6 rounded-lg shadow text-white transition-all duration-400 hover:scale-120 hover:backdrop-blur-lg ${card.color}`}>
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
      <div className="dark:bg-gray-600 dark:text-gray-200 p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Sales Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stats.salesByDate}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date"  tick={{ fill: "#f0f0f0", fontSize: 12, fontFamily: "Poppins, sans-serif" }}/>
            <YAxis tick={{ fill: "#f0f0f0", fontSize: 12, fontFamily: "Poppins, sans-serif" }}/>
            <Tooltip contentStyle={{ backgroundColor: "#333", color: "#fff", borderRadius: "8px", fontFamily: "Poppins, sans-serif" }} />
            <Line type="monotone" dataKey="total_sales" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 2. Orders by Status */}
      <div className="dark:bg-gray-600 dark:text-gray-200 rounded-2xl shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Orders by Status</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={orderStatusData}
              dataKey="value"
              nameKey="status"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label
            >
              {orderStatusData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: "#333", color: "#fff", borderRadius: "8px", fontFamily: "Poppins, sans-serif" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 3. Top Products (All Time or Global) */}
      <div className="dark:bg-gray-600 dark:text-gray-200 rounded-2xl shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Top Selling Products</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={topProductsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name"  tick={{ fill: "#f0f0f0", fontSize: 12, fontFamily: "Poppins, sans-serif" }}/>
            <YAxis tick={{ fill: "#f0f0f0", fontSize: 12, fontFamily: "Poppins, sans-serif" }}/>
            <Tooltip contentStyle={{ backgroundColor: "#333", color: "#fff", borderRadius: "8px", fontFamily: "Poppins, sans-serif" }} />
            <Bar dataKey="sales" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ✅ 3b. Monthly Top Products */}
      <div className="dark:bg-gray-600 dark:text-gray-200 rounded-2xl shadow-md p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Top Selling Products by Month</h2>
          <select
            className="border p-2 rounded"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {availableMonths.map((m, idx) => (
              <option key={idx} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={monthlyTopProducts}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="product_name" tick={{ fill: "#f0f0f0", fontSize: 12, fontFamily: "Poppins, sans-serif" }} />
            <YAxis tick={{ fill: "#f0f0f0", fontSize: 12, fontFamily: "Poppins, sans-serif" }}/>
            <Tooltip contentStyle={{ backgroundColor: "#333", color: "#fff", borderRadius: "8px", fontFamily: "Poppins, sans-serif" }} />
            <Legend />
            <Bar dataKey="total_quantity" fill="#8884d8" name="Quantity Sold" />
            <Bar dataKey="total_revenue" fill="#00C49F" name="Revenue" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 4. Category Sales */}
      <div className="dark:bg-gray-600 dark:text-gray-200 rounded-2xl shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Sales by Category</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={categorySalesData}
              dataKey="value"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {categorySalesData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: "#333", color: "#fff", borderRadius: "8px", fontFamily: "Poppins, sans-serif"}} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 4. Category Sales */}
      <div className="dark:bg-gray-600 dark:text-gray-200 rounded-2xl shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Practice</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={practice}>
            <XAxis dataKey="age" tick={{ fill: "#f0f0f0", fontSize: 12, fontFamily: "Poppins, sans-serif" }}/>
            <YAxis tick={{ fill: "#f0f0f0", fontSize: 12, fontFamily: "Poppins, sans-serif" }}/>
            <CartesianGrid strokeDasharray="3 3" />
            <Bar dataKey="income" barSize={60} fill="#FF8042" label contentStyle={{ fontFamily: "Poppins, sans-serif", fontSize: "23px" }}></Bar>
            <Tooltip contentStyle={{ backgroundColor: "#333", color: "#fff", borderRadius: "8px", fontFamily: "Poppins, sans-serif" }} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 5. User Growth */}
      <div className="dark:bg-gray-600 dark:text-gray-200 rounded-2xl shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">User Growth</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={userGrowthData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fill: "#f0f0f0", fontSize: 12, fontFamily: "Poppins, sans-serif" }}/>
            <YAxis tick={{ fill: "#f0f0f0", fontSize: 12, fontFamily: "Poppins, sans-serif" }}/>
            <Tooltip contentStyle={{ backgroundColor: "#333", color: "#fff", borderRadius: "8px", fontFamily: "Poppins, sans-serif"}} />
            <Legend />
            <Line type="monotone" dataKey="users" stroke="#FF8042" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 6. Stock Levels */}
      <div className="dark:bg-gray-600 dark:text-gray-200 rounded-2xl shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Low Stock Products</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={stockData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fill: "#f0f0f0", fontSize: 12, fontFamily: "Poppins, sans-serif" }} />
            <YAxis tick={{ fill: "#f0f0f0", fontSize: 12, fontFamily: "Poppins, sans-serif" }}/>
            <Tooltip contentStyle={{ backgroundColor: "#333", color: "#fff", borderRadius: "8px", fontFamily: "Poppins, sans-serif" }} />
            <Bar dataKey="stock_quantity" fill="#DC143C" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardHome;
