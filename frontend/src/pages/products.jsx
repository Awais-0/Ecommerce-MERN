import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {FaFilter, FaSearch, FaRegHeart, FaStar } from "react-icons/fa";
import Header from "../components/header";
import ConfettiBackground from "../components/ConfettiBg";

// Small, memoized product card to avoid re-renders
// Small, memoized product card to avoid re-renders
const ProductCard = React.memo(function ProductCard({ product, onAdd }) {
  const [rating, setRating] = useState(0);
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="w-full h-[430px] perspective cursor-pointer"
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className="relative w-full h-full transition-transform duration-700"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* FRONT SIDE */}
        <div
          className="absolute w-full h-full bg-white rounded-xl shadow hover:shadow-lg transition p-5 flex flex-col justify-between hover:bg-gray-50"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div>
            <div className="flex items-center justify-center mb-4 shadow rounded-lg overflow-hidden">
              <img
                src={product.imageUrl || "/vite.svg"}
                alt={product.name}
                className="w-full h-48 object-cover"
                loading="lazy"
              />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-2">
              {product.name}
            </h3>

            <p className="text-gray-700 font-semibold">
              Price: ${Number(product.price).toFixed(2)}
            </p>
            {product.stock_quantity > 0 ? (
              <p className="text-sm text-gray-500">
                Stock: {product.stock_quantity}
              </p>
            ) : (
              <p>Will be available soon</p>
            )}

            {/* ⭐ Rating System */}
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  onClick={(e) => {
                    e.stopPropagation(); // prevent triggering flip
                    setRating(star);
                  }}
                  className={`cursor-pointer text-xl transition ${
                    star <= rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-row gap-2 mt-4">
            {product.stock_quantity > 0 ? (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // prevent triggering flip
                  onAdd(product);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Add to Cart
              </button>
            ) : (
              <button
                disabled
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg transition"
              >
                Sold out
              </button>
            )}

            <button
              onClick={(e) => e.stopPropagation()} // prevent flip
              className="w-10 h-10 flex items-center justify-center bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              <FaRegHeart />
            </button>
          </div>
        </div>

        {/* BACK SIDE */}
        <div
          className="absolute w-full h-full bg-amber-200 text-gray-800 flex flex-col items-center justify-center rounded-xl shadow-xl p-6"
          style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
        >
          <h3 className="text-xl font-bold mb-4">{product.name}</h3>
          <p className="text-sm leading-relaxed">
            This is a dummy description for <b>{product.name}</b>.  
            It flips when you click the card.  
            Here you could show longer product details, reviews, or extra info.
          </p>
          <p className="mt-3 text-xs text-gray-600">
            Click again to flip back.
          </p>
        </div>
      </div>
    </div>
  );
});


const PAGE_SIZE = 20; // render 20 cards at a time to keep DOM light

export default function ProductsPage() {
  const [user, setUser] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [page, setPage] = useState(1);

  const navigate = useNavigate();

  // Smooth scroll helper
  const scrollToProducts = useCallback(() => {
    const el = document.getElementById("products");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

  // AUTH + PRODUCTS (with aborts to prevent memory leaks)
  useEffect(() => {
    const authController = new AbortController();
    const productsController = new AbortController();

    async function checkAuthThenFetch() {
      try {
        // Check auth
        const res = await fetch("http://localhost:4000/api/users/getUserProfile", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          signal: authController.signal,
        });
        if (!res.ok) throw new Error("Unauthorized");
        const userData = await res.json();
        setUser(userData);

        // Fetch products
        const prodRes = await fetch("http://localhost:4000/api/products/getAllProducts", {
          credentials: "include",
          signal: productsController.signal,
        });
        if (!prodRes.ok) throw new Error("Failed to fetch products");
        const data = await prodRes.json();
        setAllProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    }

    checkAuthThenFetch();

    return () => {
      authController.abort();
      productsController.abort();
    };
  }, [navigate]);

  // Derived: filtered list (memoized)
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    let items = allProducts;

    if (q) {
      items = items.filter(
        (p) =>
          String(p.name || "").toLowerCase().includes(q) ||
          String(p.category || "").toLowerCase().includes(q)
      );
    }

    if (inStockOnly) {
      items = items.filter((p) => Number(p.stock_quantity) > 0);
    }

    return items;
  }, [allProducts, search, inStockOnly]);

  // Pagination (memoized)
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages); // clamp
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, currentPage]);

  // Reset to page 1 when filters/search change
  useEffect(() => {
    setPage(1);
  }, [search, inStockOnly]);

  // Actions
  const addToCart = useCallback(async (product) => {
    try {
      const response = await fetch("http://localhost:4000/api/cart/addToCart", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      if (!response.ok) throw new Error("Failed to add product to cart");
      // Optional: toast/snackbar here. Avoid heavy localStorage writes.
      alert(`${product.name} added to cart sucessfully`)
      console.log("Added to cart:", product.name);
    } catch (e) {
      console.error(e);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
  <div className="flex flex-col min-h-screen bg-gradient-to-bl from-gray-200 to-gray-300 relative">
    {/* Confetti background (runs infinitely) */}
    {/* <ConfettiBackground /> */}

    {/* Header */}
    <Header />

    {/* Hero Section */}
    <section className="relative h-screen w-full">
      <img
        src="/heroBg.webp" // Prefer optimized webp/avif
        alt="Shop Banner"
        className="absolute top-0 left-0 w-full h-full object-cover"
        loading="eager"
      />
      <div className="absolute top-0 left-0 w-full h-full bg-black/70 flex flex-col justify-center items-center text-center text-white px-6">
        <h2 className="text-4xl md:text-6xl font-bold mb-4">
          Welcome {user?.name ?? "there"} to MyShop
        </h2>
        <p className="text-lg md:text-2xl mb-6">
          Find the best products just for you
        </p>
        <button
          onClick={scrollToProducts}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 transition rounded-lg text-lg font-medium"
        >
          Shop Now
        </button>
      </div>
    </section>

    {/* Main */}
    <main
      id="products"
      className="flex-1 container mx-auto px-6 py-10 pt-20 relative z-10"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-3xl font-bold text-gray-800">All Products</h2>

        {/* Search + Filter */}
        <div className="flex items-stretch gap-3 w-full md:w-auto">
          {/* Search box */}
          <div className="flex items-center w-full md:w-80 bg-white rounded-lg shadow px-3">
            <FaSearch className="text-gray-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search products or categories..."
              className="w-full py-2 px-1 outline-none text-gray-700"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter button */}
          <button
            onClick={() => setShowFilter((s) => !s)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            aria-expanded={showFilter}
          >
            <FaFilter />
            Filter
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilter && (
        <div className="mt-4 bg-white rounded-lg shadow p-4 flex items-center gap-6">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
            />
            <span className="text-gray-700">In stock only</span>
          </label>
          <button
            className="ml-auto text-sm text-gray-600 hover:text-gray-900 underline"
            onClick={() => {
              setSearch("");
              setInStockOnly(false);
            }}
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Results summary */}
      <div className="mt-4 text-sm text-gray-600">
        Showing{" "}
        {filteredProducts.length === 0
          ? 0
          : (currentPage - 1) * PAGE_SIZE + 1}
        –
        {Math.min(currentPage * PAGE_SIZE, filteredProducts.length)} of{" "}
        {filteredProducts.length} items
      </div>

      {/* Grid */}
      {filteredProducts.length === 0 ? (
        <p className="text-gray-500 mt-6">No products found.</p>
      ) : (
        <div className="grid gap-6 mt-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {pageItems.map((p) => (
            <ProductCard key={p.id} product={p} onAdd={addToCart} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <button
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-2 rounded border bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-3 py-2">
            {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-2 rounded border bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </main>

    {/* Footer */}
    <footer className="bg-gray-900 text-gray-400 py-6 mt-10 relative z-10">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
        <p>&copy; {new Date().getFullYear()} MyShop. All rights reserved.</p>
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

}