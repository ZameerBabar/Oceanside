'use client';
import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, onSnapshot, updateDoc, doc } from 'firebase/firestore';

const App = () => {
  const [incidents, setIncidents] = useState([]);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newType, setNewType] = useState('Guest Complaint');
  const [newStatus, setNewStatus] = useState('Open');
  const [newDescription, setNewDescription] = useState('');
  const [newReportedBy, setNewReportedBy] = useState('');
  const [newFollowUp, setNewFollowUp] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);

  const incidentTypes = ['Guest Complaint', 'Staff Injury', 'Maintenance'];
  const statusOptions = ['Open', 'In Progress', 'Closed'];

  // ================================
  // Realtime listener for Firestore
  // ================================
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'IncidentLog'), (snapshot) => {
      const incidentData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setIncidents(incidentData.sort((a, b) => new Date(b.date) - new Date(a.date)));
    });
    return () => unsubscribe();
  }, []);

  // ================================
  // Add New Incident
  // ================================
  const handleAddNewIncident = async (e) => {
    e.preventDefault();
    if (!newDate || !newDescription || !newReportedBy) {
      console.error('Please fill all required fields.');
      return;
    }

    try {
      await addDoc(collection(db, 'IncidentLog'), {
        date: newDate,
        type: newType,
        status: newStatus,
        description: newDescription,
        reportedBy: newReportedBy,
        followUp: newFollowUp
      });

      setNewDate('');
      setNewDescription('');
      setNewReportedBy('');
      setNewFollowUp('');
      setShowForm(false);
    } catch (error) {
      console.error('Error adding incident: ', error);
    }
  };

  // ================================
  // Update Status
  // ================================
  const handleStatusChange = async (id, newStatus) => {
    try {
      const incidentRef = doc(db, 'IncidentLog', id);
      await updateDoc(incidentRef, { status: newStatus });
      setEditingIndex(null);
    } catch (error) {
      console.error('Error updating status: ', error);
    }
  };

  // Status color helper
  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-yellow-300 text-yellow-800';
      case 'In Progress': return 'bg-blue-300 text-blue-800';
      case 'Closed': return 'bg-green-300 text-green-800';
      default: return 'bg-gray-300 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-gradient-to-br from-[#34916aff] to-[#d4edc9] items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-12 w-full max-w-screen-xl">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-green-700">Incident Log</h1>
          <p className="mt-2 text-gray-600">Recod Guest Complaints, accidents and maintenance issues in real time for better reporting and accountability.</p>
        </div>

        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-full shadow-lg hover:bg-green-700 transition mb-6">
          <span>Add New Incident</span>
        </button>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200 text-left text-gray-600 font-medium">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Reported By</th>
                <th className="py-3 px-4">Follow-Up</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((incident, index) => (
                <tr key={incident.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                  <td className="py-3 px-4">{incident.date}</td>
                  <td className="py-3 px-4">{incident.type}</td>

                  {/* ✅ FIXED DROPDOWN HERE */}
                  <td className="py-3 px-4 relative overflow-visible">
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(incident.status)}`}>
                        {incident.status}
                      </span>

                      {incident.status !== 'Closed' && (
                        <div className="relative">
                          <svg
                            onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-gray-500 cursor-pointer hover:text-green-600"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>

                          {editingIndex === index && (
                            <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border">
                              {incident.status === 'Open' && (
                                <>
                                  <button
                                    onClick={() => handleStatusChange(incident.id, 'In Progress')}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    In Progress
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(incident.id, 'Closed')}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    Closed
                                  </button>
                                </>
                              )}
                              {incident.status === 'In Progress' && (
                                <button
                                  onClick={() => handleStatusChange(incident.id, 'Closed')}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  Closed
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4">{incident.description}</td>
                  <td className="py-3 px-4">{incident.reportedBy}</td>
                  <td className="py-3 px-4">{incident.followUp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gradient-to-br from-[#34916aff] to-[#d4edc9] bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-xl">
            <h2 className="text-2xl font-bold mb-6 text-green-700">Add New Incident</h2>
            <form onSubmit={handleAddNewIncident}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} required
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500" />
                <select value={newType} onChange={(e) => setNewType(e.target.value)} className="w-full p-3 border rounded-xl">
                  {incidentTypes.map(type => <option key={type}>{type}</option>)}
                </select>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full p-3 border rounded-xl">
                  {statusOptions.map(status => <option key={status}>{status}</option>)}
                </select>
                <input type="text" value={newReportedBy} onChange={(e) => setNewReportedBy(e.target.value)} placeholder="Reported by"
                  className="w-full p-3 border rounded-xl col-span-1" required />
                <input type="text" value={newFollowUp} onChange={(e) => setNewFollowUp(e.target.value)} placeholder="Follow-up (Optional)"
                  className="w-full p-3 border rounded-xl col-span-1" />
                <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Description"
                  className="w-full p-3 border rounded-xl col-span-full" rows="3" required></textarea>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 border rounded-xl">Cancel</button>
                <button type="submit" className="px-6 py-3 bg-green-600 text-white rounded-xl">Add Incident</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
