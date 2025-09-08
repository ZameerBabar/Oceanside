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

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState(null);
  const [statusEdit, setStatusEdit] = useState('');
  const [followUpEdit, setFollowUpEdit] = useState('');

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
  // Update Status + Follow-Up
  // ================================
  const handleUpdateIncident = async () => {
    if (!editingIncident) return;
    try {
      const incidentRef = doc(db, 'IncidentLog', editingIncident.id);
      await updateDoc(incidentRef, {
        status: statusEdit,
        followUp: followUpEdit
      });
      setEditModalOpen(false);
      setEditingIncident(null);
      setStatusEdit('');
      setFollowUpEdit('');
    } catch (error) {
      console.error('Error updating incident: ', error);
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
          <p className="mt-2 text-gray-600">
            Record Guest Complaints, accidents and maintenance issues in real time for better reporting and accountability.
          </p>
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
              {incidents.map((incident) => (
                <tr key={incident.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                  <td className="py-3 px-4">{incident.date}</td>
                  <td className="py-3 px-4">{incident.type}</td>

                  {/* ✅ Status + Edit Button */}
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(incident.status)}`}>
                        {incident.status}
                      </span>

                      {incident.status !== 'Closed' && (
                        <button
                          onClick={() => {
                            setEditingIncident(incident);
                            setStatusEdit(incident.status);
                            setFollowUpEdit(incident.followUp || '');
                            setEditModalOpen(true);
                          }}
                          className="text-gray-500 hover:text-green-600"
                        >
                          ✏️
                        </button>
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

      {/* Modal for New Incident */}
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

      {/* Modal for Edit Incident */}
      {editModalOpen && editingIncident && (
        <div className="fixed inset-0 bg-gradient-to-br from-[#34916aff] to-[#d4edc9] bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Update Incident</h2>

            {/* Status Options */}
            <label className="block mb-2 font-medium">Status</label>
            <select
              value={statusEdit}
              onChange={(e) => setStatusEdit(e.target.value)}
              className="w-full border p-2 rounded mb-4"
            >
              {editingIncident.status === 'Open' && (
                <>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </>
              )}
              {editingIncident.status === 'In Progress' && (
                <option value="Closed">Closed</option>
              )}
            </select>

            {/* Follow-up Field */}
            <label className="block mb-2 font-medium">Follow-up</label>
            <textarea
              rows="3"
              value={followUpEdit}
              onChange={(e) => setFollowUpEdit(e.target.value)}
              placeholder="Enter follow-up details..."
              className="w-full border p-2 rounded mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateIncident}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
