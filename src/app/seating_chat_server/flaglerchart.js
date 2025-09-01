import React, { useState, useEffect } from 'react';
import { ChevronLeft, Clock, Target, CheckCircle, XCircle, Trophy } from 'lucide-react';
import { getTableData } from './seatingData';

const tableData = getTableData('flagler');

const TableComponent = ({ table, isActive, hasAnswer, isCorrect, isIncorrect, onClick, inputValue, setInputValue, handleAnswerSubmit, userAnswers }) => {
  let shapeClasses = 'rounded-md';
  if (table.isCircle) {
    shapeClasses = 'rounded-full';
  } else if (table.isDiamond) {
    shapeClasses = 'rotate-45';
  }

  let bgColor = 'bg-white';
  let textColor = 'text-gray-800';
  let borderColor = 'border-gray-400';
  let zIndex = 'z-10';

  if (isCorrect) {
    bgColor = 'bg-green-500';
    textColor = 'text-white';
    borderColor = 'border-green-700';
  } else if (isIncorrect) {
    bgColor = 'bg-red-500';
    textColor = 'text-white';
    borderColor = 'border-red-700';
  } else if (isActive) {
    bgColor = 'bg-lime green-600';
    textColor = 'text-white';
    borderColor = 'border-green-800';
    zIndex = 'z-20';
  } else if (hasAnswer) {
    bgColor = 'bg-green-400';
    textColor = 'text-white';
    borderColor = 'border-green';
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAnswerSubmit();
    }
  };

  return (
    <div
      onClick={() => onClick(table.id)}
      className={`absolute flex items-center justify-center cursor-pointer transition-all duration-300 transform
        ${shapeClasses}
        ${bgColor} ${textColor} border-2 ${borderColor}
        ${zIndex} hover:scale-110 hover:shadow-lg
      `}
      style={{
        left: `${table.x}px`,
        top: `${table.y}px`,
        width: `${table.width}px`,
        height: `${table.height}px`,
      }}
    >
      {isActive ? (
        <div className={`flex flex-col items-center justify-center w-full h-full ${table.isDiamond ? 'transform -rotate-45' : ''}`}>
          <input
            type="text"
            className="w-full p-1 text-center bg-white text-black rounded-md text-12 font-bold focus:outline-none"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <button
            onClick={(e) => { e.stopPropagation(); handleAnswerSubmit(); }}
            className="mt-1 px-2 py-1 bg-purple-700 text-white text-xs rounded-lg hover:bg-purple-800 transition-colors"
          >
            Set
          </button>
        </div>
      ) : (
        <div className={`
          ${table.isDiamond ? 'transform -rotate-45' : ''}
          text-xs font-bold select-none
        `}>
          {hasAnswer ? userAnswers[table.id] : ''}
        </div>
      )}
      {isCorrect && <CheckCircle size={12} className="absolute -top-1 -right-1 text-green-700 bg-white rounded-full" />}
      {isIncorrect && <XCircle size={12} className="absolute -top-1 -right-1 text-red-700 bg-white rounded-full" />}
    </div>
  );
};

