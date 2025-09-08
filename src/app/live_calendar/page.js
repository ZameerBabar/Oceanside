'use client';
import React, { useState } from 'react';

// ==========================================================
// Main App Component
// ==========================================================
const App = () => {
  const today = new Date();
  // Mock data for calendar events
  const [events, setEvents] = useState([
    { id: 1, title: 'Team Meeting', start: '2025-09-08T10:00:00', end: '2025-09-08T11:00:00', type: 'meeting', notes: 'Discuss Q4 goals.', manager: 'Aisha' },
    { id: 2, title: 'Client Call', start: '2025-09-09T14:30:00', end: '2025-09-09T15:00:00', type: 'call', notes: 'Follow-up on project.', manager: 'Farhan' },
    { id: 3, title: 'Project Review', start: '2025-09-10T09:00:00', end: '2025-09-10T10:30:00', type: 'meeting', notes: 'Review sprint progress.', manager: 'Usman' },
    { id: 4, title: 'Annual Inspection', start: '2025-09-11T13:00:00', end: '2025-09-11T16:00:00', type: 'inspection', notes: 'Health and safety check.', manager: 'Zainab' },
    { id: 5, title: 'Marketing Sync', start: '2025-09-12T11:30:00', end: '2025-09-12T12:00:00', type: 'promotion', notes: 'New campaign launch.', manager: 'Aisha' },
    { id: 6, title: 'Deadline for Q3 Report', start: '2025-09-12T17:00:00', end: '2025-09-12T17:30:00', type: 'deadline', notes: 'Submit report to leadership.', manager: 'Usman' },
  ]);

  // Form ko dikhane ya chhupane ke liye state
  const [showForm, setShowForm] = useState(false);
  // Naye event ke liye input fields ke state
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventStart, setNewEventStart] = useState('');
  const [newEventEnd, setNewEventEnd] = useState('');
  const [newEventType, setNewEventType] = useState('meeting');
  const [newEventNotes, setNewEventNotes] = useState('');
  const [newEventManager, setNewEventManager] = useState('');
  const [view, setView] = useState('weekly');

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const renderMonthlyView = () => {
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const leadingBlanks = Array.from({ length: (firstDay + 6) % 7 }, (_, i) => null);
    const allDays = [...leadingBlanks, ...daysArray];

    return (
      <div className="grid grid-cols-7 gap-1 border border-gray-200 rounded-xl overflow-hidden shadow-inner bg-white">
        {days.map((day, index) => (
          <div key={index} className="p-4 text-center font-bold text-gray-800 bg-gray-100 border-b border-l border-gray-200">
            {day}
          </div>
        ))}
        {allDays.map((day, index) => (
          <div key={index} className="relative p-2 h-24 border-b border-l border-gray-200">
            {day && (
              <span className="text-sm font-semibold text-gray-700">{day}</span>
            )}
            {day && events.filter(event => {
                const eventDate = new Date(event.start);
                return eventDate.getFullYear() === year && eventDate.getMonth() === month && eventDate.getDate() === day;
            }).map(event => (
              <div
                key={event.id}
                className={`mt-1 p-1 rounded-md text-xs font-semibold overflow-hidden whitespace-nowrap overflow-ellipsis border-2 ${getEventColor(event.type)}`}
              >
                {event.title}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };
  
  // Calendar ke liye hard-coded data
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const times = Array.from({ length: 10 }, (_, i) => `${(9 + i) > 12 ? (9 + i) - 12 : (9 + i)}:00 ${ (9 + i) >= 12 ? 'PM' : 'AM'}`);

  const getEventColor = (type) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-200 text-blue-800 border-blue-400';
      case 'call':
        return 'bg-green-200 text-green-800 border-green-400';
      case 'task':
        return 'bg-purple-200 text-purple-800 border-purple-400';
      case 'promotion':
        return 'bg-amber-200 text-amber-800 border-amber-400';
      case 'catering':
        return 'bg-rose-200 text-rose-800 border-rose-400';
      case 'inspection':
        return 'bg-red-200 text-red-800 border-red-400';
      case 'deadline':
        return 'bg-slate-200 text-slate-800 border-slate-400';
      default:
        return 'bg-gray-200 text-gray-800 border-gray-400';
    }
  };
  
  const handleAddNewEvent = (e) => {
    e.preventDefault();
    if (!newEventTitle || !newEventStart || !newEventEnd) {
      console.error('Please fill out all required fields.'); 
      return;
    }
    
    const newEvent = {
      id: events.length + 1,
      title: newEventTitle,
      start: newEventStart,
      end: newEventEnd,
      type: newEventType,
      notes: newEventNotes,
      manager: newEventManager
    };

    setEvents([newEvent, ...events]);
    
    // Form ko reset aur chhupana
    setNewEventTitle('');
    setNewEventStart('');
    setNewEventEnd('');
    setNewEventType('meeting');
    setNewEventNotes('');
    setNewEventManager('');
    setShowForm(false);
  };

  const getDayIndex = (dateString) => {
    const date = new Date(dateString);
    // getDay() returns 0 for Sunday, 1 for Monday etc. We want Monday to be 0 for our array.
    return (date.getDay() + 6) % 7;
  };
  
  const sortedUpcomingEvents = [...events].sort((a, b) => new Date(a.start) - new Date(b.start));
  const upcomingEvents = sortedUpcomingEvents.filter(event => new Date(event.start) >= today).slice(0, 5);

  return (
    <div className="flex flex-col min-h-screen font-sans bg-gradient-to-br from-[#34916aff] to-[#d4edc9] items-center justify-center p-10">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-screen-xl">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-green-800">Live Calendar</h1>
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-700">Today's Date</p>
            <p className="text-sm text-gray-500">{today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        
        {/* Add Event button and View Toggle */}
        <div className="flex justify-between items-center mb-6 flex-wrap space-y-4 md:space-y-0">
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-full shadow-lg hover:bg-green-700 transition-colors duration-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 4v16m-8-8h16" />
            </svg>
            <span>Add New Events</span>
          </button>
          <div className="flex space-x-2">
            <button
              onClick={() => setView('weekly')}
              className={`px-4 py-2 rounded-full font-semibold transition-colors ${view === 'weekly' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Weekly
            </button>
            <button
              onClick={() => setView('monthly')}
              className={`px-4 py-2 rounded-full font-semibold transition-colors ${view === 'monthly' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Monthly
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
          {/* Main Calendar View */}
          <div className="flex-1">
            {view === 'weekly' ? (
              <div className="grid grid-cols-8 gap-1 border border-gray-200 rounded-xl overflow-hidden shadow-inner bg-white">
                {/* Top-left empty corner */}
                <div className="col-span-1 p-2 text-center text-sm font-semibold text-gray-700"></div>
                {/* Days of the week header */}
                {days.map((day, index) => (
                  <div key={index} className="col-span-1 p-4 text-center font-bold text-gray-800 bg-gray-100 border-l border-gray-200">
                    {day}
                  </div>
                ))}

                {/* Time slots and events */}
                {times.map((time, timeIndex) => (
                  <React.Fragment key={timeIndex}>
                    {/* Time slot column */}
                    <div className="col-span-1 p-4 text-center text-sm font-medium text-gray-600 border-b border-gray-200 flex items-center justify-center">
                      {time}
                    </div>
                    {/* Event grid */}
                    {days.map((day, dayIndex) => (
                      <div key={`${timeIndex}-${dayIndex}`} className="relative col-span-1 p-2 h-20 border-b border-l border-gray-200 hover:bg-gray-50 transition-colors">
                        {/* Event rendering */}
                        {events.filter(event => getDayIndex(event.start) === dayIndex && new Date(event.start).getHours() === (9 + timeIndex)).map(event => (
                          <div
                            key={event.id}
                            className={`absolute top-0 left-0 right-0 m-1 p-2 rounded-lg text-xs font-semibold overflow-hidden whitespace-nowrap overflow-ellipsis border-2 ${getEventColor(event.type)}`}
                            style={{ height: `${(new Date(event.end) - new Date(event.start)) / (1000 * 60)}px` }}
                          >
                            {event.title}
                          </div>
                        ))}
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              renderMonthlyView()
            )}
          </div>

          {/* Upcoming Events Sidebar */}
          <div className="w-full lg:w-1/4 bg-gradient-to-br from-[#34916aff] to-[#d4edc9] p-6 rounded-3xl shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-4">Upcoming Events</h2>
            <div className="space-y-4">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map(event => (
                  <div key={event.id} className="p-4 rounded-xl border-l-4 border-white shadow-sm">
                    <p className="text-xs text-white">{new Date(event.start).toLocaleDateString()}</p>
                    <p className="font-semibold text-white">{event.title}</p>
                    <p className="text-sm text-white capitalize">{event.type}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No upcoming events.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal for adding a new incident */}
      {showForm && (
        <div className="fixed inset-0 bg-gradient-to-br from-[#34916aff] to-[#d4edc9] bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div className="relative bg-white rounded-3xl shadow-xl p-8 w-full max-w-xl mx-4">
            <h2 className="text-2xl font-bold mb-6 text-gray-700">Add New Events</h2>
            <form onSubmit={handleAddNewEvent}>
              <div className="grid grid-cols-1 gap-4">
            
                
                <input
                  type="datetime-local"
                  value={newEventEnd}
                  onChange={(e) => setNewEventEnd(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                <select
                  value={newEventType}
                  onChange={(e) => setNewEventType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="meeting">Team Meeting</option>
                  <option value="promotion">Promotion</option>
                  <option value="catering">Catering</option>
                  <option value="inspection">Inspection</option>
                  <option value="deadline">Deadline</option>
                </select>
                <input
                  type="text"
                  value={newEventManager}
                  onChange={(e) => setNewEventManager(e.target.value)}
                  placeholder="Assigned Manager"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <textarea
                  value={newEventNotes}
                  onChange={(e) => setNewEventNotes(e.target.value)}
                  placeholder="Notes (Optional)"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                ></textarea>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors duration-300"
                >
                  Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
