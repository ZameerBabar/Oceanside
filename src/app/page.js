'use client'

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';

// Firestore services ko bhi import karein.
import { auth, db } from './firebaseConfig'; 
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from 'firebase/firestore';


export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // useEffect hook jo user ki authentication state ko monitor karega.
  // Ab yeh user role ke mutabiq sahi dashboard par redirect karega.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User signed in hai. Ab role ke hisab se redirect karein.
        if (user.email === 'manager@gmail.com') {
          // Agar manager hai, to admin dashboard par bhej dein.
          router.push('/admin-dashboard');
        } else {
          // Agar employee hai, to simple dashboard par bhej dein.
          // Note: Abhi hum sirf email check kar rahe hain, lekin
          // agar aapko future mein alag-alag employee roles ke liye
          // alag dashboard chahiye, to aap Firestore se user ka role
          // fetch kar sakte hain, jaise ke neeche comment mein bataya gaya hai.

          /*
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            const userRole = userData.role;
            if (userRole === 'Host') {
              router.push('/host-dashboard');
            } else if (userRole === 'Bartender') {
              router.push('/bartender-dashboard');
            }
          }
          */

          router.push('/dashboard');
        }
      } else {
        // Koi user signed in nahi hai, ab login form dikha sakte hain.
        setLoading(false);
      }
    });

    // Cleanup function: jab component unmount hoga to listener ko remove kar dega.
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Purana error saaf kar dein

      try {
      // Firebase ke function ka istemal karke login ki koshish karein.
      await signInWithEmailAndPassword(auth, email, password);
      // Agar login successful ho gaya, to useEffect hook ki wajah se role-based redirect ho jayega.
    } catch (err) {
      // Login mein error hone par yahan handle karein.
      // Error message ko user-friendly banayein.
      if (err.code === 'auth/invalid-email' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Ghalat email ya password. Dobara koshish karein.');
      } else {
        setError('Login karne mein koi masla hua. Dobara koshish karein.');
      }
      console.error(err);
    }
  };


  // Jab tak authentication state check ho rahi hai, loading screen dikhayen.
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center font-sans">
        <div className="text-xl font-bold text-gray-700">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen font-sans">
      {/* 🔹 Left Panel with Background Image */}
      <div 
        className="relative w-1/2 h-full flex flex-col items-center justify-center text-white text-center"
        style={{ 
          backgroundImage: `url('/bg.jpg')`, 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black opacity-60 z-0"></div>

        {/* Text Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-4">
          <Image src="/logo.png" alt="Oceanside Logo" width={150} height={75} className="mb-2" />
          <br />
          
          <h1 className="text-4xl md:text-5xl mb-4 leading-tight">
            Welcome to <br /> Oceanside <br /> Training Portal
          </h1>
          <br />
          <p className="text-lg mb-3">Empowering every shift with knowledge</p>
          <br />
          <br />
          <p className="text-sm">For FOH, BOH, and Management Staff</p>
        </div>
      </div>

      {/* 🔸 Right Panel - Login Box */}
      <div 
        className="w-1/2 h-full flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #34916aff, #40cc5cff)' }}
      >
        <div className="bg-white p-10 md:p-12 rounded-[2rem] shadow-xl border border-gray-200 w-full max-w-md">
          <div className="flex justify-center mb-8">
            <Image src="/logo.png" alt="Oceanside Logo" width={120} height={60} />
          </div>

          <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Sign in to your account</h2>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border-2 border-gray-300 rounded-xl p-3 pl-12 focus:outline-none focus:ring-2 focus:ring-[#7CC242] transition-colors duration-200"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  📧
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="***********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border-2 border-gray-300 rounded-xl p-3 pl-12 focus:outline-none focus:ring-2 focus:ring-[#7CC242] transition-colors duration-200"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  🔒
                </div>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}

            <button
              type="submit"
              className="w-full bg-[#49a078] text-white font-bold py-3 px-4 rounded-xl transition-transform duration-300 transform hover:scale-105 shadow-md"
            >
              Login
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
