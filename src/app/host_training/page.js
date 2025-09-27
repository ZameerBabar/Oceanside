'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { ChevronRight, Check, PlusCircle, Award, Star, Lock, Trophy, Zap } from 'lucide-react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebaseConfig';

const TOTAL_TRAINING_DAYS = 6;
const TOTAL_QUIZZES = 6;

export default function HostTrainingPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    // CHANGE 1: URL parameters aur manager data ke liye state variables add karo
    const [currentRole, setCurrentRole] = useState(null);
    const [isManagerView, setIsManagerView] = useState(false);
    const [managerData, setManagerData] = useState(null);

    // CHANGE 2: URL parameters check karne ke liye useEffect add karo
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const roleParam = urlParams.get('role');
            const isManager = urlParams.get('isManager') === 'true';
            
            setCurrentRole(roleParam);
            setIsManagerView(isManager);
        }
    }, []);

    // CHANGE 3: Navigation functions mein URL parameters pass karo
    const handleStartClick = () => {
        const urlParams = currentRole ? `?role=${currentRole}&isManager=${isManagerView}` : '';
        router.push(`/ful_server_training${urlParams}`);
    };

    const handleDayClick = (day) => {
        const urlParams = currentRole ? `?day=${day}&role=${currentRole}&isManager=${isManagerView}` : `?day=${day}`;
        router.push(`/server_training_day${urlParams}`);
    };

    const handleQuizClick = (quiz) => {
        const urlParams = currentRole ? `&role=${currentRole}&isManager=${isManagerView}` : '';
        router.replace(`/quiz_screen?quiz=${quiz}${urlParams}`);
    };

    const handleSeatingChartClick = () => {
        const urlParams = currentRole ? `?role=${currentRole}&isManager=${isManagerView}` : '';
        router.replace(`/seating_chat_server${urlParams}`);
    };

    // CHANGE 4: Data fetching logic update karo - dono collections check karo
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                
                try {
                    // Pehle 'users' collection check karo (employees)
                    const userDocRef = doc(db, 'users', currentUser.uid);
                    const userDocSnap = await getDoc(userDocRef);
                    
                    if (userDocSnap.exists()) {
                        // Employee data mila
                        const data = userDocSnap.data();
                        setUserData(data);
                        setUserRole(data.role || 'Host');
                    } else {
                        // Agar users collection mein nahi mila, to managers collection check karo
                        const managerDocRef = doc(db, 'managers', currentUser.uid);
                        const managerDocSnap = await getDoc(managerDocRef);
                        
                        if (managerDocSnap.exists()) {
                            // Manager data mila
                            setManagerData(managerDocSnap.data());
                            setUserData({}); // Empty userData for manager
                            setUserRole('Host'); // Current viewing role
                        } else {
                            // Koi data nahi mila
                            setUserData({});
                            setUserRole('Host');
                        }
                    }
                } catch (error) {
                    console.error("Firestore se data fetch karne mein error:", error);
                    setUserData({});
                    setUserRole('Host');
                }
            } else {
                setUser(null);
                setUserData(null);
                setUserRole(null);
                setManagerData(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // CHANGE 5: Display name function add karo
    const getDisplayName = () => {
        if (isManagerView && currentRole) {
            // Agar manager view hai to manager ka name show karo
            return managerData?.name || 'Manager';
        }
        // Normal employee ka name show karo
        return userData?.name || 'Guest';
    };

    const getRolePrefix = () => {
        if (userRole === 'Bartender') {
            return 'bartender_';
        }
        if (userRole === 'Host') {
            return 'host_';
        }
        return '';
    };

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
        if (!userData || !userRole) return 0;
        const prefix = getRolePrefix();
        let completed = 0;
        for (let i = 1; i <= TOTAL_TRAINING_DAYS; i++) {
            const fieldName = `${prefix}training_day_${i}`;
            if (userData[fieldName]) {
                completed++;
            }
        }
        return completed;
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
        if (!userData || !userRole) return false;
        if (day === 1) return true;
        const prefix = getRolePrefix();
        const prevDayField = `${prefix}training_day_${day - 1}`;
        return userData[prevDayField] !== undefined;
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
        if (!userData || !userRole) return 0;
        const prefix = getRolePrefix();
        return Object.keys(userData).filter(key => 
            key.startsWith(`${prefix}quiz_`) && key.endsWith('_passed') && userData[key]
        ).length;
    };

    const completedQuizCount = getCompletedQuizCount();

    const isQuizClickable = (quiz) => {
        // MANAGER VIEW: Manager ke document se quiz eligibility check karo
        if (isManagerView && currentRole && managerData) {
            const prefix = currentRole.toLowerCase() + '_';
            if (quiz === 1) return true;
            const prevQuizField = `${prefix}quiz_${quiz - 1}_passed`;
            return managerData[prevQuizField];
        }
        
        // NORMAL EMPLOYEE: Employee ke document se quiz eligibility check karo
        if (!userData || !userRole) return false;
        const prefix = getRolePrefix();
        if (quiz === 1) return true;
        const prevQuizField = `${prefix}quiz_${quiz - 1}_passed`;
        return userData[prevQuizField];
    };

    const isQuizCompleted = (quiz) => {
        // MANAGER VIEW: Manager ke document se quiz completion check karo
        if (isManagerView && currentRole && managerData) {
            const prefix = currentRole.toLowerCase() + '_';
            const passedField = `${prefix}quiz_${quiz}_passed`;
            return managerData[passedField] !== undefined;
        }
        
        // NORMAL EMPLOYEE: Employee ke document se quiz completion check karo
        if (!userData || !userRole) return false;
        const prefix = getRolePrefix();
        const passedField = `${prefix}quiz_${quiz}_passed`;
        return userData[passedField] !== undefined;
    };
    
    const getRoleTrainingName = () => {
        if (userRole === 'Bartender') {
            return 'bartending';
        }
        if (userRole === 'Host') {
            return 'hosting';
        }
        return 'serving';
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
            {/* CHANGE 6: Manager View Banner add karo */}
            {isManagerView && currentRole && (
                <div className="w-full bg-blue-600 text-white p-3 text-center z-20 relative">
                    <span className="font-semibold">Manager View: Currently viewing Host Training</span>
                    <button
                        onClick={() => router.push('/hub?role=' + currentRole + '&isManager=true')}
                        className="ml-4 bg-white text-blue-600 px-3 py-1 rounded text-sm font-semibold hover:bg-gray-100"
                    >
                        Back to Hub
                    </button>
                </div>
            )}

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

                {/* CHANGE 7: Header Section mein getDisplayName() use karo */}
                <div className="text-white text-left mb-6 drop-shadow-lg">
                    <h1 className="text-4xl md:text-5xl font-bold mb-2">Welcome back, {getDisplayName()}!</h1>
                    <h2 className="text-3xl md:text-4xl font-bold mb-2">Ready for Day {readyForDay}?</h2>
                    <p className="text-lg md:text-xl font-light">
                        Master all aspects of {getRoleTrainingName()}—with comprehensive lessons and progress quizzes.
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
                                The complete guide covering every step of Oceanside&apos;s {getRoleTrainingName()} process.
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
                                        
                                        // MANAGER VIEW: Manager ke document se completion check karo
                                        let isCompleted, clickable;
                                        if (isManagerView && currentRole && managerData) {
                                            const prefix = currentRole.toLowerCase() + '_';
                                            const dayField = `${prefix}training_day_${day}`;
                                            isCompleted = managerData[dayField] !== undefined;
                                        } else {
                                            // EMPLOYEE VIEW: Employee ke document se completion check karo
                                            const prefix = getRolePrefix();
                                            const dayField = `${prefix}training_day_${day}`;
                                            isCompleted = userData?.[dayField] !== undefined;
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
                            <div className="bg-white p-4 rounded-3xl shadow-xl">
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
                                            isCompleted = isQuizCompleted(quiz);
                                        }
                                        
                                        clickable = isQuizClickable(quiz);

                                        return (
                                            <button
                                                key={quiz}
                                                onClick={() => handleQuizClick(quiz)}
                                                disabled={!clickable}
                                                className={`flex items-center justify-center font-medium py-3 px-4 rounded-xl gap-2 transition-colors duration-200 ${
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

                            {/* Games & Challenges Card moved below Gold Medal */}
                            <div className="bg-white p-6 rounded-3xl shadow-xl">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Seating Chart</h2>
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