'use client';
import React, { useState, useMemo } from 'react';

// ==========================================================
// Main App Component
// ==========================================================
const App = () => {
  // Mock data for contacts
  const [contacts] = useState([
    { id: 1, name: 'Farhan Ali', company: 'Oceanside Ownership', email: 'farhan.ali@oceanside.com', phone: '(555) 123-4567', category: 'Owners' },
    { id: 2, name: 'Ayesha Khan', company: 'Fresh Foods Inc.', email: 'a.khan@freshfoods.com', phone: '(555) 567-8901', category: 'Suppliers' },
    { id: 3, name: 'Zainab Ahmed', company: 'PlumbRite Solutions', email: 'zainab.a@plumbrite.com', phone: '(555) 876-5432', category: 'Contractors' },
    { id: 4, name: 'Hassan Siddiqui', company: 'City Health Dept.', email: 'h.siddiqui@city.gov', phone: '(555) 432-1098', category: 'City/Regulatory' },
    { id: 5, name: 'Ibrahim Malik', company: 'TechFix Systems', email: 'ibrahim.m@techfix.com', phone: '(555) 987-6543', category: 'Contractors' },
    { id: 6, name: 'Sana Javed', company: 'Green Harvest Co.', email: 'sana.j@greenharvest.com', phone: '(555) 112-2334', category: 'Suppliers' },
    { id: 7, name: 'Usman Chaudhry', company: 'Oceanside Ownership', email: 'u.chaudhry@oceanside.com', phone: '(555) 334-4556', category: 'Owners' },
    { id: 8, name: 'Saima Bano', company: 'City Fire Department', email: 'saima.bano@city.gov', phone: '(555) 556-6778', category: 'City/Regulatory' },
    { id: 9, name: 'Ali Raza', company: 'Electra Electricians', email: 'ali.r@electra.com', phone: '(555) 778-8990', category: 'Contractors' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Contacts ko search term aur category ke hisaab se filter karein
  const filteredContacts = useMemo(() => {
    let filtered = contacts;

    if (activeCategory !== 'All') {
      filtered = filtered.filter(contact => contact.category === activeCategory);
    }

    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(contact =>
        contact.name.toLowerCase().includes(lowercasedTerm) ||
        contact.company.toLowerCase().includes(lowercasedTerm)
      );
    }
    return filtered;
  }, [contacts, searchTerm, activeCategory]);

  const categories = ['All', 'Suppliers', 'Owners', 'Contractors', 'City/Regulatory'];

  return (
    <div className="flex flex-col min-h-screen font-sans bg-gradient-to-br from-[#34916aff] to-[#d4edc9] items-center p-10">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-screen-xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
          <h1 className="text-4xl font-bold text-green-800">Contact Book</h1>
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/2 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-colors ${activeCategory === category ? 'bg-green-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Contact Table */}
        <div className="bg-gray-50 rounded-xl shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Phone
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContacts.length > 0 ? (
                filteredContacts.map(contact => (
                  <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{contact.company}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                      <a href={`mailto:${contact.email}`} className="text-green-600 hover:text-green-800">{contact.email}</a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                      <a href={`tel:${contact.phone}`} className="text-green-600 hover:text-green-800">{contact.phone}</a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                    Koi contact nahi mila.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default App;
