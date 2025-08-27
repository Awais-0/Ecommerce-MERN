import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import Header from "../components/header";

const stripePromise = loadStripe("pk_test_51RxQSYGOilXZJXTaE8T8zArwRg5qUS3YTBKBHJW7yqUvfYPHnsBDNIZHMJhw0D7CxAEcIlo8ARUKMlygwehr4wPC007eyC4HgH"); 
// ⚠️ Replace with your real Publishable Key

const CheckoutPage = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  // Fetch user's orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/orders/getOrder", {
            method: "GET",
          credentials: "include", // include cookies for auth
        });
        const data = await res.json();
        setOrders(data.orders);
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };
    fetchOrders();
  }, []);

  // Trigger Stripe Checkout for an order
  const handlePayment = async (orderId) => {
    try {
      const stripe = await stripePromise;

      // Call backend to create checkout session
      const res = await fetch("http://localhost:4000/api/payment/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();
      if (data.id) {
        // Redirect user to Stripe Checkout
        const { error } = await stripe.redirectToCheckout({ sessionId: data.id });
        if (error) alert(error.message);
      } else {
        console.error("Error creating checkout session:", data);
        alert("Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed. Try again later.");
    }
  };

  return (
    <>
    <Header />
    <div className="p-6 max-w-4xl mx-auto">
      
      <h2 className="text-2xl font-bold mb-6">Your Orders</h2>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-4 bg-white rounded-lg shadow-md border border-gray-200"
            >
              <h3 className="text-lg font-semibold mb-2">
                Order #{order.id}
              </h3>
              <p>Total Amount: <span className="font-bold">${order.total_amount}</span></p>
              <p>Status: <span className="capitalize">{order.status}</span></p>
              <p>Date: {new Date(order.created_at).toLocaleString()}</p>

              { order.status === 'pending' ? (
                <button
                onClick={() => handlePayment(order.id)}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Proceed to Payment
              </button>
              ) : (
                <button
                disabled={true}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Paid
              </button>
              )

              }
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
};

export default CheckoutPage;