export default function FlaglerChart({ onReset }) {
  const [userAnswers, setUserAnswers] = useState({});
  const [gameState, setGameState] = useState('playing');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [results, setResults] = useState(null);
  const [activeTable, setActiveTable] = useState(null);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (!startTime && gameState === 'playing') {
      setStartTime(Date.now());
    }
  }, [startTime, gameState]);

  const handleTableClick = (tableId) => {
    if (gameState === 'finished') return;
    setActiveTable(tableId);
    setInputValue(userAnswers[tableId] || '');
  };

  const handleAnswerSubmit = () => {
    const numAnswer = parseFloat(inputValue);
    if (isNaN(numAnswer) || inputValue.trim() === '') {
      return;
    }

    setUserAnswers(prev => ({
      ...prev,
      [activeTable]: numAnswer
    }));
    setActiveTable(null);
    setInputValue('');
  };

  const handleGameSubmit = () => {
    const currentEndTime = Date.now();
    setEndTime(currentEndTime);
    setGameState('finished');

    const correct = [];
    const incorrect = [];

    tableData.forEach(table => {
      const userAnswer = userAnswers[table.id];
      if (userAnswer === table.number) {
        correct.push(table.id);
      } else {
        incorrect.push({
          tableId: table.id,
          userAnswer: userAnswer || 'No Answer',
          correctAnswer: table.number
        });
      }
    });

    const accuracy = Math.round((correct.length / tableData.length) * 100);
    const timeTaken = Math.round((currentEndTime - startTime) / 1000);

    setResults({
      correct,
      incorrect,
      accuracy,
      timeTaken,
      total: tableData.length
    });
  };

  const resetGame = () => {
    setUserAnswers({});
    setGameState('playing');
    setStartTime(null);
    setEndTime(null);
    setResults(null);
    setActiveTable(null);
    setInputValue('');
  };

  const correctCount = tableData.filter(table => userAnswers[table.id] === table.number).length;
  const totalTables = tableData.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d4edc9] via-[#34916aff] to-[#d4edc9] relative overflow-hidden">
      <div className="relative z-10 p-6 flex flex-col items-center">
        {/* Header */}
        <div className="w-full max-w-5xl mb-6">
          <div className="bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <button
                onClick={onReset}
                className="flex items-center text-green opacity-80 hover:opacity-100 transition-colors bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-2xl px-6 py-3 hover:bg-opacity-20"
              >
                <ChevronLeft size={24} />
                <span className="ml-2 font-semibold">Change Location</span>
              </button>

              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-700 via-green-500 to-green-900 bg-clip-text text-transparent">
                Flagler Seating Chart
              </h1>

              <div className="flex items-center space-x-4">
                {gameState === 'playing' && (
                  <div className="flex items-center space-x-2 bg-emerald-500 bg-opacity-20 backdrop-blur-sm border border-emerald-400 border-opacity-30 rounded-2xl px-4 py-2">
                    <Target size={20} className="text-emerald-300" />
                    <span className="text-emerald-100 font-bold text-lg">{correctCount} / {totalTables}</span>
                  </div>
                )}

                {startTime && gameState === 'playing' && (
                  <div className="flex items-center space-x-2 bg-blue-500 bg-opacity-20 backdrop-blur-sm border border-blue-400 border-opacity-30 rounded-2xl px-4 py-2">
                    <Clock size={20} className="text-blue-300" />
                    <span className="text-blue-100 font-bold text-lg">{Math.floor((Date.now() - startTime) / 1000)}s</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Game Controls */}
        {gameState === 'playing' && (
          <div className="w-full max-w-5xl mb-6">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 rounded-3xl p-4 shadow-2xl flex justify-center">
              <button
                onClick={handleGameSubmit}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
              >
                🎯 Submit Answers
              </button>
            </div>
          </div>
        )}

        {/* Results Panel */}
        {gameState === 'finished' && results && (
          <div className="w-full max-w-5xl mb-6">
            <div className="from-green-900 via-green-500 to-green-700 bg-opacity-70 backdrop-blur-lg border border-purple-800 rounded-3xl p-8 shadow-2xl animate-fade-in-up">
              <h2 className="text-3xl font-bold text-white text-center mb-4">Game Over! 🎉</h2>
              <div className="flex justify-center space-x-8 mb-6">
                <div className="text-center bg-gray-900 bg-opacity-40 p-4 rounded-xl shadow-inner border border-purple-700">
                  <Trophy className="w-12 h-12 text-yellow-300 mx-auto mb-2 animate-bounce" />
                  <p className="text-lg text-white opacity-80">Accuracy</p>
                  <p className="text-4xl font-bold text-white bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">{results.accuracy}%</p>
                </div>
                <div className="text-center bg-gray-900 bg-opacity-40 p-4 rounded-xl shadow-inner border border-purple-700">
                  <Clock className="w-12 h-12 text-blue-300 mx-auto mb-2" />
                  <p className="text-lg text-white opacity-80">Time</p>
                  <p className="text-4xl font-bold text-white bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{results.timeTaken}s</p>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">Tables to Review ({results.incorrect.length})</h3>
                <div className="max-h-32 overflow-y-auto custom-scrollbar">
                  {results.incorrect.map(item => (
                    <div key={item.tableId} className="flex items-center justify-center space-x-2 py-1 text-white opacity-80 text-sm">
                      <XCircle size={16} className="text-red-400 flex-shrink-0" />
                      <span>Table <span className="font-bold text-red-300">{item.correctAnswer}</span>: Your answer was <span className="font-bold text-red-300">{item.userAnswer}</span></span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-8 flex justify-center space-x-4">
                <button
                  onClick={resetGame}
                  className="bg-purple-600 text-white py-3 px-8 rounded-2xl font-bold hover:bg-purple-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={onReset}
                  className="bg-green bg-opacity-20 backdrop-blur-sm border border-white border-opacity-20 text-white py-3 px-8 rounded-2xl font-bold hover:bg-opacity-30 transition-colors"
                >
                  New Game
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Seating Chart Container */}
        <div className="w-full max-w-5xl bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 rounded-3xl p-8 shadow-2xl">
          <div className="relative w-[850px] h-[2000px] bg-gray-200 rounded-2xl overflow-hidden mx-auto">
            {/* 2ND LEVEL FRONT AND MIDDLE SECTION */}
            <div className="absolute top-0 left-0 w-full h-[50px] bg-white flex items-center justify-center border-b-2 border-gray-300">
              <span className="text-black font-bold text-lg">2nd Level Front and Middle</span>
            </div>
            <div className="absolute top-[50px] left-0 w-full h-[500px] bg-gray-300 border-2 border-gray-500">
              <div className="absolute top-[0px] left-[0px] w-[80px] h-[200px] bg-white border-2 border-gray-400 flex items-center justify-center">
                <span className="text-black text-sm font-semibold transform -rotate-90">Upstairs Bar Seats</span>
              </div>
              <div className="absolute top-[0px] left-[170px] w-[10px] h-[900px] bg-black"></div>
              <div className="absolute top-[167px] left-[365px] w-[90px] h-[30px]  border-2 border-gray-400 flex items-center justify-center">
                <span className="text-black text-sm font-semibold">Front Deck</span>
              </div>
              <div className="absolute top-[345px] left-[458px] w-[100px] h-[40px]  border-2 border-gray-300 flex items-center justify-center">
                <span className="text-black text-sm font-semibold">Middle Deck</span>
              </div>
              <div className="absolute top-[170px] right-[20px] w-[100px] h-[40px]  border-2 border-gray-400 flex items-center justify-center">
                <span className="text-black text-sm font-semibold ">Stairs</span>
              </div>
            </div>

            {/* 2nd Level Back Deck and Banquet Section */}
            <div className="absolute top-[550px] left-0 w-full h-[50px] bg-white flex items-center justify-center border-b-2 border-gray-300">
              <span className="text-black font-bold text-lg">2nd Level Back Deck and Banquet</span>
            </div>
            <div className="absolute top-[600px] left-0 w-full h-[400px] bg-gray-300 border-2 border-gray-500">
              <div className="absolute top-[0px] left-[100px] w-[250px] h-[40px]  border-2 border-gray-400 flex items-center justify-center">
                <span className="text-black text-sm font-semibold">Step down to middle deck</span>
              </div>
              <div className="absolute bottom-[5px] left-[350px] w-[130px] h-[40px]  border-2 border-gray-400 flex items-center justify-center">
                <span className="text-black text-sm font-semibold">Bathrooms</span>
              </div>
              <div className="absolute bottom-[40px] right-[150px] w-[100px] h-[40px]  border-2 border-gray-400 flex items-center justify-center">
                <span className="text-black text-sm font-semibold">Back Stairs</span>
              </div>
              <div className="absolute top-[150px] left-[0px] w-[50px] h-[150px]  border-2 border-gray-400 flex items-center justify-center">
                <span className="text-black text-sm font-semibold transform -rotate-90">Banquet Room</span>
              </div>
              <div className="absolute top-[366px] right-[0px] w-[280px] h-[10px] bg-black"></div>
              <div className="absolute top-[293px] right-[140px] w-[140px] h-[10px] bg-black"></div>
              <div className="absolute top-[220px] right-[0px] w-[140px] h-[10px] bg-black"></div>
              <div className="absolute top-[220px] right-[140px] w-[10px] h-[80px] bg-black"></div>
            </div>

            {/* Downstairs Inside Section */}
            <div className="absolute top-[1000px] left-0 w-full h-[50px] bg-white flex items-center justify-center border-b-2 border-gray-300">
              <span className="text-black font-bold text-lg">Downstairs Inside</span>
            </div>
            <div className="absolute top-[1050px] left-0 w-full h-[450px] bg-gray-300 border-2 border-gray-500">
              <div className="absolute top-[230px] right-[0px] w-[120px] h-[60px] bg-white border-2 border-gray-400 flex items-center justify-center">
                <span className="text-black text-sm font-semibold">Entrance</span>
              </div>
              <div className="absolute top-[293px] right-[50px] w-[100px] h-[40px]  border-2 border-gray-400 flex items-center justify-center">
                <span className="text-black text-sm font-semibold">Cashier</span>
              </div>
              <div className="absolute bottom-[20px] left-[500px] w-[150px] h-[30px]  border-2 border-gray-400 flex items-center justify-center">
                <span className="text-black text-sm font-semibold">Inside Bar</span>
              </div>
              <div className="absolute top-[330px] left-[0px] w-[400px] h-[10px] bg-black"></div>
            </div>

            {/* Downstairs Outside Section */}
            <div className="absolute top-[1500px] left-0 w-full h-[50px] bg-white flex items-center justify-center border-b-2 border-gray-300">
              <span className="text-black font-bold text-lg">Downstairs Outside</span>
            </div>
            <div className="absolute top-[1550px] left-0 w-full h-[400px] bg-gray-300 border-2 border-gray-500">
              <div className="absolute top-[10px] left-[100px] w-[200px] h-[40px]  border-2 border-gray-400 flex items-center justify-center">
                <span className="text-black text-sm font-semibold">Front Patio</span>
              </div>
              <div className="absolute top-[5px] right-[5px] w-[190px] h-[40px]  border-2 border-gray-400 flex items-center justify-center">
                <span className="text-black text-sm font-semibold">Side Covered Patio</span>
              </div>
              <div className="absolute bottom-[0px] left-[400px] w-[150px] h-[40px]  border-2 border-gray-400 flex items-center justify-center">
                <span className="text-black text-sm font-semibold">Trash/Bus Bin</span>
              </div>
              <div className="absolute top-[0px] right-[200px] w-[10px] h-[400px] bg-black"></div>
            </div>

            {tableData.map((table) => (
              <TableComponent
                key={table.id}
                table={table}
                isActive={activeTable === table.id}
                hasAnswer={userAnswers.hasOwnProperty(table.id)}
                isCorrect={gameState === 'finished' && results?.correct.includes(table.id)}
                isIncorrect={gameState === 'finished' && results?.incorrect.some(item => item.tableId === table.id)}
                onClick={handleTableClick}
                inputValue={inputValue}
                setInputValue={setInputValue}
                handleAnswerSubmit={handleAnswerSubmit}
                userAnswers={userAnswers}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}