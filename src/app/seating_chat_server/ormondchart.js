"use client"
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Clock, Target, CheckCircle, XCircle, Trophy } from 'lucide-react';
import { getTableData } from './seatingData';

const tableData = getTableData('ormond');

const TableComponent = ({ table, isActive, hasAnswer, isCorrect, isIncorrect, onClick, inputValue, setInputValue, handleAnswerSubmit, userAnswers }) => {
  const isDiamond = table.shape === 'diamond';
  const isCircle = table.shape === 'circle';

  let shapeClasses = 'rounded-md';
  if (isCircle) {
    shapeClasses = 'rounded-full';
  } else if (isDiamond) {
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
    bgColor = 'bg-purple-600';
    textColor = 'text-white';
    borderColor = 'border-purple-800';
    zIndex = 'z-20';
  } else if (hasAnswer) {
    bgColor = 'bg-blue-500';
    textColor = 'text-white';
    borderColor = 'border-blue-700';
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
        <div className={`flex flex-col items-center justify-center w-full h-full ${isDiamond ? 'transform -rotate-45' : ''}`}>
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
          ${isDiamond ? 'transform -rotate-45' : ''}
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

export default function OrmondChart({ onReset }) {
  const [userAnswers, setUserAnswers] = useState({});
  const [gameState, setGameState] = useState('playing');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [results, setResults] = useState(null);
  const [activeTable, setActiveTable] = useState(null);
  const [inputValue, setInputValue] = useState('');

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

    if (!startTime) {
      setStartTime(Date.now());
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

  const answeredCount = Object.keys(userAnswers).length;
  const totalTables = tableData.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d4edc9] via-[#34916aff] to-[#d4edc9] relative overflow-hidden">
      <div className="relative z-10 p-6 flex flex-col items-center">
        {/* Header */}
        <div className="w-full max-w-4xl mb-6">
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
                Ormond Seating Chart
              </h1>

              <div className="flex items-center space-x-4">
                {gameState === 'playing' && (
                  <div className="flex items-center space-x-2 bg-emerald-500 bg-opacity-20 backdrop-blur-sm border border-emerald-400 border-opacity-30 rounded-2xl px-4 py-2">
                    <Target size={20} className="text-emerald-300" />
                    <span className="text-emerald-100 font-bold text-lg">{answeredCount} / {totalTables}</span>
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
          <div className="w-full max-w-4xl mb-6">
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
          <div className="w-full max-w-4xl mb-6">
            <div className="from-green-700 via-green-500 to-green-900 bg-opacity-70 backdrop-blur-lg border border-purple-800 rounded-3xl p-8 shadow-2xl animate-fade-in-up">
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

        {/* Seating Chart - Main Container */}
        <div className="w-full max-w-4xl bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 rounded-3xl p-8 shadow-2xl flex justify-center">
          <div className="relative w-[960px] h-[1200px] bg-white rounded-2xl overflow-hidden flex flex-col items-center">

            {/* Background sections */}
            <div className="absolute top-[40px] left-1/2 -translate-x-1/2 w-[920px] h-[430px] bg-gray-400 border-2 border-gray-600"></div>
            <div className="absolute top-[520px] left-1/2 -translate-x-1/2 w-[920px] h-[420px] bg-gray-500 border-2 border-gray-600"></div>

            {/* Labels */}
            <div className="w-full h-[50px] bg-white border-2 border-white flex items-center justify-center">
              <span className="text-black font-bold text-lg">Outside</span>
            </div>

            {/* Inside Label */}
            <div className="absolute top-[470px] left-1/2 -translate-x-1/2 w-[100px] h-[50px] bg-white border-2 border-white flex items-center justify-center">
              <span className="text-black font-bold text-lg">Inside</span>
            </div>

            {/* Main Seating Area container to center elements */}
            <div className="relative w-[960px] h-[850px] mt-[-2px]">

              {/* Entrances */}
              <div className="absolute top-[30px] left-[210px] w-[120px] h-[40px] border-2 border-black flex items-center justify-center">
                <span className="text-white text-xs font-bold">SOUTH ENTRANCE</span>
              </div>
              <div className="absolute top-[30px] right-[210px] w-[120px] h-[40px] border-2 border-black flex items-center justify-center">
                <span className="text-white text-xs font-bold">NORTH ENTRANCE</span>
              </div>

              <div className="absolute top-[75px] left-[210px] w-[120px] h-[10px] bg-gray-700 border-2 border-black flex items-center justify-center">
              </div>
              <div className="absolute top-[75px] right-[210px] w-[120px] h-[10px] bg-gray-700 border-2 border-black flex items-center justify-center">
              </div>

              {/* Building (centered horizontally relative to the main container) */}
              <div className="absolute top-[17px] left-1/2 -translate-x-1/2 w-[280px] h-[80px] bg-gray-600 border-2 border-gray-800 flex items-center justify-center">
                <span className="text-white font-bold">BUILDING</span>
              </div>

              {/* Other fixed elements like Band Area, Bar, Server Station */}
              <div className="absolute top-[210px] left-[60px] w-[80px] h-[60px] border-2 border-gray-800 flex items-center justify-center">
                <span className="text-white text-xs font-bold">BAND AREA</span>
              </div>

              {/* The following three elements are inside the Inside section, so their top position should be relative to it */}
              <div className="absolute top-[640px] left-[50px] w-[50px] h-[220px] border-2 border-gray-800 flex items-center justify-center">
                <span className="text-white text-xs font-bold transform -rotate-90">BAR</span>
              </div>

              <div className="absolute top-[550px] left-1/3 w-[100px] h-[10px] bg-gray-700 border-2 border-black flex items-center justify-center">
              </div>
              <div className="absolute top-[750px] left-[246px] w-[10px] h-[90px] bg-gray-700 border-2 border-black flex items-center justify-center">
              </div>
              <div className="absolute top-[475px] left-1/3 w-[100px] h-[70px] border-2 border-black flex items-center justify-center">
                <span className="text-white text-xs font-bold">SERVER<br />STATION</span>
              </div>

              {/* Tables */}
              {tableData.map(table => (
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
    </div>
  );
}