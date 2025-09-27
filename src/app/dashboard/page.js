'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation' // 🔁 For redirecting to dashboard
import { signOut, onAuthStateChanged } from 'firebase/auth'; // Firebase auth functions
import { doc, getDoc } from 'firebase/firestore'; // Firebase Firestore functions
import { auth, db } from '../firebaseConfig'; // Import `db` for Firestore

// Theme Colors (based on logo)
const themeColors = {
  darkGreen: '#34916aff',
  lightGreen: '#d4edc9',
  cardBackground: '#ffffff',
  textDark: '#1a1a1a',
  textLight: '#6b7280',
};

// Hub data ko role ke hisab se define kar rahe hain
const hubs = {

  'Host': {
    title: 'Host Hub',
    description: 'Your go-to hub for greeting standards, seating charts, waitlist management, and everything you need to run the front door smoothly.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
    )
  },
  'Bartender': {
    title: 'Bartender Hub',
    description: 'Access drink recipes, bar setup guides, responsible service practices, and everything you need to run the bar efficiently.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-8.5v.5m0-13a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V3.75a.75.75 0 01.75-.75z" />
    )
  },
  'Server': {
    title: 'Sever Hub',
    description: 'Stay sharp with plating guides, table number maps, ticket timing tips, and all tools needed to support smooth service.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    )
  },

  'Cook': {
    title: 'Kitchen Hub',
    description: 'Access recipes, station prep guides, plating standards, and kitchen workflows to help you deliver consistent, high-quality dishes.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.5 20.5v-1.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1.5M10.5 19v-4m-1-4h3m-3-4h3" />
    )
  },
};

