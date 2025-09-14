"use client";
import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/app/firebaseConfig";

// Helper function to get direct Google Drive image URL
const getDriveImageUrl = (url) => {
  if (!url) return "";
  const fileIdMatch = url.match(/\/d\/(.*?)\//);
  if (fileIdMatch && fileIdMatch[1]) {
    return `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
  }
  return url;
};

// Separate allergen filters for Food & Drink
const foodAllergenOptions = [
  "Milk",
  "Eggs",
  "Fish",
  "ShellFish",
  "Wheat",
  "Tree nuts",
  "Soybeans",
  "Peanuts",
  "Sesame",
];

const drinkAllergenOptions = [
  "Speciality Cocktails",
  "Bukets",
  "Beer",
  "Wine",
  "Frozen Drinks",
  "Seltzers",
];

// New food category options
const foodCategoryOptions = [
  "Breakfast",
  "Appetizers",
  "Salads",
  "Handhelds",
  "Seafood",
  "Pasta",
  "Chicken",
  "Steak",
  "Sides",
  "Happy Hour",
  "Dessert",
];

export default function MenuGuide() {
  const [activeTab, setActiveTab] = useState("Food");
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedAllergens, setSelectedAllergens] = useState([]);
  const [appliedAllergens, setAppliedAllergens] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [appliedCategory, setAppliedCategory] = useState("");

  const [showAllergenDropdown, setShowAllergenDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const allergenDropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);

  // Fetch menu data
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const q = query(collection(db, "Menu Guide"));
        const querySnapshot = await getDocs(q);
        const items = [];
        querySnapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });
        setMenuItems(items);
      } catch (error) {
        console.error("Error fetching menu items: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenuItems();
  }, []);

  // Outside click to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        allergenDropdownRef.current &&
        !allergenDropdownRef.current.contains(event.target)
      ) {
        setShowAllergenDropdown(false);
      }
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target)
      ) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allergenOptions =
    activeTab === "Food" ? foodAllergenOptions : drinkAllergenOptions;

  // Filtering logic
  const filteredItems = menuItems
    .filter((item) => item.category === activeTab)
    .filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((item) => {
      // ✅ Filter by selected food category
      if (activeTab === "Food" && appliedCategory) {
        return (
          item.subCategory &&
          item.subCategory.toLowerCase() === appliedCategory.toLowerCase()
        );
      }
      return true;
    })
    .filter((item) => {
      if (appliedAllergens.length === 0) return true;

      const ingredients = item.ingredients
        ? item.ingredients.toLowerCase().split(",").map((ing) => ing.trim())
        : [];
      const allergens = item.allergens
        ? item.allergens.toLowerCase().split(",").map((a) => a.trim())
        : [];

      return !appliedAllergens.some((allergen) => {
        const lowerAllergen = allergen.toLowerCase();
        return (
          ingredients.includes(lowerAllergen) ||
          allergens.includes(lowerAllergen)
        );
      });
    });

  // Reset filters when tabs change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm("");
    setSelectedAllergens([]);
    setAppliedAllergens([]);
    setSelectedCategory("");
    setAppliedCategory("");
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gray-100"
        style={{
          backgroundImage: "linear-gradient(135deg, #d4edc9, #34916aff)",
        }}
      >
        <p className="text-xl text-green-800">Loading menu...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-8 flex flex-col items-center bg-gray-100"
      style={{
        backgroundImage: "linear-gradient(135deg, #d4edc9, #34916aff)",
      }}
    >
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div
          className="text-center p-8 mb-8 rounded-xl shadow-lg"
          style={{
            background: "linear-gradient(135deg, #34916aff, #38c755ff)",
          }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Menu Guide
          </h1>
          <p className="text-base sm:text-lg text-white max-w-2xl mx-auto">
            Study up on our signature dishes, specialty drinks, ingredients, and
            allergens.
          </p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          {/* Tabs */}
          <div className="flex items-center rounded shadow-lg overflow-hidden">
            <button
              onClick={() => handleTabChange("Drink")}
              className={`font-semibold px-6 py-2 transition-colors duration-200 ${
                activeTab === "Drink"
                  ? "bg-green-700 text-white"
                  : "bg-white text-green-700"
              }`}
            >
              Drinks
            </button>
            <button
              onClick={() => handleTabChange("Food")}
              className={`font-semibold px-6 py-2 transition-colors duration-200 ${
                activeTab === "Food"
                  ? "bg-green-700 text-white"
                  : "bg-white text-green-700"
              }`}
            >
              Food
            </button>
          </div>

          {/* Search bar + Filters together */}
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
            {/* Search Bar */}
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white w-full sm:w-64"
            />

            {/* New Category Dropdown for Food */}
            {activeTab === "Food" && (
              <div className="relative" ref={categoryDropdownRef}>
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg shadow hover:bg-green-50"
                >
                  Category <ChevronDown size={18} />
                </button>
                {showCategoryDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border p-3 z-10 max-h-64 overflow-y-auto">
                    {/* Default Option */}
                    <label className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-100 rounded">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === ""}
                        onChange={() => {
                          setSelectedCategory("");
                          setAppliedCategory("");
                          setShowCategoryDropdown(false);
                        }}
                      />
                      <span className="text-sm text-gray-700">All</span>
                    </label>
                    {/* Dynamic Category Options */}
                    {foodCategoryOptions.map((category) => (
                      <label
                        key={category}
                        className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-100 rounded"
                      >
                        <input
                          type="radio"
                          name="category"
                          checked={selectedCategory === category}
                          onChange={() => setSelectedCategory(category)}
                        />
                        <span className="text-sm text-gray-700">
                          {category}
                        </span>
                      </label>
                    ))}
                    {/* Apply Button */}
                    <button
                      onClick={() => {
                        setAppliedCategory(selectedCategory);
                        setShowCategoryDropdown(false);
                      }}
                      className="w-full mt-3 px-4 py-2 bg-green-600 text-white rounded-lg"
                    >
                      Apply Category
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Allergen Dropdown filter */}
            <div className="relative" ref={allergenDropdownRef}>
              <button
                onClick={() => setShowAllergenDropdown(!showAllergenDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg shadow hover:bg-green-50"
              >
                Filter <ChevronDown size={18} />
              </button>
              {showAllergenDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border p-3 z-10 max-h-64 overflow-y-auto">
                  {/* Default Option */}
                  <label className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-100 rounded">
                    <input
                      type="checkbox"
                      checked={selectedAllergens.length === 0}
                      onChange={() => {
                        setSelectedAllergens([]);
                        setAppliedAllergens([]);
                        setShowAllergenDropdown(false);
                      }}
                    />
                    <span className="text-sm text-gray-700">Default</span>
                  </label>

                  {/* Dynamic Allergen Options */}
                  {allergenOptions.map((allergen) => (
                    <label
                      key={allergen}
                      className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-100 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAllergens.includes(allergen)}
                        onChange={() => {
                          setSelectedAllergens((prev) =>
                            prev.includes(allergen)
                              ? prev.filter((a) => a !== allergen)
                              : [...prev, allergen]
                          );
                        }}
                      />
                      <span className="text-sm text-gray-700">{allergen}</span>
                    </label>
                  ))}

                  {/* Apply Filter Button */}
                  {selectedAllergens.length > 0 && (
                    <button
                      onClick={() => {
                        setAppliedAllergens(selectedAllergens);
                        setShowAllergenDropdown(false);
                      }}
                      className="w-full mt-3 px-4 py-2 bg-green-600 text-white rounded-lg"
                    >
                      Apply Filter
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Menu items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden p-4 flex flex-col sm:flex-row items-center sm:items-start gap-4"
              >
                {/* Image */}
                <div className="flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden">
                  <img
                    // ✅ Use a default placeholder image if item.image_url is empty
                    src={getDriveImageUrl(item.image_url) || "https://via.placeholder.com/150"}
                    alt={item.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                {/* Details */}
                <div className="flex-grow text-center sm:text-left">
                  <h3 className="text-xl font-semibold text-green-800 mb-1">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {item.description}
                  </p>
                  {/* ✅ Conditionally render 'Allergens' label */}
                  {item.allergens && (
                    <p className="text-sm text-red-500 font-medium">
                      {activeTab === "Food" && "Allergens: "}
                      {item.allergens}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600 col-span-full">
              No items found in this category.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}