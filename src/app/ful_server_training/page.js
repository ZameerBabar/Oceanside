"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/app/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

export default function ServerTraining() {
  const router = useRouter();
  const [trainingData, setTrainingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchUserRoleAndTraining(currentUser);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserRoleAndTraining = async (currentUser) => {
    try {
      // First fetch user role from users collection
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (!userDocSnap.exists()) {
        console.log("User document not found!");
        setLoading(false);
        return;
      }

      const userData = userDocSnap.data();
      const role = userData.role; // Get role from user document
      setUserRole(role);

      // Now fetch training data based on role
      let trainingDocRef, dataField;
      
      if (role === "Server") { // Note: case-sensitive match with your Firestore data
        trainingDocRef = doc(db, "Full Server Training", "data");
        dataField = "serverTraining";
      } else if (role === "Bartender") { // Note: case-sensitive match with your Firestore data
        trainingDocRef = doc(db, "Full Bartender Training", "data");
        dataField = "bartenderTraining";
      }
      else if (role === "Host") { // Note: case-sensitive match with your Firestore data
        trainingDocRef = doc(db, "Full Host Training", "data");
        dataField = "HostTraining";
      } else {
        console.log("Unknown role:", role);
        setLoading(false);
        return;
      }
      
      const trainingDocSnap = await getDoc(trainingDocRef);

      if (trainingDocSnap.exists()) {
        setTrainingData(trainingDocSnap.data()[dataField] || []);
      } else {
        console.log("Training document not found!");
        setTrainingData([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setTrainingData([]);
    } finally {
      setLoading(false);
    }
  };

  // Show a loading message while fetching data
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-green-100 to-green-600">
        <p className="text-xl text-green-800">Loading {userRole || 'training'} guide...</p>
      </div>
    );
  }
  
  // Show message if user is not logged in
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-green-100 to-green-600">
        <p className="text-xl text-green-800">Please log in to access training materials.</p>
      </div>
    );
  }
  
  // Show a message if no data is found
  if (trainingData.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-green-100 to-green-600">
        <p className="text-xl text-green-800">No training data found.</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto bg-gradient-to-br from-green-100 to-green-600">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-green-800 mb-8">
            Oceanside Beach Bar & Grill — {userRole} Training Guide
          </h1>

          <div className="space-y-8">
            {trainingData.map((item, index) => {
              switch (item.type) {
                case 'headline':
                  return (
                    <h2
                      key={index}
                      className="text-2xl font-bold text-green-800 pt-4 border-t border-gray-200 first:border-t-0 first:pt-0"
                    >
                      {item.text}
                    </h2>
                  );
                case 'subheading':
                  return (
                    <h3 key={index} className="text-xl font-semibold text-green-700 mt-6">
                      {item.text}
                    </h3>
                  );
                case 'bold':
                  return (
                    <p key={index} className="font-bold text-gray-800 mt-3">
                      {item.text}
                    </p>
                  );
                case 'text':
                  return (
                    <p key={index} className="text-gray-800 leading-relaxed">
                      {item.text}
                    </p>
                  );
                case 'list':
                  return (
                    <ul key={index} className="list-disc list-inside ml-4 space-y-1 mt-2">
                      {item.list.map((listItem, i) => (
                        <li key={i} className="text-gray-700">{listItem}</li>
                      ))}
                    </ul>
                  );
                default:
                  return null;
              }
            })}
          </div>
        </div>
      </main>
    </div>
  );
}