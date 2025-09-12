'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Firebase imports
// Yahan path ko theek kar diya gaya hai.
// Ab yeh do levels upar ja kar 'firebaseConfig' file ko dhoondega.
import { auth } from '../firebaseConfig'; 
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// Yeh component user ke role ke mutabiq alag-alag hub ka content dikhayega.
export default function HubPage() {
  const router = useRouter();

  // User ka role aur loading state ko manage karne ke liye state variables.
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Firestore database ka reference.
  const db = getFirestore();

  useEffect(() => {
    // onAuthStateChanged listener jo user login state ko track karta hai.
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Agar user login hai, to unka role Firestore se fetch karein.
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          // Document milne par role ko state mein save karein.
          const userData = userDocSnap.data();
          setUserRole(userData.role);
        } else {
          // Agar user ka document nahi mila, to default role set kar sakte hain ya error dikha sakte hain.
          console.error("User role document not found for:", user.uid);
          setUserRole('Server'); // Default role
        }
        setLoading(false);
      } else {
        // Agar user logged out hai, to unko login page par bhej dein.
        router.push('/');
      }
    });

    // Cleanup function: jab component unmount hoga to listener ko remove kar dega.
    return () => unsubscribe();
  }, [router, db]);

  // Fake data for different roles.
  const serverHubData = {
    title: "Server Hub",
    description: "Your all-in-one resource for training modules, task checklists, and essential tools for servers.",
    cards: [
      {
        title: "Menu Training",
        description: "Food offerings and bar cocktails with photos and ingredients.",
        imageSrc: "https://www.refrigeratedfrozenfood.com/ext/resources/NEW_RD_Website/DefaultImages/default-pasta.jpg?1430942591",
        altText: "Plates of food and drinks on a table"
      },
      {
        title: "Server Training Manual",
        description: "Learn all the key skills and procedures for excellent service.",
        imageSrc: "https://lesroches.edu/wp-content/uploads/2022/08/Restaurant_business_plan_main.jpg",
        altText: "A green manual book"
      },
      {
        title: "Seating Chart",
        description: "Understand table numbers and layout.",
        imageSrc: "https://img.freepik.com/premium-photo/elegant-green-hardcover-books-surrounded-by-lush-greenery-exuding-calm-nature-inspired_996993-55421.jpg?semt=ais_hybrid&w=740&q=80",
        altText: "A restaurant seating chart"
      }
    ]
  };

  const hostHubData = {
    title: "Host/Hostess Hub",
    description: "Your all-in-one resource for seating charts, training guides, and shift notes to keep the front of house running smoothly.",
    cards: [
      {
        title: "Seating Chart",
        description: "Understand table numbers, sections, and layout",
        imageSrc: "https://placehold.co/400x250/d4edc9/34916aff?text=Seating+Chart",
        altText: "A seating chart diagram"
      },
      {
        title: "Host/Hostess Training Manual",
        description: "Learn key greeting, seating, and guest experience skills",
        imageSrc: "https://placehold.co/400x250/d4edc9/34916aff?text=Training+Manual",
        altText: "A training manual"
      },
      {
        title: "Shift Notes",
        description: "View important updates for today's shift, including a specials, VIP guests, and any service changes",
        imageSrc: "https://placehold.co/400x250/d4edc9/34916aff?text=Shift+Notes",
        altText: "A notebook with shift notes"
      }
    ]
  };


const cookHubData = {
    title: "Kitchen Hub",
    description: "Your all-in-one resource for seating charts, training guides, and shift notes to keep the front of house running smoothly.",
    cards: [
      {
        title: "Seating Chart",
        description: "Understand table numbers, sections, and layout",
        imageSrc: "https://placehold.co/400x250/d4edc9/34916aff?text=Seating+Chart",
        altText: "A seating chart diagram"
      },
      {
        title: "Host/Hostess Training Manual",
        description: "Learn key greeting, seating, and guest experience skills",
        imageSrc: "https://placehold.co/400x250/d4edc9/34916aff?text=Training+Manual",
        altText: "A training manual"
      },
      {
        title: "Shift Notes",
        description: "View important updates for today's shift, including a specials, VIP guests, and any service changes",
        imageSrc: "https://placehold.co/400x250/d4edc9/34916aff?text=Shift+Notes",
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
        imageSrc: "https://www.refrigeratedfrozenfood.com/ext/resources/NEW_RD_Website/DefaultImages/default-pasta.jpg?1430942591",
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

  // User ke role ke hisaab se sahi data chunna.
  let currentHubData = null;
  if (userRole === 'Host') {
    currentHubData = hostHubData;
  } else if (userRole === 'Bartender') {
    currentHubData = bartenderHubData;
  } else if (userRole === 'Server') {
    currentHubData = serverHubData;
  } else if (userRole === 'Cook'){
     currentHubData = cookHubData;
  }

  const handleCardClick = (cardTitle) => {
    console.log(`Card "${cardTitle}" was clicked!`);
    // Example navigation logic
    if (cardTitle === "Menu Training") {
      router.push('/menu_guide');
    } else if (cardTitle === "Server Training Manual") {
      router.push('/server_training');
    }
    else if (cardTitle === "Seating Chart") {
      router.push('/seating_chat_server');
    }
     else if (cardTitle === "Cocktail & Drink Recipes") {
      router.push('/cocktail_recipies');
    }
     else if (cardTitle === "Bartender Training Manual") {
      router.push('/bartender_training');
    }
      else if (cardTitle === "Shift Notes") {
      router.push('/shift_note');
    }
  };

  // Jab tak role load nahi hota, loading screen dikhayen.
  if (loading || !currentHubData) {
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
