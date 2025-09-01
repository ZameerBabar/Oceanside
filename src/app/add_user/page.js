'use client';

import React, { useState } from 'react';
// Firebase ke zaroori functions ko import karen
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

// Sahi file path ka istemal karen: 'src/app/add_user/page.js' se 'src/firebaseConfig.js' tak
import { auth, db } from '../firebaseConfig';

// Theme Colors
const themeColors = {
  darkGreen: '#34916aff',
  lightGreen: '#d4edc9',
  cardBackground: '#ffffff',
  textDark: '#1a1a1a',
  textLight: '#6b7280',
};

const AddUserForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    role: 'Host',
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  // Array of roles for the dropdown menu
  const roles = ['Host', 'Server', 'Busser', 'Bartender', 'Dishwasher', 'Cook'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match.');
      setMessageType('error');
      return;
    }
    if (Object.values(formData).some(value => value === '')) {
      setMessage('Please fill in all the fields.');
      setMessageType('error');
      return;
    }
    setMessage('User create ho raha hai...');
    setMessageType('info');

    try {
      // ----------------------------------------------
      // Step 1: Firebase Authentication (Create User)
      // `auth` object ko import karke seedhe istemal kar rahe hain
      // ----------------------------------------------
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // ----------------------------------------------
      // Step 2: Store User Data in Firestore
      // `db` object ko bhi import karke seedhe istemal kar rahe hain
      // ----------------------------------------------
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        name: formData.name,
        email: formData.email,
        age: parseInt(formData.age, 10),
        role: formData.role,
        createdAt: new Date(),
      });

      setMessage('User kamyabi se ban gaya hai aur aap dashboard pe redirect ho rahe hain!');
      setMessageType('success');
      
      // Redirect karne ke liye 3 second ka intezaar
      // Asal application mein, aap router ka istemal karenge (maslan, react-router-dom)
      setTimeout(() => {
        window.location.href = '/admin-dashboard';
      }, 3000);

    } catch (error) {
      console.error("Error creating user and storing data:", error);
      let errorMessage = "User banate waqt koi galti hui. Kripya dobara koshish karein.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Yeh email pehle se hi istemal mein hai.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email address theek nahi hai.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password bohot kamzor hai (minimum 6 characters).';
      }
      setMessage(errorMessage);
      setMessageType('error');
    }
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
        <h2 className="text-3xl font-bold text-center mb-6" style={{ color: themeColors.darkGreen }}>
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
          <div className="flex gap-4">
            <div className="w-1/3">
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-3 border"
              />
            </div>
            <div className="w-2/3">
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
    </div>
  );
};

const App = () => {
  return <AddUserForm />;
};

export default App;
