// src/pages/CartPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaTrashAlt } from "react-icons/fa";
import Header from "../components/header";

const CartPage = () => {
  const [cartItems, setCartItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/users/getUserProfile", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Unauthorized");
        await fetchCartItems();
      } catch (err) {
        console.error("Not authorized:", err.message);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    const fetchCartItems = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/cart/getCartItems", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch cart items");
        const data = await res.json();
        setCartItems(data);
      } catch (err) {
        console.error("Error fetching cart items:", err.message);
      }
    };

    checkAuth();
  }, [navigate]);

  const removeFromCart = async (id) => {
    try {
      const res = await fetch(`http://localhost:4000/api/cart/removeFromCart/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to remove item");

      // Update cart state locally
      setCartItems((prev) => {
        if (!prev) return prev;
        const updatedItems = prev.items
          .map((item) =>
            item.product_id === id
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
          .filter((item) => item.quantity > 0);

        return { ...prev, items: updatedItems };
      });

      const data = await res.json();
      console.log(data.message);
    } catch (err) {
      console.error(err.message);
    }
  };

  const clearCart = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/cart/clearCart", {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to clear cart");
      setCartItems({ ...cartItems, items: [] });
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleCheckout = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/orders/createOrder", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to create order");
      const data = await res.json();

      localStorage.setItem("orderId", data.orderId);
      navigate("/checkout");
    } catch (err) {
      console.error("Checkout error:", err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <Header />

      {/* Main */}
      <main className="flex-1 container mx-auto px-6 py-10 pt-20">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Your Cart</h2>

        {!cartItems || !cartItems.items ? (
          <p className="text-gray-500">Add items to your cart first.</p>
        ) : cartItems.items.length === 0 ? (
          <p className="text-gray-500">Your cart is empty.</p>
        ) : (
          <div className="space-y-6">
            <h2 className="text-lg font-bold mb-6 text-gray-800">
              Cart ID: {cartItems.cartId}
            </h2>

            {cartItems.items.map((item) => (
              <div
                key={item.product_id}
                className="flex bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition"
              >
                {/* Left: Image */}
                <div className="w-40 flex-shrink-0 flex items-center justify-center bg-gray-100">
                  <img
                    src="/vite.svg" // replace later with product image
                    alt="product"
                    className="w-32 h-32 object-contain"
                  />
                </div>

                {/* Right: Details */}
                <div className="flex-1 p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {item.product_name}
                    </h3>
                    <p className="text-gray-600">Category: {item.category}</p>
                    <p className="font-semibold text-gray-700">
                      Price: ${item.price}
                    </p>
                    <p className="text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product_id)}
                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition self-start"
                  >
                    <FaTrashAlt /> Remove
                  </button>
                </div>
              </div>
            ))}

            {/* Clear Cart + Checkout */}
            <div className="flex justify-between mt-6">
              <button
                onClick={clearCart}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Clear Cart
              </button>
              <button
                onClick={handleCheckout}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-6 mt-10">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; 2025 MyShop. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link to="/about" className="hover:text-white transition">
              About
            </Link>
            <Link to="/contact" className="hover:text-white transition">
              Contact
            </Link>
            <Link to="/privacy" className="hover:text-white transition">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CartPage;
