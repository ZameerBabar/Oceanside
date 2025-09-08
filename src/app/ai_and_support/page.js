'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Book, ChevronRight } from 'lucide-react';

// Reusable card component with a modern design
const ModernCard = ({ title, description, icon, onClick, className = '' }) => (
  <div
    onClick={onClick}
    className={`
      bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl
      transform transition-all duration-500 hover:scale-105
      cursor-pointer flex flex-col items-center text-center
      border border-gray-100 hover:border-purple-300
      ${className}
    `}
  >
    <div className="p-5 bg-gradient-to-br from-[#34916aff] to-[#38c755ff] rounded-full shadow-lg mb-6">
      {React.cloneElement(icon, { size: 48, className: 'text-white' })}
    </div>
    <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-sm text-gray-600 mb-6">{description}</p>
    <div className="mt-auto text-sm font-semibold text-green-600 flex items-center group">
      Explore &nbsp;
      <ChevronRight size={16} className="transform transition-transform group-hover:translate-x-1" />
    </div>
  </div>
);

// Main AI & Support screen view
const AiSupportView = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#34916aff] to-[#d4edc9] p-10 font-sans flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <header className="text-center mb-16">
          {/* Gradient Text */}
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-[#38c755ff] to-[#34916aff] bg-clip-text text-transparent drop-shadow-lg [text-stroke:1px_green/20] [-webkit-text-stroke:1px_white]">
        AI & Support
          </h1>
          <p className="text-lg text-white/80 mt-2 font-medium">
            Your hub for resources and instant assistance.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <ModernCard
            title="AI Chat"
            description="Your 24/7 Oceanside Assistant—ask about policies, menu items, or training tasks and get instant answers."
            icon={<MessageSquare />}
            onClick={() => router.push('/ai_chat')} // 👈 ab direct tumhari ai_chat page.js khul jaega
            className="hover:shadow-purple-500/40 shadow-lg"
          />
          <ModernCard
            title="Contact Book"
            description="Directory for suppliers, owners, contractors, and city contacts relevant to restaurant operations."
            icon={<Book />}
             onClick={() => router.push('/contact_book')} 
            className="hover:shadow-blue-500/40 shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default AiSupportView;
