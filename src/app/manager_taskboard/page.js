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

  const teamMembers = ['Sarah', 'Mike', 'Alex', 'John'];

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

  // ✅ Complete Task (MOVE to History)
  const handleTaskCompletion = async (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    try {
      // Step 1: Add to History
      await addDoc(collection(db, 'History'), {
        ...task,
        status: 'Completed',
        lastUpdated: new Date().toLocaleDateString(),
        completedAt: serverTimestamp(),
        type: 'Completed',
      });

      // Step 2: Remove from Manager Task
      await deleteDoc(doc(db, 'Manager Task', taskId));
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (!isAuthReady) return <p>Loading...</p>;

  return (
    <div className="flex flex-col min-h-screen font-sans bg-gradient-to-br from-[#34916aff] to-[#d4edc9] items-center">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-teal-500 text-white  shadow-lg p-6 mb-6 w-full">
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
            <div className="grid grid-cols-4 gap-4 pb-2 border-b-2 border-gray-200 font-bold text-gray-700 text-sm">
              <span>Task</span>
              <span>Assigned to</span>
              <span>Due date</span>
              <span>Last updated</span>
            </div>
            <div className="mt-4 space-y-3">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="grid grid-cols-4 gap-4 items-center text-sm border-b py-2"
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        onChange={() => handleTaskCompletion(task.id)}
                      />
                      <span>{task.description}</span>
                    </div>
                    <span>{task.assignee}</span>
                    <span>{task.dueDate}</span>
                    <span>{task.lastUpdated}</span>
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
    </div>
  );
};

export default App;
