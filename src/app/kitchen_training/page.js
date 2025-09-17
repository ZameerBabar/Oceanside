'use client';
import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  LayoutList,
  X,
  Shirt,
  Hand,
  Sprout,
  Flame,
  BadgeAlert,
  SprayCan,
  Truck,
  HardHat,
  FireExtinguisher,
  Bug,
  Users
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebaseConfig'; // Apni firebase config file ka path confirm kar lein

// Icons ko Firebase se aane wale string se map karne ke liye
const iconMap = {
  Shirt: Shirt,
  Hand: Hand,
  Sprout: Sprout,
  Flame: Flame,
  BadgeAlert: BadgeAlert,
  SprayCan: SprayCan,
  Truck: Truck,
  HardHat: HardHat,
  FireExtinguisher: FireExtinguisher,
  Bug: Bug,
  Users: Users,
};

export default function BackOfHouseTraining() {
  const [trainingContent, setTrainingContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchTrainingData = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'kitchen_training'));
        const fetchedData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            title: data.title,
            icon: iconMap[data.iconName], // Firebase se icon ka naam (string) le kar, usko icon component mein convert karega
            content: data.content,
          };
        });
        setTrainingContent(fetchedData);
      } catch (error) {
        console.error("Error fetching training data: ", error);
        // Agar data fetch nahi ho pata to aap yahan error message dikha sakte hain
      } finally {
        setLoading(false);
      }
    };

    fetchTrainingData();
  }, []); // Empty dependency array means this effect runs only once when the component mounts

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Data loading ho raha hai...</p>
      </div>
    );
  }

  if (trainingContent.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Firebase mein 'kitchen_training' collection mein koi data nahi mila.</p>
      </div>
    );
  }

  const totalPages = trainingContent.length;
  const currentSection = trainingContent[currentPage];
  const IconComponent = currentSection.icon;

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-200 text-gray-800 flex flex-col lg:flex-row">
      {/* Sidebar for Navigation */}
      <div
        className={`fixed inset-y-0 left-0 bg-gradient-to-br from-green-950 to-green-700 shadow-xl transform transition-transform duration-300 z-50 p-6 w-64 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0 lg:shadow-none lg:p-8 lg:w-72 border-r border-green-700`}
      >
        <div className="flex justify-between items-center mb-6 lg:hidden">
          <h2 className="text-xl font-bold text-green-200">Menu</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-full text-green-300 hover:bg-green-800">
            <X size={24} />
          </button>
        </div>
        <h2 className="hidden lg:block text-2xl font-bold mb-3 text-white">Training Modules</h2>
        <div className="w-full h-1 bg-green-500 rounded-full mb-4"></div>
        <ul className="space-y-2">
          {trainingContent.map((section, index) => {
            const SidebarIcon = section.icon;
            return (
              <li key={index}>
                <button
                  onClick={() => {
                    setCurrentPage(index);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 text-left ${
                    index === currentPage
                      ? 'bg-green-600 text-white font-semibold shadow-lg'
                      : 'text-gray-200 hover:bg-green-800 hover:text-white'
                  }`}
                >
                  <SidebarIcon size={18} className={index === currentPage ? "text-white" : "text-green-400"} />
                  <span className="text-sm font-medium">
                    {section.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 transition-all duration-300 p-4 lg:p-8 flex flex-col items-center">
        {/* Header */}
        <header className="w-full max-w-4xl bg-gradient-to-br from-green-900 to-green-700 rounded-2xl shadow-xl p-4 md:p-6 lg:p-8 mb-6 text-center">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-wide">
                Back of House Training Guide
            </h1>
        </header>
        
        {/* Mobile Sidebar Toggle */}
        <div className="w-full flex items-center justify-start lg:hidden mb-6">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100">
            <LayoutList size={24} />
          </button>
        </div>

        {/* Content Card */}
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-6 lg:p-10 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <IconComponent size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-green-700">
              {currentSection.title}
            </h2>
          </div>
          <div className="w-full h-1 bg-gray-200 rounded-full my-6"></div>
          <div className="space-y-4 text-sm lg:text-base text-gray-700">
            {currentSection.content.map((paragraph, index) => {
              const isHeading = paragraph.startsWith("Required Uniform:") || paragraph.startsWith("Expectations & Standards:") || paragraph.startsWith("Why It Matters:") || paragraph.startsWith("Hygiene Standards:") || paragraph.startsWith("Personal Grooming:") || paragraph.startsWith("Standards:") || paragraph.startsWith("Cooking Temperatures (minimum internal temp):") || paragraph.startsWith("Holding Temperatures:") || paragraph.startsWith("Cooling Standards (2-stage method):") || paragraph.startsWith("Reheating:") || paragraph.startsWith("The Big 9 Allergens:") || paragraph.startsWith("Protocol When a Guest Reports an Allergy:") || paragraph.startsWith("Sanitizer Buckets:") || paragraph.startsWith("Clean As You Go:") || paragraph.startsWith("End-of-Shift Duties:") || paragraph.startsWith("Deep Cleaning:") || paragraph.startsWith("Inspection Standards:") || paragraph.startsWith("Receiving Process:") || paragraph.startsWith("General Rules:") || paragraph.startsWith("Specific Equipment Safety:") || paragraph.startsWith("Lockout/Tagout Procedures:") || paragraph.startsWith("Fire Safety:") || paragraph.startsWith("First Aid:") || paragraph.startsWith("Spill Response:") || paragraph.startsWith("Waste Standards:") || paragraph.startsWith("Pest Control Standards:") || paragraph.startsWith("Expectations:");
              const isList = paragraph.includes('—');
              const isBulleted = paragraph.startsWith("Move quickly,") || paragraph.startsWith("Always announce") || paragraph.startsWith("Keep aisles,") || paragraph.startsWith("Immediately report") || paragraph.startsWith("Wear approved") || paragraph.startsWith("Wipe up") || paragraph.startsWith("Place wet") || paragraph.startsWith("Keep walkways") || paragraph.startsWith("Avoid carrying") || paragraph.startsWith("Always use") || paragraph.startsWith("Treat every") || paragraph.startsWith("Keep pot handles") || paragraph.startsWith("Open lids") || paragraph.startsWith("Never overfill") || paragraph.startsWith("Shake excess") || paragraph.startsWith("Use the right") || paragraph.startsWith("Keep your non-cutting") || paragraph.startsWith("Cut away") || paragraph.startsWith("Never leave") || paragraph.startsWith("Store knives") || paragraph.startsWith("Use cut-resistant") || paragraph.startsWith("Always keep") || paragraph.startsWith("Never mix") || paragraph.startsWith("Store chemicals") || paragraph.startsWith("Wear gloves") || paragraph.startsWith("Follow SDS") || paragraph.startsWith("Keep hands") || paragraph.startsWith("Never overload") || paragraph.startsWith("Do not use") || paragraph.startsWith("Unplug equipment") || paragraph.startsWith("If equipment") || paragraph.startsWith("Know the location") || paragraph.startsWith("Fire extinguishers:") || paragraph.startsWith("For grease fires:") || paragraph.startsWith("Report all injuries") || paragraph.startsWith("If unsure,") || paragraph.startsWith("No phones,") || paragraph.startsWith("No horseplay,") || paragraph.startsWith("Stay focused,") || paragraph.startsWith("Look out");
              if (isHeading) {
                return <p key={index} className="text-base font-bold mt-4 mb-2 text-green-700">{paragraph}</p>;
              } else if (isList) {
                const [item, description] = paragraph.split('—');
                return (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-green-600 font-bold text-xl">•</span>
                    <p className="leading-relaxed">
                      <span className="font-semibold">{item.trim()}</span> — {description.trim()}
                    </p>
                  </div>
                );
              } else if (isBulleted) {
                return (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-green-600 font-bold text-xl">•</span>
                    <p className="leading-relaxed">{paragraph}</p>
                  </div>
                );
              } else {
                return (
                  <p key={index} className="leading-relaxed">
                    {paragraph}
                  </p>
                );
              }
            })}
          </div>
        </div>

        {/* Pagination and Navigation Buttons */}
        <div className="w-full max-w-4xl flex justify-between items-center bg-white rounded-2xl shadow-lg p-4 lg:p-6 mt-4">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
              currentPage === 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            <ChevronLeft size={20} />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <span className="text-sm sm:text-base font-semibold text-gray-600">
            {currentPage + 1} / {totalPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
              currentPage === totalPages - 1
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}