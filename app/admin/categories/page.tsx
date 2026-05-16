"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Search, 
  Plus, 
  Trash2, 
  Package,
  X,
  Tag,
  Eye,
  ChevronRight,
  Layers
} from "lucide-react";
import Image from "next/image";

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
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/products/categories");
      const categoryNames = res.data.categories;

      const categoryData = await Promise.all(
        categoryNames.map(async (catName: string) => {
          try {
            const productsRes = await axios.get(
              `/api/products/categories/${encodeURIComponent(catName)}`
            );
            return {
              name: catName,
              productCount: productsRes.data.products?.length || 0,
              products: productsRes.data.products || [],
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
      await axios.post("/api/products", {
        title: `Init - ${newCategoryName}`,
        description: "Category initialization unit",
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
    }
  };

  const handleDeleteCategory = async (categoryName: string) => {
    if (!confirm(`CONFIRM REMOVAL OF CLASS: "${categoryName}"?`)) return;
    try {
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
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#fdfdfd] gap-4">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black tracking-[0.4em] uppercase italic">Indexing_Classes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 bg-[#fdfdfd] min-h-screen text-black p-2 md:p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-4 border-black pb-8">
        <div>
          <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none mb-2">Classes</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 italic">
            Zengy.go / Taxonomy_Control / {categories.length}_Total_Groups
          </p>
        </div>
        <button
          onClick={() => { setNewCategoryName(""); setShowModal(true); }}
          className="flex items-center gap-3 px-8 py-4 bg-black text-white hover:bg-[#ffdf00] hover:text-black transition-all duration-300 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">New_Class</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity" size={18} />
        <input
          type="text"
          placeholder="Filter_Archives..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border-2 border-black outline-none font-bold text-sm focus:bg-gray-50"
        />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <div
            key={category.name}
            className="bg-white border-2 border-black p-6 group hover:bg-black hover:text-white transition-all duration-300 relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 border-2 border-black bg-white text-black group-hover:bg-[#ffdf00] transition-colors">
                  <Tag size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter leading-none mb-1">{category.name}</h3>
                  <p className="text-[9px] font-bold uppercase opacity-40 group-hover:opacity-100 tracking-widest">
                    Load: {category.productCount}_Units
                  </p>
                </div>
              </div>
            </div>

            {/* Preview Thumbnails */}
            {category.products && category.products.length > 0 && (
              <div className="flex items-center gap-1 mb-8 relative z-10">
                {category.products.slice(0, 4).map((product) => (
                  <div key={product._id} className="w-10 h-10 border border-black overflow-hidden grayscale hover:grayscale-0 transition-all bg-gray-100">
                    {product.img ? (
                      <Image src={product.img} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <Package size={12} className="m-auto mt-3 opacity-20" />
                    )}
                  </div>
                ))}
                {category.productCount > 4 && (
                  <div className="text-[10px] font-black italic ml-2">+{category.productCount - 4}</div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 relative z-10">
              <button
                onClick={() => setSelectedCategory(category)}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-black text-white border border-white/20 text-[10px] font-black uppercase tracking-widest group-hover:bg-[#ffdf00] group-hover:text-black transition-all"
              >
                <Eye size={14} /> Inspect_Data
              </button>
              <button
                onClick={() => handleDeleteCategory(category.name)}
                className="p-3 border border-black hover:bg-red-600 hover:text-white transition-all text-black group-hover:border-white/20 group-hover:text-white"
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            {/* Background design element */}
            <Layers size={80} className="absolute -bottom-4 -right-4 opacity-[0.03] pointer-events-none group-hover:opacity-10 transition-opacity" />
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black w-full max-w-md relative overflow-hidden">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 hover:bg-black hover:text-white transition-colors">
              <X size={24} />
            </button>
            <div className="p-10">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-8 border-b-2 border-black pb-4">
                Define_Class
              </h2>
              <form onSubmit={handleAddCategory} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Classification_Label</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="E.G. OUTERWEAR_V1"
                    className="w-full bg-gray-50 border-2 border-black p-4 text-sm font-bold outline-none focus:bg-white transition-colors"
                  />
                  <p className="text-[8px] font-bold text-red-500 uppercase mt-2">* INITIALIZES A VIRTUAL UNIT TO ESTABLISH PATH</p>
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 border-2 border-black font-black uppercase text-[10px] hover:bg-gray-100 transition-colors">
                    Abort
                  </button>
                  <button type="submit" className="flex-1 py-4 bg-black text-white font-black uppercase text-[10px] italic tracking-widest hover:bg-[#ffdf00] hover:text-black transition-colors">
                    Commit_Class
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <button onClick={() => setSelectedCategory(null)} className="absolute top-6 right-6 p-2 bg-black text-white z-10 transition-transform hover:rotate-90">
              <X size={24} />
            </button>
            <div className="p-10">
              <header className="border-b-4 border-black pb-6 mb-8">
                <div className="flex items-center gap-4 mb-2">
                  <Tag size={24} strokeWidth={3} />
                  <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">
                    {selectedCategory.name}
                  </h2>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 italic">
                  Class_Load: {selectedCategory.productCount}_Active_Units
                </p>
              </header>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedCategory.products.map((product) => (
                  <div key={product._id} className="flex items-center gap-4 p-4 border-2 border-black hover:bg-gray-50 transition-colors group">
                    <div className="w-16 h-16 border border-black grayscale group-hover:grayscale-0 transition-all overflow-hidden shrink-0">
                      {product.img ? (
                        <Image src={product.img} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Package size={20} className="m-auto mt-5 opacity-10" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black uppercase italic tracking-tighter leading-tight truncate">{product.title}</p>
                      <p className="text-[10px] font-bold italic opacity-40 mt-1">${product.price.toLocaleString()}</p>
                    </div>
                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>

              <button
                onClick={() => setSelectedCategory(null)}
                className="mt-10 w-full py-4 bg-black text-white font-black uppercase italic tracking-widest hover:bg-[#ffdf00] hover:text-black transition-colors"
              >
                Close_Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Quote */}
      <footer className="mt-20 text-center border-t border-black/5 pt-10">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30 italic">
          Zengy.go / System Architecture © 2026
        </p>
      </footer>
    </div>
  );
}