// ==========================================================
// Web Dashboard Component
// ==========================================================
const DashboardPage = () => {
  const router = useRouter(); // ✅ Required for navigation
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState('Jacob');
  const [userRole, setUserRole] = useState('Server');
  const [loading, setLoading] = useState(true);

  // Function to handle the logout process
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // After a successful sign out, redirect to the login page.
      router.push('/');
    } catch (error) {
      console.error("Something went Wrong!:", error);
    }
  };
  
  // A helper component for the 3-line menu icon
  const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User logged in hai, ab role fetch karein
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setUserName(userData.name || 'Employee');
            setUserRole(userData.role || 'Server');
          } else {
            console.log("Firestore mein user ka data nahi mila.");
          }
        } catch (error) {
          console.error("Firestore se user data fetch karne mein galti hui:", error);
        }
      } else {
        // Agar user logged out hai, to login screen par bhej dein
        router.push('/');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center font-sans" style={{
        background: `linear-gradient(135deg, ${themeColors.lightGreen}, ${themeColors.darkGreen})`,
      }}>
        <div className="text-xl font-bold text-white">Loading...</div>
      </div>
    );
  }

  // Dashboard Hub card ko role ke hisab se taiyar kar rahe hain
  const hubCardData = hubs[userRole] || hubs['Host']; // Default to Host if role is not found

  // Cards ki list
  const cardItems = [
    {
      title: hubCardData.title,
      description: hubCardData.description,
      icon: hubCardData.icon,
      onClick: () => {
    console.log(`${hubCardData.title} clicked`);
    // Normal employee ke liye direct hub page par bhejo with role parameter
    router.push(`/training_screen?role=${userRole}&isManager=false`);
      },
    },
    {
      title: 'AI Chat',
      description:
        'Ask anything, anytime. Your 24/7 Oceanside assistant — here to answer questions about policies, menu items, tasks, and more.',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h8m-4 4h4"
        />
      ),
      onClick: () => {
        console.log("AI Chat clicked");
        router.push('/ai_chat');
      },
    },
    {
      title: 'Employee Manual',
      description:
        "Know what's expected. Access company policies, protocols, and essential FOH information in one place.",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13"
        />
      ),
      onClick: () => {
        console.log("Employee Manual clicked");
        router.push('/employee_manual');
      },
    },
    {
      title: 'Hot Schedules',
      description: 'Check your schedule, request time off, and manage shift swaps—all in one place.',
      link: 'https://app.hotschedules.com/hs/login.jsp',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 10h18M3 14h18m-9-4v4m0 0v4m0-4h4m-4 0H7"
        />
      ),
      onClick: () => {
        window.open("https://app.hotschedules.com/hs/login.jsp", "_blank");
       
      },
    },
    
    {
      title: 'Menu Features',
      description:
        "See what’s fresh. Browse our latest specials, seasonal dishes, and featured items.",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13"
        />
      ),
      onClick: () => {
        window.open("https://www.oceansidebeachgrill.com/features", "_blank");
       
      },
    },
  ];

  return (
    <div
      className="flex min-h-screen text-gray-800 relative"
      style={{
        background: `linear-gradient(135deg, ${themeColors.lightGreen}, ${themeColors.darkGreen})`,
      }}
    >
      {/* Mobile Header (visible on small screens) */}
      <div className="md:hidden w-full flex justify-between items-center p-4 shadow-lg fixed top-0 left-0 z-50" 
          style={{ backgroundColor: themeColors.darkGreen }}>
        <img
          src="/logo.png"
          alt="Oceanside Logo"
          className="h-8 w-auto object-contain"
        />
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-md">
          <MenuIcon />
        </button>
      </div>

      {/* Desktop Sidebar (hidden on small screens) */}
      <div className="hidden md:flex flex-col w-64 p-6 text-white shadow-lg" style={{
        background: `linear-gradient(105deg, ${themeColors.lightGreen}, #34916aff)`,
      }}>
        <div className="flex items-center justify-center mb-10 mt-4">
          <img
            src="/logo.png"
            alt="Oceanside Logo"
            className="h-12 w-auto object-contain"
          />
        </div>
        <nav className="space-y-2 flex-grow">
          <a href="#" className="flex items-center p-3 rounded-xl transition-colors duration-200 bg-green-800 hover:bg-green-700">
            <span className="mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </span>
            <span className="font-semibold text-white">Dashboard</span>
          </a>
        </nav>
        {/* Logout Button */}
        <nav className="space-y-1 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-3 rounded-xl transition-colors duration-200 bg-green-500 hover:bg-red-700 text-white font-semibold"
          >
            <span className="mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-2 0V4H5v12h12v-2a1 1 0 112 0v3a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm9.293 8.293a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L13 13.414V17a1 1 0 11-2 0v-3.586l-1.293 1.293a1 1 0 01-1.414-1.414l3-3z" clipRule="evenodd" />
              </svg>
            </span>
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Mobile Menu (opens on small screens) */}
      <div className={`fixed inset-0 z-40 bg-gray-900 bg-opacity-75 md:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileMenuOpen(false)}></div>
      <div className={`fixed top-0 left-0 h-full w-64 z-50 flex flex-col p-6 text-white shadow-lg transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{
        background: `linear-gradient(105deg, ${themeColors.lightGreen}, #34916aff)`,
      }}>
        <div className="flex items-center justify-center mb-10 mt-4">
          <img
            src="/logo.png"
            alt="Oceanside Logo"
            className="h-12 w-auto object-contain"
          />
        </div>
        <nav className="space-y-2 flex-grow">
          <a href="#" className="flex items-center p-3 rounded-xl transition-colors duration-200 bg-green-800 hover:bg-green-700">
            <span className="mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </span>
            <span className="font-semibold text-white">Dashboard</span>
          </a>
        </nav>
        {/* Logout Button */}
        <nav className="space-y-1 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-3 rounded-xl transition-colors duration-200 bg-green-500 hover:bg-red-700 text-white font-semibold"
          >
            <span className="mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-2 0V4H5v12h12v-2a1 1 0 112 0v3a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm9.293 8.293a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L13 13.414V17a1 1 0 11-2 0v-3.586l-1.293 1.293a1 1 0 01-1.414-1.414l3-3z" clipRule="evenodd" />
              </svg>
            </span>
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto mt-16 md:mt-0">
        {/* Greeting Card */}
        <div
          className="flex flex-col p-6 rounded-3xl mb-8 shadow-md"
          style={{
            background: 'linear-gradient(135deg, #34916aff, #38c755ff)',
            color: themeColors.cardBackground,
          }}
        >
          <h2 className="text-3xl font-bold">Hello, {userName}!</h2>
          <p className="text-lg mt-2 opacity-90">Welcome to Your Oceanside Portal</p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 md:p-3">
          {/* Card Component */}
          {cardItems.map((card, index) => (
            <div
              key={index}
              onClick={card.onClick}
              className="bg-white rounded-3xl shadow-md p-6 flex items-start cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
              style={{ border: `1px solid ${themeColors.lightGreen}` }}
            >
              <span className="p-3 rounded-full mr-4" style={{ backgroundColor: themeColors.lightGreen }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke={themeColors.darkGreen}>
                  {card.icon}
                </svg>
              </span>
              <div>
                <h3 className="text-xl font-bold mb-1" style={{ color: themeColors.darkGreen }}>
                  {card.title}
                </h3>
                <p className="text-sm" style={{ color: themeColors.textLight }}>
                  {card.description}
                </p>
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
};

// ==========================================================
// Main App Component
// ==========================================================
const App = () => {
  return <DashboardPage />;
};

export default App;
