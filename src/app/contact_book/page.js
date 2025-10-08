'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // <-- apni firebaseConfig file ka path sahi rakhna

// ==========================================================
// Main App Component
// ==========================================================
const App = () => {
  // Firestore se data store karne ke liye state
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Edit modal ke liye naye state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  // Form input states for editing
  const [editName, setEditName] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCategory, setEditCategory] = useState('');


  // Firestore se data fetch
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'contacts'));
        const contactList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setContacts(contactList);
      } catch (error) {
        console.error('Error fetching contacts: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  // Contacts ko search term aur category ke hisaab se filter karein
  const filteredContacts = useMemo(() => {
    let filtered = contacts;

    if (activeCategory !== 'All') {
      filtered = filtered.filter(contact => contact.category === activeCategory);
    }

    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(contact =>
        contact.name?.toLowerCase().includes(lowercasedTerm) ||
        contact.company?.toLowerCase().includes(lowercasedTerm)
      );
    }
    return filtered;
  }, [contacts, searchTerm, activeCategory]);

  const categories = ['All', 'Suppliers', 'Owners', 'Contractors', 'City/Regulatory'];

  // Edit modal kholne ka function
  const handleEditClick = (contact) => {
    setEditingContact(contact);
    setEditName(contact.name);
    setEditCompany(contact.company);
    setEditEmail(contact.email);
    setEditPhone(contact.phone);
    setEditCategory(contact.category);
    setEditModalOpen(true);
  };

  // Contact update karne ka function
  const handleUpdateContact = async () => {
    if (!editingContact) return;

    try {
      const contactRef = doc(db, 'contacts', editingContact.id);
      await updateDoc(contactRef, {
        name: editName,
        company: editCompany,
        email: editEmail,
        phone: editPhone,
        category: editCategory,
      });

      // State ko bhi update karein taake UI refresh ho
      setContacts(contacts.map(contact =>
        contact.id === editingContact.id ? { ...contact, name: editName, company: editCompany, email: editEmail, phone: editPhone, category: editCategory } : contact
      ));

      setEditModalOpen(false);
      setEditingContact(null);
    } catch (error) {
      console.error('Error updating contact: ', error);
    }
  };

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
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading contacts...</div>
          ) : (
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
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Edit</span>
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
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditClick(contact)}
                          className="text-green-600 hover:text-green-900 transition-colors"
                        >
                          ✏️
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                     No contacts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {/* Edit Contact Modal */}
      {editModalOpen && editingContact && (
        <div className="fixed inset-0 bg-gradient-to-br from-[#34916aff] to-[#d4edc9] bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-green-700">Update Contact</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateContact(); }}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-3 border rounded-xl"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Company</label>
                <input
                  type="text"
                  value={editCompany}
                  onChange={(e) => setEditCompany(e.target.value)}
                  className="w-full p-3 border rounded-xl"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full p-3 border rounded-xl"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Phone</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full p-3 border rounded-xl"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full p-3 border rounded-xl"
                >
                  {categories.slice(1).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-6 py-3 border rounded-xl text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;