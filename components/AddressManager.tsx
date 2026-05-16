"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { X, Edit, Trash2, Check, AlertCircle } from "lucide-react";

interface Address {
  _id: string;
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  addressType: string;
  isDefault: boolean;
}

interface AddressManagerProps {
  onSelectAddress?: (address: Address) => void;
  selectMode?: boolean;
}

export default function AddressManager({ onSelectAddress, selectMode = false }: AddressManagerProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    streetAddress: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    addressType: "Home",
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch addresses
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get("/api/users/addresses");
      
      if (res.data.success) {
        setAddresses(res.data.addresses);
      } else {
        setError(res.data.error || "Failed to fetch addresses");
      }
    } catch (error: unknown) {
      console.error("Error fetching addresses:", error);
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      setError(err.response?.data?.error || err.message || "Failed to fetch addresses");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      alert("Full name is required");
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      alert("Phone number is required");
      return false;
    }
    if (!formData.streetAddress.trim()) {
      alert("Street address is required");
      return false;
    }
    if (!formData.city.trim()) {
      alert("City is required");
      return false;
    }
    if (!formData.state.trim()) {
      alert("State is required");
      return false;
    }
    if (!formData.postalCode.trim()) {
      alert("Postal code is required");
      return false;
    }
    // Validate phone number (basic)
    const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      alert("Please enter a valid phone number (10-15 digits)");
      return false;
    }
    // Validate postal code (6 digits for India)
    if (formData.country === "India" && !/^\d{6}$/.test(formData.postalCode)) {
      alert("Please enter a valid 6-digit postal code");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      if (editingId) {
        // Update existing address
        const res = await axios.put(`/api/users/addresses/${editingId}`, formData);
        if (res.data.success) {
          setAddresses(
            addresses.map((addr) =>
              addr._id === editingId ? res.data.address : addr
            )
          );
          setEditingId(null);
          setShowForm(false);
          // Reset form
          setFormData({
            fullName: "",
            phoneNumber: "",
            streetAddress: "",
            city: "",
            state: "",
            postalCode: "",
            country: "India",
            addressType: "Home",
          });
        } else {
          alert(res.data.error || "Failed to update address");
        }
      } else {
        // Create new address
        const res = await axios.post("/api/users/addresses", formData);
        if (res.data.success) {
          setAddresses([...addresses, res.data.address]);
          setShowForm(false);
          // Reset form
          setFormData({
            fullName: "",
            phoneNumber: "",
            streetAddress: "",
            city: "",
            state: "",
            postalCode: "",
            country: "India",
            addressType: "Home",
          });
        } else {
          alert(res.data.error || "Failed to save address");
        }
      }
    } catch (error: unknown) {
      console.error("Error saving address:", error);
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      const errorMsg = err.response?.data?.error || err.message || "Failed to save address";
      alert(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (address: Address) => {
    setFormData({
      fullName: address.fullName,
      phoneNumber: address.phoneNumber,
      streetAddress: address.streetAddress,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      addressType: address.addressType,
    });
    setEditingId(address._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const res = await axios.delete(`/api/users/addresses/${id}`);
      if (res.data.success) {
        setAddresses(addresses.filter((addr) => addr._id !== id));
      } else {
        alert(res.data.error || "Failed to delete address");
      }
    } catch (error: unknown) {
      console.error("Error deleting address:", error);
      const err = error as { response?: { data?: { error?: string } } };
      alert(err.response?.data?.error || "Failed to delete address");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await axios.put(`/api/users/addresses/${id}/default`);
      if (res.data.success) {
        setAddresses(
          addresses.map((addr) => ({
            ...addr,
            isDefault: addr._id === id,
          }))
        );
      } else {
        alert(res.data.error || "Failed to set default address");
      }
    } catch (error: unknown) {
      console.error("Error setting default address:", error);
      const err = error as { response?: { data?: { error?: string } } };
      alert(err.response?.data?.error || "Failed to set default address");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900"></div>
      </div>
    );
  }

  if (error && addresses.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={fetchAddresses}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && addresses.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <p className="text-sm text-yellow-800">{error}</p>
          <button onClick={fetchAddresses} className="ml-auto text-sm text-yellow-800 underline">
            Retry
          </button>
        </div>
      )}

      {/* Add/Edit Form - Show first if no addresses */}
      {addresses.length === 0 && !selectMode ? (
        <div className="space-y-4">
          <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg">
            <h2 className="text-lg font-bold text-blue-900 mb-2">Add Your First Address</h2>
            <p className="text-sm text-blue-800">Save your address to make checkout faster and easier next time.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="border rounded-lg p-6 bg-white space-y-4">
            <h3 className="text-xl font-bold">Add New Address</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="9876543210"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">Street Address *</label>
                <textarea
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleInputChange}
                  required
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black resize-none"
                  placeholder="123 Main Street"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Mumbai"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">State *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Maharashtra"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Postal Code *</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="400001"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="India"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Address Type</label>
                <select
                  name="addressType"
                  value={formData.addressType}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold text-lg disabled:bg-green-400 disabled:cursor-not-allowed"
            >
              {submitting ? "Saving..." : "Save Address"}
            </button>
          </form>
        </div>
      ) : (
        <>
          {/* Addresses List */}
          <div>
            <h2 className="text-2xl font-bold mb-4">My Addresses</h2>

            {addresses.length === 0 ? (
              <p className="text-gray-500 py-4">No addresses saved yet. Add your first address.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((address) => (
                  <div
                    key={address._id}
                    className={`border-2 rounded-lg p-4 transition ${
                      address.isDefault
                        ? "border-zinc-900 bg-gray-50"
                        : "border-gray-300 hover:border-gray-400"
                    } ${selectMode ? "cursor-pointer hover:shadow-lg" : ""}`}
                    onClick={() => {
                      if (selectMode && onSelectAddress) {
                        onSelectAddress(address);
                      }
                    }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{address.fullName}</h3>
                        <p className="text-sm text-gray-600">{address.addressType}</p>
                      </div>
                      {address.isDefault && (
                        <span className="bg-black text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                          <Check size={14} /> Default
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-700 mb-1">{address.streetAddress}</p>
                    <p className="text-sm text-gray-700 mb-1">
                      {address.city}, {address.state} {address.postalCode}
                    </p>
                    <p className="text-sm text-gray-700 mb-3">{address.country}</p>
                    <p className="text-sm text-gray-600 mb-4">Ph: {address.phoneNumber}</p>

                    {!selectMode && (
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(address);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 text-sm"
                        >
                          <Edit size={16} /> Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(address._id);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded hover:bg-red-600 text-sm"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                        {!address.isDefault && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetDefault(address._id);
                            }}
                            className="flex-1 bg-gray-700 text-white py-2 rounded hover:bg-gray-800 text-sm"
                          >
                            Set Default
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add/Edit Form */}
          {!selectMode && (
            <>
              {!showForm && (
                <button
                  onClick={() => {
                    setShowForm(true);
                    setEditingId(null);
                    setFormData({
                      fullName: "",
                      phoneNumber: "",
                      streetAddress: "",
                      city: "",
                      state: "",
                      postalCode: "",
                      country: "India",
                      addressType: "Home",
                    });
                  }}
                  className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-900 font-semibold"
                >
                  + Add New Address
                </button>
              )}

              {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                      <h3 className="text-xl font-bold">
                        {editingId ? "Edit Address" : "Add New Address"}
                      </h3>
                      <button
                        onClick={() => {
                          setShowForm(false);
                          setEditingId(null);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">Full Name *</label>
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2">Phone Number *</label>
                          <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold mb-2">Street Address *</label>
                          <textarea
                            name="streetAddress"
                            value={formData.streetAddress}
                            onChange={handleInputChange}
                            required
                            rows={2}
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black resize-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2">City *</label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2">State *</label>
                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2">Postal Code *</label>
                          <input
                            type="text"
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleInputChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2">Country</label>
                          <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2">Address Type</label>
                          <select
                            name="addressType"
                            value={formData.addressType}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                          >
                            <option value="Home">Home</option>
                            <option value="Work">Work</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowForm(false);
                            setEditingId(null);
                          }}
                          className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-semibold disabled:bg-green-400"
                        >
                          {submitting ? "Saving..." : (editingId ? "Update Address" : "Save Address")}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}