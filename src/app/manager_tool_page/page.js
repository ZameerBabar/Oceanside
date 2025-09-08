'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

const themeColors = {
  darkGreen: '#34916aff',
  lightGreen: '#d4edc9',
  cardBackground: '#ffffff',
  textDark: '#1a1a1a',
  textLight: '#6b7280',
};

// ==========================================================
// Manager Tools Component
// ==========================================================
const ManagerToolsPage = () => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Logout karne mein koi masla hua:", error);
    }
  };

  const menuItems = [
    {
      title: 'Manager Hub',
      description:
        'Your command center. From team updates to training modules and daily operations, everything you need to lead effectively is here.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        </svg>
      ),
      onClick: () => {
        router.push('/manager_hub');
      },
    },
    {
      title: 'Review Reports',
      description: 'Review performance insights, staff mentions, and monthly highlights in one place.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0h.01M9 19h7a2 2 0 002-2v-6a2 2 0 00-2-2h-5a2 2 0 00-2 2v6a2 2 0 002 2zm0 0V7a2 2 0 012-2h2a2 2 0 012 2v10m-3 0h3" />
        </svg>
      ),
      onClick: () => {
        router.push('/manager_dashbaord');
      },
    },
    {
      title: 'Manager Task Board',
      description:
        'Track daily and shift-specific manager responsibilities like checklists, approvals, and operational follow-ups.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M18 10h.01" />
        </svg>
      ),
      onClick: () => {
        router.push('/manager_taskboard');
      },
    },
    {
      title: 'Incident Log',
      description:
        'Record guest complaints, accidents, and maintenance issues in real time for better reporting and accountability.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.39 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
        onClick: () => {
        router.push('/incident_log');
      },
    },
    
    {
      title: 'Calendar',
      description: 'Keep track of promotions, seasonal campaigns, team events, and important deadlines in one place.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h.01M7 12h.01M7 15h.01M11 12h.01M11 15h.01M15 12h.01M15 15h.01M19 12h.01M19 15h.01M4 20h16a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
       onClick: () => {
        router.push('/live_calendar');
      },
    },
    {
      title: 'Toast',
      description: 'Access Toast POS system for sales, reporting, and transactions.',
      link: 'https://pos.toasttab.com/',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: 'Hot Schedules',
      description: 'Review and approve schedules, time-off requests, and shift swaps.',
      link: 'https://app.hotschedules.com/hs/login.jsp',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  // Manager Hub card alag
  const managerHubCard = menuItems[0];
  const otherItems = menuItems.slice(1);

  return (
    <div
      className="flex min-h-screen text-gray-800 relative"
      style={{
        background: `linear-gradient(135deg, ${themeColors.lightGreen}, ${themeColors.darkGreen})`,
      }}
    >
      {/* Mobile Header */}
      <div
        className="md:hidden w-full flex justify-between items-center p-6 shadow-xl fixed top-0 left-0 z-50 backdrop-blur-lg"
        style={{ backgroundColor: `${themeColors.darkGreen}` }}
      >
        <button onClick={() => router.back()} className="p-2 rounded-lg bg-white/20 backdrop-blur">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-white">Manager Tools</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-lg bg-white/20 backdrop-blur">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto mt-20 md:mt-0">
        {/* Title */}
        <div
          className="hidden md:flex flex-row items-center text-white mb-6 p-6 rounded-3xl backdrop-blur-lg shadow-xl"
          style={{
            background: `linear-gradient(135deg, ${themeColors.darkGreen}, #38c755dd)`,
            borderColor: `${themeColors.lightGreen}`,
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          </svg>
          <h1 className="text-3xl font-bold">Manager Tools</h1>
        </div>

        {/* Manager Hub Card */}
        <div
          onClick={managerHubCard.onClick}
          className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-xl p-7 flex items-start transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl border border-white/50 mb-6 cursor-pointer"
        >
          <div className={`p-4 rounded-2xl mr-4 bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg`}>
            {managerHubCard.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-1.5" style={{ color: themeColors.darkGreen }}>
              {managerHubCard.title}
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: themeColors.textLight }}>
              {managerHubCard.description}
            </p>
          </div>
        </div>

        {/* Other Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-1">
          {otherItems.map((item, index) => {
            const handleClick = () => {
              if (item.onClick) {
                item.onClick();
              } else if (item.link) {
                window.open(item.link, '_blank');
              }
            };

            return (
              <div
                key={index}
                onClick={handleClick}
                className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-xl p-7 flex items-start cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/50"
              >
                <div className={`p-4 rounded-2xl mr-4 bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg`}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-1.5" style={{ color: themeColors.darkGreen }}>
                    {item.title}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: themeColors.textLight }}>
                    {item.description}
                  </p>
                  {item.link && (
                    <span className="mt-2 flex items-center text-xs font-semibold hover:underline" style={{ color: themeColors.darkGreen }}>
                      Visit Site
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ==========================================================
// Main App Component
// ==========================================================
const App = () => {
  return <ManagerToolsPage />;
};

export default App;
