'use client'

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';

// Firebase
import { auth, db } from './firebaseConfig'; 
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from 'firebase/firestore';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // ✅ Auth state check (No change needed here)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // 🔹 Step 1: Managers collection check
          const managerRef = doc(db, 'managers', user.uid);
          const managerSnap = await getDoc(managerRef);

          if (managerSnap.exists()) {
            router.push('/admin-dashboard');
            return;
          }

          // 🔹 Step 2: Users collection check
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            router.push('/dashboard');
            return;
          }

          // ❌ Not found
          setError('User role not found. Please contact admin.');
        } catch (err) {
          console.error("Role check error:", err);
          setError("Something went wrong. Please try again.");
        }
      }
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [router]);

  // ✅ Login Handler (No change needed here)
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // ✅ Redirect handled in useEffect
    } catch (err) {
      console.error(err);
      if (
        err.code === 'auth/invalid-email' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/invalid-credential'
      ) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex h-screen w-screen items-center justify-center font-sans">
        <div className="text-xl font-bold text-gray-700">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen font-sans">
      
      {/* 🔹 Left Panel (Mobile: Hidden / Desktop: 50% width) */}
      <div 
        // Mobile par: hidden. Desktop/Tablet par (md:): w-1/2, h-full, flex show.
        className="hidden md:flex md:w-1/2 md:h-screen relative flex-col items-center justify-center text-white text-center"
        style={{ 
          backgroundImage: `url('/bground.jpg')`, 
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black opacity-60 z-0"></div>
        <div className="relative z-10 flex flex-col items-center text-center px-4">
          <Image src="/wlogo.png" alt="Oceanside Logo" width={150} height={75} className="mb-2" />
          <h1 className="text-4xl md:text-5xl mb-4 leading-tight">
            Welcome to <br /> Oceanside <br /> Training Portal
          </h1>
          <p className="text-lg mb-3">Empowering every shift with knowledge</p>
          <p className="text-sm">For FOH, BOH, and Management Staff</p>
        </div>
      </div>

      {/* 🔸 Right Panel - Login Box (Mobile: Full screen / Desktop: 50% width) */}
      <div 
        // Mobile par: w-full, flex-grow. Desktop/Tablet par (md:): w-1/2, h-screen
        className="w-full md:w-1/2 md:h-screen flex items-center justify-center p-4 sm:p-8"
        style={{ background: 'linear-gradient(135deg, #34916aff, #40cc5cff)' }}
      >
        <div className="bg-white p-8 sm:p-10 md:p-12 rounded-[2rem] shadow-xl border border-gray-200 w-full max-w-md">
          
          {/* Mobile Logo (Show Logo clearly on mobile when image panel is hidden) */}
          <div className="flex justify-center mb-8 md:hidden">
            <Image src="/logo.png" alt="Oceanside Logo" width={120} height={60} />
          </div>

          <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
            Sign in to your account
          </h2>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border-2 border-gray-300 rounded-xl p-3 pl-12 focus:outline-none focus:ring-2 focus:ring-[#7CC242] transition-colors duration-200"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">📧</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="***********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border-2 border-gray-300 rounded-xl p-3 pl-12 focus:outline-none focus:ring-2 focus:ring-[#7CC242] transition-colors duration-200"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">🔒</div>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className={`w-full font-bold py-3 px-4 rounded-xl transition-transform duration-300 transform hover:scale-105 shadow-md ${
                loading
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-[#49a078] text-white'
              }`}
            >
              {loading ? 'Loading...' : 'Login'}
            </button>
          </form>

          <div className="flex flex-col md:flex-row justify-between mt-6 text-sm text-center">
            <a href="/forget_password" className="text-gray-600 hover:underline">Forgot password?</a>
            <a href="#" className="text-gray-600 hover:underline mt-2 md:mt-0">Need help? Contact your manager</a>
          </div>
        </div>
      </div>
    </div>
  );
}