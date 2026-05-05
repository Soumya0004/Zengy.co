"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Package,
  X,
  Tag,
  Eye
} from "lucide-react";

interface Category {
  name: string;
  productCount: number;
  products: Product[];
}

interface Product {
  _id: string;
  title: string;
  price: number;
  img: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/products/categories");
      // The API returns an array of category names, we need to fetch products for each
      const categoryNames = res.data;
      
      // Fetch products for each category to get counts
      const categoryData = await Promise.all(
        categoryNames.map(async (catName: string) => {
          try {
            const productsRes = await axios.get(`/api/products/categories/${encodeURIComponent(catName)}`);
            return {
              name: catName,
              productCount: productsRes.data.length || 0,
              products: productsRes.data || []
            };
          } catch {
            return { name: catName, productCount: 0, products: [] };
          }
        })
      );
      
      setCategories(categoryData);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      // Add a product with the new category to create it
      await axios.post("/api/products", {
        title: `New Category - ${newCategoryName}`,
        description: "Placeholder product for new category",
        price: 0,
        category: newCategoryName,
        img: "",
        sizes: [{ size: "M", stock: 0 }],
        availability: false
      });
      
      setShowModal(false);
      setNewCategoryName("");
      fetchCategories();
    } catch (error) {
      console.error("Failed to add category:", error);
      alert("Failed to add category");
    }
  };

  const handleDeleteCategory = async (categoryName: string) => {
    if (!confirm(`Are you sure you want to delete the "${categoryName}" category? This will not delete the products.`)) return;

    try {
      // Update all products in this category to have no category
      const category = categories.find(c => c.name === categoryName);
      if (category?.products) {
        for (const product of category.products) {
          await axios.put("/api/products/update", {
            id: product._id,
            category: ""
          });
        }
      }
      fetchCategories();
    } catch (error) {
      console.error("Failed to delete category:", error);
      alert("Failed to delete category");
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
          <p className="text-gray-500">{categories.length} total categories</p>
        </div>
        <button
          onClick={() => {
            setNewCategoryName("");
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <div
            key={category.name}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Tag className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{category.name}</h3>
                    <p className="text-sm text-gray-500">
                      {category.productCount} products
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview Products */}
              {category.products && category.products.length > 0 && (
                <div className="flex -space-x-2 mb-4">
                  {category.products.slice(0, 4).map((product) => (
                    <div
                      key={product._id}
                      className="w-10 h-10 rounded-lg border-2 border-white bg-gray-200 overflow-hidden"
                    >
                      {product.img ? (
                        <img
                          src={product.img}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={16} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                  ))}
                  {category.productCount > 4 && (
                    <div className="w-10 h-10 rounded-lg border-2 border-white bg-gray-100 flex items-center justify-center">
                      <span className="text-xs text-gray-500">
                        +{category.productCount - 4}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedCategory(category)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Eye size={18} />
                  View
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.name)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <Tag size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No categories found</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 text-purple-600 hover:text-purple-700"
          >
            Add your first category
          </button>
        </div>
      )}

      {/* Add Category Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                Add New Category
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddCategory} className="p-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g., Electronics, Clothing, Books"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-sm text-gray-500 mt-2">
                  A placeholder product will be created to establish this category.
                </p>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Category Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {selectedCategory.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedCategory.productCount} products
                </p>
              </div>
              <button
                onClick={() => setSelectedCategory(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              {selectedCategory.products && selectedCategory.products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedCategory.products.map((product) => (
                    <div
                      key={product._id}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                        {product.img ? (
                          <img
                            src={product.img}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={24} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">
                          {product.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          ${product.price?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No products in this category
                </p>
              )}
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}