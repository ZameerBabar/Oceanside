// src/app/api/chat/firebase-utils.js

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

// 🔥 CRITICAL FIX: privateKey ko is format mein theek karna zaroori hai.
const FIREBASE_ADMIN_CREDENTIALS = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // Agar key double quotes ("") mein hai aur single line mein hai (jaisa humne fix kiya)
    // to .replace() aur .trim() dono ka hona zaroori hai.
    privateKey: process.env.FIREBASE_PRIVATE_KEY
        .replace(/\\n/g, '\n') 
        .trim() 
};

// Initialization status ko globally track karte hain
global.firebaseAdminError = false;

if (!getApps().length) {
    try {
        initializeApp({
            credential: cert(FIREBASE_ADMIN_CREDENTIALS),
            storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
        });
        console.log("Firebase Admin SDK successfully initialized.");
    } catch (e) {
        console.error("Firebase initialization failed:", e.message);
        global.firebaseAdminError = true;
    }
}

// Initialization ke baad hi storage bucket ko access karen
const bucket = !global.firebaseAdminError ? getStorage().bucket() : null;

export async function getSignedMediaURL(fileName, userId) {
    // Agar initialization fail ho gaya tha, to null return karo.
    if (global.firebaseAdminError || !bucket) {
        return null;
    }
    
    // Media file ko access karne ke liye signed URL generate karna
    const file = bucket.file(fileName);
    const [url] = await file.getSignedUrl({
        action: 'read',
        // Expires in 1 hour (3600 * 1000 ms)
        expires: Date.now() + 3600 * 1000, 
    });
    return url;
}