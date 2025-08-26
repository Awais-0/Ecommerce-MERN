// src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../../components/admin/sidebar";
import Products from "./products";
import Users from "./users";
import Orders from "./orders";
import Categories from "./categories";
import DashboardHome from "./dashboardHome";

const AdminDashboard = () => {
  const [activePage, setActivePage] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const [iconAnimation, setIconAnimation] = useState(false); 

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/users/getUserProfile", { withCredentials: true });
        console.log(res.data.role)
        if (res.data.role === "admin") {
          setIsAdmin(true);
        } else {
          alert("You cannot access admin panel") // not admin → redirect
          navigate('/products')
        }
      } catch (err) {
        navigate("/login"); // not logged in → redirect
      } finally {
        setLoading(false);
      }
    };
    checkAdmin();
  }, [navigate]);

  if (loading) return <p>Loading...</p>;
  if (!isAdmin) return null; // don’t render until check passes

  return (
    <div
    className="flex dark:text-gray-200 min-h-screen dark:bg-gray-800">
      {/* Sidebar */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} iconAnimation={iconAnimation} setIconAnimation={setIconAnimation}/>

      {/* Main Content */}
      <div className="flex-1 ml-65 p-6">
        {activePage === "dashboard" && <DashboardHome />}
        {activePage === "products" && <Products />}
        {activePage === "users" && <Users />}
        {activePage === "orders" && <Orders />}
        {activePage === "categories" && <Categories />}
      </div>
    </div>
  );
};

export default AdminDashboard;
