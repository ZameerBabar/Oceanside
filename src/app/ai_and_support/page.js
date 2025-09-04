'use client';

import React, { useState } from 'react';
import { MessageSquare, Book, ChevronRight } from 'lucide-react';

// Reusable card component with a modern design
const ModernCard = ({ title, description, icon, onClick, className = '' }) => (
  <div
    onClick={onClick}
    className={`
      bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl 
      transform transition-all duration-500 hover:scale-105 
      cursor-pointer flex flex-col items-center text-center
      border border-gray-100 hover:border-purple-300
      ${className}
    `}
  >
    <div className="p-5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full shadow-lg mb-6">
      {React.cloneElement(icon, { size: 48, className: 'text-white' })}
    </div>
    <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-sm text-gray-600 mb-6">{description}</p>
    <div className="mt-auto text-sm font-semibold text-purple-600 flex items-center group">
      Explore &nbsp;
      <ChevronRight size={16} className="transform transition-transform group-hover:translate-x-1" />
    </div>
  </div>
);

// Main AI & Support screen view
const AiSupportView = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d4edc9] to-[#34916aff] p-10 font-sans flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">AI & Support</h1>
          <p className="text-lg text-white/80 mt-2 font-medium">
            Your hub for resources and instant assistance.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <ModernCard
            title="AI Chat"
            description="Your 24/7 Oceanside Assistant—ask about policies, menu items, or training tasks and get instant answers."
            icon={<MessageSquare />}
            onClick={() => onNavigate('aiChat')}
            className="hover:shadow-purple-500/30"
          />
          <ModernCard
            title="Contact Book"
            description="Directory for suppliers, owners, contractors, and city contacts relevant to restaurant operations."
            icon={<Book />}
            onClick={() => {}}
            className="hover:shadow-blue-500/30"
          />
        </div>
      </div>
    </div>
  );
};

// Placeholder for the AI Chat screen
const AiChatView = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d4edc9] to-[#34916aff] p-10 font-sans flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white/90 backdrop-blur-sm rounded-3xl p-10 shadow-2xl text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">AI Chat</h1>
        <p className="text-gray-600">
          This is the placeholder for the AI Chat screen.
        </p>
        <button
          onClick={() => onNavigate('aiSupport')}
          className="mt-8 px-6 py-3 bg-purple-600 text-white rounded-full font-semibold shadow-lg transform transition-transform hover:scale-105"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

// Main App component to handle navigation
const App = () => {
  const [currentPage, setCurrentPage] = useState('aiSupport');

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  switch (currentPage) {
    case 'aiSupport':
      return <AiSupportView onNavigate={handleNavigate} />;
    case 'aiChat':
      return <AiChatView onNavigate={handleNavigate} />;
    default:
      return <AiSupportView onNavigate={handleNavigate} />;
  }
};

export default App;
