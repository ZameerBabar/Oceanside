'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Search, Filter, Edit3, Trash2, MapPin, Clock, User, Tag, Calendar, Eye, Star, TrendingUp, Users, AlertCircle } from 'lucide-react';
import { db, auth } from '@/app/firebaseConfig';
import { collection, addDoc, query, orderBy, onSnapshot, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const ShiftNotesSystem = () => {
  const router = useRouter(); 
  const searchParams = useSearchParams(); 

  // URL State
  const [currentRole, setCurrentRole] = useState(null);
  const [isManagerView, setIsManagerView] = useState(false);
  const [urlParamsRead, setUrlParamsRead] = useState(false); // New state to ensure parameters are read first

  const [activeView, setActiveView] = useState('add');
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(true);

  // States for the authenticated user and their Firestore data
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);

  const [formData, setFormData] = useState({
    location: 'Ormond',
    shiftType: 'AM',
    role: '', 
    staffName: '', 
    notes: '',
    tags: []
  });

  const [filters, setFilters] = useState({
    location: 'all',
    dateFrom: '',
    dateTo: '',
    keyword: ''
  });

  const locations = ['Ormond', 'Flagler'];
  const shiftTypes = ['AM', 'PM'];
  const availableTags = ['Sales', 'Comps', 'Staffing', 'Issues', 'Maintenance', 'Training'];

  const roleColors = {
    Server: 'from-blue-400 to-blue-600',
    Host: 'from-emerald-400 to-emerald-600',
    Manager: 'from-purple-400 to-purple-600',
    Bartender: 'from-orange-400 to-amber-600',
    Cook: 'from-red-400 to-red-600'
  };
  const tagColors = {
    Sales: 'bg-gradient-to-r from-green-400 to-emerald-500 text-white',
    Comps: 'bg-gradient-to-r from-red-400 to-pink-500 text-white',
    Staffing: 'bg-gradient-to-r from-orange-400 to-amber-500 text-white',
    Issues: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white',
    Maintenance: 'bg-gradient-to-r from-gray-400 to-slate-500 text-white',
    Training: 'bg-gradient-to-r from-indigo-400 to-purple-500 text-white'
  };

  // --- 1. Read URL Parameters ---
  useEffect(() => {
    // Check if the component is running in the browser
    if (typeof window !== 'undefined') {
      const roleParam = searchParams.get('role');
      // 'isManager' parameter is a string in the URL, check if it's 'true'
      const managerParam = searchParams.get('isManager') === 'true';

      if (roleParam) {
        setCurrentRole(roleParam);
        setIsManagerView(managerParam);
      }
      setUrlParamsRead(true);
    }
  }, [searchParams]);

  // --- 2. Listen for auth state and fetch user data with Manager Fallback ---
  useEffect(() => {
    // Wait until URL parameters are confirmed to be read
    if (!urlParamsRead) return; 

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        
        let fetchedUserData = null;
        let docFound = false;

        // Determine primary collection based on the view
        const primaryCollectionName = isManagerView ? 'managers' : 'users';
        let collectionToUseForNotes = primaryCollectionName; // Default collection for notes

        // 1. Try to fetch from the primary/expected collection
        const primaryUserDocRef = doc(db, primaryCollectionName, user.uid);
        let primaryUserDoc = await getDoc(primaryUserDocRef);

        if (primaryUserDoc.exists()) {
          fetchedUserData = primaryUserDoc.data();
          docFound = true;
        } 
        
        // 2. FALLBACK: If the manager is NOT found in 'managers', check 'users'
        // This solves the common issue of managers not being duplicated in both collections.
        if (isManagerView && !docFound) {
           console.warn("Manager not found in 'managers' collection. Checking 'users' collection as fallback.");
           const fallbackUserDocRef = doc(db, 'users', user.uid);
           const fallbackUserDoc = await getDoc(fallbackUserDocRef);
           
           if (fallbackUserDoc.exists()) {
               fetchedUserData = fallbackUserDoc.data();
               docFound = true;
               // Important: If we use the fallback, future notes should still be stored 
               // in the collection designated by the current view (managers).
               collectionToUseForNotes = primaryCollectionName; 
           }
        }
        
        if (docFound && fetchedUserData) {
          setUserData({ ...fetchedUserData, collection: collectionToUseForNotes });
          setFormData(prev => ({
            ...prev,
            staffName: fetchedUserData.fullName || '',
            role: currentRole || fetchedUserData.role || '' 
          }));
        } else {
          console.error(`User data not found in either the ${primaryCollectionName} or fallback collections.`);
          setUserData(null);
        }
      } else {
        setCurrentUser(null);
        setUserData(null);
      }
      setUserLoading(false);
    });
    return () => unsubscribe();
  }, [urlParamsRead, isManagerView, currentRole]); 

  // --- 3. Fetch the current user's notes ---
  useEffect(() => {
    // Ensure all dependencies are available and user data is loaded
    if (!currentUser || !userData || !urlParamsRead) return;
    
    // Determine the collection to use for the notes subcollection
    const notesCollectionName = isManagerView ? 'managers' : 'users';
    
    // The query is on the subcollection of the authenticated user's document
    const notesRef = collection(db, notesCollectionName, currentUser.uid, 'notes');
    const q = query(notesRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));
      setNotes(notesData);
      setFilteredNotes(notesData);
    }, (error) => {
        // ERROR HANDLING: Crucial for debugging loading issues!
        console.error("Error fetching notes subcollection:", error);
        // If an error occurs (e.g., permission denied or subcollection path is wrong), 
        // this can stop the loading spinner for the user, showing empty data.
        setNotes([]);
        setFilteredNotes([]);
    });

    return () => unsubscribe();
  }, [currentUser, userData, urlParamsRead, isManagerView]);

  // --- 4. Handle Submit (Write Operation) ---
  const handleSubmit = async () => {
    if (!currentUser || !formData.notes.trim()) {
      alert('Please enter shift notes.');
      return;
    }

    setLoading(true);

    try {
      const now = new Date();
      const noteData = {
        ...formData,
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().slice(0, 5),
        timestamp: now,
        userId: currentUser.uid,
        userAvatar: userData?.avatar || null
      };

      // Determine the collection for notes storage based on the current view
      const userCollectionName = isManagerView ? 'managers' : 'users';
      const notesRef = collection(db, userCollectionName, currentUser.uid, 'notes');

      await addDoc(notesRef, noteData);

      // Reset form
      setFormData(prev => ({
        ...prev,
        notes: '',
        tags: []
      }));

      alert('🎉 Shift note added successfully!');
      setActiveView('view');
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Error adding note. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- 5. Handle Delete (Delete Operation) ---
  const handleDeleteNote = async (noteId) => {
    if (!currentUser) {
      alert('You must be logged in to delete notes.');
      return;
    }

    if (window.confirm("Are you sure you want to delete this note?")) {
      try {
        // Determine the collection for note deletion
        const userCollectionName = isManagerView ? 'managers' : 'users';
        const noteRef = doc(db, userCollectionName, currentUser.uid, 'notes', noteId);
        
        await deleteDoc(noteRef);
        alert('Note deleted successfully!');
      } catch (error) {
        console.error('Error deleting note:', error);
        alert('Error deleting note. Please try again.');
      }
    }
  };
  
  // --- Filtering and Stats (Unchanged Logic) ---
  const toggleTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const filterNotes = () => {
    let filtered = notes;

    if (filters.location !== 'all') {
      filtered = filtered.filter(note => note.location === filters.location);
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(note => note.date >= filters.dateFrom);
    }
    if (filters.dateTo) {
      filtered = filtered.filter(note => note.date <= filters.dateTo);
    }
    if (filters.keyword) {
      filtered = filtered.filter(note => 
        note.notes.toLowerCase().includes(filters.keyword.toLowerCase())
      );
    }
    setFilteredNotes(filtered);
  };

  useEffect(() => {
    filterNotes();
  }, [filters, notes]);

  const getDashboardStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayNotes = notes.filter(note => note.date === today);
    return {
      todayNotes: todayNotes.length,
      totalNotes: notes.length,
      thisWeek: notes.filter(note => {
        const noteDate = new Date(note.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return noteDate >= weekAgo;
      }).length
    };
  };

  const stats = getDashboardStats();
  
  // --- Loading/Error Handling UI ---
  // The component is stuck here if userData is null
  if (userLoading || !currentUser || !userData || !urlParamsRead) {
    return (
      <div className="text-center p-8 bg-white ">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800">
            {userLoading || !currentUser ? "Authenticating user..." : "Loading user profile data..."}
        </h2>
        {/* Helper message for Manager View debugging */}
        {isManagerView && !userData && !userLoading && (
             <p className="text-red-500 mt-2">
                 Error: Profile not found in 'managers' or 'users' collection. Check Firestore database setup.
             </p>
        )}
      </div>
    );
  }

  // Fallback for user name initial
  const userInitial = userData?.fullName ? userData.fullName.charAt(0).toUpperCase() : 'N';

  return (
    // ... (rest of the unchanged JSX/Design) ...
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #adcfc1ff, #8ef0a2ff)',
    }}>
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-gradient-to-br from-green-130 via-green-200 to-green-150 border-b border-green/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 via-green-300 to-green-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <Edit3 className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-900 to-green-600 bg-clip-text text-transparent">
                  My Shift Notes
                </h1>
                <p className="text-gray-600 font-medium">Personal Operations Log </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                  {/* Display name initial as avatar */}
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {userInitial}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{userData?.fullName}</p>
                    <p className="text-sm text-gray-600">{userData?.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center mt-6">
            <div className="bg-white/60 backdrop-blur-xl rounded-full p-2 border border-white/20 shadow-xl">
              <div className="flex space-x-2">
                {[
                  { id: 'add', label: 'Add Note', icon: Plus },
                  { id: 'view', label: 'My Notes', icon: Eye }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveView(id)}
                    className={`relative px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                      activeView === id
                        ? 'bg-gradient-to-r from-green-500 to-green-700 text-white shadow-lg transform scale-105'
                        : 'text-gray-700 hover:bg-white/50 hover:scale-105'
                    }`}
                  >
                    <Icon className="w-4 h-4 inline mr-2" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeView === 'add' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Add New Shift Note</h2>
                <p className="text-gray-600">Share what happened during your shift</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700">
                      <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
                      Location
                    </label>
                    <select
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    >
                      {locations.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700">
                      <Clock className="w-4 h-4 mr-2 text-indigo-500" />
                      Shift Type
                    </label>
                    <select
                      value={formData.shiftType}
                      onChange={(e) => setFormData(prev => ({ ...prev, shiftType: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    >
                      {shiftTypes.map(type => (
                        <option key={type} value={type}>{type} Shift</option>
                      ))}
                    </select>
                  </div>

                  {/* New fields: Staff Name and Role */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700">
                      <User className="w-4 h-4 mr-2 text-indigo-500" />
                      Staff Name
                    </label>
                    <input
                      type="text"
                      value={formData.staffName}
                      onChange={(e) => setFormData(prev => ({ ...prev, staffName: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700">
                      <Tag className="w-4 h-4 mr-2 text-indigo-500" />
                      Role
                    </label>
                    <input
                      type="text"
                      value={formData.role}
                      disabled
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl cursor-not-allowed text-gray-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-gray-700">
                    <Edit3 className="w-4 h-4 mr-2 text-indigo-500" />
                    What happened during your shift?
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={5}
                    className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                    placeholder="Share details like: special events, customer feedback, inventory issues, staffing notes, or anything noteworthy that happened..."
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center text-sm font-semibold text-gray-700">
                    <Tag className="w-4 h-4 mr-2 text-indigo-500" />
                    Category Tags (Optional)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availableTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                          formData.tags.includes(tag)
                            ? `${tagColors[tag]} shadow-lg transform scale-105`
                            : 'bg-white/70 text-gray-700 hover:bg-white/90 hover:scale-105 border border-white/20'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 via-green-700 to-green-400 text-white font-bold py-4 px-8 rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2"></div>
                      Adding Note...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 inline mr-2" />
                      Add Shift Note
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeView === 'view' && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Today's Notes", value: stats.todayNotes, icon: Calendar, color: 'from-blue-400 to-blue-600', bg: 'from-blue-50 to-blue-100' },
                { label: 'Total Notes', value: stats.totalNotes, icon: Edit3, color: 'from-green-400 to-green-600', bg: 'from-green-50 to-green-100' },
                { label: 'This Week', value: stats.thisWeek, icon: TrendingUp, color: 'from-purple-400 to-purple-600', bg: 'from-purple-50 to-purple-100' }
              ].map((stat, index) => (
                <div key={index} className={`bg-gradient-to-br ${stat.bg} backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 font-medium">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`w-14 h-14 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <stat.icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Filter className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Filter & Search</h2>
                </div>
                <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  {filteredNotes.length} Results
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  className="px-4 py-3 bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                >
                  <option value="all">🏢 All Locations</option>
                  {locations.map(loc => (
                    <option key={loc} value={loc}>📍 {loc}</option>
                  ))}
                </select>

                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  className="px-4 py-3 bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />

                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  className="px-4 py-3 bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={filters.keyword}
                    onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="🔍 Search notes..."
                  />
                </div>
              </div>
            </div>

            {/* Notes Display */}
            <div className="grid gap-6">
              {filteredNotes.map(note => (
                <div key={note.id} className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      {/* Note creator's name initial */}
                      <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {note.staffName?.charAt(0).toUpperCase() || 'N'}
                      </div>
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="font-bold text-gray-900">{note.staffName}</h3>
                          <span className={`px-3 py-1 bg-gradient-to-r ${roleColors[note.role]} text-white text-xs font-bold rounded-full shadow-lg`}>
                            {note.role}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {note.date}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {note.time}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {note.location}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                            {note.shiftType}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Delete button, visible only for the note's owner */}
                    {currentUser && note.userId === currentUser.uid && (
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-red-500 hover:text-red-700 transition-all duration-200 p-2 rounded-full hover:bg-red-50"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="bg-gray-50/50 rounded-2xl p-4 mb-4">
                    <p className="text-gray-800 leading-relaxed text-lg">{note.notes}</p>
                  </div>

                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {note.tags.map((tag, index) => (
                        <span
                          key={index}
                          className={`px-3 py-1 rounded-full text-sm font-semibold shadow-lg ${tagColors[tag] || 'bg-gray-100 text-gray-700'}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredNotes.length === 0 && (
              <div className="text-center py-16">

                <h3 className="text-2xl font-bold text-gray-900 mb-4">No shift notes yet</h3>
                <p className="text-gray-600 mb-6">Start documenting your shifts to build your work history.</p>
                <button
                  onClick={() => setActiveView('add')}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Add Your First Note
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftNotesSystem;