'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Search, X } from 'lucide-react';

const drinksData = [
    {
        id: 'bloody_mary_works',
        name: 'Bloody Mary (The Works)',
        glassware: 'Pint Glass',
        garnish: 'Lemon Wedge, Lime Wedge, Green Olive, Celery Stick, 2 Shrimp, 1 Slice Bacon, Ground Black Pepper',
        ingredients: ['3 oz Vodka (guest’s choice)', 'Zing Zang Bloody Mary Mix (to fill glass)'],
        method: ['Fill a pint glass with ice.', 'Add vodka.', 'Top with Zing Zang to fill glass.', 'Shake ingredients together, then pour back into the pint glass.', 'Garnish with lemon wedge, lime wedge, green olive, celery stick, two shrimp, one slice of bacon.', 'Finish with a sprinkle of freshly ground black pepper.'],
        image: 'https://media.istockphoto.com/id/1307546222/photo/mojito-cocktail-with-lime-and-mint.jpg?s=612x612&w=0&k=20&c=gHx_HqT6b_zREkORePVRJaDbibixhtjbO1rncgKUGOQ='
    },
    {
        id: 'blue_hawaiian',
        name: 'Blue Hawaiian',
        glassware: 'Pint Glass',
        garnish: 'Orange Slice, Maraschino Cherry',
        ingredients: ['0.75 oz Grey Goose Vodka', '0.75 oz Bacardi Rum', '0.5 oz Blue Curaçao', '3 oz Pineapple Juice', '1 oz Sour Mix'],
        method: ['Add all ingredients to a shaker with ice.', 'Shake well and pour into a pint glass.', 'Garnish with an orange slice and maraschino cherry.'],
        image: 'https://www.shutterstock.com/image-photo/lemonade-mojito-cocktail-lemon-mint-260nw-662695249.jpg'
    },
    {
        id: 'coconut_lemonade',
        name: 'Coconut Lemonade',
        glassware: 'Pint Glass',
        garnish: 'Lemon Wheel',
        ingredients: ['2 oz Bacardi Coconut Rum', '1 oz Pineapple Juice', '2 oz Lemonade', '1 oz Sprite'],
        method: ['Add all ingredients to a shaker with ice.', 'Roll between shaker and pint glass to mix.', 'Pour into pint glass.', 'Garnish with a lemon wheel.'],
        image: 'https://foodal.com/wp-content/uploads/2022/06/Mint-Lime-Ginger-Splash.jpg'
    },
    {
        id: 'espresso_martini',
        name: 'Espresso Martini',
        glassware: 'Martini Glass',
        garnish: '3 Coffee Beans',
        ingredients: ['1.5 oz Cantera Negra Tequila', '1 oz 360 Vanilla Vodka', '0.5 oz Five Farms Irish Cream', '1 oz Finest Call Espresso Mix'],
        method: ['Add all ingredients to a shaker with ice.', 'Shake well until chilled.', 'Strain into a martini glass.', 'Float three coffee beans on top for garnish.'],
        image: 'https://static01.nyt.com/images/2021/05/16/multimedia/16ah-mintdrinks/16ah-mintdrinks-articleLarge.jpg?quality=75&auto=webp&disable=upscale'
    },
    {
        id: 'grapefruit_pomegranate',
        name: 'Grapefruit Pomegranate',
        glassware: 'Highball Glass (Salt Rim)',
        garnish: 'Lime Slice',
        ingredients: ['1 oz Cazadores Tequila', '0.75 oz Pama Pomegranate Liqueur', '0.25 oz Lime Juice', '3 oz Grapefruit Juice'],
        method: ['Rim a highball glass with salt.', 'Add all ingredients to a shaker with ice.', 'Shake well and pour into the prepared glass.', 'Garnish with a lime slice.'],
        image: 'https://thumbs.dreamstime.com/b/strawberry-lemonade-cocktail-ice-mint-glass-strawberry-lemonade-cocktail-ice-mint-glass-gray-stone-123213960.jpg'
    },
    {
        id: 'hemingways_painkiller',
        name: 'Hemingway’s Painkiller',
        glassware: 'Pint Glass',
        garnish: 'Orange Slice, Maraschino Cherry, Dash of Cinnamon',
        ingredients: ['1.5 oz Pilar Blonde Rum', '0.5 oz Pilar Dark Rum (floater)', '0.5 oz Island Oasis Piña Colada Mix', '1.5 oz Pineapple Juice', '1.5 oz Orange Juice'],
        method: ['Add all ingredients except Pilar Dark Rum into a shaker with ice.', 'Shake well and pour into a pint glass.', 'Float the Pilar Dark Rum on top.', 'Garnish with an orange slice, maraschino cherry, and a dash of cinnamon.'],
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhcuInwojHyj8DetK1lrql4vIp_ZnKnXgLVg&s'
    },
    {
        id: 'key_lime_colada',
        name: 'Key Lime Colada',
        glassware: 'Goblet',
        garnish: 'Whipped Cream & Lime Wedge',
        ingredients: ['2 oz Bacardi Lime Rum', '5 oz Island Oasis Piña Colada Mix', '1 Large Scoop of Ice'],
        method: ['Rim goblet glass with graham cracker crumbles.', 'Add rum, piña colada mix, and ice into blender cup.', 'Blend on first setting for one drink.', 'Pour into prepared goblet.', 'Garnish with whipped cream and lime wedge.'],
        image: 'https://c8.alamy.com/comp/2F4PF1Y/closeup-vertical-shot-of-a-strawberry-being-dropped-into-a-glass-of-water-and-causing-a-splash-2F4PF1Y.jpg'
    },
    {
        id: 'mango_jalapeno_margarita',
        name: 'Mango Jalapeño Margarita',
        glassware: 'Goblet',
        garnish: 'Lime Slice & Jalapeño Slice',
        ingredients: ['1.5 oz Patrón Tequila', '0.5 oz Patrón Citrónage', '4–5 Fresh Jalapeño Slices', '1 oz Island Oasis Mango', '1 oz Sour Mix', '1 oz Fresh Lime Juice'],
        method: ['Rim goblet with chamoy and Tajín.', 'Add jalapeño slices to shaker and muddle.', 'Add remaining ingredients and ice to shaker.', 'Shake well and pour into prepared goblet.', 'Garnish with lime slice and jalapeño slice.'],
        image: 'https://www.thescramble.com/wp-content/uploads/2022/07/flavored-water-inside-vertical.800.jpg.webp'
    },
];

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
            <div className="flex justify-end mb-4 md:hidden">
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <X size={24} />
                </button>
            </div>
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

    const filteredDrinks = drinksData.filter(drink =>
        drink.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        if (filteredDrinks.length > 0 && !selectedDrink) {
            setSelectedDrink(filteredDrinks[0]);
        }
    }, [filteredDrinks, selectedDrink]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#34916aff] to-[#38c755ff] p-4 font-sans">
            <div className="flex justify-between items-center mb-6 max-w-7xl mx-auto">
                <button
                    onClick={() => router.push('/server_training')}
                    className="text-[#1E4D2B] hover:text-[#0C2A1A] transition-colors flex items-center"
                >
                    <ChevronLeft size={24} />
                    <span className="ml-1">Back</span>
                </button>
                <h1 className="text-3xl font-bold text-white text-center flex-1">Cocktail & Drink Recipes</h1>
                <div className="w-10"></div>
            </div>

            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3">
                    <div className="bg-white p-6 rounded-lg shadow-xl overflow-y-auto max-h-[80vh] md:max-h-full">
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
                        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
                            {filteredDrinks.length > 0 ? (
                                filteredDrinks.map(drink => (
                                    <DrinkCard
                                        key={drink.id}
                                        drink={drink}
                                        onClick={setSelectedDrink}
                                        isSelected={selectedDrink?.id === drink.id}
                                    />
                                ))
                            ) : (
                                <p className="text-gray-500 text-center col-span-full">No drinks found.</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="w-full md:w-2/3">
                    <DrinkDetail drink={selectedDrink} onClose={() => setSelectedDrink(null)} />
                </div>
            </div>
        </div>
    );
}