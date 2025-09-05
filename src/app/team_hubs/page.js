'use client';

import React from 'react';
import { ChefHat, Coffee, Handshake, Utensils, ChevronRight } from 'lucide-react';

const ModernCard = ({ title, description, icon, onClick, className = '', iconClassName = '' }) => (
  <div
    onClick={onClick}
    className={`
      bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl 
      transform transition-all duration-500 hover:scale-105 
      cursor-pointer flex flex-col items-center text-center
      border border-gray-100 hover:border-green-300
      ${className}
    `}
  >
    <div className={`p-5 rounded-full shadow-lg mb-6 ${iconClassName}`}>
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

const TeamHubsScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#34916aff] to-[#d4edc9] p-10 font-sans flex items-center justify-center">
      <div className="w-full max-w-6xl">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-extrabold drop-shadow-lg bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-600" style={{ WebkitTextStroke: '1px white' }}>
            Team Hubs
          </h1>
          <p className="text-lg text-white/80 mt-2 font-medium">
            Access dedicated resources and training for every role.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <ModernCard
            title="Server Hub"
            description="Training, menu knowledge, service standards, and customer interaction scenarios."
            icon={<Handshake />}
            onClick={() => {}}
            className="hover:shadow-green-500/50"
            iconClassName="bg-gradient-to-br from-green-500 to-sky-600"
          />
          <ModernCard
            title="Bartender Hub"
            description="Cocktail recipes, bar procedures, compliance checks, and upselling strategies."
            icon={<Coffee />}
            onClick={() => {}}
            className="hover:shadow-green-500/50"
            iconClassName="bg-gradient-to-br from-green-500 to-indigo-600"
          />
          <ModernCard
            title="Host/Hostess Hub"
            description="Reservation flow, seating charts, guest communication guidelines, and customer service scripts."
            icon={<Utensils />}
            onClick={() => {}}
            className="hover:shadow-green-500/50"
            iconClassName="bg-gradient-to-br from-green-500 to-teal-600"
          />
          <ModernCard
            title="Kitchen Hub"
            description="Batch recipes, prep standards, food safety protocols, and storage guidelines."
            icon={<ChefHat />}
            onClick={() => {}}
            className="hover:shadow-green-500/50"
            iconClassName="bg-gradient-to-br from-green-500 to-orange-600"
          />
        </div>
      </div>
    </div>
  );
};

export default TeamHubsScreen;
