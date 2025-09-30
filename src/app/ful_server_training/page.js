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
  
  // CHANGE 1: URL parameters aur manager data ke liye state variables
  const [currentRole, setCurrentRole] = useState(null);
  const [isManagerView, setIsManagerView] = useState(false);
  const [displayName, setDisplayName] = useState('');

  // CHANGE 2: URL parameters check karne ke liye useEffect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const roleParam = urlParams.get('role');
      const isManager = urlParams.get('isManager') === 'true';
      
      setCurrentRole(roleParam);
      setIsManagerView(isManager);
    }
  }, []);

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
  }, [currentRole, isManagerView]); // Add dependencies

  // CHANGE 3: Updated fetchUserRoleAndTraining function
  const fetchUserRoleAndTraining = async (currentUser) => {
    try {
      let role, userName;
      
      // Manager view logic
      if (isManagerView && currentRole) {
        // Agar manager view hai to URL se role le kar manager data fetch karo
        const managerDocRef = doc(db, "managers", currentUser.uid);
        const managerDocSnap = await getDoc(managerDocRef);
        
        if (managerDocSnap.exists()) {
          userName = managerDocSnap.data().name || 'Manager';
          role = currentRole; // URL se role use karo
        } else {
          console.log("Manager document not found!");
          setLoading(false);
          return;
        }
      } else {
        // Normal user logic - employees collection se fetch karo
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (!userDocSnap.exists()) {
          console.log("User document not found!");
          setLoading(false);
          return;
        }

        const userData = userDocSnap.data();
        role = userData.role;
        userName = userData.name || 'Employee';
      }
      
      setUserRole(role);
      setDisplayName(userName);

      // Now fetch training data based on determined role
      let trainingDocRef, dataField;
      
      if (role === "Server") {
        trainingDocRef = doc(db, "Full Server Training", "data");
        dataField = "serverTraining";
      } else if (role === "Bartender") {
        trainingDocRef = doc(db, "Full Bartender Training", "data");
        dataField = "bartenderTraining";
      } else if (role === "Host") {
        trainingDocRef = doc(db, "Full Host Training", "data");
        dataField = "hostTraining";
      } else if (role === "Cook") { // Add Cook role support
        trainingDocRef = doc(db, "Full Cook Training", "data");
        dataField = "cookTraining";
      } else {
        console.log("Unknown role:", role);
        setLoading(false);
        return;
      }
      
      const trainingDocSnap = await getDoc(trainingDocRef);

      if (trainingDocSnap.exists()) {
        setTrainingData(trainingDocSnap.data()[dataField] || []);
      } else {
        console.log("Training document not found for role:", role);
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
        <div className="text-center">
          {/* CHANGE 4: Manager view banner */}
          {isManagerView && currentRole && (
            <div className="bg-blue-600 text-white p-3 rounded-lg mb-4">
              <span className="font-semibold">Manager View: {displayName} viewing {currentRole} Training</span>
            </div>
          )}
          <p className="text-xl text-green-800">No training data found for {userRole} role.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
     
      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto bg-gradient-to-br from-green-100 to-green-600">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 max-w-7xl mx-auto">
          {/* CHANGE 6: Dynamic title with display name */}
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