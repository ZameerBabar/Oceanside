'use client';

import React, { useState } from 'react';
import { FaDownload } from 'react-icons/fa';

const SeatingLayout = () => {
    const [selectedLocation, setSelectedLocation] = useState('flagler');

    // Replace with your actual Firebase Storage PDF URLs
    const flaglerPdfUrl = 'https://firebasestorage.googleapis.com/v0/b/oceanside-2e497.firebasestorage.app/o/Locations%20Pdf%2FFlagler%20Tables.pdf?alt=media&token=cc175630-70d1-4a93-8350-c84b15a7dda1';
    const ormondPdfUrl = 'https://firebasestorage.googleapis.com/v0/b/oceanside-2e497.firebasestorage.app/o/Locations%20Pdf%2FOrmond%20Tables.pdf?alt=media&token=4f85e9ad-5c7d-4d05-b893-afd39f4ad49d';

    const handleLocationChange = (location) => {
        setSelectedLocation(location);
    };

    const pdfUrl = selectedLocation === 'flagler' ? flaglerPdfUrl : ormondPdfUrl;
    const documentName = selectedLocation === 'flagler' ? 'Flagler Seating' : 'Ormond Seating';

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `${documentName.replace(' ', '_')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-green-200 to-green-700 dark:bg-green-900 p-8 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-500">
            <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden transform transition-all duration-500 hover:shadow-[0_25px_60px_rgba(0,0,0,0.2)]">
                {/* Header & Location Buttons */}
                <div className="bg-gradient-to-r from-green-700 to-green-400 dark:from-yellow-600 dark:to-cyan-700 text-white p-6 md:p-10 flex flex-col md:flex-row justify-between items-center">
                    <h1 className="text-3xl md:text-5xl font-extrabold mb-4 md:mb-0 tracking-wide text-center md:text-left">Seating Layouts</h1>
                    <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                        <button
                            onClick={() => handleLocationChange('flagler')}
                            className={`px-8 py-3 rounded-full font-bold transition-all duration-300 transform hover:scale-105
                            ${selectedLocation === 'flagler' ? 'bg-white text-teal-600 shadow-lg' : 'border-2 border-white text-white hover:bg-white hover:text-teal-600'}`}
                        >
                            Flagler
                        </button>
                        <button
                            onClick={() => handleLocationChange('ormond')}
                            className={`px-8 py-3 rounded-full font-bold transition-all duration-300 transform hover:scale-105
                            ${selectedLocation === 'ormond' ? 'bg-white text-cyan-600 shadow-lg' : 'border-2 border-white text-white hover:bg-white hover:text-cyan-600'}`}
                        >
                            Ormond
                        </button>
                    </div>
                </div>

                {/* PDF Viewer Container */}
                <div className="p-6 md:p-10 bg-gray-100 dark:bg-gray-700">
                    <div className="relative border-4 border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden shadow-2xl w-full h-[80vh] group">
                        <iframe
                            src={pdfUrl}
                            className="w-full h-full transition-all duration-500 group-hover:scale-[1.005]"
                            title={`${documentName} PDF`}
                            frameBorder="0"
                        />
                       
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeatingLayout;