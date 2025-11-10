'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Search, X } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebaseConfig'; // Apni firebase config file ka path confirm kar lein


const DrinkCard = ({ drink, onClick, isSelected }) => (
    <div
        className={`bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1 ${isSelected ? 'border-2 border-[#1E4D2B]' : ''}`}
        onClick={() => onClick(drink)}
    >
        <img
            src={drink.image || '/drinks/placeholder.jpg'}
            alt={drink.name}
            className="w-full h-48 object-cover"
        />
        <div className="p-4 text-center">
            <h3 className="text-lg font-bold text-[#1E4D2B]">{drink.name}</h3>
        </div>
    </div>
);

const DrinkDetail = ({ drink, onClose }) => {
    if (!drink) {
        return (
            <div className="flex items-center justify-center p-8 text-gray-500">
                <p>Select a drink from the list.</p>
            </div>
        );
    }
    return (
        <div className="bg-white rounded-2xl p-8 h-full overflow-y-auto shadow-xl">
            {/* Mobile Back Button: Detail view se list view par jaane ke liye */}
            <div className="flex justify-start mb-4 md:hidden">
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-900 transition-colors flex items-center font-semibold"
                >
                    <ChevronLeft size={24} className="mr-1" />
                    Back to Recipes
                </button>
            </div>
            {/* Original Close Button (if you prefer 'X' icon) - hiding it here since we added a 'Back' button */}
            {/* <div className="flex justify-end mb-4 md:hidden">
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <X size={24} />
                </button>
            </div> */}
            <img
                src={drink.image || '/drinks/placeholder.jpg'}
                alt={drink.name}
                className="w-full h-auto rounded-xl shadow-md mb-6"
            />
            <h2 className="text-3xl font-bold text-[#1E4D2B] mb-2">{drink.name}</h2>
            <p className="text-gray-600 mb-4">
                    <span className="font-semibold text-gray-800">Glassware:</span> {drink.glassware}
            </p>
            {drink.garnish && (
                <p className="text-gray-600 mb-4">
                    <span className="font-semibold text-gray-800">Garnish:</span> {drink.garnish}
                </p>
            )}
            <h3 className="text-xl font-bold text-gray-800 mb-2 mt-4">Ingredients</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
                {drink.ingredients.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
            <h3 className="text-xl font-bold text-gray-800 mb-2 mt-4">Method</h3>
            <ol className="list-decimal list-inside text-gray-700 space-y-1">
                {drink.method.map((step, index) => (
                    <li key={index}>{step}</li>
                ))}
            </ol>
        </div>
    );
};

export default function BartenderHubScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDrink, setSelectedDrink] = useState(null);
    const [drinksData, setDrinksData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDrinksData = async () => {
            setLoading(true);
            try {
                const querySnapshot = await getDocs(collection(db, 'cocktail_recipes'));
                const fetchedData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setDrinksData(fetchedData);
                
                // IMPORTANT: Pehle drink ko sirf desktop par select karein
                if (fetchedData.length > 0 && typeof window !== 'undefined' && window.innerWidth >= 768) {
                    setSelectedDrink(fetchedData[0]);
                }
                 // Agar mobile par load ho raha hai, toh selectedDrink null rehne dein taaki sirf list dikhe
                else if (fetchedData.length > 0 && typeof window !== 'undefined' && window.innerWidth < 768) {
                    setSelectedDrink(null); 
                }

            } catch (error) {
                console.error("Error fetching cocktail recipes: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDrinksData();
    }, []);

    const filteredDrinks = drinksData.filter(drink =>
        drink.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Ye function DrinkCard se call hoga
    const handleDrinkSelect = (drink) => {
        setSelectedDrink(drink);
        // Mobile par jab drink select ho toh detail dikhegi.
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p>Data loading ho raha hai...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#34916aff] to-[#38c755ff] p-4 font-sans">
            <div className="flex justify-between items-center mb-6 max-w-7xl mx-auto">
                <button
                    onClick={() => router.push('/server_training')}
                    className="text-white hover:text-gray-100 transition-colors flex items-center"
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-3xl font-bold text-white text-center flex-1">Cocktail & Drink Recipes</h1>
                <div className="w-10"></div>
            </div>

            <div className="max-w-7xl mx-auto flex flex-col md:flex-row  lg:items-start gap-6">
                
                {/* 1. Drink List Container */}
                <div 
                    // Mobile Par: Agar koi drink selected ho toh list chhipa do (hidden)
                    className={`w-full ${selectedDrink ? 'hidden' : 'block'} md:w-1/3 md:block`}
                >
                    <div className="bg-white p-6 rounded-lg shadow-xl overflow-y-auto max-h-[108vh] ">
                        <div className="relative mb-6">
                            <input
                                type="text"
                                placeholder="Search for a drink..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full p-4 pl-12 rounded-lg shadow-inner border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1E4D2B] transition-all"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4">
                            {filteredDrinks.length > 0 ? (
                                filteredDrinks.map(drink => (
                                    <DrinkCard
                                        key={drink.id}
                                        drink={drink}
                                        onClick={handleDrinkSelect} // Updated to use the new handler
                                        isSelected={selectedDrink?.id === drink.id}
                                    />
                                ))
                            ) : (
                                <p className="text-gray-500 text-center col-span-full">No drinks found.</p>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* 2. Drink Detail Container */}
                <div 
                    // Mobile Par: Agar koi drink selected ho toh detail dikha do (block)
                    className={`w-full ${selectedDrink ? 'block' : 'hidden'} md:w-2/3 md:block`}
                >
                    <DrinkDetail 
                        drink={selectedDrink} 
                        // Mobile par jab user 'Back' dabayega toh selectedDrink null ho jayega
                        onClose={() => setSelectedDrink(null)} 
                    />
                </div>
            </div>
        </div>
    );
}