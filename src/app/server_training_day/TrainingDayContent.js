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
    const [currentUser, setCurrentUser] = useState(null); // Auth user object store karne ke liye

    // CHANGE 1: Manager view ke liye state variables
    const [currentRole, setCurrentRole] = useState(null);
    const [isManagerView, setIsManagerView] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [isManager, setIsManager] = useState(false);

    // CHANGE 2: URL parameters check karne ke liye useEffect
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const roleParam = urlParams.get('role');
            const isManagerParam = urlParams.get('isManager') === 'true';
            
            setCurrentRole(roleParam);
            setIsManagerView(isManagerParam);
        }
    }, []);

    // **NAYA USEEFFECT: Authentication Handling**
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
                setCurrentUser(user);
            } else {
                setUserId(null);
                setCurrentUser(null);
                setUserRole(null);
                setTrainingData([]);
                setLoading(false);
                console.error("No user is logged in.");
            }
        });
        return () => unsubscribe();
    }, []);

    // **NAYA USEEFFECT: Data Fetching**
    useEffect(() => {
        const day = searchParams.get('day');
        setSelectedDay(day);

        // Sirf tab data fetch karo jab saari zaroori states set ho chuki hon
        if (!day || !currentUser || currentRole === null) {
            // Agar sab kuch set nahi hua to loading screen continue rakho
            if (day && currentUser && currentRole !== null) setLoading(false);
            return;
        }

        // CHANGE 3: Updated fetchUserRoleAndTrainingData function
        const fetchUserRoleAndTrainingData = async () => {
            setLoading(true);
            try {
                let role, userName;
                
                // Determine which collection to check first (Manager or Employee)
                if (isManagerView) {
                    // Manager ka data managers collection se check karo
                    const managerDocRef = doc(db, "managers", currentUser.uid);
                    const managerDocSnap = await getDoc(managerDocRef);
                    
                    if (managerDocSnap.exists()) {
                        userName = managerDocSnap.data().name || 'Manager';
                        role = currentRole || 'Server'; // URL se role use karo
                        setIsManager(true); // Manager hai, isliye save logic managers collection mein jaana chahiye
                        setTraineeName(userName); // Form mein manager ka naam auto-fill kar diya
                    } else {
                        // Agar manager view true hai lekin document nahi mila
                        console.error("Manager document not found for logged-in user!");
                        setUserRole(null);
                        setTrainingData([]);
                        return;
                    }
                } else {
                    // Normal employee ka data users collection se check karo
                    const userDocRef = doc(db, "users", currentUser.uid);
                    const userDocSnap = await getDoc(userDocRef);
                    
                    if (!userDocSnap.exists()) {
                        // Agar user document nahi mila, to yeh normal employee ke liye error hai
                        console.error("User document not found for logged-in user in 'users' collection!");
                        setUserRole(null);
                        setTrainingData([]);
                        return;
                    }

                    const userData = userDocSnap.data();
                    role = userData.role || 'Server';
                    userName = userData.name || 'Employee';
                    setIsManager(false);
                    setTraineeName(userName); // Form mein employee ka naam auto-fill kar diya
                }
                
                setDisplayName(userName);
                setUserRole(role);

                // Choose schedule collection based on the determined role
                let collectionName;
                if (role === "Bartender") {
                    collectionName = "Bartender Training Schedule";
                } else if (role === "Host") {
                    collectionName = "Host Training Schedule";
                } else if (role === "Cook") {
                    collectionName = "Cook Training Schedule";
                } else { // Default to Server
                    collectionName = "Server Training Schedule";
                }

                // Fetch the training day content
                const docRef = doc(db, collectionName, `day${day}`);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setTrainingData(docSnap.data().schedule || []);
                } else {
                    console.log(`No document found for day${day} in ${collectionName}!`);
                    setTrainingData([]);
                }
            } catch (error) {
                console.error("Error fetching data: ", error);
                setTrainingData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchUserRoleAndTrainingData();
    }, [searchParams, currentUser, currentRole, isManagerView]); // Depend on relevant states

    // CHANGE 4: Updated handleSubmit function (Aapka submit logic theek hai, sirf isManager ka check use karna hai)
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
            let docRef, trainingDayField;
            
            // Manager vs Employee save logic
            if (isManager) {
                // Manager ka data managers collection mein save karo
                docRef = doc(db, "managers", userId);
                // Field name banane ke liye role ko lowercase mein convert karna zaroori hai
                trainingDayField = `${userRole.toLowerCase()}_training_day_${selectedDay}`; 
            } else {
                // Employee ka data users collection mein save karo
                docRef = doc(db, "users", userId);
                
                // Role-based field name
                const rolePrefix = userRole.toLowerCase();
                trainingDayField = (rolePrefix === 'server') ? `training_day_${selectedDay}` : `${rolePrefix}_training_day_${selectedDay}`;
            }

            await setDoc(docRef, {
                [trainingDayField]: {
                    date,
                    traineeName,
                    completedAt: new Date(),
                    viewedRole: userRole, // Track which role was being viewed
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
            {/* CHANGE 5: Manager View Banner */}
            {isManagerView && currentRole && (
                <div className="max-w-6xl mx-auto mb-4">
                    <div className="bg-blue-600 text-white p-3 text-center rounded-t-lg">
                        <span className="font-semibold">Manager View: {displayName} viewing {currentRole} Training Day {selectedDay}</span>
                        <button
                            onClick={() => {
                                const urlParams = currentRole ? `?role=${currentRole}&isManager=true` : '';
                                router.push(`/server_training${urlParams}`);
                            }}
                            className="ml-4 bg-white text-blue-600 px-3 py-1 rounded text-sm font-semibold hover:bg-gray-100"
                        >
                            Back to Training
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-green-800 text-white p-6">
                    <h1 className="text-3xl font-bold">
                        Oceanside Beach Bar & Grill — {userRole} Training Guide (Day {selectedDay})
                    </h1>
                    {/* CHANGE 6: Show current user in header */}
                    {isManagerView && (
                        <p className="text-green-200 mt-2">Viewing as: {displayName}</p>
                    )}
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
                                    className="border-b border-gray-400 focus:border-green-500 outline-none px-2 py-1 w-[168px]"
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
                                    className="border-b border-gray-400 focus:border-green-500 outline-none px-2 py-1 w-[150px]"
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
                                    <p className="text-green-600 mt-2">Data saved successfully!</p>
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