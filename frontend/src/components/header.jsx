import React, { useCallback, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaBoxOpen, FaTags, FaSignOutAlt, FaShoppingBag } from "react-icons/fa";
import { RiAdminFill } from "react-icons/ri";
import { useState } from "react";
import axios from "axios";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(null);

  // Helper to check active path
  const isActive = useCallback((path) => location.pathname === path, [location.pathname]);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/users/getUserProfile", { withCredentials: true });
        console.log(res.data.role)
        if (res.data.role === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('Error occured at header: ', err);
      }
    };
    checkAdmin();
  }, []);

  // Logout handler
  const logout = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:4000/api/auth/logoutUser", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Logout failed");
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error.message);
    }
  }, [navigate]);

  return (
    <header className="bg-black/55 shadow-md backdrop-blur-2xl fixed top-0 w-full z-20">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">MyShop</h1>
        <nav className="flex gap-6">
          <Link
            to="/products"
            className={`flex items-center gap-2 hover:text-blue-600 transition relative ${
              isActive("/products") ? "text-blue-600 font-semibold" : "text-gray-300"
            }`}
          >
            <FaBoxOpen />
            Products
            {isActive("/products") && (
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-600"></span>
            )}
          </Link>
          <Link
            to="/categories"
            className={`flex items-center gap-2 hover:text-blue-600 transition relative ${
              isActive("/categories") ? "text-blue-600 font-semibold" : "text-gray-300"
            }`}
          >
            <FaTags />
            Categories
            {isActive("/categories") && (
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-600"></span>
            )}
          </Link>
          <Link
            to="/userCart"
            className={`flex items-center gap-2 hover:text-blue-600 transition relative ${
              isActive("/userCart") ? "text-blue-600 font-semibold" : "text-gray-300"
            }`}
          >
            <FaShoppingCart />
            Cart
            {isActive("/userCart") && (
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-600"></span>
            )}
          </Link>
          <Link
            to="/checkout"
            className={`flex items-center gap-2 hover:text-blue-600 transition relative ${
              isActive("/checkout") ? "text-blue-600 font-semibold" : "text-gray-300"
            }`}
          >
            <FaShoppingBag />
            Orders
            {isActive("/checkout") && (
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-600"></span>
            )}
          </Link>
          {isAdmin && (
            <Link
            to="/admindashboard"
            className={`flex items-center gap-2 hover:text-blue-600 transition relative ${
              isActive("/admindashboard") ? "text-blue-600 font-semibold" : "text-gray-300"
            }`}
          >
            <RiAdminFill />
            Admin
            {isActive("/admindashboard") && (
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-600"></span>
            )}
          </Link>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-2 text-gray-300 hover:text-red-600 transition"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
