'use client';

import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, sendPasswordResetEmail, createUserWithEmailAndPassword, updateProfile, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDocs, collection, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, firebaseConfig } from '../firebaseConfig';

const secondaryApp = initializeApp(firebaseConfig, 'Secondary');
const secondaryAuth = getAuth(secondaryApp);

const roles = ['Host', 'Server', 'Cook', 'Bartender', 'Manager'];
const locations = ['Flagler', 'Ormond'];
const statuses = ['Active', 'Inactive', 'Pending'];

const UserManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [isAddingEmployee, setIsAddingEmployee] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [locationFilter, setLocationFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [managerUsername, setManagerUsername] = useState('');

    const [formState, setFormState] = useState({
        name: '',
        email: '',
        role: 'Host',
        location: 'Flagler',
        status: 'Pending',
        sendInvite: false,
    });
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);
    const [openStatusDropdown, setOpenStatusDropdown] = useState(null);

    // Fetch employees from Firestore and get logged-in manager's info
    useEffect(() => {
        const fetchEmployees = async () => {
            const usersCol = collection(db, 'users');
            const managersCol = collection(db, 'managers');

            const usersSnapshot = await getDocs(usersCol);
            const managersSnapshot = await getDocs(managersCol);

            const userList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), collectionName: 'users' }));
            const managerList = managersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), collectionName: 'managers' }));

            const sortedEmployees = [...userList, ...managerList].sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());
            setEmployees(sortedEmployees);
        };
        
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setManagerUsername(user.email);
            } else {
                setManagerUsername('');
            }
        });

        fetchEmployees();
        return () => unsubscribe();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormState(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleAddClick = () => {
        setFormState({
            name: '',
            email: '',
            role: 'Host',
            location: 'Flagler',
            status: 'Pending',
            sendInvite: false,
        });
        setIsAddingEmployee(true);
    };

    const handleDeleteClick = (employee) => {
        if (employee.email === managerUsername) {
            alert("You cannot delete your own account.");
            return;
        }
        setEmployeeToDelete(employee);
        setDeleteModalOpen(true);
    };

    const handleFinalDelete = async () => {
        if (!employeeToDelete) return;

        const collectionName = employeeToDelete.collectionName;

        try {
            await deleteDoc(doc(db, collectionName, employeeToDelete.id));
            setEmployees(employees.filter(emp => emp.id !== employeeToDelete.id));
            alert('Employee document permanently deleted from Firestore.');
        } catch (error) {
            console.error("Error deleting document: ", error);
            alert("Failed to permanently delete the document. Please check permissions.");
        } finally {
            setDeleteModalOpen(false);
            setEmployeeToDelete(null);
        }
    };

    const handleStatusChange = async (newStatus, employee) => {
        const collectionName = employee.collectionName;
        try {
            await updateDoc(doc(db, collectionName, employee.id), { status: newStatus });
            setEmployees(employees.map(emp => emp.id === employee.id ? { ...emp, status: newStatus } : emp));
            setOpenStatusDropdown(null);
        } catch (error) {
            console.error("Error updating status: ", error);
        }
    };

    const handleSave = async () => {
        if (!formState.email || !formState.name) {
            alert("Please fill out all required fields.");
            return;
        }
        if (!formState.sendInvite) {
            alert("Please check the 'Send login email now' box to proceed.");
            return;
        }

        const employeeData = {
            name: formState.name,
            email: formState.email,
            role: formState.role,
            location: formState.location,
            status: 'Pending',
            createdAt: new Date(),
        };

        const collectionName = formState.role === 'Manager' ? 'managers' : 'users';

        try {
            const dummyPassword = Math.random().toString(36).slice(-8);
            const userCredential = await createUserWithEmailAndPassword(secondaryAuth, employeeData.email, dummyPassword);

            await updateProfile(userCredential.user, { displayName: employeeData.name });
            await setDoc(doc(db, collectionName, userCredential.user.uid), employeeData);
            await sendPasswordResetEmail(secondaryAuth, employeeData.email);

            alert('Employee added successfully!');

        } catch (error) {
            console.error("Error saving employee: ", error);
            alert("Failed to save employee. " + error.message);
        } finally {
            setIsAddingEmployee(false);
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const managersSnapshot = await getDocs(collection(db, 'managers'));
            const userList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), collectionName: 'users' }));
            const managerList = managersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), collectionName: 'managers' }));
            const sortedEmployees = [...userList, ...managerList].sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());
            setEmployees(sortedEmployees);
        }
    };

    const handleResendInvite = async (employee) => {
        try {
            await sendPasswordResetEmail(secondaryAuth, employee.email);
            alert('Invite resent successfully!');
        } catch (error) {
            alert('Failed to resend invite. ' + error.message);
        }
    };

    const filteredEmployees = employees.filter(employee => {
        const matchesSearch =
            employee.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            employee.email?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'All' || employee.role === roleFilter;
        const matchesLocation = locationFilter === 'All' || employee.location === locationFilter;
        const matchesStatus = statusFilter === 'All' || employee.status === statusFilter;
        return matchesSearch && matchesRole && matchesLocation && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'bg-green-500';
            case 'Inactive': return 'bg-red-500';
            case 'Pending': return 'bg-yellow-500';
            default: return 'bg-gray-400';
        }
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-green-800 to-green-200 relative overflow-hidden">
            <div className={`flex-1 p-8 transition-all duration-500 ease-in-out ${isAddingEmployee ? 'w-2/3' : 'w-full'}`}>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-4xl font-bold text-white">Employees</h1>
                        {managerUsername && <p className="text-white mt-2">Logged in as: <span className="font-semibold">{managerUsername}</span> (Manager)</p>}
                    </div>
                    <button
                        onClick={handleAddClick}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-transform transform hover:scale-105"
                    >
                        Add Employee
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-6">
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <input
                            type="text"
                            placeholder="Search by name or email"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <select
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="p-3 border border-gray-300 rounded-xl"
                        >
                            <option value="All">All Roles</option>
                            {roles.map(role => <option key={role} value={role}>{role}</option>)}
                        </select>
                        <select
                            onChange={(e) => setLocationFilter(e.target.value)}
                            className="p-3 border border-gray-300 rounded-xl"
                        >
                            <option value="All">All Locations</option>
                            {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                        </select>
                        <select
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="p-3 border border-gray-300 rounded-xl"
                        >
                            <option value="All">All Statuses</option>
                            {statuses.map(status => <option key={status} value={status}>{status}</option>)}
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name / Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredEmployees.length > 0 ? (
                                    filteredEmployees.map(employee => (
                                        <tr key={employee.id} className={employee.status === 'Inactive' ? 'text-gray-400' : ''}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                                                <div className="text-sm text-gray-500">{employee.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">{employee.role}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{employee.location}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-md ${getStatusColor(employee.status)} text-white`}>
                                                    {employee.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-2 relative">
                                                    {employee.status === 'Pending' ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusChange('Active', employee)}
                                                                className="py-1 px-3 border border-green-500 text-green-500 rounded-md text-xs font-semibold hover:bg-green-50 hover:text-green-600 transition-colors"
                                                            >
                                                                Activate
                                                            </button>
                                                            <button onClick={() => handleDeleteClick(employee)} className="text-gray-400 hover:text-gray-600">
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                                                    <path fillRule="evenodd" d="M16.5 4.475a.75.75 0 0 1 .722.568l.814 3.467m-1.558.74a.75.75 0 0 1-.582.568h-9.14a.75.75 0 0 1-.582-.568c.307-.123.69-.262 1.182-.36a9.231 9.231 0 0 1 6.076 0c.492.098.875.237 1.182.36ZM13.5 8.625a.75.75 0 0 1 .75.75v6.75a.75.75 0 0 1-1.5 0v-6.75a.75.75 0 0 1 .75-.75Zm-3 0a.75.75 0 0 1 .75.75v6.75a.75.75 0 0 1-1.5 0v-6.75a.75.75 0 0 1 .75-.75Zm.375-3.625a.75.75 0 0 1 .599.508l1.472 4.141a.75.75 0 0 1-.599.998l-7.462 1.492a.75.75 0 0 1-.998-.599L4.125 5.5a.75.75 0 0 1 .998-.599l3.468.995a.75.75 0 0 1 .995-.998l1.5-.429a.75.75 0 0 1 .429-1.5ZM19.5 9.75a.75.75 0 0 0-.75-.75H4.5a.75.75 0 0 0-.75.75V19.5a2.25 2.25 0 0 0 2.25 2.25h11.25A2.25 2.25 0 0 0 19.5 19.5V9.75Zm-1.5 1.5H6.75a.75.75 0 0 1 0-1.5h11.25a.75.75 0 0 1 0 1.5Z" clipRule="evenodd" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={() => handleResendInvite(employee)}
                                                                className="py-1 px-3 border border-blue-500 text-blue-500 rounded-md text-xs font-semibold hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                            >
                                                                Resend
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button onClick={() => handleDeleteClick(employee)} className="text-gray-400 hover:text-gray-600">
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                                                <path fillRule="evenodd" d="M16.5 4.475a.75.75 0 0 1 .722.568l.814 3.467m-1.558.74a.75.75 0 0 1-.582.568h-9.14a.75.75 0 0 1-.582-.568c.307-.123.69-.262 1.182-.36a9.231 9.231 0 0 1 6.076 0c.492.098.875.237 1.182.36ZM13.5 8.625a.75.75 0 0 1 .75.75v6.75a.75.75 0 0 1-1.5 0v-6.75a.75.75 0 0 1 .75-.75Zm-3 0a.75.75 0 0 1 .75.75v6.75a.75.75 0 0 1-1.5 0v-6.75a.75.75 0 0 1 .75-.75Zm.375-3.625a.75.75 0 0 1 .599.508l1.472 4.141a.75.75 0 0 1-.599.998l-7.462 1.492a.75.75 0 0 1-.998-.599L4.125 5.5a.75.75 0 0 1 .998-.599l3.468.995a.75.75 0 0 1 .995-.998l1.5-.429a.75.75 0 0 1 .429-1.5ZM19.5 9.75a.75.75 0 0 0-.75-.75H4.5a.75.75 0 0 0-.75.75V19.5a2.25 2.25 0 0 0 2.25 2.25h11.25A2.25 2.25 0 0 0 19.5 19.5V9.75Zm-1.5 1.5H6.75a.75.75 0 0 1 0-1.5h11.25a.75.75 0 0 1 0 1.5Z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No employees found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add Employee Form Section */}
            {isAddingEmployee && (
                <div className="w-full sm:w-[450px] bg-white shadow-xl p-8 overflow-y-auto transition-all duration-500 ease-in-out">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-800">Add Employee</h2>
                        <button onClick={() => setIsAddingEmployee(false)} className="text-gray-500 hover:text-gray-800 text-4xl font-light">×</button>
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formState.name}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-xl border border-gray-300 p-3"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formState.email}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-xl border border-gray-300 p-3"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700">Role</label>
                            <select
                                name="role"
                                value={formState.role}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-xl border border-gray-300 p-3"
                            >
                                {roles.map(role => <option key={role} value={role}>{role}</option>)}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700">Location</label>
                            <select
                                name="location"
                                value={formState.location}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-xl border border-gray-300 p-3"
                            >
                                {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center mb-6">
                            <input
                                type="checkbox"
                                name="sendInvite"
                                checked={formState.sendInvite}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-green-600 border-gray-300 rounded"
                                required
                            />
                            <label htmlFor="sendInvite" className="ml-2 block text-sm text-gray-900">
                                Send login email now
                            </label>
                        </div>
                        <div className="flex justify-end gap-4 mt-8">
                            <button
                                type="button"
                                onClick={() => setIsAddingEmployee(false)}
                                className="py-3 px-6 rounded-xl border border-gray-300 text-gray-700 font-bold"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="py-3 px-6 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700"
                            >
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && (
                <div className="fixed inset-0 bg-gray-200 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 shadow-lg w-full max-w-sm">
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Confirm Deletion</h3>
                        <p className="mb-6 text-gray-600">Are you sure you want to permanently delete this employee? This action cannot be undone.</p>
                        <div className="flex justify-end gap-4">
                            <button onClick={() => setDeleteModalOpen(false)} className="py-2 px-4 rounded-xl border border-gray-300 text-gray-700">
                                Cancel
                            </button>
                            <button onClick={handleFinalDelete} className="py-2 px-4 rounded-xl bg-red-600 text-white font-bold">
                                Permanent Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;