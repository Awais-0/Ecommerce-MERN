import React, { useState, useEffect } from "react";

const CategoriesModal = ({ 
  show, 
  onClose, 
  onSubmit, 
  initialData = {}, 
  categories = [], 
  mode = "add" // "add" | "update"
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    total_products: "",
    categoryId: "",
  });

  // 🔹 Prefill data if editing
  // 🔹 Prefill or reset data when mode or initialData changes
useEffect(() => {
  if (mode === "update" && initialData && Object.keys(initialData).length > 0) {
    setFormData({
      name: initialData.name || "",
      description: initialData.description || "",
      total_products: initialData.total_products || "",
      categoryId: initialData.categoryId || "",
    });
  } else if (mode === "add") {
    // Reset form when adding new
    setFormData({
      name: "",
      description: "",
      total_products: "",
      categoryId: "",
    });
  }
}, [initialData, mode]);


  // 🔹 Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔹 Submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData); // pass data back to parent
  };

  if (!show) return null;

  return (
    <div className="fixed z-10 inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-semibold mb-4">
          {mode === "add" ? "Add New category" : "Update Category"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Category Name"
            className="border p-2 rounded"
            required
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            className="border p-2 rounded"
          />
          {/* <input
            type="number"
            name="total_products"
            value={formData.total_products}
            onChange={handleChange}
            placeholder="Total products"
            className="border p-2 rounded"
            required
          />
          <input
            type="number"
            name="id"
            value={formData.stock}
            onChange={handleChange}
            placeholder="Stock Quantity"
            className="border p-2 rounded"
            required
          /> */}

          {/* 🔹 Dropdown for Category */}
          {/* <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          >
            <option value="">-- Select Category --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select> */}

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {mode === "add" ? "Add" : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoriesModal;
