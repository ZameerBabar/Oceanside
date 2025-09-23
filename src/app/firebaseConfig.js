import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getFunctions, httpsCallable } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

// ✅ All required Cloud Functions for your app
const createEmployeeFunction = httpsCallable(functions, 'createEmployee');
const activateEmployeeFunction = httpsCallable(functions, 'activateEmployee');
const deleteEmployeeFunction = httpsCallable(functions, 'deleteEmployee');
const resendInviteFunction = httpsCallable(functions, 'resendInvite');

// Additional functions (from your original code)
const deleteUserAndDataFunction = httpsCallable(functions, 'deleteUserAndData');
const updateUserStatusFunction = httpsCallable(functions, 'updateUserStatus');

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn("Offline persistence can only be enabled in one tab at a time.");
  } else if (err.code === 'unimplemented') {
    console.warn("The current browser does not support all of the features required to enable offline persistence.");
  }
});

export { 
  auth, 
  db, 
  functions,
  // Required functions for add_user/page.js
  createEmployeeFunction,
  activateEmployeeFunction,
  deleteEmployeeFunction,
  resendInviteFunction,
  // Additional functions
  deleteUserAndDataFunction, 
  updateUserStatusFunction,
  firebaseConfig 
};