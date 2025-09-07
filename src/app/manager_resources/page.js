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
        { name: 'Hurricane Shut Down Procedures.docx', link: 'https://firebasestorage.googleapis.com/v0/b/oceanside-2e497.firebasestorage.app/o/Resources%2FHurricane%20Shut%20Down%20Procedures.docx?alt=media&token=eca505b1-0c65-4639-ad24-32cad167a017' },
        { name: 'Storm Preparedness Checklist.docx', link: 'https://firebasestorage.googleapis.com/v0/b/oceanside-2e497.firebasestorage.app/o/Resources%2FStorm%20Preparedness%20Checklist.docx?alt=media&token=e5d53cc4-9b3e-4317-914a-553e4d1156f6' },
      ],
    },
    {
      title: 'Private Events & Banquets',
      items: [
        { name: 'Private Events Menu 2025.pdf', link: 'https://firebasestorage.googleapis.com/v0/b/oceanside-2e497.firebasestorage.app/o/Resources%2FPrivate%20Events%20Menu%202025.pdf?alt=media&token=4979c881-1b8c-4381-8c34-6ba8d3cbb043' },
        { name: 'FAQ Banquets.pdf', link: 'https://firebasestorage.googleapis.com/v0/b/oceanside-2e497.firebasestorage.app/o/Resources%2FFAQ%20Banquets.pdf?alt=media&token=44436a0c-b30e-4f1f-9bbe-1bf8ea5a35dd' },
      ],
      isTwoColumn: true,
    },
    {
      title: 'Guest Services & Payments',
      items: [
        { name: 'Accepting Old Gift Cards.pdf', link: 'https://firebasestorage.googleapis.com/v0/b/oceanside-2e497.firebasestorage.app/o/Resources%2FAccepting%20Old%20Gift%20Cards.pdf?alt=media&token=a84ee756-84d1-429b-b0e9-c768c4fd239c' },
      ],
      isTwoColumn: false,
    },
    {
      title: 'Manager Operations Checklists',
      items: [
        { name: 'FOH Manager Closing.pdf', link: 'https://firebasestorage.googleapis.com/v0/b/oceanside-2e497.firebasestorage.app/o/Resources%2FFOH%20Manager%20Closing-2.pdf?alt=media&token=a6337a43-99ae-4739-85a1-47ad72eddb19' },
        { name: 'Close Out Day, Z Report, and Auto-Capture Overview.docx', link: 'https://firebasestorage.googleapis.com/v0/b/oceanside-2e497.firebasestorage.app/o/Resources%2FClose%20Out%20Day%2C%20Z%20Report%2C%20and%20Auto-Capture%20Overview.docx?alt=media&token=3e2e3fc1-bda0-4e56-96d8-f70d2623d9d9' },
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
                <h3 className="text-xl font-semibold mb-2" style={{ color: themeColors.textDark }}>File open nahi ho rahi</h3>
                <p className="text-center text-sm" style={{ color: themeColors.textLight }}>
                  Yeh file .docx format mein hai, isliye yeh seedhe browser mein open nahi ho sakti.
                  Ise download karne ke liye download icon par click karen.
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
