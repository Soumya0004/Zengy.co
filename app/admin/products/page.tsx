"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  X,
  Filter,
  Package,
} from "lucide-react";

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  img: string;
  category: string;
  discount?: number;
  sizes: { size: string; stock: number }[];
  rating?: number;
  availability?: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [categories, setCategories] = useState<string[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    img: "",
    category: "",
    discount: "",
    sizes: [{ size: "M", stock: 0 }],
    availability: true,
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("/api/products");
      setProducts(res.data.products || res.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/products/categories");
      setCategories(res.data.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const resetForm = () => {
    setEditingProduct(null);

    setFormData({
      title: "",
      description: "",
      price: "",
      img: "",
      category: "",
      discount: "",
      sizes: [{ size: "M", stock: 0 }],
      availability: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setUploading(true);

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        discount: formData.discount
          ? parseFloat(formData.discount)
          : 0,
        sizes: formData.sizes.map((s) => ({
          size: s.size,
          stock: parseInt(String(s.stock)) || 0,
        })),
      };

      if (editingProduct) {
        await axios.put("/api/products/update", {
          id: editingProduct._id,
          ...payload,
        });
      } else {
        await axios.post("/api/products", payload);
      }

      setShowModal(false);

      resetForm();

      fetchProducts();
    } catch (error) {
      console.error("Failed to save product:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;

    try {
      await axios.delete("/api/products/delete", {
        data: { id },
      });

      fetchProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);

    setFormData({
      title: product.title,
      description: product.description || "",
      price: String(product.price),
      img: product.img || "",
      category: product.category || "",
      discount: String(product.discount || ""),
      sizes: product.sizes || [{ size: "M", stock: 0 }],
      availability: product.availability !== false,
    });

    setShowModal(true);
  };

  const handleView = (product: Product) => {
    setViewingProduct(product);
  };

  const addSize = () => {
    setFormData({
      ...formData,
      sizes: [...formData.sizes, { size: "", stock: 0 }],
    });
  };

  const updateSize = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const newSizes = [...formData.sizes];

    newSizes[index] = {
      ...newSizes[index],
      [field]: value,
    };

    setFormData({
      ...formData,
      sizes: newSizes,
    });
  };

  const removeSize = (index: number) => {
    setFormData({
      ...formData,
      sizes: formData.sizes.filter((_, i) => i !== index),
    });
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" ||
      product.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfdfd] p-4 text-black">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4 border-b-2 border-zinc-900 pb-6">
        <div>
          <h1 className="text-4xl font-black uppercase italic">
            Inventory
          </h1>

          <p className="text-xs mt-2 font-bold">
            Total Products: {products.length}
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-black text-white px-6 py-3 flex items-center gap-2 hover:bg-gray-800"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="md:col-span-3 relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
          />

          <input
            type="text"
            autoComplete="off"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border-2 border-zinc-900 pl-10 pr-4 py-3 outline-none"
          />
        </div>

        <div className="relative">
          <Filter
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
          />

          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value)
            }
            className="w-full border-2 border-zinc-900 pl-10 pr-4 py-3 outline-none"
          >
            <option value="all">All Categories</option>

            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto border-2 border-zinc-900 mt-6 bg-white">
        <table className="w-full">
          <thead className="bg-black text-white">
            <tr>
              <th className="text-left px-4 py-4">Product</th>
              <th className="text-left px-4 py-4">Category</th>
              <th className="text-left px-4 py-4">Price</th>
              <th className="text-left px-4 py-4">Stock</th>
              <th className="text-left px-4 py-4">Status</th>
              <th className="text-right px-4 py-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.map((product) => (
              <tr
                key={product._id}
                className="border-t border-gray-200 hover:bg-gray-50"
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={product.img}
                      alt={product.title}
                      className="w-16 h-16 object-cover border"
                    />

                    <div>
                      <p className="font-bold">
                        {product.title}
                      </p>

                      <p className="text-xs text-gray-500 line-clamp-1">
                        {product.description}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4">
                  {product.category}
                </td>

                <td className="px-4 py-4">
                  ${product.price}
                </td>

                <td className="px-4 py-4">
                  {product.sizes?.reduce(
                    (acc, s) => acc + s.stock,
                    0
                  )}
                </td>

                <td className="px-4 py-4">
                  {product.availability !== false
                    ? "Active"
                    : "Offline"}
                </td>

                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() =>
                        handleView(product)
                      }
                      className="p-2 hover:bg-blue-100"
                    >
                      <Eye size={18} />
                    </button>

                    <button
                      onClick={() =>
                        handleEdit(product)
                      }
                      className="p-2 hover:bg-green-100"
                    >
                      <Edit2 size={18} />
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(product._id)
                      }
                      className="p-2 hover:bg-red-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowModal(false);
            resetForm();
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-2xl border-4 border-zinc-900 p-6 max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b-2 border-zinc-900 pb-4">
              <h2 className="text-2xl font-black uppercase">
                {editingProduct
                  ? "Edit Product"
                  : "Add Product"}
              </h2>

              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-6 mt-6"
            >
              <input
                type="text"
                autoComplete="off"
                placeholder="Product Title"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    title: e.target.value,
                  })
                }
                className="w-full border-2 border-zinc-900 p-3 outline-none"
              />

              <textarea
                autoComplete="off"
                placeholder="Description"
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
                className="w-full border-2 border-zinc-900 p-3 outline-none"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="number"
                  autoComplete="off"
                  placeholder="Price"
                  required
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: e.target.value,
                    })
                  }
                  className="border-2 border-zinc-900 p-3 outline-none"
                />

                <input
                  type="number"
                  autoComplete="off"
                  placeholder="Discount"
                  value={formData.discount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discount: e.target.value,
                    })
                  }
                  className="border-2 border-zinc-900 p-3 outline-none"
                />

                {/* FIXED URL INPUT */}
                <input
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="Image URL"
                  value={formData.img}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      img: e.target.value,
                    })
                  }
                  className="border-2 border-zinc-900 p-3 outline-none"
                />
              </div>

              <input
                type="text"
                autoComplete="off"
                placeholder="Category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value,
                  })
                }
                className="w-full border-2 border-zinc-900 p-3 outline-none"
              />

              {/* Sizes */}
              <div className="border-2 border-dashed border-zinc-900 p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold uppercase">
                    Sizes
                  </h3>

                  <button
                    type="button"
                    onClick={addSize}
                    className="text-sm underline"
                  >
                    Add Size
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.sizes.map((size, index) => (
                    <div
                      key={index}
                      className="flex gap-3"
                    >
                      <input
                        type="text"
                        autoComplete="off"
                        placeholder="Size"
                        value={size.size}
                        onChange={(e) =>
                          updateSize(
                            index,
                            "size",
                            e.target.value
                          )
                        }
                        className="flex-1 border-2 border-zinc-900 p-2 outline-none"
                      />

                      <input
                        type="number"
                        autoComplete="off"
                        placeholder="Stock"
                        value={size.stock}
                        onChange={(e) =>
                          updateSize(
                            index,
                            "stock",
                            parseInt(
                              e.target.value
                            ) || 0
                          )
                        }
                        className="w-28 border-2 border-zinc-900 p-2 outline-none"
                      />

                      {formData.sizes.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeSize(index)
                          }
                          className="bg-red-500 text-white px-3"
                        >
                          X
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.availability}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      availability:
                        e.target.checked,
                    })
                  }
                  className="w-5 h-5"
                />

                <label>Available</label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-black text-white py-4 font-bold hover:bg-gray-800"
              >
                {uploading
                  ? "Saving..."
                  : editingProduct
                  ? "Update Product"
                  : "Save Product"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingProduct && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setViewingProduct(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white max-w-3xl w-full border-4 border-zinc-900 overflow-hidden"
          >
            <div className="flex flex-col md:flex-row">
              <img
                src={viewingProduct.img}
                alt={viewingProduct.title}
                className="w-full md:w-1/2 h-[400px] object-cover"
              />

              <div className="p-6 flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm uppercase text-gray-500">
                      {viewingProduct.category}
                    </p>

                    <h2 className="text-3xl font-black mt-2">
                      {viewingProduct.title}
                    </h2>
                  </div>

                  <button
                    onClick={() =>
                      setViewingProduct(null)
                    }
                  >
                    <X size={24} />
                  </button>
                </div>

                <p className="mt-4 text-gray-700">
                  {viewingProduct.description}
                </p>

                <p className="text-3xl font-black mt-6">
                  ${viewingProduct.price}
                </p>

                <div className="mt-6">
                  <h3 className="font-bold mb-3">
                    Sizes
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {viewingProduct.sizes.map(
                      (size, i) => (
                        <div
                          key={i}
                          className="border border-zinc-900 px-3 py-2"
                        >
                          {size.size} - {size.stock}
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}