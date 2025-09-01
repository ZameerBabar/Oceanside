'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { ChevronRight, Check, PlusCircle, Award, Star, Lock, Trophy, Zap } from 'lucide-react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { db } from '@/app/firebaseConfig';

const TOTAL_TRAINING_DAYS = 4;
const TOTAL_QUIZZES = 4;

export default function BartenderTrainingPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleStartClick = () => {
        router.push('/ful_server_training');
    };

    const handleDayClick = (day) => {
        router.push(`/server_training_day?day=${day}`);
    };

    const handleQuizClick = (quiz) => {
        router.replace(`/quiz_screen?quiz=${quiz}`);
    };

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const data = userDocSnap.data();
                    setUserData(data);
                    setUserRole(data.role || 'Server'); // Default to Server if no role
                } else {
                    setUserData({});
                    setUserRole('Server');
                }
            } else {
                setUser(null);
                setUserData(null);
                setUserRole(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const getCompletedDays = () => {
        if (!userData || !userRole) return 0;
        let completed = 0;
        for (let i = 1; i <= TOTAL_TRAINING_DAYS; i++) {
            const fieldName = userRole === 'Bartender' ? `bartender_training_day_${i}` : `training_day_${i}`;
            if (userData[fieldName]) {
                completed++;
            }
        }
        return completed;
    };

    const completedDays = getCompletedDays();
    const readyForDay = completedDays + 1;
    
    const isDayClickable = (day) => {
        if (day === 1) return true;
        const prevDayField = userRole === 'Bartender' ? `bartender_training_day_${day - 1}` : `training_day_${day - 1}`;
        return userData?.[prevDayField] !== undefined;
    };

    const getCompletedQuizCount = () => {
        if (!userData || !userRole) return 0;
        const prefix = userRole === 'Bartender' ? 'bartender_quiz_' : 'quiz_';
        return Object.keys(userData).filter(key => 
            key.startsWith(prefix) && key.endsWith('_passed') && userData[key]
        ).length;
    };

    const completedQuizCount = getCompletedQuizCount();

    const isQuizClickable = (quiz) => {
        if (!userRole) return false;
        
        if (quiz === 1) {
            return true;
        }
        if (quiz === 2) {
            const quiz1Field = userRole === 'Bartender' ? 'bartender_quiz_1_passed' : 'quiz_1_passed';
            return userData?.[quiz1Field];
        }
        if (quiz === 3) {
            const quiz2Field = userRole === 'Bartender' ? 'bartender_quiz_2_passed' : 'quiz_2_passed';
            return userData?.[quiz2Field];
        }
        if (quiz === 4) {
            const quiz3Field = userRole === 'Bartender' ? 'bartender_quiz_3_passed' : 'quiz_3_passed';
            return userData?.[quiz3Field];
        }
        return false;
    };

    const isQuizCompleted = (quiz) => {
        if (!userRole) return false;
        const passedField = userRole === 'Bartender' ? `bartender_quiz_${quiz}_passed` : `quiz_${quiz}_passed`;
        return userData?.[passedField] !== undefined;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center font-sans bg-white relative">
            {/* Top Section with Background Image */}
            <div
                className="w-full h-[500px] bg-cover bg-top"
                style={{ backgroundImage: 'url(https://img.freepik.com/premium-photo/portrait-two-beautiful-female-waitress-smiling-camera_8595-17930.jpg)' }}
            >
                {/* Dark Overlay for better text readability */}
                <div className="absolute inset-0 h-[500px] bg-black opacity-40" />
            </div>

            {/* Main Content Container */}
            <div className="w-full max-w-6xl z-10 p-4 md:p-8 -mt-64 relative">

                {/* Header Section */}
                <div className="text-white text-left mb-6 drop-shadow-lg">
                    <h1 className="text-4xl md:text-5xl font-bold mb-2">Welcome back, {userData?.name || 'Guest'}!</h1>
                    <h2 className="text-3xl md:text-4xl font-bold mb-2">Ready for Day {readyForDay}?</h2>
                    <p className="text-lg md:text-xl font-light">
                        Master all aspects of {userRole === 'Bartender' ? 'bartending' : 'serving'}—with comprehensive lessons and progress quizzes.
                    </p>
                </div>

                {/* Main Cards Section */}
                <div className="w-full space-y-6">
                    {/* Full Training Card */}
                    <div className="p-6 md:p-8 rounded-3xl shadow-xl text-white flex flex-col md:flex-row items-center justify-between" style={{ background: 'linear-gradient(135deg, #49a078, #a2cc8e)' }}>
                        <div className="text-left flex-grow mb-4 md:mb-0">
                            <h2 className="text-xl md:text-2xl font-semibold">
                                Full {userRole} Training
                            </h2>
                            <p className="text-gray-100 mt-1">
                               The complete guide covering every step of Oceanside&apos;s {userRole === 'Bartender' ? 'bartending' : 'service'} process.
                            </p>

                            {/* Progress Bar */}
                            <div className="mt-4 w-full max-w-md bg-white bg-opacity-30 rounded-full h-2.5">
                                <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${(completedDays / TOTAL_TRAINING_DAYS) * 100}%` }}></div>
                            </div>
                            <p className="text-sm mt-1 text-gray-100">{completedDays} of {TOTAL_TRAINING_DAYS} days completed</p>
                        </div>
                        <button
                            onClick={handleStartClick}
                            className="w-full md:w-auto bg-white text-[#49a078] font-bold py-3 px-8 rounded-xl transition-transform duration-300 transform hover:scale-105 shadow-md"
                        >
                            Start
                        </button>
                    </div>

                    {/* Smaller Cards Section */}
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Left Column - Training Schedule and Quizzes */}
                        <div className="flex-1 space-y-6">
                            {/* Training Schedule Card */}
                            <div className="bg-white p-6 rounded-3xl shadow-xl">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Training Schedule</h2>
                                <div className="flex flex-wrap gap-2">
                                    {[...Array(TOTAL_TRAINING_DAYS)].map((_, index) => {
                                        const day = index + 1;
                                        const dayField = userRole === 'Bartender' ? `bartender_training_day_${day}` : `training_day_${day}`;
                                        const isCompleted = userData?.[dayField] !== undefined;
                                        const clickable = isDayClickable(day);

                                        return (
                                            <button
                                                key={day}
                                                onClick={() => handleDayClick(day)}
                                                disabled={!clickable}
                                                className={`flex items-center justify-center font-medium py-3 px-6 rounded-xl gap-2 transition-colors duration-200 ${
                                                    isCompleted
                                                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                        : clickable
                                                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                                            : 'bg-gray-200 text-gray-800 opacity-50 cursor-not-allowed'
                                                }`}
                                            >
                                                {isCompleted ? <Check size={18} /> : <Lock size={18} />}
                                                Day {day}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Quizzes Card */}
                            <div className="bg-white p-6 rounded-3xl shadow-xl">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Quizzes</h2>
                                <div className="flex flex-wrap gap-2">
                                    {[...Array(TOTAL_QUIZZES)].map((_, index) => {
                                        const quiz = index + 1;
                                        const isCompleted = isQuizCompleted(quiz);
                                        const clickable = isQuizClickable(quiz);

                                        return (
                                            <button
                                                key={quiz}
                                                onClick={() => handleQuizClick(quiz)}
                                                disabled={!clickable}
                                                className={`flex items-center justify-center font-medium py-3 px-6 rounded-xl gap-2 transition-colors duration-200 ${
                                                    isCompleted
                                                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                                        : clickable
                                                            ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500'
                                                            : 'bg-gray-200 text-gray-800 opacity-50 cursor-not-allowed'
                                                }`}
                                            >
                                                {isCompleted ? <Award size={18} /> : clickable ? <PlusCircle size={18} /> : <Lock size={18} />}
                                                Quiz {quiz}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Gold Medal */}
                        <div className="flex-none w-full md:w-[250px] space-y-6">
                            {/* Gold Medal Card with reduced height */}
                            <div className="bg-white p-6 rounded-3xl shadow-xl h-[135px] flex items-center">
                                <div className="flex items-center space-x-4">
                                    <Trophy className="text-yellow-500" size={48} />
                                    <div>
                                        <h3 className="text-sm font-bold text-yellow-500">QUIZZES PASSED</h3>
                                        <p className="text-lg font-bold text-gray-800">{completedQuizCount} QUIZZES PASSED</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}