'use client';
import React, { useState, useEffect } from 'react';
import { LayoutList, CheckCircle2, UserCheck, Timer, XCircle } from 'lucide-react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/app/firebaseConfig'; // `auth` ko import karna zaroori hai

const tasks = {
  "Opening Duties": [
    "Keep rags clean",
    "Tables, chairs, and ledges remain clean",
    "Periodically check/restock bathrooms",
    "Redo windows/doors when smudged",
    "Roll silverware",
    "Fold bags",
    "Keep hostess station neat and clean",
    "Wipe down/organize Oceanside display case",
    "Drink menus on tables",
    "Features are done and written on board",
    "Menus wiped and clean",
    "Outside hostess station is stocked (menus, silverware, crayons)",
    "All seating charts filled out for week and kept up to date",
    "Open signs on",
    "Count drawer to make sure it’s at $200",
    "Clean sanitizer water and rags for tables",
    "Check bathrooms (restock, sweep, check air fresheners, cleanliness)",
    "TO-GO supplies restocked, inside and outside",
    "Doors and windows cleaned",
    "Window ledges clean",
    "Wipe outside tables and put caddies out",
    "Table caddies wiped (as needed)",
    "Outside hostess station set up and swept"
  ],
  "Running Duties": [
    "Keep rags clean",
    "Tables, chairs, and ledges remain clean",
    "Periodically check/restock bathrooms",
    "Redo windows/doors when smudged",
    "Roll silverware",
    "Fold bags",
    "Keep hostess station neat and clean",
    "Wipe down/organize Oceanside display case",
    "Drink menus on tables",
    "Features are done and written on board",
    "Menus wiped and clean",
    "Outside hostess station is stocked (menus, silverware, crayons)",
    "TO-GO supplies checked and restocked as needed"
  ],
  "Closing Duties": [
    "Clean bathrooms",
    "Wipe feature board",
    "Turn outside hostess stand around to face wall",
    "All working FOH employees’ names written on the clipboard",
    "Doors, windows, and display case clean",
    "Clean hostess area (trash, tidy up, rags)",
    "Menus wiped",
    "Open signs off",
    "Close your drawer",
    "Pens, rubber bands, crayons, kids’ menus, To-Go menus, gift cards, business cards, toothpicks, napkins, applications stocked",
    "Counter is wiped down",
    "Trash is emptied",
    "Clean water for rags",
    "Clean GREEN rags (inside)"
  ],
  "Bathroom Checklist": [
    {
      "section": "Sinks & Counters",
      "items": [
        "Counters: wipe down with cleaner",
        "Sink bases holding up the sink: wipe thoroughly",
        "Faucet: turn faucet on and clean gunk between faucet and handle",
        "Clean around drain",
        "Look where the sink and countertop meet — scrub if needed"
      ]
    },
    {
      "section": "Toilets",
      "items": [
        "Lift the seat, spray inside the toilet bowl, scrub with brush",
        "Spray entire toilet (top, handle, seat, base, tank) with cleaner, wipe down, scrub if needed"
      ]
    },
    {
      "section": "Shelves & Décor",
      "items": [
        "Dust all shelves",
        "Rearrange décor back to proper place",
        "Dust décor as needed"
      ]
    },
    {
      "section": "Floors",
      "items": [
        "Sweep under sink, under cabinets, behind trash cans, and around toilet",
        "Mop if needed with Fabuloso + hot water"
      ]
    },
    {
      "section": "Paper & Dispensers",
      "items": [
        "Change toilet paper (open and check)",
        "Change paper towels (open and check)",
        "Wipe down toilet paper holder",
        "Wipe down paper towel holder"
      ]
    },
    {
      "section": "Trash Cans",
      "items": [
        "Wipe outside of trash can",
        "Change trash bag, tie/secure to rim so it does not fall in",
        "Every Sunday, closing: scrub inside/outside of trash can with fine steel wool (ask manager which type to avoid scratches)",
        "Empty small trash cans too"
      ]
    },
    {
      "section": "Miscellaneous",
      "items": [
        "Replenish daily-use cleaning chemicals, gloves, etc. in bathroom caddy",
        "Organize cabinets in downstairs bathrooms when needed",
        "Dust tile borders",
        "Dust door frames and cracks",
        "Wipe bathroom doors (use magic eraser on white doors)",
        "Wipe down walls as needed",
        "Clean spots off mirror with Windex",
        "Check/refill soap",
        "Dust top of mirror frame"
      ]
    }
  ],
  "Hostess Stand Essentials": [
    {
      "section": "Keep at the Hostess Stand",
      "items": [
        "Seating chart for upstairs and downstairs with the same sections outlined inside and outside",
        "Expo marker to mark open tables",
        "Pen and watch to write down wait times",
        "Clipboard with pages for wait list",
        "Kids menus and crayons underneath",
        "To-Go menus underneath for customers"
      ]
    },
    {
      "section": "Doors & Windows: Fast Method",
      "items": [
        "Spray with Windex",
        "Wipe with coffee filters or a clean towel",
        "Check window sills"
      ]
    }
  ]
};

const tabIcons = {
  "Opening Duties": <Timer />,
  "Running Duties": <UserCheck />,
  "Closing Duties": <XCircle />,
  "Bathroom Checklist": <LayoutList />,
  "Hostess Stand Essentials": <CheckCircle2 />,
};

