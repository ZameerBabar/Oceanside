"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "@/app/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function ServerTrainingDay1() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [date, setDate] = useState("");
    const [traineeName, setTraineeName] = useState("");
    const [trainingData, setTrainingData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [userId, setUserId] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const day = searchParams.get('day');
        if (day) {
            setSelectedDay(day);
        }
    }, [searchParams]);

    useEffect(() => {
        if (!selectedDay) return;

        const fetchUserRoleAndTrainingData = async (user) => {
            try {
                // First fetch user role
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);
                
                if (!userDocSnap.exists()) {
                    console.log("User document not found!");
                    setUserRole(null);
                    setTrainingData([]);
                    setLoading(false);
                    return;
                }

                const userData = userDocSnap.data();
                const role = userData.role;
                setUserRole(role);

                // Choose collection based on role
                let collectionName = "Server Training Schedule"; // Default for Server
                if (role === "Bartender") {
                    collectionName = "Bartender Training Schedule";
                }

                // Fetch training data
                const docRef = doc(db, collectionName, `day${selectedDay}`);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setTrainingData(docSnap.data().schedule);
                } else {
                    console.log(`No document found for day${selectedDay} in ${collectionName}!`);
                    setTrainingData([]);
                }
            } catch (error) {
                console.error("Error fetching data: ", error);
                setTrainingData([]);
            } finally {
                setLoading(false);
            }
        };

        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
                fetchUserRoleAndTrainingData(user);
            } else {
                setUserId(null);
                setUserRole(null);
                setTrainingData([]);
                setLoading(false);
                console.error("No user is logged in.");
            }
        });
        
        return () => unsubscribe();
    }, [selectedDay]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveError(null);
        setSaveSuccess(false);

        if (!date || !traineeName) {
            setSaveError("Please fill out both the date and your name.");
            setIsSaving(false);
            return;
        }

        if (!userId) {
            setSaveError("User not authenticated. Please log in.");
            setIsSaving(false);
            return;
        }

        if (!userRole) {
            setSaveError("User role not found. Please contact administrator.");
            setIsSaving(false);
            return;
        }

        try {
            const userDocRef = doc(db, "users", userId);
            
            // Dynamically set the training day field name based on role and day
            let trainingDayField;
            if (userRole === "Server") {
                trainingDayField = `training_day_${selectedDay}`;
            } else if (userRole === "Bartender") {
                trainingDayField = `bartender_training_day_${selectedDay}`;
            }

            await setDoc(userDocRef, {
                [trainingDayField]: {
                    date,
                    traineeName,
                    completedAt: new Date(),
                },
            }, { merge: true });

            console.log("Document successfully written!");
            setSaveSuccess(true);
            setDate("");
            setTraineeName("");

        } catch (error) {
            console.error("Error writing document: ", error);
            setSaveError("Failed to save data. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-green-600">
                <p className="text-white text-xl">Loading...</p>
            </div>
        );
    }

    if (!userRole) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-green-600">
                <p className="text-white text-xl">User role not found. Please contact administrator.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-600 p-6 font-inter">
            <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-green-800 text-white p-6">
                    <h1 className="text-3xl font-bold">
                        Oceanside Beach Bar & Grill — {userRole} Training Guide (Day {selectedDay})
                    </h1>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 space-y-8">
                    {trainingData.length > 0 ? (
                        trainingData.map((item, index) => {
                            switch (item.type) {
                                case 'headline':
                                    return (
                                        <h1 key={index} className="text-2xl font-bold text-green-800 border-b border-green-200 pb-2">
                                            {item.text}
                                        </h1>
                                    );
                                case 'subheading':
                                    return (
                                        <h2 key={index} className="text-xl font-semibold text-green-700 mt-6">
                                            {item.text}
                                        </h2>
                                    );
                                case 'bold':
                                    return (
                                        <h3 key={index} className="font-bold text-gray-800 mt-4">
                                            {item.text}
                                        </h3>
                                    );
                                case 'text':
                                    return (
                                        <p key={index} className="text-gray-700 leading-relaxed">
                                            {item.text}
                                        </p>
                                    );
                                case 'list':
                                    return (
                                        <ul key={index} className="list-disc list-inside ml-4 space-y-2 mt-2">
                                            {item.list.map((listItem, i) => (
                                                <li key={i} className="text-gray-700">{listItem}</li>
                                            ))}
                                        </ul>
                                    );
                                default:
                                    return null;
                            }
                        })
                    ) : (
                        <p className="text-center text-gray-500">No training data available for Day {selectedDay}.</p>
                    )}

                    <div className="h-px w-full bg-gray-300 my-8"></div>

                    <form onSubmit={handleSubmit}>
                        <div className="mt-8 flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <label htmlFor="date" className="font-medium whitespace-nowrap">Date</label>
                                <input
                                    id="date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="border-b border-gray-400 focus:border-green-500 outline-none px-2 py-1 w-168"
                                    required
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <label htmlFor="traineeName" className="font-medium whitespace-nowrap">Trainee Name</label>
                                <input
                                    id="traineeName"
                                    type="text"
                                    value={traineeName}
                                    onChange={(e) => setTraineeName(e.target.value)}
                                    className="border-b border-gray-400 focus:border-green-500 outline-none px-2 py-1 w-150"
                                    placeholder="Enter Trainee name and initials"
                                    required
                                />
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    className="mt-4 px-20 py-2 bg-green-700 text-white font-semibold rounded-lg shadow hover:bg-green-600 transition-colors disabled:bg-gray-400"
                                    disabled={isSaving || !userId}
                                >
                                    {isSaving ? "Saving..." : "Submit"}
                                </button>
                                {saveSuccess && (
                                    <p className="text-green-600 mt-2">Data saved successfully! 🎉</p>
                                )}
                                {saveError && (
                                    <p className="text-red-500 mt-2">{saveError}</p>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}