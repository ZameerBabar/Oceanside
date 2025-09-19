'use client';

import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import {
  signInAnonymously,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [history, setHistory] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [newAssignee, setNewAssignee] = useState('Sarah');
  const [newDueDate, setNewDueDate] = useState('');
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  // New states for editing tasks
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editDescription, setEditDescription] = useState('');
  const [editAssignee, setEditAssignee] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [completedByName, setCompletedByName] = useState('');
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState(null);

  const teamMembers = ['Tony', 'Anna', 'Johnny', 'Dan'];

  // ✅ Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        const result = await signInAnonymously(auth);
        setUserId(result.user.uid);
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // ✅ Real-time tasks & history
  useEffect(() => {
    if (!isAuthReady || !userId) return;

    const tasksRef = collection(db, 'Manager Task');
    const unsubscribeTasks = onSnapshot(query(tasksRef), (snapshot) => {
      setTasks(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const historyRef = collection(db, 'History');
    const unsubscribeHistory = onSnapshot(query(historyRef), (snapshot) => {
      setHistory(snapshot.docs.map((doc) => doc.data()).reverse());
    });

    return () => {
      unsubscribeTasks();
      unsubscribeHistory();
    };
  }, [isAuthReady, userId]);

  // ✅ Add Task (NO History add here)
  const handleAddTask = async () => {
    if (!newTask || !newDueDate) {
      alert('Please fill all fields.');
      return;
    }

    setIsAdding(true);

    const today = new Date().toISOString().split('T')[0];
    const selectedDate = new Date(newDueDate).toISOString().split('T')[0];

    let displayDueDate =
      selectedDate === today
        ? 'Today'
        : selectedDate ===
          new Date(Date.now() + 86400000).toISOString().split('T')[0]
          ? 'Tomorrow'
          : new Date(newDueDate).toLocaleDateString();

    const newTodoTask = {
      description: newTask,
      assignee: newAssignee,
      status: 'To Do',
      dueDate: displayDueDate,
      lastUpdated: new Date().toLocaleDateString(),
      createdBy: userId,
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'Manager Task'), newTodoTask);

      setNewTask('');
      setNewDueDate('');
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Failed to add task.');
    } finally {
      setIsAdding(false);
    }
  };

  // ✅ Handle Edit Click
  const handleEditClick = (task) => {
    setEditingTask(task);
    setEditDescription(task.description);
    setEditAssignee(task.assignee);
    setEditDueDate(
      task.dueDate === 'Today' || task.dueDate === 'Tomorrow'
        ? ''
        : new Date(task.dueDate).toISOString().split('T')[0]
    );
    setEditModalOpen(true);
  };

  // ✅ Update Task & Log to History
  const handleUpdateTask = async () => {
    if (!editingTask) return;

    const today = new Date().toISOString().split('T')[0];
    const selectedDate = new Date(editDueDate).toISOString().split('T')[0];
    let displayDueDate = editDueDate;

    if (editDueDate) {
      if (selectedDate === today) {
        displayDueDate = 'Today';
      } else if (selectedDate === new Date(Date.now() + 86400000).toISOString().split('T')[0]) {
        displayDueDate = 'Tomorrow';
      } else {
        displayDueDate = new Date(editDueDate).toLocaleDateString();
      }
    } else {
      displayDueDate = editingTask.dueDate;
    }
  
    try {
      const taskRef = doc(db, 'Manager Task', editingTask.id);
      await updateDoc(taskRef, {
        description: editDescription,
        assignee: editAssignee,
        dueDate: displayDueDate,
        lastUpdated: new Date().toLocaleDateString(),
      });

      // Add to History
      await addDoc(collection(db, 'History'), {
        description: `Task updated: "${editingTask.description}" to "${editDescription}"`,
        lastUpdated: new Date().toLocaleDateString(),
        type: 'Updated',
        updatedBy: 'Manager', // Temporarily using 'Manager'
      });

      setEditModalOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // ✅ Handle Completion Prompt
  const handleCompletionPrompt = (task) => {
    setTaskToComplete(task);
    setCompleteModalOpen(true);
  };

  // ✅ Complete Task & Log to History
  const handleTaskCompletion = async () => {
    if (!taskToComplete) return;

    try {
      // Step 1: Add to History
      await addDoc(collection(db, 'History'), {
        ...taskToComplete,
        status: 'Completed',
        lastUpdated: new Date().toLocaleDateString(),
        completedAt: serverTimestamp(),
        type: 'Completed by ' + (completedByName || 'Anonymous'),
      });

      // Step 2: Remove from Manager Task
      await deleteDoc(doc(db, 'Manager Task', taskToComplete.id));

      setCompleteModalOpen(false);
      setTaskToComplete(null);
      setCompletedByName('');
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (!isAuthReady) return <p>Loading...</p>;

  return (
    <div className="flex flex-col min-h-screen font-sans bg-gradient-to-br from-[#34916aff] to-[#d4edc9] items-center">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-teal-500 text-white shadow-lg p-6 mb-6 w-full">
        <h1 className="text-3xl font-bold text-center">Manager Task Board</h1>
        <p className="text-sm text-center opacity-80">
          Create, assign, and track tasks for your team.
        </p>
      </header>

      <div className="p-4 w-[96%] max-w-screen-xl flex flex-col sm:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Add Task */}
          <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Add task"
                className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
              />
              <select
                value={newAssignee}
                onChange={(e) => setNewAssignee(e.target.value)}
                className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
              >
                {teamMembers.map((member) => (
                  <option key={member} value={member}>
                    {member}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                min={today}
                className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={handleAddTask}
                disabled={isAdding}
                className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-60"
              >
                {isAdding ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>

          {/* Task Board */}
          <div className="flex-1 bg-white rounded-2xl shadow-md p-6">
            <div className="grid grid-cols-5 gap-4 pb-2 border-b-2 border-gray-200 font-bold text-gray-700 text-sm">
              <span className="col-span-1">Task</span>
              <span className="col-span-1">Assigned to</span>
              <span className="col-span-1">Due date</span>
              <span className="col-span-1">Last updated</span>
              <span className="col-span-1">Actions</span>
            </div>
            <div className="mt-4 space-y-3">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="grid grid-cols-5 gap-4 items-center text-sm border-b py-2"
                  >
                    <div className="flex items-center col-span-1">
                      <input
                        type="checkbox"
                        className="mr-2"
                        onChange={() => handleCompletionPrompt(task)}
                      />
                      <span>{task.description}</span>
                    </div>
                    <span>{task.assignee}</span>
                    <span>{task.dueDate}</span>
                    <span>{task.lastUpdated}</span>
                    <button
                      onClick={() => handleEditClick(task)}
                      className="text-gray-500 hover:text-green-600"
                    >
                      ✏️
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 mt-10">
                  No tasks found.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* History */}
        <div className="bg-white rounded-2xl shadow-md p-4 w-full sm:w-72 flex-shrink-0">
          <h2 className="text-xl font-bold mb-4 text-green-600">History</h2>
          <div className="space-y-4 text-sm text-gray-600">
            {history.length > 0 ? (
              history.map((item, i) => (
                <div key={i} className="border-b pb-2">
                  {item.description} - {item.lastUpdated} ({item.type})
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No history found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Task Modal */}
      {editModalOpen && editingTask && (
        <div className="fixed inset-0 bg-gradient-to-br from-[#34916aff] to-[#d4edc9] bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
            <h2 className="text-2xl font-bold mb-4 text-green-700">Edit Task</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Assignee</label>
                <select
                  value={editAssignee}
                  onChange={(e) => setEditAssignee(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {teamMembers.map((member) => (
                    <option key={member} value={member}>
                      {member}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Due Date</label>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  min={today}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateTask}
                className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Task Modal */}
      {completeModalOpen && taskToComplete && (
        <div className="fixed inset-0 bg-gradient-to-br from-[#34916aff] to-[#d4edc9] bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
            <h2 className="text-2xl font-bold mb-4 text-green-700">Complete Task</h2>
            <p className="mb-4">Task: **{taskToComplete.description}**</p>
            <div>
              <label className="block text-sm font-medium mb-1">Completed by:</label>
              <input
                type="text"
                value={completedByName}
                onChange={(e) => setCompletedByName(e.target.value)}
                placeholder="Your name"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={() => setCompleteModalOpen(false)}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTaskCompletion}
                className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                Confirm Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;