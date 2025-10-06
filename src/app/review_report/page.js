'use client';

import React, { useState, useEffect, useRef } from 'react';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { ChevronDown, BarChart2, Star, Download, Share2, Printer, RefreshCw, Calendar, TrendingUp, TrendingDown, Check } from 'lucide-react';

const FirebaseReviewReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Flagler');
  const [availableMonths, setAvailableMonths] = useState([]);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  
  const reportRef = useRef(null);
  
  // NEW: View mode state (Month or Year)
  const [viewMode, setViewMode] = useState('Month');
  const [selectedYear, setSelectedYear] = useState('');
  const [availableYears, setAvailableYears] = useState([]);

  const aggregateYearData = (monthsData) => {
    if (!monthsData || monthsData.length === 0) return null;

    const aggregated = {
      newReviews: { count: 0, change: '' },
      staffMentions: { count: 0, period: `Year ${selectedYear}` },
      ratings: [],
      staffMentionsData: {},
      notableNegativeReviews: []
    };

    // Aggregate new reviews
    monthsData.forEach(monthData => {
      if (monthData.newReviews?.count) {
        aggregated.newReviews.count += monthData.newReviews.count;
      }
      if (monthData.staffMentions?.count) {
        aggregated.staffMentions.count += monthData.staffMentions.count;
      }
      
      // Collect all negative reviews
      if (monthData.notableNegativeReviews) {
        aggregated.notableNegativeReviews.push(...monthData.notableNegativeReviews);
      }

      // Aggregate staff mentions
      if (monthData.staffMentionsData) {
        monthData.staffMentionsData.forEach(staff => {
          const key = `${staff.name}-${staff.location}`;
          if (!aggregated.staffMentionsData[key]) {
            aggregated.staffMentionsData[key] = {
              name: staff.name,
              location: staff.location,
              positive_mentions: 0,
              negative_mentions: 0
            };
          }
          aggregated.staffMentionsData[key].positive_mentions += staff.positive_mentions || 0;
          aggregated.staffMentionsData[key].negative_mentions += staff.negative_mentions || 0;
        });
      }
    });

    // Convert staff mentions object to array and sort
    aggregated.staffMentionsData = Object.values(aggregated.staffMentionsData)
      .sort((a, b) => (b.positive_mentions + b.negative_mentions) - (a.positive_mentions + a.negative_mentions))
      .slice(0, 10);

    // Aggregate ratings by platform and location
    const ratingsMap = {};
    monthsData.forEach(monthData => {
      if (monthData.ratings) {
        monthData.ratings.forEach(rating => {
          const key = `${rating.platform}-${rating.location}`;
          if (!ratingsMap[key]) {
            ratingsMap[key] = {
              platform: rating.platform,
              location: rating.location,
              breakdown: { '1_stars': 0, '2_stars': 0, '3_stars': 0, '4_stars': 0, '5_stars': 0 },
              totalRating: 0,
              totalCount: 0,
              firstMonthAvg: null,
              lastMonthAvg: null
            };
          }
          
          // Aggregate breakdown
          if (rating.breakdown) {
            Object.entries(rating.breakdown).forEach(([star, count]) => {
              ratingsMap[key].breakdown[star] = (ratingsMap[key].breakdown[star] || 0) + count;
            });
          }

          // Track first and last month averages for comparison
          if (ratingsMap[key].firstMonthAvg === null) {
            ratingsMap[key].firstMonthAvg = rating.average_this_month;
          }
          ratingsMap[key].lastMonthAvg = rating.average_this_month;
        });
      }
    });

    // Calculate average ratings for the year
    aggregated.ratings = Object.values(ratingsMap).map(rating => {
      const breakdown = rating.breakdown;
      let totalStars = 0;
      let totalReviews = 0;

      Object.entries(breakdown).forEach(([star, count]) => {
        const starValue = parseInt(star.split('_')[0]);
        totalStars += starValue * count;
        totalReviews += count;
      });

      const yearAverage = totalReviews > 0 ? (totalStars / totalReviews).toFixed(1) : 0;

      return {
        platform: rating.platform,
        location: rating.location,
        average_this_month: yearAverage,
        average_last_month: rating.firstMonthAvg,
        breakdown: rating.breakdown
      };
    });

    // Sort negative reviews by date (most recent first) and limit
    aggregated.notableNegativeReviews.sort((a, b) => {
      if (b.date && a.date) return new Date(b.date) - new Date(a.date);
      return 0;
    });
    aggregated.notableNegativeReviews = aggregated.notableNegativeReviews.slice(0, 10);

    return aggregated;
  };

  const fetchYearData = async (year) => {
    if (!year) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError('');
      
      // Get all months for the selected year
      const yearMonths = availableMonths.filter(month => month.startsWith(year));
      
      if (yearMonths.length === 0) {
        setError(`No data found for year ${year}`);
        setData(null);
        setLoading(false);
        return;
      }

      // Fetch data for all months in the year
      const monthsDataPromises = yearMonths.map(async (month) => {
        const docRef = doc(db, 'reviewReports', month);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
      });

      const monthsData = await Promise.all(monthsDataPromises);
      const validMonthsData = monthsData.filter(data => data !== null);

      if (validMonthsData.length > 0) {
        const aggregatedData = aggregateYearData(validMonthsData);
        setData(aggregatedData);
      } else {
        setError(`No valid data found for year ${year}`);
        setData(null);
      }
    } catch (error) {
      console.error('Error fetching year data:', error);
      setError('Failed to fetch year data from Firebase');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

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
      months.sort().reverse();
      setAvailableMonths(months);
      
      // Extract unique years
      const years = [...new Set(months.map(month => month.split('-')[0]))].sort().reverse();
      setAvailableYears(years);
      
      if (months.length > 0) {
        setSelectedMonth(months[0]);
        if (years.length > 0) {
          setSelectedYear(years[0]);
        }
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
    if (viewMode === 'Month' && selectedMonth) {
      fetchDataFromFirebase(selectedMonth);
    } else if (viewMode === 'Year' && selectedYear) {
      fetchYearData(selectedYear);
    }
  }, [selectedMonth, selectedYear, viewMode]);

  // SHARE LINK FUNCTION
  const handleShare = async () => {
    const currentUrl = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Review Report - ${viewMode === 'Year' ? selectedYear : formatMonthLabel(selectedMonth)}`,
          text: 'Check out this review report',
          url: currentUrl
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(currentUrl);
        setShowCopySuccess(true);
        setTimeout(() => setShowCopySuccess(false), 2000);
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        alert('Failed to copy link. Please copy manually: ' + currentUrl);
      }
    }
  };

  // PRINT FUNCTION
  const handlePrint = () => {
    window.print();
  };

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
            <div className="flex-1 flex flex-col items-start">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-800">{rating.platform}</span>
                <Pill text={rating.location} color={locationPillColor} />
              </div>
              <div className="flex text-xs text-gray-500 mt-1">
                <span className="mr-2">{viewMode === 'Year' ? 'Start' : 'Last'}: {rating.average_last_month || 'N/A'}</span>
                <span>{viewMode === 'Year' ? 'Avg' : 'Now'}: {rating.average_this_month || 'N/A'}</span>
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-gray-800">{rating.average_this_month || 'N/A'}</span>
                {trendIcon}
              </div>
            </div>
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
          <p className="text-gray-600">Please select another {viewMode.toLowerCase()} to view data.</p>
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
          <p className="text-sm text-gray-500">Please upload data first using the Upload Report Data feature</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d4edc9] to-[#34916aff]">
      <main className="p-8" ref={reportRef}>
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 bg-gradient-to-br from-[#40cc5cff] to-[#34916aff] p-6 rounded-xl shadow-lg">
          <div className="flex items-center space-x-4 flex-wrap">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white">Review Report</h1>
            
            {/* VIEW MODE TOGGLE */}
            <div className="flex items-center bg-white/20 rounded-full p-1 backdrop-blur-sm">
              <button
                onClick={() => setViewMode('Month')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  viewMode === 'Month' 
                    ? 'bg-white text-[#34916aff]' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('Year')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  viewMode === 'Year' 
                    ? 'bg-white text-[#34916aff]' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Year
              </button>
            </div>

            {/* CONDITIONAL DROPDOWN */}
            {viewMode === 'Month' ? (
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
            ) : (
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-white/20 text-white px-4 py-2 rounded-full border border-white/30 backdrop-blur-sm"
              >
                {availableYears.map((year) => (
                  <option key={year} value={year} className="text-gray-800">
                    {year}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="flex flex-wrap items-center space-x-2 space-y-2 md:space-y-0 mt-4 md:mt-0">
            
            <button 
              onClick={handleShare}
              className="bg-white text-gray-700 px-4 py-2 rounded-full shadow-sm flex items-center transition-colors hover:bg-gray-50 relative"
            >
              {showCopySuccess ? (
                <>
                  <Check size={18} className="mr-2 text-green-600" /> Copied!
                </>
              ) : (
                <>
                  <Share2 size={18} className="mr-2" /> Share
                </>
              )}
            </button>
            <button 
              onClick={handlePrint}
              className="bg-white text-gray-700 px-4 py-2 rounded-full shadow-sm flex items-center transition-colors hover:bg-gray-50"
            >
              <Printer size={18} className="mr-2" /> Print
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card title="New Reviews" className="lg:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-6xl font-extrabold text-[#194D33]">{data.newReviews?.count || 0}</span>
              <div className="flex items-center text-[#38A169] font-semibold">
                <span className="text-sm">{data.newReviews?.change || (viewMode === 'Year' ? `${selectedYear} Total` : 'No change')}</span>
                <BarChart2 size={28} className="ml-2" />
              </div>
            </div>
          </Card>
          
          <Card title="Staff Mentions" className="lg:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-6xl font-extrabold text-[#194D33]">{data.staffMentions?.count || 0}</span>
              <div className="flex items-center text-gray-500 font-semibold">
                <span className="text-sm">{data.staffMentions?.period || (viewMode === 'Year' ? `Year ${selectedYear}` : 'This period')}</span>
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
                className="bg-gray-50 text-gray-700 px-4 py-2 rounded-full border border-gray-200 shadow-sm appearance-none cursor-pointer hover:border-gray-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#34916aff]"
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

          {/* HIDE NOTABLE NEGATIVE IN YEAR VIEW */}
          {viewMode === 'Month' && (
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
          )}
        </div>
      </main>
    </div>
  );
};

export default FirebaseReviewReport;