export default function HostessChecklists() {
  const [activeTab, setActiveTab] = useState("Opening Duties");
  const [checkedTasks, setCheckedTasks] = useState({});
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const docRef = doc(db, "users", userId, "checklists", activeTab);

    const unsubscribeSnapshot = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setCheckedTasks(docSnap.data());
      } else {
        setCheckedTasks({});
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching checklist data: ", error);
      setLoading(false);
    });

    return () => unsubscribeSnapshot();
  }, [userId, activeTab]);

  const handleCheckboxChange = async (task) => {
    if (!userId) return;

    const newCheckedTasks = {
      ...checkedTasks,
      [task]: !checkedTasks[task]
    };
    
    try {
      const docRef = doc(db, "users", userId, "checklists", activeTab);
      await setDoc(docRef, newCheckedTasks, { merge: true });
    } catch (error) {
      console.error("Error updating checklist data: ", error);
    }
  };

  const getPercentage = () => {
    const currentTabTasks = tasks[activeTab];
    if (!currentTabTasks || loading) return 0;
    
    let totalTasks = 0;
    let completedTasks = 0;

    if (Array.isArray(currentTabTasks)) {
      if (typeof currentTabTasks[0] === 'string') {
        totalTasks = currentTabTasks.length;
        completedTasks = currentTabTasks.filter(task => checkedTasks?.[task]).length;
      } else {
        currentTabTasks.forEach(section => {
          totalTasks += section.items.length;
          completedTasks += section.items.filter(item => checkedTasks?.[item]).length;
        });
      }
    }

    if (totalTasks === 0) return 0;
    return Math.round((completedTasks / totalTasks) * 100);
  };

  const percentage = getPercentage();

  const renderChecklist = (list) => {
    if (Array.isArray(list) && typeof list[0] === 'string') {
      return (
        <div className="flex flex-wrap gap-4">
          <div className="w-full">
            {list.map((task, index) => (
              <div key={index} className="flex items-center space-x-2 my-2 bg-gray-50 p-3 rounded-lg border border-red shadow-sm">
                <input
                  type="checkbox"
                  id={`task-${index}`}
                  checked={!!checkedTasks[task]}
                  onChange={() => handleCheckboxChange(task)}
                  className="form-checkbox h-5 w-5 text-emerald-600 rounded-md transition duration-150 ease-in-out border-gray-300 focus:ring-emerald-500"
                />
                <label htmlFor={`task-${index}`} className="text-gray-800 flex-1">
                  {task}
                </label>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (Array.isArray(list) && typeof list[0] === 'object') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((section, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-xl shadow-md border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-3">{section.section}</h3>
              <ul className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id={`item-${index}-${itemIndex}`}
                      checked={!!checkedTasks[item]}
                      onChange={() => handleCheckboxChange(item)}
                      className="mt-1 h-4 w-4 text-emerald-600 rounded-md transition duration-150 ease-in-out border-gray-300 focus:ring-emerald-500"
                    />
                    <label htmlFor={`item-${index}-${itemIndex}`} className="text-gray-700 text-sm">
                      {item}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const circularProgressBar = (
    <div className="relative w-16 h-16">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle
          className="text-gray-200 stroke-current"
          strokeWidth="10"
          cx="50"
          cy="50"
          r="40"
          fill="transparent"
        ></circle>
        <circle
          className="text-white stroke-current transition-all duration-500 ease-in-out"
          strokeWidth="10"
          strokeLinecap="round"
          cx="50"
          cy="50"
          r="40"
          fill="transparent"
          strokeDasharray={2 * Math.PI * 40}
          strokeDashoffset={2 * Math.PI * 40 - (percentage / 100) * (2 * Math.PI * 40)}
        ></circle>
      </svg>
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-white font-bold text-lg">
        {percentage}%
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <p className="text-gray-600">Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-200  to-green-700 p-4 sm:p-6 lg:p-8 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-green-900 to-green-400 border-white p-6 md:p-8 text-white text-center">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide">
                Host/Hostess Sidework Checklists
              </h1>
              <p className="text-sm mt-1 opacity-90">
                Oceanside Beach Bar & Grill
              </p>
            </div>
            {circularProgressBar}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-emerald-700 flex flex-wrap justify-center sm:justify-start">
          {Object.keys(tasks).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 sm:flex-initial flex items-center justify-center sm:justify-start px-4 py-3 text-center text-sm font-semibold transition-colors duration-200 border-b-4 ${
                activeTab === tab
                  ? 'border-white text-white bg-emerald-800'
                  : 'border-transparent text-gray-200 hover:text-white hover:bg-emerald-600'
              }`}
            >
              <span className="hidden sm:inline-block mr-2">{tabIcons[tab]}</span>
              <span>{tab}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{activeTab}</h2>
          {loading ? (
            <div className="text-center text-gray-500">
              <p>Data load ho raha hai...</p>
            </div>
          ) : (
            renderChecklist(tasks[activeTab])
          )}
          <div className="mt-8 text-center text-gray-500 font-medium">
            <span className="text-emerald-600">
              {percentage === 100 ? "All required tasks complete!" : `${percentage}% of tasks complete`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}