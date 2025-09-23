'use client';

import React from 'react';
import { useRouter } from 'next/navigation';  // 👈 yeh import add karo
import { Users, UserPlus, FilePlus, ChevronRight } from 'lucide-react';

const ModernCard = ({ title, description, icon, onClick, className = '', iconClassName = '', buttonText }) => (
  <div
    onClick={onClick}
    className={`
      bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl 
      transform transition-all duration-500 hover:scale-105 
      cursor-pointer flex flex-col items-center text-center
      border border-gray-100
      ${className}
    `}
  >
    <div className={`p-5 rounded-full shadow-lg mb-6 ${iconClassName}`}>
      {React.cloneElement(icon, { size: 48, className: 'text-white' })}
    </div>
    <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-sm text-gray-600 mb-6">{description}</p>
    <div className="mt-auto text-sm font-semibold text-green-600 flex items-center group">
      {buttonText} &nbsp;
      <ChevronRight size={16} className="transform transition-transform group-hover:translate-x-1" />
    </div>
  </div>
);

const AdminToolsScreen = () => {
  const router = useRouter(); // 👈 router initialize karo

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#34916aff] to-[#d4edc9] p-10 font-sans flex items-center justify-center">
      <div className="w-full max-w-6xl">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-extrabold drop-shadow-lg bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-600" style={{ WebkitTextStroke: '1px white' }}>
            Admin Tools
          </h1>
          <p className="text-lg text-white/80 mt-2 font-medium">
            Manage your team and operations with powerful administrative controls.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <ModernCard
            title="Add/Manage Users"
            description="Onboard new employees or update team information to keep your roster accurate."
            icon={<UserPlus />}
            onClick={() => router.push('/add_user')} // 👈 ab ye kaam karega
            className="hover:shadow-green-500/50"
            iconClassName="bg-gradient-to-br from-green-500 to-sky-600"
            buttonText="Add Employee"
          />
          <ModernCard
            title="User Records"
            description="Browse employee profiles, certifications, and performance records in one place."
            icon={<Users />}
            onClick={() => router.push('/employee_record')}
            className="hover:shadow-green-500/50"
            iconClassName="bg-gradient-to-br from-green-500 to-indigo-600"
            buttonText="See Records"
          />
          <ModernCard
            title="Add Report Data"
            description="Create and generate detailed reports for various operational metrics and analysis."
            icon={<FilePlus />}
            onClick={() => router.push('/upload_data')}
            className="hover:shadow-green-500/50"
            iconClassName="bg-gradient-to-br from-green-500 to-teal-600"
            buttonText="Add Data"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminToolsScreen;
