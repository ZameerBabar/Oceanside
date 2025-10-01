'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function MenuMemoryGame() {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [gameStatus, setGameStatus] = useState('playing');
  const [feedback, setFeedback] = useState('');

  // Fetch menu items from Firebase
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const menuRef = collection(db, 'menuMemoryGame');
        const querySnapshot = await getDocs(menuRef);
        
        const items = [];
        querySnapshot.forEach((doc) => {
          items.push({ docId: doc.id, ...doc.data() });
        });

        // Sort by id if available
        items.sort((a, b) => (a.id || 0) - (b.id || 0));
        
        if (items.length === 0) {
          console.error('No menu items found in Firebase');
          alert('No menu items available. Please add items to Firebase.');
        } else {
          setMenuItems(items);
        }
      } catch (error) {
        console.error('Error fetching menu items:', error);
        alert('Failed to load menu items from Firebase');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && gameStatus === 'playing') {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameStatus === 'playing') {
      handleAnswer(false);
    }
  }, [timeLeft, gameStatus]);

  const handleAnswer = (isCorrect) => {
    if (isCorrect) {
      setScore(score + 1);
      setFeedback(`Correct! It's ${menuItems[currentItemIndex].name}`);
      setGameStatus('correct');
    } else {
      setFeedback(`Incorrect. It's ${menuItems[currentItemIndex].name}`);
      setGameStatus('incorrect');
    }

    setTimeout(() => {
      if (currentItemIndex < menuItems.length - 1) {
        setCurrentItemIndex(currentItemIndex + 1);
        setUserAnswer('');
        setTimeLeft(30);
        setGameStatus('playing');
      } else {
        setGameStatus('completed');
      }
    }, 2000);
  };

  const checkAnswer = () => {
    const correctAnswer = menuItems[currentItemIndex].name.toLowerCase();
    const userInput = userAnswer.toLowerCase();
    const isCorrect = correctAnswer.includes(userInput) || userInput.includes(correctAnswer);
    handleAnswer(isCorrect);
  };

  const restartGame = () => {
    setCurrentItemIndex(0);
    setScore(0);
    setUserAnswer('');
    setTimeLeft(30);
    setGameStatus('playing');
    setFeedback('');
  };

  // Loading screen while fetching data
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-green-50">
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 font-semibold">Loading game data...</p>
        </div>
      </div>
    );
  }

  // No items found error
  if (menuItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-green-50">
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">No Menu Items Found</h2>
          <p className="text-gray-600 mb-6">Please add menu items to Firebase first.</p>
          <button 
            onClick={() => router.push('/server_training')}
            className="bg-gradient-to-r from-green-600 to-green-400 text-white py-3 px-8 rounded-lg hover:shadow-lg transition-all duration-300"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (gameStatus === 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-green-50">
        <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-2xl text-center border border-gray-100">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Game Complete!</h1>
            <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-purple-500 mx-auto mb-6"></div>
            <p className="text-2xl mb-6">
              You scored <span className="font-bold text-blue-600">{score}</span> out of <span className="font-bold">{menuItems.length}</span>
            </p>
            <div className="flex justify-center gap-6">
              <button 
                onClick={restartGame}
                className="bg-gradient-to-r from-red-400 to-red-600 text-white py-3 px-8 rounded-lg hover:shadow-lg transition-all duration-300"
              >
                Play Again
              </button>
              <button 
                onClick={() => router.push('/server_training')}
                className="bg-gradient-to-r from-green-600 to-green-400 text-white py-3 px-8 rounded-lg hover:shadow-lg transition-all duration-300"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-green-50">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-4xl border border-gray-100">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-green-600">Menu Memory Game</h1>
            <p className="text-gray-500">Test your menu knowledge</p>
          </div>
          <div className="bg-yellow-300 text-blue-800 py-2 px-4 rounded-full font-medium">
            {currentItemIndex + 1} of {menuItems.length}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-700">What is this item?</h2>
              <div className="relative h-64 w-full rounded-xl overflow-hidden shadow-md mb-6">
                <Image
                  src={menuItems[currentItemIndex].image}
                  alt="Menu item"
                  fill
                  className="object-cover"
                  priority
                  unoptimized={process.env.NODE_ENV !== 'production'}
                />
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-700">Time Remaining:</span>
                <span className={`text-xl font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-yellow-400'}`}>
                  {timeLeft}s
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${timeLeft <= 10 ? 'bg-red-400' : 'bg-yellow-400'}`} 
                  style={{ width: `${(timeLeft/30)*100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            {gameStatus === 'playing' ? (
              <>
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type the menu item name..."
                  className="w-full p-4 border border-gray-300 rounded-xl mb-6 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                />
                <button
                  onClick={checkAnswer}
                  disabled={!userAnswer.trim()}
                  className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all duration-300 ${
                    !userAnswer.trim() 
                      ? 'bg-yellow-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg'
                  }`}
                >
                  Submit Answer
                </button>
              </>
            ) : (
              <div className={`p-6 rounded-xl mb-6 border ${
                gameStatus === 'correct' 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <h3 className="text-xl font-bold mb-2">
                  {gameStatus === 'correct' ? '✓ Correct!' : '✗ Incorrect'}
                </h3>
                <p className="text-lg">{feedback}</p>
              </div>
            )}

            <div className="mt-auto pt-6">
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                <span className="font-medium text-yellow-400">Current Score:</span>
                <span className="text-2xl font-bold text-yellow-400">{score}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}