import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaShoppingCart, FaBoxOpen, FaTags, FaSignOutAlt } from "react-icons/fa";
import Header from "../components/header";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/categories/getAllCategories", {credentials: 'include'});
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err.message);
      }
    };

    fetchCategories();
  }, []);

  const fetchProductsByCategory = async (categoryId, categoryName) => {
    console.log(categoryId, categoryName)
    try {
      const res = await fetch(`http://localhost:4000/api/products/getProductByCategory/${categoryId}`, {credentials: 'include'});
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data);
      setSelectedCategory(categoryName);
    } catch (err) {
      console.error("Error fetching products:", err.message);
    }
  };

  const addToCart = async (product) => {
    console.log("Adding " + product + " to cart clicked");
    const response = await fetch("http://localhost:4000/api/cart/addToCart", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ productId: product.id, quantity: 1 })
    });
    if (response.ok) {
      const updatedCart = await response.json();
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      alert(`Added to cart`)
      console.log("Product added to cart successfully");
    } else {
      console.error("Failed to add product to cart");
    }
    console.log("Product added to cart:", product);
    // navigate("/cart");
    };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header />

      {/* Hero Banner */}
      <section
        className="w-full h-[60vh] flex items-center justify-center text-center text-white bg-cover bg-center relative mt-[0px]"
        style={{ backgroundImage: "url('/categoriesBg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <h2 className="relative z-10 text-4xl md:text-5xl font-bold">
          Shop by Category
        </h2>
      </section>

      {/* Categories Grid */}
      <main className="flex-1 container mx-auto px-6 py-12">
        {categories.length === 0 ? (
          <p className="text-gray-600 text-center">No categories found.</p>
        ) : (
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-xl shadow hover:shadow-xl transition transform hover:scale-105 overflow-hidden"
              >
                {/* Category Image */}
                <div className="h-40 bg-gray-200 flex items-center justify-center">
                  <img
                    src="/vite.svg" // placeholder
                    alt={cat.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Category Details */}
                <div className="p-5 flex flex-col items-center text-center">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {cat.name}
                  </h3>
                  <p className="text-gray-500 mb-4 line-clamp-2">
                    {cat.description || "Explore the latest products in this category."}
                  </p>
                  <button
                    onClick={() => fetchProductsByCategory(cat.id, cat.name)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Explore
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products Section */}
        {/* Products Section */}
{selectedCategory && (
  <section className="mt-16">
    <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
      Products in {selectedCategory}
    </h2>

    {products.length > 0 ? (
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow hover:shadow-lg transition p-5 flex flex-col"
          >
            <div className="h-40 bg-gray-200 flex items-center justify-center mb-4">
              <img
                src="/vite.svg" // placeholder
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              {product.name}
            </h3>
            <p className="text-gray-500">{product.description}</p>
            <p className="text-blue-600 font-bold mt-2">${product.price}</p>
            <button
              onClick={() => addToCart(product)}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-600 text-center">
        No products found in this category.
      </p>
    )}
  </section>
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

export default CategoriesPage;
