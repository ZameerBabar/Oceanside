'use client'; 

 import React, { useState, useEffect } from 'react'; 
 import { useRouter } from 'next/navigation' 
 import { signOut, onAuthStateChanged } from 'firebase/auth'; 
 import { auth, db } from '../firebaseConfig'; 
 import { doc, getDoc } from 'firebase/firestore'; 

 const themeColors = { 
   darkGreen: '#34916aff', 
   lightGreen: '#d4edc9', 
   cardBackground: '#ffffff', 
   textDark: '#1a1a1a', 
   textLight: '#6b7280', 
 }; 

 // ========================================================== 
 // Web Dashboard Component 
 // ========================================================== 
 const DashboardPage = () => { 
   const router = useRouter(); 
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
   const [userName, setUserName] = useState('Manager'); // Default name 

   useEffect(() => { 
     const unsubscribe = onAuthStateChanged(auth, async (user) => { 
       if (user) { 
         // User is logged in, now fetch their name from Firestore 
         const userDocRef = doc(db, 'managers', user.uid); 
         try { 
           const userDocSnap = await getDoc(userDocRef); 
           if (userDocSnap.exists()) { 
             const userData = userDocSnap.data(); 
             if (userData.name) { 
               setUserName(userData.name); 
             } 
           } 
         } catch (error) { 
           console.error("Error fetching user data from Firestore:", error); 
         } 
       } else { 
         // User is logged out, redirect to login page 
         router.push('/'); 
       } 
     }); 

     // Cleanup subscription on unmount 
     return () => unsubscribe(); 
   }, [router]); 

   const handleLogout = async () => { 
     try { 
       await signOut(auth); 
       router.push('/'); 
     } catch (error) { 
       console.error("Logout karne mein koi masla hua:", error); 
     } 
   }; 
    
   const MenuIcon = () => ( 
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"> 
       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /> 
     </svg> 
   ); 

   const dashboardCards = [ 
     { 
       title: 'Manager Tools', 
       description: 'Everything you need to thrive ... From training to daily updates, this is your central resource as a server.', 
       icon: ( 
         <path 
           strokeLinecap="round" 
           strokeLinejoin="round" 
           strokeWidth={2} 
           d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
         /> 
       ), 
       gradient: 'from-blue-500 to-blue-600', 
       shadowColor: 'shadow-blue-200', 
       onClick: () => { 
         router.push('/manager_tool_page'); 
       }, 
     }, 
     { 
       title: 'AI & Support', 
       description: 'Ask anything, anytime. Your 24/7 Oceanside assistant — here to answer questions about policies, menu items, tasks, and more.', 
       icon: ( 
         <path 
           strokeLinecap="round" 
           strokeLinejoin="round" 
           strokeWidth={1} 
           d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
         /> 
       ), 
       gradient: 'from-purple-500 to-purple-600', 
       shadowColor: 'shadow-purple-200', 
       onClick: () => { 
         router.push('/ai_and_support'); 
       }, 
     }, 
      
     { 
       title: 'Team Hubs', 
       description: 'Check your schedule, request time off, and manage shift swaps—all in one place.', 
       icon: ( 
         <path 
           strokeLinecap="round" 
           strokeLinejoin="round" 
           strokeWidth={2} 
           d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
         /> 
       ), 
       gradient: 'from-green-500 to-emerald-600', 
       shadowColor: 'shadow-green-200', 
       onClick: () => { 
         router.push('/team_hubs'); 
       }, 
     }, 
      
     { 
       title: 'Admin Tools', 
       description: "See what's fresh. Browse our latest specials, seasonal dishes, and featured items.", 
       icon: ( 
         <path 
           strokeLinecap="round" 
           strokeLinejoin="round" 
           strokeWidth={2} 
           d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
         /> 
       ), 
       gradient: 'from-orange-500 to-red-500', 
       shadowColor: 'shadow-green-200', 
       onClick: () => { 
         router.push('/admin_tool'); 
       }, 
     }, 
   ]; 

   return ( 
     <div 
       className="flex min-h-screen text-gray-800 relative" 
       style={{ 
         background: `linear-gradient(135deg, ${themeColors.lightGreen}, ${themeColors.darkGreen})`, 
       }} 
     > 
       {/* Mobile Header (visible on small screens) */} 
       <div className="md:hidden w-full flex justify-between items-center p-6 shadow-xl fixed top-0 left-0 z-50 backdrop-blur-lg"  
       style={{ backgroundColor: `${themeColors.darkGreen}` }}> 
         <img 
           src="/logo.png" 
           alt="Oceanside Logo" 
           className="h-10 w-auto object-contain" 
         /> 
         <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-lg bg-white/20 backdrop-blur"> 
           <MenuIcon /> 
         </button> 
       </div> 

       {/* Desktop Sidebar (hidden on small screens) */} 
       <div className="hidden md:flex flex-col w-52 p-4 text-white shadow-2xl backdrop-blur-lg" style={{ 
         background: `linear-gradient(145deg, ${themeColors.darkGreen}, ${themeColors.lightGreen})`, 
         borderRight: `1px solid ${themeColors.lightGreen}`, 
       }}> 
         <div className="flex items-center justify-center mb-6 mt-2"> 
            
             <img 
               src="/logo.png" 
               alt="Oceanside Logo" 
               className="h-14 w-auto object-contain" 
             /> 
            
         </div> 
         <nav className="space-y-3 flex-grow"> 
           <div className="flex items-center p-2 rounded-2xl bg-gradient-to-r from-[#34916aff] to-green-600 backdrop-blur-lg shadow-lg border border-white"> 
             <span className="mr-3 bg-white/20 p-1.5 rounded-xl"> 
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"> 
                 <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /> 
               </svg> 
             </span> 
             <span className="font-bold text-lg text-white">Dashboard</span> 
           </div> 
         </nav> 
         {/* Logout Button */} 
         <nav className="space-y-1 mt-auto"> 
           <button 
             onClick={handleLogout} 
             className="flex items-center w-full p-2 rounded-2xl transition-all duration-300 border border-red text-white font-bold hover:bg-red/20 hover:shadow-xl transform hover:scale-105" 
           > 
             <span className="mr-3 bg-white/20 p-1.5 rounded-xl"> 
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"> 
                 <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-2 0V4H5v12h12v-2a1 1 0 112 0v3a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm9.293 8.293a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L13 13.414V17a1 1 0 11-2 0v-3.586l-1.293 1.293a1 1 0 01-1.414-1.414l3-3z" clipRule="evenodd" /> 
               </svg> 
             </span> 
             <span>Logout</span> 
           </button> 
         </nav> 
       </div> 

       {/* Mobile Menu (opens on small screens) */} 
       <div className={`fixed inset-0 z-40 bg-gray-900/80 backdrop-blur-sm md:hidden transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileMenuOpen(false)}></div> 
       <div className={`fixed top-0 left-0 h-full w-60 z-50 flex flex-col p-4 text-white shadow-2xl transition-transform duration-300 ease-in-out md:hidden backdrop-blur-lg ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ 
         background: `linear-gradient(145deg, ${themeColors.darkGreen}, ${themeColors.lightGreen})`, 
       }}> 
         <div   className="flex items-center justify-center mb-8 mt-2"> 
            
             <img 
               src="/logo.png" 
               alt="Oceanside Logo" 
               className="h-14 w-auto object-contain" 
             /> 
            
         </div> 
         <nav className="space-y-2 flex-grow"> 
           <div className="flex items-center p-2 rounded-2xl bg-green/20 backdrop-blur-lg shadow-lg border border-white/30"> 
             <span className="mr-3 bg-white/20 p-1.5 rounded-xl"> 
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"> 
                 <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /> 
               </svg> 
             </span> 
             <span className="font-bold text-lg text-white">Dashboard</span> 
           </div> 
         </nav> 
         {/* Logout Button */} 
         <nav className="space-y-1 mt-auto"> 
           <button 
             onClick={handleLogout} 
             className="flex items-center w-full p-2 rounded-2xl transition-all duration-300 border border-white text-white font-bold hover:bg-white/20 hover:shadow-xl transform hover:scale-105" 
           > 
             <span className="mr-3 bg-white/20 p-1.5 rounded-xl"> 
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"> 
                 <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-2 0V4H5v12h12v-2a1 1 0 112 0v3a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm9.293 8.293a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L13 13.414V17a1 1 0 11-2 0v-3.586l-1.293 1.293a1 1 0 01-1.414-1.414l3-3z" clipRule="evenodd" /> 
               </svg> 
             </span> 
             <span>Logout</span> 
           </button> 
         </nav> 
       </div> 

       {/* Main Content Area */} 
       <div className="flex-1 p-4 md:p-6 overflow-y-hidden mt-20 md:mt-0"> 
         {/* Greeting Card */} 
         <div 
           className="flex flex-col p-7 rounded-3xl mb-6 shadow-2xl border backdrop-blur-lg" 
           style={{ 
             background: `linear-gradient(135deg, ${themeColors.darkGreen}, #38c755dd)`, 
             color: themeColors.cardBackground, 
             borderColor: `${themeColors.lightGreen}`, 
           }} 
         > 
           <div className="flex items-center mb-2"> 
             <div className="bg-white/20 p-3 rounded-2xl mr-3"> 
               <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"> 
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" /> 
               </svg> 
             </div> 
             <div> 
               <h2 className="text-2xl font-bold">Hello {userName}!</h2> 
               <p className="text-base mt-1 opacity-90">Welcome to Your Oceanside Manager Portal.<br></br> Use this dashboard to oversee your team, access recources, and manage day-to-day operations.</p> 
             </div> 
           </div> 
         </div> 

         {/* Cards Grid */} 
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1"> 
           {dashboardCards.map((card, index) => ( 
             <div 
               key={index} 
               onClick={card.onClick} 
               className={`bg-white/95 backdrop-blur-lg rounded-3xl shadow-xl p-9 flex items-start cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/50 ${card.shadowColor} hover:${card.shadowColor}/50`} 
             > 
               <div className={`p-4 rounded-2xl mr-4 bg-gradient-to-br ${card.gradient} shadow-lg`}> 
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"> 
                   {card.icon} 
                 </svg> 
               </div> 
               <div className="flex-1"> 
                 <h3 className="text-lg font-bold mb-1.5" style={{ color: themeColors.darkGreen }}> 
                   {card.title} 
                 </h3> 
                 <p className="text-xs leading-relaxed" style={{ color: themeColors.textLight }}> 
                   {card.description} 
                 </p> 
                 <div className="mt-2 flex items-center text-xs font-semibold" style={{ color: themeColors.darkGreen }}> 
                   <span>Explore</span> 
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"> 
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /> 
                   </svg> 
                 </div> 
               </div> 
             </div> 
           ))} 
         </div> 
       </div> 
     </div> 
   ); 
 }; 

 // ========================================================== 
 // Main App Component 
 // ========================================================== 
 const App = () => { 
   return <DashboardPage />; 
 }; 

 export default App;