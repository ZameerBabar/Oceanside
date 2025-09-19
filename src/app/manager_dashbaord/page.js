'use client';

import React, { useState, useEffect } from 'react';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { ChevronDown, BarChart2, Star, Download, Share2, Printer, RefreshCw, Calendar, TrendingUp, TrendingDown } from 'lucide-react';

const FirebaseReviewReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Flagler');
  const [availableMonths, setAvailableMonths] = useState([]);

  const fetchDataFromFirebase = async (month) => {
    if (!month) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError('');
      
      const docRef = doc(db, 'reviewReports', month);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const fetchedData = docSnap.data();
        setData(fetchedData);
      } else {
        setError(`No data found for ${month}`);
        setData(null);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data from Firebase');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableMonths = async () => {
    try {
      const collectionRef = collection(db, 'reviewReports');
      const querySnapshot = await getDocs(collectionRef);
      const months = [];
      querySnapshot.forEach(doc => {
        months.push(doc.id);
      });
      months.sort().reverse(); // Sort to get the most recent first
      setAvailableMonths(months);
      if (months.length > 0) {
        setSelectedMonth(months[0]);
      } else {
        setError("No data available in Firestore for any month.");
      }
    } catch (error) {
      console.error("Error fetching available months:", error);
      setError("Failed to fetch available months from Firestore.");
    }
  };

  useEffect(() => {
    fetchAvailableMonths();
  }, []);

  useEffect(() => {
    if (selectedMonth) {
      fetchDataFromFirebase(selectedMonth);
    }
  }, [selectedMonth]);

  const getRatingStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          className={i < rating ? 'text-[#FFC107] fill-[#FFC107]' : 'text-gray-300'}
        />
      );
    }
    return stars;
  };

  const Pill = ({ text, color }) => (
    <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full" style={{ backgroundColor: color, color: '#fff' }}>
      {text}
    </span>
  );

  const getLocationPillColor = (location) => {
    switch (location) {
      case 'Flagler':
        return '#1E4D2B'; 
      case 'Ormond':
        return '#007BFF'; 
      default:
        return '#6C757D'; 
    }
  };

  const Card = ({ title, children, className = '', rightContent }) => (
    <div className={`bg-white rounded-xl p-6 shadow-md transition-shadow hover:shadow-lg ${className}`}>
      <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
        <h3 className="text-xl font-bold text-[#194D33]">{title}</h3>
        {rightContent}
      </div>
      {children}
    </div>
  );

  const formatMonthLabel = (monthValue) => {
    const [year, month] = monthValue.split('-');
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  const filteredRatings = data?.ratings?.filter(rating => {
    if (selectedLocation === 'Comparison') {
      return true;
    }
    return rating.location === selectedLocation;
  });

  const flaglerRatings = data?.ratings?.filter(r => r.location === 'Flagler');
  const ormondRatings = data?.ratings?.filter(r => r.location === 'Ormond');

  const renderRatings = (ratings) => {
    return ratings.map((rating, index) => {
      const locationPillColor = getLocationPillColor(rating.location);
      const ratingChange = (rating.average_this_month || 0) - (rating.average_last_month || 0);
      const trendIcon = ratingChange > 0 ? (
        <TrendingUp size={20} className="text-green-500" />
      ) : ratingChange < 0 ? (
        <TrendingDown size={20} className="text-red-500" />
      ) : null;
      
      return (
        <div key={index}>
          <div className="flex items-center justify-between">
            {/* Left Side: Platform & Location */}
            <div className="flex-1 flex flex-col items-start">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-800">{rating.platform}</span>
                <Pill text={rating.location} color={locationPillColor} />
              </div>
              <div className="flex text-xs text-gray-500 mt-1">
                <span className="mr-2">Last: {rating.average_last_month || 'N/A'}</span>
                <span>Now: {rating.average_this_month || 'N/A'}</span>
              </div>
            </div>
            {/* Center: Now Rating & Trend Icon */}
            <div className="flex-1 flex flex-col items-center">
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-gray-800">{rating.average_this_month || 'N/A'}</span>
                {trendIcon}
              </div>
            </div>
            {/* Right Side: Bar Chart */}
            <div className="flex-none flex items-end justify-end h-16 w-1/3">
              {rating.breakdown && Object.entries(rating.breakdown).length > 0 ? (
                Object.entries(rating.breakdown).map(([stars, count], barIndex) => {
                  const maxCount = Math.max(...Object.values(rating.breakdown), 1);
                  return (
                    <div 
                      key={barIndex} 
                      className="flex flex-col items-center mx-1 h-full justify-end"
                      style={{ width: '24px' }}
                    >
                      <div 
                        className="w-full rounded-t-lg transition-all duration-500"
                        style={{ 
                          height: `${(count / maxCount) * 100}%`,
                          backgroundColor: (stars === '5_stars' ? '#4caf50' : stars === '4_stars' ? '#8bc34a' : stars === '3_stars' ? '#ffeb3b' : stars === '2_stars' ? '#ff9800' : '#f44336')
                        }}
                      ></div>
                      <span className="text-[9px] text-gray-500 mt-1">{stars.split('_')[0]}★</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-xs">No data</p>
              )}
            </div>
          </div>
          {index < ratings.length - 1 && <hr className="mt-4 border-gray-200" />}
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#d4edc9] to-[#34916aff]">
        <div className="bg-white rounded-xl p-8 shadow-lg flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#34916aff]"></div>
          <p className="text-gray-600 font-semibold">Loading review report data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#d4edc9] to-[#34916aff]">
        <div className="bg-white rounded-xl p-8 shadow-lg text-center space-y-4 max-w-md">
          <div className="text-red-500 text-lg font-semibold">{error}</div>
          <p className="text-gray-600">Please select another month to view data.</p>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg border border-gray-300 shadow-sm transition-colors hover:bg-gray-200"
          >
            {availableMonths.map((month) => (
              <option key={month} value={month} className="text-gray-800">
                {formatMonthLabel(month)}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#d4edc9] to-[#34916aff]">
        <div className="bg-white rounded-xl p-8 shadow-lg text-center space-y-4 max-w-md">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto" />
          <p className="text-gray-600 text-lg">No review report data available</p>
        <p className="text-sm text-gray-500">Please upload data first using the &quot;Upload Report Data&quot; feature</p></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d4edc9] to-[#34916aff]">
      <main className="p-8">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 bg-gradient-to-br from-[#40cc5cff] to-[#34916aff] p-6 rounded-xl shadow-lg">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white">Review Report</h1>
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-white/20 text-white px-4 py-2 rounded-full border border-white/30 backdrop-blur-sm"
            >
              {availableMonths.map((month) => (
                <option key={month} value={month} className="text-gray-800">
                  {formatMonthLabel(month)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center space-x-2 space-y-2 md:space-y-0 mt-4 md:mt-0">
           
            <button className="bg-[#1E4D2B] text-white px-4 py-2 rounded-full flex items-center transition-transform transform hover:scale-105">
              <Download size={18} className="mr-2" /> Download
            </button>
            <button className="bg-white text-gray-700 px-4 py-2 rounded-full shadow-sm flex items-center transition-colors hover:bg-gray-50">
              <Share2 size={18} className="mr-2" /> Share
            </button>
            <button className="bg-white text-gray-700 px-4 py-2 rounded-full shadow-sm flex items-center transition-colors hover:bg-gray-50">
              <Printer size={18} className="mr-2" /> Print
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card title="New Reviews" className="lg:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-6xl font-extrabold text-[#194D33]">{data.newReviews?.count || 0}</span>
              <div className="flex items-center text-[#38A169] font-semibold">
                <span className="text-sm">{data.newReviews?.change || 'No change'}</span>
                <BarChart2 size={28} className="ml-2" />
              </div>
            </div>
          </Card>
          
          <Card title="Staff Mentions" className="lg:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-6xl font-extrabold text-[#194D33]">{data.staffMentions?.count || 0}</span>
              <div className="flex items-center text-gray-500 font-semibold">
                <span className="text-sm">{data.staffMentions?.period || 'This period'}</span>
                <ChevronDown size={28} className="ml-2" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 lg:items-start gap-6">
          <Card 
            title="Channel Performance" 
            className="lg:col-span-2"
            rightContent={
              <select 
                value={selectedLocation} 
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="
                  bg-gray-50 text-gray-700 px-4 py-2 rounded-full border 
                  border-gray-200 shadow-sm appearance-none cursor-pointer
                  hover:border-gray-400 transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-[#34916aff]
                "
              >
                <option value="Flagler">Flagler</option>
                <option value="Ormond">Ormond</option>
                <option value="Comparison">Comparison</option>
              </select>
            }
          >
            {selectedLocation === 'Comparison' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-bold mb-4 text-[#1E4D2B]">Flagler</h4>
                  <div className="space-y-6">
                    {flaglerRatings && flaglerRatings.length > 0 ? renderRatings(flaglerRatings) : <p className="text-gray-500">No data for Flagler</p>}
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-bold mb-4 text-[#007BFF]">Ormond</h4>
                  <div className="space-y-6">
                    {ormondRatings && ormondRatings.length > 0 ? renderRatings(ormondRatings) : <p className="text-gray-500">No data for Ormond</p>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredRatings && filteredRatings.length > 0 ? (
                  renderRatings(filteredRatings)
                ) : (
                  <p className="text-gray-500">No rating data available for this location</p>
                )}
              </div>
            )}
          </Card>

          <Card title="Top Staff Mentions" className="lg:col-span-1">
            <div className="space-y-4">
              {data.staffMentionsData && data.staffMentionsData.length > 0 ? (
                data.staffMentionsData.map((staff, index) => (
                  <div key={index} className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex-1">
                      <p className="font-bold text-[#194D33]">{staff.name}</p>
                      <p className="text-sm text-gray-500">{staff.location}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Pill text={`Positive: ${staff.positive_mentions}`} color="#4CAF50" />
                      <Pill text={`Negative: ${staff.negative_mentions}`} color="#F44336" />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No staff mention data available</p>
              )}
            </div>
          </Card>

          <Card title="Notable Negative" className="lg:col-span-3">
            <div className="space-y-4">
              {data.notableNegativeReviews && data.notableNegativeReviews.length > 0 ? (
                data.notableNegativeReviews.map((review, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-[#194D33]">{review.reviewer_name}</span>
                        <Pill text={review.platform} color="#1E4D2B" />
                      </div>
                     
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{review.review_text}</p>
                    <Pill text={review.location} color="#A3C7B5" />
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No negative reviews available</p>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default FirebaseReviewReport;
