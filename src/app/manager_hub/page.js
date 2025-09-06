'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // ✅ import router
import { ChevronRight, Users, BookOpen, FileText, Target, TrendingUp, Shield, Sparkles, Star } from 'lucide-react';

const ModernCard = ({ 
  title, 
  description, 
  icon, 
  onClick, 
  className = '', 
  iconBg = 'from-emerald-500 to-teal-600',
  image = null,
  features = []
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative group bg-white/95 backdrop-blur-xl rounded-2xl p-4 
        shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] hover:shadow-[0_35px_60px_-12px_rgba(0,0,0,0.4)]
        transform transition-all duration-700 hover:scale-105 hover:-translate-y-3
        cursor-pointer flex flex-col overflow-hidden
        border border-white/50 hover:border-white/80
        ${className}
      `}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-all duration-700 bg-gradient-to-br from-red-400 to-green-600" />
      
      {/* Floating elements */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <Star size={16} className="text-yellow-400 animate-pulse" />
      </div>
      <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-80 transition-opacity duration-700 delay-200">
        <Sparkles size={12} className="text-emerald-400 animate-bounce" />
      </div>

      {/* Image or Icon section */}
      <div className="relative mb-6 h-40 rounded-2xl overflow-hidden">
        {image ? (
          <div className="relative h-full">
            <img 
              src={image} 
              alt={title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <div className={`absolute top-4 left-4 p-3 rounded-full bg-gradient-to-br ${iconBg} shadow-lg`}>
              {React.cloneElement(icon, { size: 28, className: 'text-white' })}
            </div>
          </div>
        ) : (
          <div className={`h-full flex items-center justify-center bg-gradient-to-br ${iconBg} relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />
            <div className="relative">
              {React.cloneElement(icon, { size: 60, className: 'text-white drop-shadow-lg' })}
            </div>
            {/* Animated circles */}
            <div className="absolute top-4 right-4 w-12 h-12 bg-white/10 rounded-full animate-ping" />
            <div className="absolute bottom-4 left-4 w-10 h-10 bg-white/20 rounded-full" style={{ animation: 'float 4s ease-in-out infinite' }} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-grow">
        <h3 className="text-xl font-bold text-gray-800 mb-2 transition-colors duration-300 group-hover:text-gray-900 leading-tight">
          {title}
        </h3>
        <p className="text-sm text-gray-600 mb-4 leading-relaxed transition-colors duration-300 group-hover:text-gray-700">
          {description}
        </p>

        {/* Features list */}
        {features.length > 0 && (
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center text-xs text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 flex-shrink-0" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced CTA */}
      <div className={`
        px-4 py-3 rounded-2xl font-semibold flex items-center justify-center
        transition-all duration-500 transform relative overflow-hidden
        ${isHovered ? 'bg-gradient-to-r from-emerald-500 to-[#38c755dd] text-white shadow-lg scale-105' : 'bg-green-100 text-emerald-600'}
      `}>
        <span className="relative z-10">Access Hub</span>
        <ChevronRight 
          size={16} 
          className={`ml-2 transform transition-all duration-300 relative z-10 ${isHovered ? 'translate-x-2 text-white' : 'text-emerald-600'}`} 
        />
        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse" />
        )}
      </div>

      {/* Subtle glow effect */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
      </div>
    </div>
  );
};

const FloatingBadge = ({ children, delay = 0, position = 'top-right' }) => {
  const positionClasses = {
    'top-right': 'top-16 right-16',
    'top-left': 'top-28 left-28',
    'bottom-right': 'bottom-28 right-28',
    'bottom-left': 'bottom-16 left-16'
  };

  return (
    <div 
      className={`absolute ${positionClasses[position]} opacity-20 animate-pulse`}
      style={{ animationDelay: `${delay}s`, animationDuration: '3s' }}
    >
      {children}
    </div>
  );
};

const ManagerHubScreen = () => {
  const router = useRouter(); // ✅ fix

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#34916aff]  to-[#d4edc9]">
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
        
        {/* Floating background elements */}
        <FloatingBadge delay={0} position="top-right">
          <Target size={50} className="text-white/30" />
        </FloatingBadge>
        <FloatingBadge delay={1} position="top-left">
          <TrendingUp size={70} className="text-white/20" />
        </FloatingBadge>
        <FloatingBadge delay={2} position="bottom-right">
          <Shield size={60} className="text-white/25" />
        </FloatingBadge>
        
        {/* Animated shapes */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-emerald-300/20 rounded-full blur-2xl" style={{ animation: 'float 6s ease-in-out infinite 2s' }} />
      </div>
      
      <div className="relative z-10 p-6 font-sans flex items-center justify-center min-h-screen">
        <div className="w-full max-w-5xl">
          {/* Enhanced header */}
          <header className="text-center mb-16">
            <div className="inline-block relative w-full">
              {/* Background glow */}
              <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl scale-110" />
              
              <div className="relative bg-gradient-to-r from-[#34916aff]  to-[#38c755dd]  rounded-2xl p-5 shadow-2xl border border-white">
                {/* Header icon */}
                <h1 className="text-4xl font-black bg-clip-text text-transparent bg-white mb-2">
                  Manager Hub
                </h1>
                <div className="w-24 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent mx-auto mb-4 rounded-full" />
                <p className="text-base text-white/70 font-medium leading-relaxed max-w-2x3 mx-auto">
                  Your comprehensive command center for leadership excellence, team management, and operational success
                </p>
              </div>
            </div>
          </header>

          {/* Cards grid */}
          <div className="flex flex-col md:flex-row gap-5 justify-center">
            <ModernCard className="md:w-[45%]"
              title="Manager Training"
              description="Orientation, shift management, labor, leadership, 
                         guest experience, and all Oceanside training 
                         modules."
              icon={<BookOpen />}
              onClick={() => {
                router.push('/manager_training_manual'); // ✅ now works
              }}
              iconBg="from-emerald-500 via-teal-500 to-cyan-600"
              image="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop&crop=faces"
            />
            
            <ModernCard className="md:w-[45%]"
              title="Manager Resources & Documents"
              description="Access checklists, policies, forms, and 
                         downloadable documents needed for daily 
                         operations."
              icon={<FileText />}
              onClick={() => {
                router.push('/manager_resources'); // ✅ add navigation
              }}
              iconBg="from-violet-500 via-purple-500 to-indigo-600"
              image="https://thumbor.forbes.com/thumbor/fit-in/900x510/https://www.forbes.com/advisor/wp-content/uploads/2022/09/What_Is_Human_Resources_-_article_image.jpg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerHubScreen;
