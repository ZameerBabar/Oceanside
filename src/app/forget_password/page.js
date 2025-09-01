'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from '../firebaseConfig';
import Image from 'next/image';
import Link from 'next/link'; // ✅ Yeh line add ki gayi hai

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            // Firebase function to send a password reset email
            await sendPasswordResetEmail(auth, email);
            setMessage('A password reset link has been sent to your email. Please check your inbox.');
            setEmail(''); // Clear the email field after sending
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/invalid-email' || err.code === 'auth/user-not-found') {
                setError('The provided email is not registered with an account.');
            } else {
                setError('There was an error sending the password reset link. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

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

            {/* 🔸 Right Panel - Forgot Password Box */}
            <div
                className="w-1/2 h-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #34916aff, #40cc5cff)' }}
            >
                <div className="bg-white p-10 md:p-12 rounded-[2rem] shadow-xl border border-gray-200 w-full max-w-md">
                    <div className="flex justify-center mb-8">
                        <Image src="/logo.png" alt="Oceanside Logo" width={120} height={60} />
                    </div>

                    <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Forgot Your Password?</h2>
                    <p className="text-center text-gray-600 mb-6">Enter your email to receive a password reset link.</p>

                    <form onSubmit={handleResetPassword} className="space-y-6">
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

                        {message && <p className="text-green-500 text-sm mt-2 text-center">{message}</p>}
                        {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#49a078] text-white font-bold py-3 px-4 rounded-xl transition-transform duration-300 transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>

                    <div className="flex flex-col md:flex-row justify-center mt-6 text-sm text-center">
                        {/* ❌ Yeh code <Link> se replace kiya gaya hai */}
                        <Link href="/" className="text-gray-600 hover:underline">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}