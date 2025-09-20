'use client';

import React, { useState } from 'react';

const themeColors = {
  darkGreen: '#34916aff',
  lightGreen: '#d4edc9',
  cardBackground: '#ffffff',
  textDark: '#1a1a1a',
  textLight: '#6b7280',
  background: '#f5fff1',
  borderGreen: '#e3f3df',
  iconGreen: '#39a26e',
};

// ==========================================================
// Web Dashboard Component
// ==========================================================
const DashboardPage = () => {
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Documents ka data
  const documentsData = [
    {
      title: 'Storm & Emergency Procedures',
      items: [
        { name: 'Hurricane Shut Down Procedures.pdf', link: 'https://firebasestorage.googleapis.com/v0/b/oceanside-2e497.firebasestorage.app/o/manager_resources%2FHurricane%20Shut%20Down%20Procedures%20pdf.pdf?alt=media&token=2447186f-6a3e-4b8b-8e87-e03aec4d39c4' },
        { name: 'Storm Preparedness Checklist.pdf', link: 'https://firebasestorage.googleapis.com/v0/b/oceanside-2e497.firebasestorage.app/o/manager_resources%2FStorm%20Preparedness%20Checklist.pdf?alt=media&token=92ad89d1-5cce-4da6-992e-e99e3ed33a09' },
      ],
    },
    {
      title: 'Private Events & Banquets',
      items: [
        { name: 'Private Events Menu 2025.pdf', link: 'https://firebasestorage.googleapis.com/v0/b/oceanside-2e497.firebasestorage.app/o/manager_resources%2FPrivate%20Events%20Menu%202025.pdf?alt=media&token=35014b9c-2204-4a57-90e8-72c167c8f278' },
        { name: 'FAQ Banquets.pdf', link: 'https://firebasestorage.googleapis.com/v0/b/oceanside-2e497.firebasestorage.app/o/manager_resources%2FFAQ%20Banquets.pdf?alt=media&token=67e04816-83d8-4a31-ba5d-fc1d9799b9cd' },
      ],
      isTwoColumn: true,
    },
    {
      title: 'Guest Services & Payments',
      items: [
        { name: 'Accepting Old Gift Cards.pdf', link: 'https://firebasestorage.googleapis.com/v0/b/oceanside-2e497.firebasestorage.app/o/manager_resources%2FAccepting%20Old%20Gift%20Cards.pdf?alt=media&token=fbdfc4e7-7da3-4b02-92fd-74a5c1e93b6b' },
      ],
      isTwoColumn: false,
    },
    {
      title: 'Manager Operations Checklists',
      items: [
        { name: 'FOH Manager Closing.pdf', link: 'https://firebasestorage.googleapis.com/v0/b/oceanside-2e497.firebasestorage.app/o/manager_resources%2FFOH%20Manager%20Closing-2.pdf?alt=media&token=5807eb9c-d1a8-4a99-9f40-599382994d1a' },
        { name: 'Close Out Day, Z Report, and Auto-Capture Overview.pdf', link: 'https://firebasestorage.googleapis.com/v0/b/oceanside-2e497.firebasestorage.app/o/manager_resources%2FClose%20Out%20Day%2C%20Z%20Report%2C%20and%20Auto-Capture%20Overview%20.pdf?alt=media&token=65389f8a-d922-4aa4-b2e6-d095caf599d6' },
      ],
      isTwoColumn: true,
    },
  ];

  // Document icon SVG
  const DocumentIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  // Download icon SVG
  const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
  
  return (
    <div className="flex flex-col min-h-screen relative" style={{ background: themeColors.background }}>
      {/* Top Header Card */}
      <div className="flex items-center p-6 shadow-md z-50 rounded-b-3xl" style={{ 
          background: `linear-gradient(135deg, ${themeColors.darkGreen}, #38c755dd)`,
          color: themeColors.cardBackground,
        }}>
        <h1 className="text-2xl font-bold">Manager Documents</h1>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {documentsData.map((section, index) => (
          <div key={index} className="mb-4">
            <h2 className="text-xl font-bold mb-2" style={{ color: themeColors.iconGreen }}>{section.title}</h2>
            <div className={`grid gap-2 ${section.isTwoColumn ? 'md:grid-cols-2' : ''}`}>
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex} className="bg-white rounded-xl shadow-lg flex items-center justify-between p-2 border border-gray-200 transition-shadow duration-300 hover:shadow-xl">
                  {/* Click karne par link open hoga */}
                  <div
                    onClick={() => setSelectedDocument({ url: item.link, name: item.name })}
                    className="flex items-center flex-grow text-sm font-medium text-gray-800 cursor-pointer"
                  >
                    <div style={{ color: themeColors.darkGreen }}>
                      <DocumentIcon />
                    </div>
                    <span>{item.name}</span>
                  </div>
                  {/* Download icon par click karne se file download hogi */}
                  <a
                    href={item.link}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDocument({ url: item.link, name: item.name });
                    }}
                    className="flex items-center justify-center p-1 rounded-full transition-colors duration-300 cursor-pointer"
                    style={{ backgroundColor: themeColors.lightGreen, color: themeColors.darkGreen }}
                  >
                    <DownloadIcon />
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-[100]">
          <div className="relative w-[90vw] h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden">
            <button
              onClick={() => setSelectedDocument(null)}
              className="absolute top-4 right-4 text-white bg-red-500 rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg"
            >
              &times;
            </button>
            {/* Ab file ka naam check kiya ja raha hai taake sahi message dikhe */}
            {selectedDocument.name.endsWith('.docx') ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-4">
                <h3 className="text-xl font-semibold mb-2" style={{ color: themeColors.textDark }}>The file is not opening.</h3>
                <p className="text-center text-sm" style={{ color: themeColors.textLight }}>
                 This file is in docx format, so it cannot be opened directly in a browser.
                  Click the download icon to download it.
                </p>
              </div>
            ) : (
              <iframe
                src={selectedDocument.url}
                className="w-full h-full border-none"
                title="Document Viewer"
              ></iframe>
            )}
          </div>
        </div>
      )}
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
