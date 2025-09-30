'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { ChevronRight, Check, PlusCircle, Award, Star, Lock, Trophy, Zap } from 'lucide-react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebaseConfig';

const TOTAL_TRAINING_DAYS = 6;
const TOTAL_QUIZZES = 4;

export default function ServerTrainingPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // URL parameters se role aur manager status
    const [currentRole, setCurrentRole] = useState(null);
    const [isManagerView, setIsManagerView] = useState(false);
    
    // Manager ka data alag se store karne ke liye
    const [managerData, setManagerData] = useState(null);

    useEffect(() => {
        // URL parameters check karo
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const roleParam = urlParams.get('role');
            const isManager = urlParams.get('isManager') === 'true';
            
            setCurrentRole(roleParam);
            setIsManagerView(isManager);
        }
    }, []);

    const handleStartClick = () => {
        const urlParams = currentRole ? `?role=${currentRole}&isManager=${isManagerView}` : '';
        router.push(`/ful_server_training${urlParams}`);
    };

    const handleDayClick = (day) => {
        const urlParams = currentRole ? `?day=${day}&role=${currentRole}&isManager=${isManagerView}` : `?day=${day}`;
        router.push(`/server_training_day${urlParams}`);
    };

    const handleQuizClick = (quiz) => {
        // MANAGER VIEW: Manager ke document se quiz status check karo
        if (isManagerView && currentRole && managerData) {
            const prefix = currentRole.toLowerCase() + '_';
            const isPassed = managerData[`${prefix}quiz_${quiz}_passed`];
            const isApproved = managerData[`${prefix}approved_quiz_${quiz}`];
            const urlParams = currentRole ? `&role=${currentRole}&isManager=${isManagerView}` : '';

            if (isPassed && !isApproved && (quiz === 2 || quiz === 3 || quiz === 4)) {
                router.replace(`/practical_check?quiz=${quiz}${urlParams}`);
            } else {
                router.replace(`/quiz_screen?quiz=${quiz}${urlParams}`);
            }
        } else {
            // NORMAL EMPLOYEE: Employee ke document se quiz status check karo
            const isPassed = userData?.[`quiz_${quiz}_passed`];
            const isApproved = userData?.[`approved_quiz_${quiz}`];
            const urlParams = currentRole ? `&role=${currentRole}&isManager=${isManagerView}` : '';

            if (isPassed && !isApproved && (quiz === 2 || quiz === 3 || quiz === 4)) {
                router.replace(`/practical_check?quiz=${quiz}${urlParams}`);
            } else {
                router.replace(`/quiz_screen?quiz=${quiz}${urlParams}`);
            }
        }
    };

    const handleSeatingChartClick = () => {
        const urlParams = currentRole ? `?role=${currentRole}&isManager=${isManagerView}` : '';
        router.replace(`/menu-memory-game${urlParams}`);
    };

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                
                // CHANGE 1: Manager aur employee data dono fetch karo
                try {
                    // Pehle 'users' collection check karo (employees)
                    const userDocRef = doc(db, 'users', currentUser.uid);
                    const userDocSnap = await getDoc(userDocRef);
                    
                    if (userDocSnap.exists()) {
                        // Employee data mila
                        setUserData(userDocSnap.data());
                    } else {
                        // Agar users collection mein nahi mila, to managers collection check karo
                        const managerDocRef = doc(db, 'managers', currentUser.uid);
                        const managerDocSnap = await getDoc(managerDocRef);
                        
                        if (managerDocSnap.exists()) {
                            // Manager data mila
                            setManagerData(managerDocSnap.data());
                            setUserData({}); // Empty userData for manager
                        } else {
                            // Koi data nahi mila
                            setUserData({});
                        }
                    }
                } catch (error) {
                    console.error("Firestore se data fetch karne mein error:", error);
                    setUserData({});
                }
            } else {
                setUser(null);
                setUserData(null);
                setManagerData(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const getCompletedDays = () => {
        // MANAGER VIEW: Manager ke document se progress fetch karo
        if (isManagerView && currentRole && managerData) {
            const prefix = currentRole.toLowerCase() + '_';
            let completed = 0;
            for (let i = 1; i <= TOTAL_TRAINING_DAYS; i++) {
                const fieldName = `${prefix}training_day_${i}`;
                if (managerData[fieldName]) {
                    completed++;
                }
            }
            return completed;
        }
        
        // NORMAL EMPLOYEE: Employee ke document se progress fetch karo
        if (!userData) return 0;
        let completed = 0;
        for (let i = 1; i <= TOTAL_TRAINING_DAYS; i++) {
            if (userData[`training_day_${i}`]) {
                completed++;
            }
        }
        return completed;
    };

    // CHANGE 2: Display name logic update - manager ka actual name show karo
    const getDisplayName = () => {
        if (isManagerView && currentRole) {
            // Agar manager view hai to manager ka name show karo
            return managerData?.name || 'Manager';
        }
        // Normal employee ka name show karo
        return userData?.name || 'Guest';
    };

    const completedDays = getCompletedDays();
    const readyForDay = completedDays + 1;
    
    const isDayClickable = (day) => {
        // MANAGER VIEW: Manager ke document se check karo
        if (isManagerView && currentRole && managerData) {
            if (day === 1) return true;
            const prefix = currentRole.toLowerCase() + '_';
            const prevDayField = `${prefix}training_day_${day - 1}`;
            return managerData[prevDayField] !== undefined;
        }
        
        // NORMAL EMPLOYEE: Employee ke document se check karo
        if (day === 1) return true;
        return userData?.[`training_day_${day - 1}`] !== undefined;
    };
    
    const getCompletedQuizCount = () => {
        // MANAGER VIEW: Manager ke document se quiz count fetch karo
        if (isManagerView && currentRole && managerData) {
            const prefix = currentRole.toLowerCase() + '_';
            return Object.keys(managerData).filter(key => 
                key.startsWith(`${prefix}quiz_`) && key.endsWith('_passed') && managerData[key]
            ).length;
        }
        
        // NORMAL EMPLOYEE: Employee ke document se quiz count fetch karo
        return Object.keys(userData || {}).filter(key => key.startsWith('quiz_') && userData[key]).length;
    };
    
    const completedQuizCount = getCompletedQuizCount();

    const isQuizClickable = (quiz) => {
        // MANAGER VIEW: Manager ke document se quiz eligibility check karo
        if (isManagerView && currentRole && managerData) {
            const prefix = currentRole.toLowerCase() + '_';
            if (quiz === 1) {
                return true;
            }
            if (quiz === 2) {
                return managerData[`${prefix}quiz_1_passed`];
            }
            if (quiz === 3) {
                return managerData[`${prefix}approved_quiz_2`];
            }
            if (quiz === 4) {
                return managerData[`${prefix}approved_quiz_3`];
            }
            return false;
        }
        
        // NORMAL EMPLOYEE: Employee ke document se quiz eligibility check karo
        if (quiz === 1) {
            return true;
        }
        if (quiz === 2) {
            return userData?.quiz_1_passed;
        }
        if (quiz === 3) {
            return userData?.approved_quiz_2;
        }
        if (quiz === 4) {
            return userData?.approved_quiz_3;
        }
        return false;
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
                style={{ backgroundImage: 'url(https://firebasestorage.googleapis.com/v0/b/oceanside-2e497.firebasestorage.app/o/Team%20and%20Restaurant%20Photos%2FServers.JPG?alt=media&token=cc9f0d9a-dab4-42c0-8d80-8f6c95348820)', backgroundPosition: 'center'  }}
            >
                {/* Dark Overlay for better text readability */}
                <div className="absolute inset-0 h-[500px] bg-black opacity-60" />
            </div>

            {/* Main Content Container */}
            <div className="w-full max-w-6xl z-10 p-4 md:p-8 -mt-64 relative">

                {/* Header Section */}
                <div className="text-white text-left mb-6 drop-shadow-lg">
                    <h1 className="text-4xl md:text-5xl font-bold mb-2">Welcome back, {getDisplayName()}!</h1>
                    <h2 className="text-3xl md:text-4xl font-bold mb-2">Ready for Day {readyForDay}?</h2>
                    <p className="text-lg md:text-xl font-light">
                        Master all aspects of serving—with comprehensive lessons and progress quizzes.
                    </p>
                </div>

                {/* Main Cards Section */}
                <div className="w-full space-y-6">
                    {/* Full Server Training Card */}
                    <div className="p-6 md:p-8 rounded-3xl shadow-xl text-white flex flex-col md:flex-row items-center justify-between" style={{ background: 'linear-gradient(135deg, #49a078, #a2cc8e)' }}>
                        <div className="text-left flex-grow mb-4 md:mb-0">
                            <h2 className="text-xl md:text-2xl font-semibold">Full Server Training</h2>
                            <p className="text-gray-100 mt-1">The complete guide covering every step of Oceanside service process.</p>

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
                                        
                                        // MANAGER VIEW: Manager ke document se completion check karo
                                        let isCompleted, clickable;
                                        if (isManagerView && currentRole && managerData) {
                                            const prefix = currentRole.toLowerCase() + '_';
                                            const dayField = `${prefix}training_day_${day}`;
                                            isCompleted = managerData[dayField] !== undefined;
                                        } else {
                                            // EMPLOYEE VIEW: Employee ke document se completion check karo
                                            isCompleted = userData?.[`training_day_${day}`] !== undefined;
                                        }
                                        
                                        clickable = isDayClickable(day);

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
                                        
                                        // MANAGER VIEW: Manager ke document se quiz completion check karo
                                        let isCompleted, clickable;
                                        if (isManagerView && currentRole && managerData) {
                                            const prefix = currentRole.toLowerCase() + '_';
                                            const quizField = `${prefix}quiz_${quiz}_passed`;
                                            isCompleted = managerData[quizField] !== undefined;
                                        } else {
                                            // EMPLOYEE VIEW: Employee ke document se quiz completion check karo
                                            isCompleted = userData?.[`quiz_${quiz}_passed`] !== undefined;
                                        }
                                        
                                        clickable = isQuizClickable(quiz);

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

                        {/* Right Column - Gold Medal and Games & Challenges */}
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

                            {/* Games & Challenges Card moved below Gold Medal */}
                            <div className="bg-white p-6 rounded-3xl shadow-xl">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Challenges</h2>
                                <div className="space-y-3">
                                    <button
                                        onClick={handleSeatingChartClick}
                                        className="w-full flex items-center justify-between bg-blue-100 text-blue-800 font-medium py-3 px-4 rounded-lg hover:bg-blue-200">
                                        <div className="flex items-center gap-2">
                                            <Trophy size={18} />
                                            Memory
                                        </div>
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}