'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Firebase imports
import { auth } from '../firebaseConfig'; 
import { onAuthStateChanged } from 'firebase/auth';

export default function HubPage() {
  const router = useRouter();

  // User authentication state
  const [userAuthenticated, setUserAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  // Role passed from URL parameter
  const [currentRole, setCurrentRole] = useState(null);
  // Manager view state
  const [isManagerView, setIsManagerView] = useState(false);

  useEffect(() => {
    // Check user authentication
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserAuthenticated(true);
        setLoading(false);
      } else {
        // Agar user logged out hai, to unko login page par bhej dein.
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Get role from URL parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const roleParam = urlParams.get('role');
      const isManager = urlParams.get('isManager') === 'true';
      
      if (roleParam) {
        setCurrentRole(roleParam);
        setIsManagerView(isManager);
      } else {
        // Check if user came from dashboard (referrer check)
        const referrer = document.referrer;
        if (referrer && referrer.includes('/dashboard')) {
          // Agar dashboard se aaya hai but role parameter nahi hai, 
          // to dashboard par wapas bhej do
          router.push('/dashboard');
        } else {
          // Agar kahan se aaya pata nahi to team hub screen par bhej do
          router.push('/team-hubs');
        }
      }
    }
  }, [router]);

  // Fake data for different roles.
  const serverHubData = {
    title: "Server Hub",
    description: "Your all-in-one resource for training modules, task checklists, and essential tools for servers.",
    cards: [
      {
        title: "Menu Training",
        description: "Food offerings and bar cocktails with photos and ingredients.",
        imageSrc: "https://firebasestorage.googleapis.com/v0/b/oceanside-2e497.firebasestorage.app/o/Menu_Item%2FBreakfast%2FStuffed%20French%20Toast.png?alt=media&token=54724791-e4cd-419c-85c4-9e8064f2de65",
        altText: "Plates of food and drinks on a table"
      },
      {
        title: "Server Training Manual",
        description: "Learn all the key skills and procedures for excellent service.",
        imageSrc: "https://firebasestorage.googleapis.com/v0/b/oceanside-2e497.firebasestorage.app/o/Team%20and%20Restaurant%20Photos%2FTeam%20Photo.jpg?alt=media&token=d00cbbe0-6de4-4537-926e-f98de1bd732d",
        altText: "A green manual book"
      },
      {
        title: "Seating Chart",
        description: "Understand table numbers and layout.",
        imageSrc: "https://firebasestorage.googleapis.com/v0/b/oceanside-2e497.firebasestorage.app/o/Team%20and%20Restaurant%20Photos%2FSeating%20Chart.jpg?alt=media&token=9aa58b1c-9515-4526-aef5-476f73959d20",
        altText: "A restaurant seating chart"
      }
    ]
  };

  const hostHubData = {
    title: "Host/Hostess Hub",
    description: "Your one-stop resource for seating charts, training guides, and checklists to keep the front of house organized, efficient, and guest-ready.",
    cards: [
      {
        title: "Sidework Checklists",
        description: "Stay on top of opening, closing, and shift duties with easy-to-follow checklists.",
        imageSrc: "https://www.phly.com/CMSImages/BackgroundChecksBlogBanner-1440x40736-21390.jpg",
        altText: "A seating chart diagram"
      },
      {
        title: "Seating Layout",
        description: "Quickly view and manage the restaurant's seating layout for smooth service flow.",
        imageSrc: "https://firebasestorage.googleapis.com/v0/b/oceanside-2e497.firebasestorage.app/o/Team%20and%20Restaurant%20Photos%2FSeating%20Chart.jpg?alt=media&token=9aa58b1c-9515-4526-aef5-476f73959d20",
        altText: "A training manual"
      },
      {
        title: "Host Training Manual",
        description: "Access step-by-step training modules designed to help hosts and hostesses succeed.",
        imageSrc: "https://firebasestorage.googleapis.com/v0/b/oceanside-2e497.firebasestorage.app/o/Team%20and%20Restaurant%20Photos%2FTeam%20Photo.jpg?alt=media&token=d00cbbe0-6de4-4537-926e-f98de1bd732d",
        altText: "A notebook with shift notes"
      }
    ]
  };

  const cookHubData = {
    title: "Kitchen Hub",
    description: "Your all-in-one resource for seating charts, training guides, and shift notes to keep the front of house running smoothly.",
    cards: [
      {
        title: "Recipe Library",
        description: "Browse and learn menu recipes with ingredients and steps.",
        imageSrc: "https://images.immediate.co.uk/production/volatile/sites/30/2022/08/Fish-Tacos-1337495.jpg?quality=90&resize=708,643",
        altText: "A seating chart diagram"
      },
      {
        title: "Kitchen Safety",
        description: "Understand safety protocols and kitchen procedures.",
        imageSrc: "https://www.bondcleaninginmelbourne.com.au/wp-content/uploads/2021/08/kitchen-cleaning.jpg",
        altText: "A training manual"
      },
      {
        title: "Kitchen Training Manual",
        description: "Step-by-step guide for kitchen practices and procedures.",
        imageSrc: "https://www.restaurant365.com/wp-content/uploads/2024/07/RestaurantMenuTrainingStaffFun-1024x681.png",
        altText: "A notebook with shift notes"
      }
    ]
  };

  const bartenderHubData = {
    title: "Bartender Hub",
    description: "Your all-in-one resource for drink recipes, manuals, menu knowledge, and shift notes.",
    cards: [
      {
        title: "Cocktail & Drink Recipes",
        description: "Cocktail recipes and drink preparation steps",
        imageSrc: "https://img.freepik.com/free-photo/refreshing-lime-mint-drink_23-2151954296.jpg?semt=ais_hybrid&w=740&q=80",
        altText: "A fresh mojito cocktail"
      },
      {
        title: "Bartender Training Manual",
        description: "Master the key bartending skills and techniques",
        imageSrc: "https://www.restaurantmanifesto.com/wp-content/uploads/2023/02/img_2233-600x337.jpg",
        altText: "A manual book with bar equipment"
      },
      {
        title: "Menu Training",
        description: "Food offerings and bar cocktails with photos and ingredients.",
        imageSrc: "https://firebasestorage.googleapis.com/v0/b/oceanside-2e497.firebasestorage.app/o/Menu_Item%2FBreakfast%2FStuffed%20French%20Toast.png?alt=media&token=54724791-e4cd-419c-85c4-9e8064f2de65",
        altText: "Plates of food and drinks on a table"
      },
      {
        title: "Shift Notes",
        description: "Important updates for each bar shift",
        imageSrc: "https://lesroches.edu/wp-content/uploads/2022/08/Restaurant_business_plan_main.jpg",
        altText: "A notebook with shift notes"
      }
    ]
  };

  // Function to handle going back to team hubs
  const handleBackToTeamHubs = () => {
    router.push('/team-hubs');
  };

  // User ke role ke hisaab se sahi data chunna.
  let currentHubData = null;

  if (currentRole === 'Host') {
    currentHubData = hostHubData;
  } else if (currentRole === 'Bartender') {
    currentHubData = bartenderHubData;
  } else if (currentRole === 'Server') {
    currentHubData = serverHubData;
  } else if (currentRole === 'Cook'){
    currentHubData = cookHubData;
  }

  const handleCardClick = (cardTitle) => {
    console.log(`Card "${cardTitle}" was clicked!`);
    
    // Pass current role and manager status to all navigation pages
    const urlParams = `?role=${currentRole}&isManager=${isManagerView}`;
    
    // Example navigation logic
    if (cardTitle === "Menu Training") {
      router.push(`/menu_guide${urlParams}`);
    } else if (cardTitle === "Server Training Manual") {
      router.push(`/server_training${urlParams}`);
    }
    else if (cardTitle === "Seating Chart") {
      router.push(`/seating_chat_server${urlParams}`);
    }
    else if (cardTitle === "Seating Layout") {
      router.push(`/seating_layout${urlParams}`);
    }
     else if (cardTitle === "Cocktail & Drink Recipes") {
      router.push(`/cocktail_recipies${urlParams}`);
    }
     else if (cardTitle === "Bartender Training Manual") {
      router.push(`/bartender_training${urlParams}`);
    }
    else if (cardTitle === "Recipe Library") {
      router.push(`/recipe_library${urlParams}`);
    }
     else if (cardTitle === "Kitchen Safety") {
      router.push(`/kitchen_safety${urlParams}`);
    }
     else if (cardTitle === "Kitchen Training Manual") {
      router.push(`/kitchen_training${urlParams}`);
    }
      else if (cardTitle === "Shift Notes") {
      router.push(`/shift_note${urlParams}`);
    }
    else if (cardTitle === "Host Training Manual") {
      router.push(`/host_training${urlParams}`);
    }
    else if (cardTitle === "Sidework Checklists") {
      router.push(`/sidework_list${urlParams}`);
    }
  };

  // Jab tak authentication check nahi hoti, loading screen dikhayen.
  if (loading || !userAuthenticated || !currentHubData) {
    return (
      <div className="flex h-screen w-screen items-center justify-center font-sans">
        <div className="text-xl font-bold text-gray-700">Loading Hub...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 flex items-center justify-center bg-gray-100 font-sans"
      style={{
        backgroundImage: "linear-gradient(135deg, #d4edc9, #34916aff)",
      }}
    >
      <div className="max-w-6xl w-full">
        {/* Manager View Banner */}
        {isManagerView && (
          <div className="bg-blue-600 text-white p-4 rounded-lg mb-6 text-center shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <span className="font-semibold">Manager View: Currently viewing {currentRole} Hub</span>
              </div>
              <button
                onClick={handleBackToTeamHubs}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Back to Team Hubs
              </button>
            </div>
          </div>
        )}

        {/* Hub Title aur Description section */}
        <div className="text-center p-8 mb-8 rounded-xl shadow-lg"
          style={{
            background: "linear-gradient(135deg, #34916aff, #38c755ff)",
          }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{currentHubData.title}</h1>
          <p className="text-base sm:text-lg text-white max-w-2xl mx-auto">{currentHubData.description}</p>
        </div>

        {/* Hub Cards section */}
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          {currentHubData.cards.map((card, index) => (
            <div
              key={index}
              onClick={() => handleCardClick(card.title)}
              className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col items-center p-4 text-center transform transition-transform duration-300 hover:scale-105 cursor-pointer"
            >
              {/* Card Image */}
              <div className="w-full h-48 overflow-hidden rounded-lg mb-4">
                <img
                  src={card.imageSrc}
                  alt={card.altText}
                  className="object-cover w-full h-full"
                />
              </div>
              {/* Card Title and Description */}
              <div className="flex-grow">
                <h3 className="text-xl font-semibold text-green-800 mb-2">{card.title}</h3>
                <p className="text-sm text-gray-600">{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}