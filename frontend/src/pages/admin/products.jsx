import React, { useState, useEffect } from "react";
import ProductModal from "../../components/admin/productModal";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";



const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedProduct, setSelectedProduct] = useState(null);

  // ✅ Fetch products
  useEffect(() => {
    fetch("http://localhost:4000/api/products/getAllProducts", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  // ✅ Fetch categories
  useEffect(() => {
    fetch("http://localhost:4000/api/categories/getAllCategories", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setCategories(data));
  }, []);

  // ✅ Add Product API
  const handleAddProduct = async (formData) => {
    try {
      const res = await fetch("http://localhost:4000/api/products/addProduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        const newProduct = { id: data.productId, ...formData, imageUrl: "/vite.svg" };
        setProducts((prev) => [...prev, newProduct]);
        setShowModal(false);
      } else {
        console.error("Add failed:", data.error);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  // ✅ Update Product API
  const handleUpdateProduct = async (formData) => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/products/updateProduct/${selectedProduct.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === selectedProduct.id ? { ...p, ...formData } : p))
        );
        setShowModal(false);
        setSelectedProduct(null);
      } else {
        console.error("Update failed:", data.error);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  // ✅ Delete Product
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:4000/api/products/deleteProduct/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  return (
    <div className="shadow-md sm:rounded-lg">
      {/* 🔹 Add Product Button */}
      <div className="flex justify-end p-4">
        <button
          onClick={() => { setShowModal(true); setModalMode("add"); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Add Product
        </button>
      </div>

      {/* 🔹 Products Table */}
      <div className="overflow-y-auto max-h-[600px] rounded-lg">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 dark:bg-gray-800">
          <thead className="text-xs text-gray-200 text-center uppercase bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3">Image</th>
              <th className="px-6 py-3">Product</th>
              <th className="px-6 py-3">Qty</th>
              <th className="px-6 py-3">Price</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="bg-white dark:bg-gray-900 border-b dark:text-gray-100 text-center">
                <td className="p-4 flex items-center justify-center">
                  <img src={p.imageUrl || "/vite.svg"} alt={p.name} className="w-16 md:w-32" />
                </td>
                <td className="px-6 py-4 font-semibold dark:text-gray-200">{p.name}</td>
                <td className="px-6 py-4">{p.stock_quantity || 0}</td>
                <td className="px-6 py-4 font-semibold dark:text-gray-200">${Number(p.price).toFixed(2)}</td>
                <td className="px-6 py-2">
                  <div className="flex items-center justify-center">
                    <FaEdit
                    onClick={() => { setSelectedProduct(p); setModalMode("update"); setShowModal(true); }}
                    className="text-blue-600 hover:underline text-2xl m-2 hover:cursor-pointer"/>
                  <MdDelete onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline hover:cursor-pointer text-2xl m-2" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔹 Reusable Modal */}
      <ProductModal
        show={showModal}
        onClose={() => { setShowModal(false); setSelectedProduct(null); }}
        onSubmit={modalMode === "add" ? handleAddProduct : handleUpdateProduct}
        initialData={modalMode === "update" ? selectedProduct : {}}
        categories={categories}
        mode={modalMode}
      />
    </div>
  );
};

export default Products;
