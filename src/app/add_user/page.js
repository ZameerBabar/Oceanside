'use client';

import React, { useState, useEffect } from 'react';
import { 
    sendPasswordResetEmail, 
    createUserWithEmailAndPassword, 
    updateProfile, 
    onAuthStateChanged, 
    signOut 
} from 'firebase/auth';
import { 
    doc, 
    setDoc, 
    getDocs, 
    collection, 
    updateDoc,
    getDoc,
    deleteDoc 
} from 'firebase/firestore';
import { 
    auth, 
    db,
    createEmployeeFunction,
    activateEmployeeFunction,
    deleteEmployeeFunction,
    resendInviteFunction
} from '../firebaseConfig';

const roles = ['Host', 'Server', 'Cook', 'Bartender', 'Manager'];
const locations = ['All', 'Flagler', 'Ormond'];
const statuses = ['Active', 'Inactive', 'Pending'];

const UserManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [isAddingEmployee, setIsAddingEmployee] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [locationFilter, setLocationFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
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
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isManager, setIsManager] = useState(false);

    // Auth state observer with manager check
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            
            // Check if user is a manager
            if (user) {
                try {
                    const managerDoc = await getDoc(doc(db, 'managers', user.uid));
                    if (managerDoc.exists()) {
                        const managerData = managerDoc.data();
                        setIsManager(managerData.role === 'Manager');
                        console.log('Manager verified:', managerData);
                    } else {
                        setIsManager(false);
                        console.log('User is not a manager');
                    }
                } catch (error) {
                    console.error('Error checking manager status:', error);
                    setIsManager(false);
                }
            } else {
                setIsManager(false);
            }
            
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Fetch employees when current user changes
    useEffect(() => {
        const fetchEmployees = async () => {
            if (!currentUser) return;
            try {
                const usersCol = collection(db, 'users');
                const managersCol = collection(db, 'managers');

                const usersSnapshot = await getDocs(usersCol);
                const managersSnapshot = await getDocs(managersCol);

                const userList = usersSnapshot.docs.map(doc => ({ 
                    id: doc.id, 
                    ...doc.data(), 
                    collectionName: 'users' 
                }));
                const managerList = managersSnapshot.docs.map(doc => ({ 
                    id: doc.id, 
                    ...doc.data(), 
                    collectionName: 'managers' 
                }));

                const sortedEmployees = [...userList, ...managerList].sort((a, b) => {
                    const aDate = a.createdAt ? a.createdAt.toDate() : new Date(0);
                    const bDate = b.createdAt ? b.createdAt.toDate() : new Date(0);
                    return bDate - aDate;
                });

                setEmployees(sortedEmployees);
            } catch (error) {
                console.error("Error fetching employees:", error);
            }
        };

        if (currentUser) {
            fetchEmployees();
        }
    }, [currentUser]);

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
        if (!isManager) {
            alert("Only managers can delete employees.");
            return;
        }
        setEmployeeToDelete(employee);
        setDeleteModalOpen(true);
    };

    const handleFinalDelete = async () => {
        if (!employeeToDelete) return;

        if (!isManager) {
            alert("Only managers can delete employees.");
            setDeleteModalOpen(false);
            return;
        }

        try {
            // Call Firebase Function
            const result = await deleteEmployeeFunction({
                uid: employeeToDelete.id,
                collectionName: employeeToDelete.collectionName
            });

            if (result.data.success) {
                // Update local state
                setEmployees(employees.filter(emp => emp.id !== employeeToDelete.id));
                alert('Employee deleted successfully!');
            } else {
                alert('Failed to delete employee: ' + result.data.message);
            }
            
        } catch (error) {
            console.error("Error deleting employee:", error);
            
            if (error.code === 'functions/permission-denied') {
                alert("Permission denied. Only managers can delete employees.");
            } else {
                alert(`Failed to delete employee: ${error.message}`);
            }
        } finally {
            setDeleteModalOpen(false);
            setEmployeeToDelete(null);
        }
    };

    const handleActivateEmployee = async (employee) => {
        if (!isManager) {
            alert("Only managers can activate employees.");
            return;
        }

        try {
            // Call Firebase Function
            const result = await activateEmployeeFunction({
                uid: employee.id,
                collectionName: employee.collectionName
            });

            if (result.data.success) {
                // Update local state
                setEmployees(employees.map(emp => 
                    emp.id === employee.id ? { ...emp, status: 'Active' } : emp
                ));
                alert('Employee activated successfully!');
            } else {
                alert('Failed to activate employee: ' + result.data.message);
            }
            
        } catch (error) {
            console.error("Error activating employee:", error);
            
            if (error.code === 'functions/permission-denied') {
                alert("Permission denied. Only managers can activate employees.");
            } else {
                alert(`Failed to activate employee: ${error.message}`);
            }
        }
    };

    const refreshEmployeeList = async () => {
        try {
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const managersSnapshot = await getDocs(collection(db, 'managers'));
            const userList = usersSnapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data(), 
                collectionName: 'users' 
            }));
            const managerList = managersSnapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data(), 
                collectionName: 'managers' 
            }));
            const sortedEmployees = [...userList, ...managerList].sort((a, b) => {
                const aDate = a.createdAt ? a.createdAt.toDate() : new Date(0);
                const bDate = b.createdAt ? b.createdAt.toDate() : new Date(0);
                return bDate - aDate;
            });
            setEmployees(sortedEmployees);
        } catch (error) {
            console.error("Error refreshing employee list:", error);
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
        if (!isManager) {
            alert("Only managers can add employees.");
            return;
        }

        try {
            // Create unique ID for employee
            const employeeId = doc(collection(db, 'temp')).id;
            
            const employeeData = {
                name: formState.name,
                email: formState.email,
                role: formState.role,
                location: formState.location,
                status: 'Pending',
                createdAt: new Date(),
                uid: employeeId,
                needsAuth: true // Flag to create auth later
            };

            const collectionName = formState.role === 'Manager' ? 'managers' : 'users';

            // Save to Firestore directly
            await setDoc(doc(db, collectionName, employeeId), employeeData);

            // Send invite email using a simple method
            await sendPasswordResetEmail(auth, formState.email).catch(() => {
                // If email doesn't exist in auth, we'll handle it later
                console.log('Email will be sent when user signs up');
            });

            alert('Employee added successfully! They will receive login instructions.');
            setIsAddingEmployee(false);
            await refreshEmployeeList();

        } catch (error) {
            console.error("Error saving employee:", error);
            alert("Failed to save employee: " + error.message);
        }
    };

    const handleResendInvite = async (employee) => {
        if (!isManager) {
            alert("Only managers can resend invites.");
            return;
        }
        
        try {
            // Call Firebase Function
            const result = await resendInviteFunction({
                email: employee.email,
                uid: employee.id,
                collectionName: employee.collectionName
            });

            if (result.data.success) {
                alert('Invite resent successfully!');
                await refreshEmployeeList();
            } else {
                alert('Failed to resend invite: ' + result.data.message);
            }
            
        } catch (error) {
            console.error("Error resending invite:", error);
            
            if (error.code === 'functions/permission-denied') {
                alert("Permission denied. Only managers can resend invites.");
            } else {
                alert('Failed to resend invite: ' + error.message);
            }
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-green-100">
                <p className="text-xl text-gray-700">Loading...</p>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-green-100">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Please log in to manage employees.</h1>
            </div>
        );
    }

    if (!isManager) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-green-100">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
                <p className="text-gray-600 mb-4">Only managers can access this page.</p>
                <button
                    onClick={() => signOut(auth)}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                >
                    Logout
                </button>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-green-50 to-green-100 relative overflow-hidden">
            <div className={`flex-1 p-8 transition-all duration-500 ease-in-out ${isAddingEmployee ? 'w-2/3' : 'w-full'}`}>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800">Employees</h1>
                        <p className="text-sm text-gray-600 mt-1">Logged in as: {currentUser.email} (Manager)</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={handleAddClick}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-transform transform hover:scale-105"
                        >
                            Add Employee
                        </button>
                        
                    </div>
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
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="All">All Roles</option>
                            {roles.map(role => <option key={role} value={role}>{role}</option>)}
                        </select>
                        <select
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                            className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="All">All Locations</option>
                            {locations.filter(loc => loc !== 'All').map(loc => <option key={loc} value={loc}>{loc}</option>)}
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="All">All Statuses</option>
                            {statuses.map(status => <option key={status} value={status}>{status}</option>)}
                        </select>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
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
                                            <td className="px-6 py-4 whitespace-nowrap font-medium">{employee.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">{employee.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{employee.role}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{employee.location}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(employee.status)} text-white`}>
                                                    {employee.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-2">
                                                    {employee.status !== 'Active' && (
                                                        <button 
                                                            onClick={() => handleActivateEmployee(employee)} 
                                                            className="text-green-600 hover:text-green-700 px-2 py-1 text-xs rounded border border-green-300"
                                                            title="Activate Employee"
                                                        >
                                                            Activate
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => handleDeleteClick(employee)} 
                                                        className="text-red-500 hover:text-red-700 p-1 rounded"
                                                        title="Delete Employee"
                                                    >
                                                        🗑️
                                                    </button>
                                                    {employee.status === 'Pending' && (
                                                        <button 
                                                            onClick={() => handleResendInvite(employee)} 
                                                            className="text-blue-500 hover:text-blue-700 px-2 py-1 text-xs rounded border border-blue-300"
                                                            title="Resend Invitation"
                                                        >
                                                            Resend
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No employees found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add Employee Sidebar */}
            {isAddingEmployee && (
                <div className="w-full sm:w-[450px] bg-white shadow-xl p-8 overflow-y-auto transition-all duration-500 ease-in-out">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-800">Add Employee</h2>
                        <button 
                            onClick={() => setIsAddingEmployee(false)} 
                            className="text-gray-500 hover:text-gray-800 text-4xl font-light"
                        >
                            ×
                        </button>
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formState.name}
                                onChange={handleInputChange}
                                className="w-full rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={formState.email}
                                onChange={handleInputChange}
                                className="w-full rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                            <select
                                name="role"
                                value={formState.role}
                                onChange={handleInputChange}
                                className="w-full rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                {roles.map(role => <option key={role} value={role}>{role}</option>)}
                            </select>
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                            <select
                                name="location"
                                value={formState.location}
                                onChange={handleInputChange}
                                className="w-full rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                {locations.filter(loc => loc !== 'All').map(loc => <option key={loc} value={loc}>{loc}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center mb-8">
                            <input
                                type="checkbox"
                                name="sendInvite"
                                checked={formState.sendInvite}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                required
                            />
                            <label className="ml-3 block text-sm text-gray-900 font-medium">
                                Send login email now *
                            </label>
                        </div>
                        <div className="flex justify-end gap-4 mt-8">
                            <button
                                type="button"
                                onClick={() => setIsAddingEmployee(false)}
                                className="py-3 px-6 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="py-3 px-6 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-colors"
                            >
                                Save Employee
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 shadow-xl w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Confirm Deletion</h3>
                        <p className="mb-6 text-gray-600">
                            Are you sure you want to delete <strong>{employeeToDelete?.name}</strong> from the database? 
                            This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-4">
                            <button 
                                onClick={() => setDeleteModalOpen(false)} 
                                className="py-2 px-4 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleFinalDelete} 
                                className="py-2 px-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;