import React, { useState, useEffect } from "react";
import CategoriesModal from "../../components/admin/categoriesModal";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";



const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedCategory, setSelectedCategory] = useState(null);


  // ✅ Fetch categories
  useEffect(() => {
    fetch("http://localhost:4000/api/categories/getAllCategories", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setCategories(data));
  }, []);

  // ✅ Add Product API
  const handleAddCategory = async (formData) => {
    try {
      const res = await fetch("http://localhost:4000/api/categories/addCategory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        const newCategory = { id: data.categoryId, ...formData, imageUrl: "/vite.svg" };
        setCategories((prev) => [...prev, newCategory]);
        setShowModal(false);
      } else {
        console.error("Add failed:", data.error);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  // ✅ Update Product API
  const handleCategoryUpdate = async (formData) => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/categories/updateCategory/${selectedCategory.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setCategories((prev) =>
          prev.map((c) => (c.id === selectedCategory.id ? { ...c, ...formData } : c))
        );
        setShowModal(false);
        setSelectedCategory(null);
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
      const res = await fetch(`http://localhost:4000/api/categories/deleteCategory/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
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
          + Add Category
        </button>
      </div>

      {/* 🔹 Products Table */}
      <div className="overflow-y-auto max-h-[600px] rounded-lg">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 dark:bg-gray-800">
          <thead className="text-xs text-gray-200 text-center uppercase bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3">Image</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Description</th>
              <th className="px-6 py-3">Total products</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="bg-white dark:bg-gray-900 border-b dark:text-gray-100 text-center">
                <td className="p-4 flex items-center justify-center">
                  <img src={c.imageUrl || "/vite.svg"} alt={c.name} className="w-18 md:w-12" />
                </td>
                <td className="px-6 py-4 font-semibold dark:text-gray-200">{c.name}</td>
                <td className="px-6 py-4">{c.description || '-'}</td>
                <td className="px-6 py-4 font-semibold dark:text-gray-200">{c.total_products ? c.total_products : '0'}</td>
                <td className="px-6 py-2">
                  <div className="flex items-center justify-center">
                    <FaEdit
                    onClick={() => { setSelectedCategory(c); setModalMode("update"); setShowModal(true); }}
                    className="text-blue-600 hover:underline text-2xl m-2 hover:cursor-pointer"/>
                  <MdDelete onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline hover:cursor-pointer text-2xl m-2" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔹 Reusable Modal */}
      <CategoriesModal
        show={showModal}
        onClose={() => { setShowModal(false); setSelectedCategory(null); }}
        onSubmit={modalMode === "add" ? handleAddCategory : handleCategoryUpdate}
        initialData={modalMode === "update" ? selectedCategory : {}}
        categories={categories}
        mode={modalMode}
      />
    </div>
  );
};

export default Categories;
