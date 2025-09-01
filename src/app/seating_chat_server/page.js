"use client"
import React, { useState } from 'react';
import { ChevronLeft, Clock, Target, CheckCircle, XCircle, Trophy, Zap } from 'lucide-react';
import { seatingData } from './seatingData';
import FlaglerChart from './flaglerchart';
import OrmondChart from './ormondchart';

export default function SeatingChartGame() {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  const resetGame = () => {
    setSelectedLocation(null);
  };

  if (!selectedLocation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#34916aff] via-white-700 to-[#d4edc9] p-6 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-green-500 opacity-20 rounded-full blur-3xl animate-pulse"></div>
         
        </div>

        <div className="relative z-10 w-full max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-green-200 via-white to-green-100 bg-clip-text text-transparent mb-4 animate-pulse">
              SEATING CHART
            </h1>
            <h2 className="text-4xl md:text-5xl font-bold text-white opacity-90 mb-6">
              MASTERY
            </h2>
            <p className="text-xl text-white  max-w-2xl mx-auto leading-relaxed">
              Master your restaurant seating layout with this interactive training game
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div
              onClick={() => handleLocationSelect('flagler')}
              className="group relative overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-800 via-green-600 to-green-300 opacity-20 backdrop-blur-sm border border-green border-opacity-100 rounded-3xl"></div>
              <div className="relative p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-700 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-500">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-3">Flagler Location</h3>
                <div className="inline-flex items-center bg-teal-700 bg-opacity-20 backdrop-blur-sm border border-emerald-400 border-opacity-30 rounded-full px-6 py-2 mb-4">
                  <Target className="w-5 h-5 text-emerald-300 mr-2" />
                  <span className="text-white font-semibold">{seatingData.flagler.totalTables} Tables</span>
                </div>
                <p className="text-white  mb-6">Advanced level with multiple sections</p>
                <div className="bg-gradient-to-r from-green-700 to-teal-500 text-white py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300">
                  Start Challenge
                </div>
              </div>
            </div>
            <div
              onClick={() => handleLocationSelect('ormond')}
              className="group relative overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-300 via-green-600 to-green-900 opacity-20 backdrop-blur-sm border border-green rounded-3xl"></div>
              <div className="relative p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-green-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-500">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-3">Ormond Location</h3>
                <div className="inline-flex items-center bg-teal-700 bg-opacity-20 backdrop-blur-sm border border-violet-400 border-opacity-30 rounded-full px-6 py-2 mb-4">
                  <Target className="w-5 h-5 text-violet-300 mr-2" />
                  <span className="text-violet-100 font-semibold">{seatingData.ormond.totalTables} Tables</span>
                </div>
                <p className="text-white  mb-6">Perfect for beginners</p>
                <div className="bg-gradient-to-r from-teal-500 to-green-700 text-white py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300">
                  Start Challenge
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedLocation === 'flagler') {
    return <FlaglerChart onReset={resetGame} />;
  }

  if (selectedLocation === 'ormond') {
    return <OrmondChart onReset={resetGame} />;
  }

  return null;
}