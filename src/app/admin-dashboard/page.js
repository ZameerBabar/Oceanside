'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import ManagerDashboardPage from '../manager_dashbaord/page'; // Sahi kiya gaya import path

const themeColors = {
  darkGreen: '#34916aff',
  lightGreen: '#d4edc9',
  cardBackground: '#ffffff',
  textDark: '#1a1a1a',
  textLight: '#6b7280',
};

// ==========================================================
// New Component for Review Report Page
// ==========================================================
const ReviewReportPage = () => {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-md" style={{ border: `1px solid ${themeColors.lightGreen}` }}>
      <h2 className="text-2xl font-bold" style={{ color: themeColors.darkGreen }}>Review Report</h2>
      <p className="mt-2 text-gray-600">This is the Review Report page content. Here you can display tables, charts, and other report-related information.</p>
    </div>
  );
};

// ==========================================================
// Web Dashboard Component
// ==========================================================
const DashboardPage = () => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Logout karne mein koi masla hua:", error);
    }
  };
  
  const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );

  const dashboardCards = [
    {
      title: 'Manager Hub',
      description: 'Everything you need to thrive ... From training to daily updates, this is your central resource as a server.',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 10h18M3 14h18m-9-4v4m0 0v4m0-4h4m-4 0H7"
        />
      ),
      onClick: () => {
        router.push('/training_screen');
      },
    },
    {
      title: 'AI Chat',
      description: 'Ask anything, anytime. Your 24/7 Oceanside assistant — here to answer questions about policies, menu items, tasks, and more.',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h8m-4 4h4"
        />
      ),
      onClick: () => {
        router.push('/ai_chat');
      },
    },
    {
      title: 'Employee Manual',
      description: "Know what's expected. Access company policies, protocols, and essential FOH information in one place.",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13"
        />
      ),
      onClick: () => {
        router.push('/employee_manual');
      },
    },
    {
      title: 'Hot Schedules',
      description: 'Check your schedule, request time off, and manage shift swaps—all in one place.',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 10h18M3 14h18m-9-4v4m0 0v4m0-4h4m-4 0H7"
        />
      ),
      onClick: () => {
        router.push('/training_screen');
      },
    },
    {
      title: 'Add User',
      description: 'Never miss a beat. Stay informed with real-time team updates and important alerts.',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h8m-4 4h4"
        />
      ),
      onClick: () => {
        router.push('/add_user');
      },
    },
    {
      title: 'Users Record',
      description: "See what’s fresh. Browse our latest specials, seasonal dishes, and featured items.",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13"
        />
      ),
      onClick: () => {
        router.push('/employee_manual');
      },
    },
    {
      title: 'Events',
      description: 'Never miss a beat. Stay informed with real-time team updates and important alerts.',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h8m-4 4h4"
        />
      ),
      onClick: () => {
        router.push('/upload_data');
      },
    },
    {
      title: 'Menu Features',
      description: "See what’s fresh. Browse our latest specials, seasonal dishes, and featured items.",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13"
        />
      ),
      onClick: () => {
        router.push('/employee_manual');
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
          <a
            href="#"
            onClick={() => setActiveView('dashboard')}
            className={`flex items-center p-3 rounded-xl transition-colors duration-200 ${activeView === 'dashboard' ? 'bg-green-800' : 'hover:bg-green-700'}`}
          >
            <span className="mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </span>
            <span className="font-semibold text-white">Dashboard</span>
          </a>
          {/* New "Review Report" button */}
          <button
            onClick={() => setActiveView('managerDashboard')}
            className={`flex items-center w-full p-3 rounded-xl transition-colors duration-200 ${activeView === 'managerDashboard' ? 'bg-green-800' : 'hover:bg-green-700'}`}
          >
            <span className="mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 19V6.253a1 1 0 00-1.447-.894L.493 8.369A1 1 0 000 9.253v8.5a1 1 0 001 1h8a1 1 0 001-1zm6-6v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 001 1h5a1 1 0 001-1zm-4-4a1 1 0 001-1V5a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 001 1zm-2-2a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1h2a1 1 0 001-1v-2z" />
              </svg>
            </span>
            <span className="font-semibold text-white">Review Report</span>
          </button>
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
          <a
            href="#"
            onClick={() => {
              setActiveView('dashboard');
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center p-3 rounded-xl transition-colors duration-200 ${activeView === 'dashboard' ? 'bg-green-800' : 'hover:bg-green-700'}`}
          >
            <span className="mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </span>
            <span className="font-semibold text-white">Dashboard</span>
          </a>
          {/* New "Review Report" button */}
          <button
            onClick={() => {
              setActiveView('managerDashboard');
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center w-full p-3 rounded-xl transition-colors duration-200 ${activeView === 'managerDashboard' ? 'bg-green-800' : 'hover:bg-green-700'}`}
          >
            <span className="mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 19V6.253a1 1 0 00-1.447-.894L.493 8.369A1 1 0 000 9.253v8.5a1 1 0 001 1h8a1 1 0 001-1zm6-6v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 001 1h5a1 1 0 001-1zm-4-4a1 1 0 001-1V5a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 001 1zm-2-2a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1h2a1 1 0 001-1v-2z" />
              </svg>
            </span>
            <span className="font-semibold text-white">Review Report</span>
          </button>
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
        {activeView === 'dashboard' && (
          <>
            {/* Greeting Card */}
            <div
              className="flex flex-col p-6 rounded-3xl mb-8 shadow-md"
              style={{
                background: 'linear-gradient(135deg, #34916aff, #38c755ff)',
                color: themeColors.cardBackground,
              }}
            >
              <h2 className="text-3xl font-bold">Hello, Jacob!</h2>
              <p className="text-lg mt-2 opacity-90">Welcome to Your Oceanside Portal</p>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 md:p-3">
              {dashboardCards.map((card, index) => (
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
          </>
        )}
        
        {activeView === 'reviewReport' && <ReviewReportPage />}
        {activeView === 'managerDashboard' && <ManagerDashboardPage />}
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