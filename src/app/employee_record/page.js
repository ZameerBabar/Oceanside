'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';

const EmployeeRecord = () => {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showDisciplinaryForm, setShowDisciplinaryForm] = useState(false);
    const [newLog, setNewLog] = useState({ date: '', note: '' });
    const [isEditingNote, setIsEditingNote] = useState(false);
    const [editNoteId, setEditNoteId] = useState(null);
    const [editNoteText, setEditNoteText] = useState('');
    const [feedback, setFeedback] = useState({ message: '', type: '' });

    const auth = getAuth();
    const user = auth.currentUser;

    const displayFeedback = (message, type) => {
        setFeedback({ message, type });
        setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
    };

    const getProfileAvatar = (name) => {
        const initial = name ? name.charAt(0).toUpperCase() : '?';
        const colors = ['#10B981', '#06B6D4', '#6366F1', '#EC4899', '#F97316'];
        const hash = initial.charCodeAt(0) + initial.charCodeAt(initial.length - 1);
        const color = colors[hash % colors.length];

        return (
            <div
                style={{ backgroundColor: color }}
                className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white text-xl md:text-2xl font-bold shadow-lg flex-shrink-0"
            >
                {initial}
            </div>
        );
    };

    useEffect(() => {
        const fetchEmployees = async () => {
            setLoading(true);
            try {
                const usersCol = collection(db, 'users');
                const managersCol = collection(db, 'managers');

                const usersSnapshot = await getDocs(usersCol);
                const managersSnapshot = await getDocs(managersCol);

                const allEmployees = [
                    ...usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), collectionName: 'users' })),
                    ...managersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), collectionName: 'managers' }))
                ];

                const sortedEmployees = allEmployees.sort((a, b) => a.name.localeCompare(b.name));
                setEmployees(sortedEmployees);

                if (sortedEmployees.length > 0) {
                    setSelectedEmployee(sortedEmployees[0]);
                }

            } catch (error) {
                console.error("Error fetching employees: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployees();
    }, []);

    useEffect(() => {
        if (selectedEmployee) {
            const fetchDetailedRecord = async () => {
                const logsCollectionRef = collection(db, selectedEmployee.collectionName, selectedEmployee.id, 'disciplinaryLogs');
                const q = query(logsCollectionRef, orderBy("date", "desc"));
                const logsSnapshot = await getDocs(q);
                const logsData = logsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                const employeeRecord = {
                    ...selectedEmployee,
                    disciplinaryLogs: logsData,
                    trainingCompletion: {
                        'Employee Handbook': 100,
                        'Server Training': 65,
                        'Customer Service': 80,
                    },
                };
                setSelectedEmployee(employeeRecord);
            };
            fetchDetailedRecord();
        }
    }, [selectedEmployee?.id]);

    const handleSelectEmployee = (employee) => {
        setSelectedEmployee(employee);
    };

    const handleAddLog = async () => {
        if (!newLog.date || !newLog.note) {
            displayFeedback('Date and note are required.', 'error');
            return;
        }

        try {
            const logsCollectionRef = collection(db, selectedEmployee.collectionName, selectedEmployee.id, 'disciplinaryLogs');
            const newDoc = await addDoc(logsCollectionRef, {
                ...newLog,
                date: new Date(newLog.date),
                createdAt: serverTimestamp(),
            });

            const updatedLogs = [{ ...newLog, id: newDoc.id, date: new Date(newLog.date) }, ...selectedEmployee.disciplinaryLogs];
            setSelectedEmployee({ ...selectedEmployee, disciplinaryLogs: updatedLogs });
            
            setShowDisciplinaryForm(false);
            setNewLog({ date: '', note: '' });
            displayFeedback('Disciplinary log added successfully!', 'success');
        } catch (error) {
            console.error("Error adding disciplinary log: ", error);
            displayFeedback('Failed to add log.', 'error');
        }
    };

    const handleDeleteLog = async (logId) => {
        if (!window.confirm("Are you sure you want to delete this log?")) return;

        try {
            const logDocRef = doc(db, selectedEmployee.collectionName, selectedEmployee.id, 'disciplinaryLogs', logId);
            await deleteDoc(logDocRef);

            const updatedLogs = selectedEmployee.disciplinaryLogs.filter(log => log.id !== logId);
            setSelectedEmployee({ ...selectedEmployee, disciplinaryLogs: updatedLogs });
            displayFeedback('Disciplinary log deleted successfully!', 'success');

        } catch (error) {
            console.error("Error deleting disciplinary log: ", error);
            displayFeedback('Failed to delete log.', 'error');
        }
    };

    const handleEditNoteClick = (log) => {
        setIsEditingNote(true);
        setEditNoteId(log.id);
        setEditNoteText(log.note);
    };

    const handleSaveNote = async () => {
        if (!editNoteText) {
            displayFeedback('Note cannot be empty.', 'error');
            return;
        }

        try {
            const logDocRef = doc(db, selectedEmployee.collectionName, selectedEmployee.id, 'disciplinaryLogs', editNoteId);
            await updateDoc(logDocRef, { note: editNoteText });

            const updatedLogs = selectedEmployee.disciplinaryLogs.map(log =>
                log.id === editNoteId ? { ...log, note: editNoteText } : log
            );
            setSelectedEmployee({ ...selectedEmployee, disciplinaryLogs: updatedLogs });

            setIsEditingNote(false);
            setEditNoteId(null);
            setEditNoteText('');
            displayFeedback('Note updated successfully!', 'success');
        } catch (error) {
            console.error("Error updating note: ", error);
            displayFeedback('Failed to update note.', 'error');
        }
    };

    const handleCancelEdit = () => {
        setIsEditingNote(false);
        setEditNoteId(null);
        setEditNoteText('');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-gray-600 text-lg">Loading employee data...</div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-green-50 font-sans">
            {/* Left Column: Employee List */}
            <div className="w-64 flex-shrink-0 bg-gradient-to-br from-[#34916aff] to-[#d4edc9] shadow-xl overflow-y-auto p-4 border-r border-gray-200">
               
                <ul className="space-y-3">
                    {employees.map(employee => (
                        <li
                            key={employee.id}
                            onClick={() => handleSelectEmployee(employee)}
                            className={`p-3 rounded-xl cursor-pointer transition-colors flex items-center space-x-3
                            ${selectedEmployee?.id === employee.id ? 'bg-green-100 text-green-800 font-semibold' : 'hover:bg-gray-100 text-gray-700'}`}
                        >
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 text-lg font-bold text-gray-600">
                                {employee.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <p className="text-md">{employee.name}</p>
                                <p className="text-xs opacity-70">{employee.role}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Right Column: Employee Record Details */}
            <div className="flex-1 p-8 bg-gradient-to-br from-green-800 to-green-200">
                {feedback.message && (
                    <div className={`p-4 mb-4 rounded-xl font-medium ${feedback.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {feedback.message}
                    </div>
                )}
                {selectedEmployee ? (
                    <div className="space-y-6">
                        {/* Header Section */}
                        <div className="bg-gradient-to-br from-green-500 to-emerald-400 text-white rounded-2xl shadow-lg p-6 flex items-center space-x-6">
                            {getProfileAvatar(selectedEmployee.name)}
                            <div>
                                <h1 className="text-3xl font-extrabold">{selectedEmployee.name}</h1>
                                <p className="text-md font-medium opacity-90 mt-1">{selectedEmployee.role} | {selectedEmployee.location}</p>
                            </div>
                        </div>

                        {/* Detail Cards Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Training Completion Card */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Training Completion</h3>
                                {selectedEmployee.trainingCompletion && Object.entries(selectedEmployee.trainingCompletion).map(([training, progress]) => (
                                    <div key={training} className="mb-4">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-gray-700 font-medium text-sm">{training}</span>
                                            <span className="text-sm font-bold text-green-600">{progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-green-500 h-2 rounded-full transition-all duration-500 ease-out"
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Disciplinary Logs Summary Card */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Logs</h3>
                                {selectedEmployee.disciplinaryLogs?.length > 0 ? (
                                    selectedEmployee.disciplinaryLogs.slice(0, 3).map((log, index) => (
                                        <div key={index} className="border-b pb-3 mb-3 last:border-0 last:pb-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <p className="text-sm font-medium text-gray-800">{log.note}</p>
                                                <span className="text-xs text-gray-400">{log.date?.toDate().toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-sm">No recent logs found.</p>
                                )}
                            </div>
                        </div>

                        {/* Full Disciplinary Logs Section */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Full Disciplinary Log</h2>
                            <button
                                onClick={() => setShowDisciplinaryForm(!showDisciplinaryForm)}
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-xl mb-4 transition-colors text-sm"
                            >
                                {showDisciplinaryForm ? 'Cancel' : 'Add New Entry'}
                            </button>

                            {showDisciplinaryForm && (
                                <div className="mb-4 p-4 border border-gray-200 rounded-xl bg-gray-50 transition-all duration-300">
                                    <h3 className="text-md font-semibold mb-2">New Log Entry</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <input
                                            type="date"
                                            value={newLog.date}
                                            onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
                                            className="p-2 border border-gray-300 rounded-xl text-sm"
                                        />
                                        <textarea
                                            value={newLog.note}
                                            onChange={(e) => setNewLog({ ...newLog, note: e.target.value })}
                                            placeholder="Enter disciplinary note..."
                                            className="p-2 border border-gray-300 rounded-xl text-sm md:col-span-2"
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2 mt-3">
                                        <button onClick={handleAddLog} className="py-2 px-4 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-colors text-sm">Save</button>
                                    </div>
                                </div>
                            )}

                            {selectedEmployee.disciplinaryLogs?.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Note</th>
                                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {selectedEmployee.disciplinaryLogs.map(log => (
                                                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{log.date?.toDate().toLocaleDateString()}</td>
                                                    <td className="px-4 py-3">
                                                        {isEditingNote && editNoteId === log.id ? (
                                                            <textarea
                                                                value={editNoteText}
                                                                onChange={(e) => setEditNoteText(e.target.value)}
                                                                className="w-full p-1 border rounded-md text-sm"
                                                            />
                                                        ) : (
                                                            <span className="text-gray-800 text-sm">{log.note}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                                        {isEditingNote && editNoteId === log.id ? (
                                                            <div className="flex space-x-2">
                                                                <button onClick={handleSaveNote} className="text-green-600 hover:text-green-800 text-sm">Save</button>
                                                                <button onClick={handleCancelEdit} className="text-gray-600 hover:text-gray-800 text-sm">Cancel</button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex space-x-2">
                                                                <button onClick={() => handleEditNoteClick(log)} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                                                                <button onClick={() => handleDeleteLog(log.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-6 text-sm">No disciplinary logs found for this employee.</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500 text-xl">Select an employee from the list to view their record.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeRecord;