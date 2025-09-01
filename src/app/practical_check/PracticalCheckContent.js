'use client'
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // <-- 1. useSearchParams ko import karein
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/app/firebaseConfig";
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // <-- onAuthStateChanged ko bhi import karein
import SignaturePad from 'react-signature-canvas';

// selectedQuiz prop ko remove kar dein
export default function PracticalCheckScreen() { 
    const router = useRouter();
    const searchParams = useSearchParams(); // <-- 2. useSearchParams ko use karein
    const selectedQuiz = searchParams.get('quiz'); // <-- 2. quiz parameter ko URL se lein
    const signaturePadRef = useRef({});
    const [practicalData, setPracticalData] = useState({
        traineeName: '',
        trainerName: '',
        date: ''
    });
    const [loading, setLoading] = useState(true);
    const [traineeUserId, setTraineeUserId] = useState(null); // <-- traineeUserId state add karein

    const quizTasks = {
        '2': [
            'Open a ticket in the POS.',
            'Print a ticket.',
            'Open the tables screen.',
            'Find a specific menu item in the POS.',
            'Locate alcoholic beverages in the POS.',
            'Complete a physical skills check.'
        ],
        '3': [
            'Verbally present features in correct order (Chef’s recommendation → Featured Fish → Featured Soup).',
            'Demonstrate correct sauce & utensil pairing for 2 menu items.',
            'Ring in the following in the POS:',
            'Non-alcoholic drink',
            'Appetizer',
            'Salad',
            'Entrée',
            'Dessert',
            'Feature',
            'Beer',
            'Wine',
            'Liquor',
            'Merchandise'
        ],
        '4': [
            'Recite and present features fluently in the correct order.',
            'Recite all Steps of Service from memory.',
            'Practice upselling a drink, a food item, and a dessert/espresso.',
            'Identify one personal weakness from training so far and describe how you will improve it.'
        ]
    };

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setTraineeUserId(currentUser.uid); // <-- UserId state ko set karein
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    setPracticalData(prev => ({ ...prev, traineeName: userDocSnap.data().name || '' }));
                }
            } else {
                setTraineeUserId(null);
                router.push('/login');
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [router]);

    const handleClearSignature = () => {
        signaturePadRef.current.clear();
    };

    const handlePracticalSubmit = async () => {
        // userId ke bajaye traineeUserId use karein
        if (signaturePadRef.current.isEmpty() || !traineeUserId || !practicalData.traineeName || !practicalData.date || !practicalData.trainerName) {
            alert("Please fill out all fields and provide a signature.");
            return;
        }

        try {
            const signatureData = signaturePadRef.current.toDataURL();
            const userDocRef = doc(db, 'users', traineeUserId); // <-- traineeUserId use karein
            const updateData = {
                [`approved_quiz_${selectedQuiz}`]: {
                    traineeName: practicalData.traineeName,
                    trainerName: practicalData.trainerName,
                    trainerSignature: signatureData,
                    date: practicalData.date,
                }
            };

            await updateDoc(userDocRef, updateData);
            alert('Practical skills check submitted successfully!');
            router.replace('/server_training');

        } catch (error) {
            console.error("Error submitting practical skills data:", error);
            alert("Failed to submit data. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <p>Loading form...</p>
            </div>
        );
    }

    const tasksToDisplay = quizTasks[selectedQuiz] || [];
    const isQuiz3 = selectedQuiz === '3';
    const isQuiz4 = selectedQuiz === '4';

    return (
        <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-green-100 to-green-600 flex items-center justify-center font-inter">
            <div className="w-full max-w-2xl p-8 bg-gray-50 rounded-2xl shadow-xl border border-gray-200">
                <h1 className="text-2xl md:text-3xl font-bold text-green-700 mb-6 text-center">
                    {isQuiz3 || isQuiz4 ? 'Trainer-Assisted Skills Check' : 'Practical Skills Check (Trainer-Assisted)'}
                </h1>
                <p className="text-gray-600 mb-6 text-center">After you submit your quiz, see your certified trainer or a manager to complete this portion.</p>
                {isQuiz3 || isQuiz4 ? (
                    <p className="text-gray-600 mb-6 text-center italic">(Completed live with a trainer or manager)</p>
                ) : null}

                <div className="bg-white p-6 rounded-xl border border-dashed border-gray-300">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Trainer Tasks:</h2>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {tasksToDisplay.map((task, index) => (
                            <li key={index}>
                                {task}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="grid grid-cols-1 gap-6 my-8">
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">Trainer Name</label>
                        <input
                            type="text"
                            value={practicalData.trainerName}
                            onChange={(e) => setPracticalData({ ...practicalData, trainerName: e.target.value })}
                            placeholder="Trainer's Name"
                            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">Trainer Signature</label>
                        <div className="border border-gray-300 rounded-lg bg-white p-2 relative">
                            <SignaturePad
                                ref={signaturePadRef}
                                canvasProps={{
                                    className: 'w-full h-32',
                                    style: { border: '1px dashed #ccc', borderRadius: '8px' }
                                }}
                            />
                            <button
                                onClick={handleClearSignature}
                                className="absolute bottom-2 right-2 text-sm text-gray-500 hover:text-red-500"
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            value={practicalData.date}
                            onChange={(e) => setPracticalData({ ...practicalData, date: e.target.value })}
                            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                        />
                    </div>
                </div>

                <div className="text-center">
                    <button
                        onClick={handlePracticalSubmit}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-lg text-lg w-full"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
}