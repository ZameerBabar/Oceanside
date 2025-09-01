"use client"
import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/app/firebaseConfig";

// Helper function to get a direct image URL from a Google Drive share link
const getDriveImageUrl = (url) => {
  if (!url) return '';
  const fileIdMatch = url.match(/\/d\/(.*?)\//);
  if (fileIdMatch && fileIdMatch[1]) {
    return `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
  }
  return url;
};

export default function MenuGuide() {
  const [activeTab, setActiveTab] = useState('Food');
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch menu data from Firestore
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

  // Filter items based on the active tab
  const filteredItems = menuItems.filter(item => item.category === activeTab);

  // Show a loading message while fetching data
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100" style={{ backgroundImage: "linear-gradient(135deg, #d4edc9, #34916aff)" }}>
        <p className="text-xl text-green-800">Loading menu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 flex flex-col items-center bg-gray-100"
      style={{
        backgroundImage: "linear-gradient(135deg,  #34916aff, #38c755ff)",
      }}
    >
      <div className="max-w-6xl w-full">
        {/* Header section */}
        <div className="text-center p-8 mb-8 rounded-xl shadow-lg"
          style={{
            background: "linear-gradient(135deg, #34916aff, #38c755ff)",
          }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Menu Guide</h1>
          <p className="text-base sm:text-lg text-white max-w-2xl mx-auto">Study up on our signature dishes, specialty drinks, ingredients, and allergens.</p>
        </div>

        {/* Navigation buttons and dropdown */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center rounded 20 shadow-lg overflow-hidden">
            <button
              onClick={() => setActiveTab('Drink')} // Corrected from 'Drinks' to 'Drink'
              className={`font-semibold px-6 py-2 transition-colors duration-200 ${
                activeTab === 'Drink' ? 'bg-green-700 text-white' : 'bg-white text-green-700'
              }`}
            >
              Drinks
            </button>
            <button
              onClick={() => setActiveTab('Food')}
              className={`font-semibold px-6 py-2 transition-colors duration-200 ${
                activeTab === 'Food' ? 'bg-green-700 text-white' : 'bg-white text-green-700'
              }`}
            >
              Food
            </button>
          </div>
         
        </div>

        {/* Menu items grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden p-4 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                {/* Item Image */}
                <div className="flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden">
                  <img
                    src={getDriveImageUrl(item.image_url)}
                    alt={item.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                {/* Item Details */}
                <div className="flex-grow text-center sm:text-left">
                  <h3 className="text-xl font-semibold text-green-800 mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  <p className="text-sm text-red-500 font-medium">Allergens: {item.allergens}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600 col-span-full">No items found in this category.</p>
          )}
        </div>
      </div>
    </div>
  );
}