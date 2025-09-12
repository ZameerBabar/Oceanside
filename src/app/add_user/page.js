'use client';

import React, { useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db, firebaseConfig } from '../firebaseConfig'; // ✅ import firebaseConfig too

// Theme Colors
const themeColors = {
  darkGreen: '#34916aff',
  lightGreen: '#d4edc9',
  cardBackground: '#ffffff',
  textDark: '#1a1a1a',
  textLight: '#6b7280',
};

// ✅ Secondary Firebase App for user creation
const secondaryApp = initializeApp(firebaseConfig, 'Secondary');
const secondaryAuth = getAuth(secondaryApp);

const AddUserForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Manager',
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  // Roles dropdown
  const roles = ['Manager', 'Host', 'Server', 'Bartender', 'Cook'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const copyToClipboard = () => {
    const credentials = `Email: ${formData.email}\nPassword: ${formData.password}`;
    navigator.clipboard.writeText(credentials);
    alert('Credentials copied to clipboard!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match.');
      setMessageType('error');
      return;
    }
    if (Object.values(formData).some((value) => value === '')) {
      setMessage('Please fill in all the fields.');
      setMessageType('error');
      return;
    }

    setMessage('Creating user...');
    setMessageType('info');

    try {
      // ✅ Use secondary auth so primary admin stays logged in
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // Immediately sign out secondaryAuth so it doesn’t affect session
      await signOut(secondaryAuth);

      // Common user data
      const userData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        createdAt: new Date(),
      };

      // Step 2: Save user data
      if (formData.role === 'Manager') {
        const managerRef = doc(db, 'managers', user.uid);
        await setDoc(managerRef, userData);
      } else {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, userData);
      }

      setMessage('User has been created successfully!');
      setMessageType('success');
      setShowPopup(true);
    } catch (error) {
      console.error('Error creating user and storing data:', error);
      let errorMessage = 'Something went wrong while creating the user. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak (minimum 6 characters).';
      }
      setMessage(errorMessage);
      setMessageType('error');
    }
  };

  // ✅ Reset form fields when popup closes
  const handleClosePopup = () => {
    setShowPopup(false);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'Manager',
    });
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4 sm:p-8"
      style={{
        background: `linear-gradient(135deg, ${themeColors.lightGreen}, ${themeColors.darkGreen})`,
      }}
    >
      <div
        className="w-full max-w-lg p-6 sm:p-8 bg-white rounded-3xl shadow-lg border"
        style={{ borderColor: themeColors.lightGreen }}
      >
        <h2
          className="text-3xl font-bold text-center mb-6"
          style={{ color: themeColors.darkGreen }}
        >
          Add New Employee
        </h2>

        {message && (
          <div
            className={`p-4 mb-4 rounded-xl text-white font-semibold transition-all duration-300 ${
              messageType === 'success'
                ? 'bg-green-500'
                : messageType === 'error'
                ? 'bg-red-500'
                : 'bg-gray-500'
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-3 border"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-3 border"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-3 border"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-3 border"
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-3 border"
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white"
              style={{
                backgroundColor: themeColors.darkGreen,
                transition: 'background-color 0.2s',
              }}
            >
              Add User
            </button>
          </div>
        </form>
      </div>

      {/* ✅ Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-gradient-to-br from-[#34916aff] to-[#d4edc9] bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-96 text-center">
            <h3 className="text-lg font-bold mb-4 text-green-600">User Created Successfully</h3>
            <p className="mb-2">
              <strong>Email:</strong> {formData.email}
            </p>
            <p className="mb-4">
              <strong>Password:</strong> {formData.password}
            </p>
            <button
              onClick={copyToClipboard}
              className="w-full mb-3 py-2 px-4 bg-green-600 text-white rounded-xl"
            >
              Copy Credentials
            </button>
            <button
              onClick={handleClosePopup}
              className="w-full py-2 px-4 bg-green-400 text-white rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const App = () => {
  return <AddUserForm />;
};

export default App;
