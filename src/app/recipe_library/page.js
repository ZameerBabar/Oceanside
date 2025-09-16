'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronRight, Filter } from 'lucide-react';

// Dummy data for Single Recipes
const dummySingleRecipes = [
  {
    id: 1,
    name: 'Spicy Shrimp Tacos',
    category: 'Handhelds',
    imageUrl: 'https://cdn.britannica.com/36/123536-050-95CB0C6E/Variety-fruits-vegetables.jpg',
  },
  {
    id: 2,
    name: 'Grilled Salmon with Lemon Herb Butter',
    category: 'Seafood',
    imageUrl: 'https://www.daysoftheyear.com/cdn-cgi/image/dpr=1%2Cf=auto%2Cfit=cover%2Ch=1335%2Cq=85%2Cw=2000/wp-content/uploads/national-fast-food-day.jpg',
  },
  {
    id: 3,
    name: 'Mushroom and Spinach Pasta',
    category: 'Pasta',
    imageUrl: 'https://content.jdmagicbox.com/v2/comp/hyderabad/m3/040pxx40.xx40.211101203237.y7m3/catalogue/pizza-and-burgers-musheerabad-hyderabad-fast-food-gstak8mgek.jpg',
  },
  {
    id: 4,
    name: 'Classic Cheeseburger',
    category: 'Handhelds',
    imageUrl: 'https://assets.bwbx.io/images/users/iqjWHBFdfxIU/ii8hsWpGpOx4/v2/-1x-1.webp',
  },
];

// Dummy data for Batch Recipes List
const batchRecipesList = [
  {
    id: 1,
    name: 'Sunrise Empanada Filling',
    yield: '4 lb batch',
    prepTime: '35 min active / 60 min total',
  },
  {
    id: 2,
    name: 'Classic Breakfast Burrito Mix',
    yield: '6 lb batch',
    prepTime: '45 min active / 75 min total',
  },
  {
    id: 3,
    name: 'Mediterranean Wrap Filling',
    yield: '5 lb batch',
    prepTime: '40 min active / 65 min total',
  },
  {
    id: 4,
    name: 'Spicy Chicken Quesadilla Mix',
    yield: '3.5 lb batch',
    prepTime: '30 min active / 50 min total',
  }
];

// Detailed batch recipe data
const dummyBatchRecipe = {
  name: 'Sunrise Empanada Filling',
  yield: '4 lb batch',
  ingredients: [
    '1 lb Bacon',
    '2 cups Hash Brown Patties',
    '1 lb Ham, Rolled',
    '30 medium Eggs',
    '2 tbsp Sauté seasoning',
    '1 lb American Cheese',
    '3 lb Onions',
    '1.5 lb Green Peppers'
  ],
  instructions: [
    'Cut & Prep Meats: Dice bacon, sausage, and ham into ½ inch pieces.',
    'Grill: Cook meats until edges are crisp and browned.',
    'Add Eggs: Add scrambled eggs, stir gently, and cook until eggs are just set.',
    'Season: Mix in sauté seasoning evenly.',
    'Add Vegetables: Fold in diced onions and peppers, cook lightly until softened.',
    'Cool: Remove mixture and allow to cool completely.',
    'Add Cheese: Once cooled, fold in shredded American cheese.',
    'Store: Transfer to a 4" clear ½ lexan. Label with product name, date, and expiration.'
  ],
  allergens: [
    'Eggs (fresh/shell/egg)',
    'Milk/Dairy (American cheese)'
  ],
  storage: 'Store in a 4" clear ½ lexan, labeled and dated',
  prepTime: '35 min active / 60 min total (includes cooling)'
};

export default function RecipeLibrary() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('single');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [batchSearchTerm, setBatchSearchTerm] = useState('');
  const [selectedBatchRecipe, setSelectedBatchRecipe] = useState(dummyBatchRecipe);

  const categories = ['All', ...new Set(dummySingleRecipes.map(recipe => recipe.category))];

  const handleViewRecipe = (recipe) => {
    // Recipe data ko query parameters ke through pass karte hain
    const recipeData = encodeURIComponent(JSON.stringify(recipe));
    router.replace(`/view_procedure?recipe=${recipeData}`);
  };

  const filteredRecipes = dummySingleRecipes.filter(recipe => {
    const matchesCategory = selectedCategory === 'All' || recipe.category === selectedCategory;
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredBatchRecipes = batchRecipesList.filter(recipe =>
    recipe.name.toLowerCase().includes(batchSearchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#34916aff] to-[#d4edc9] border white">
      {/* Header with gradient overlay */}
      <div className="bg-gradient-to-r from-green-200 via-green-900 to-green-600 text-white border white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-pink-200">
              Recipe Library
            </h1>
            <p className="text-sm text-indigo-100 max-w-2xl mx-auto">
              Discover amazing recipes and master batch cooking techniques
            </p>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex justify-center">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-1">
              <button
                onClick={() => setActiveTab('single')}
                className={`px-6 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                  activeTab === 'single'
                    ? 'bg-white text-green-900 shadow-lg'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                Single Recipes
              </button>
              <button
                onClick={() => setActiveTab('batch')}
                className={`px-6 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                  activeTab === 'batch'
                    ? 'bg-white text-green-900 shadow-lg'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                Batch Recipes
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'single' && (
          <div>
            {/* Search and Filter Section */}
            <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border border-gray-100">
              <div className="flex flex-col lg:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                  <input
                    type="text"
                    placeholder="Search for delicious recipes..."
                    className="w-full px-4 py-3 pl-12 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-gray-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                </div>
                <div className="relative w-full lg:w-48">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-gray-700 appearance-none bg-white"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>
            </div>

            {/* Recipe Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRecipes.length > 0 ? (
                filteredRecipes.map(recipe => (
                  <div key={recipe.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border-2 border-white">
                    {/* Image Section */}
                    <div className="h-40 overflow-hidden">
                      <div 
                        className="w-full h-full bg-cover bg-center hover:scale-105 transition-transform duration-300" 
                        style={{ backgroundImage: `url(${recipe.imageUrl})` }}
                      />
                    </div>
                    
                    {/* Content Section */}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        {recipe.name}
                      </h3>
                      
                      <button 
                        onClick={() => handleViewRecipe(recipe)}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        View procedure
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-400 text-4xl mb-3">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No recipes found</h3>
                  <p className="text-gray-500">Try adjusting your search terms or filters</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'batch' && (
          <div>
            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border border-gray-100">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search batch recipes..."
                  className="w-full px-4 py-3 pl-12 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-gray-700"
                  value={batchSearchTerm}
                  onChange={(e) => setBatchSearchTerm(e.target.value)}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>

            <div className="flex gap-6">
              {/* Sidebar with Recipe List */}
              <div className="w-80 bg-white rounded-xl shadow-lg border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Batch Recipes</h3>
                <div className="space-y-2">
                  {filteredBatchRecipes.map(recipe => (
                    <div 
                      key={recipe.id}
                      onClick={() => setSelectedBatchRecipe(recipe.id === 1 ? dummyBatchRecipe : {...dummyBatchRecipe, name: recipe.name, yield: recipe.yield, prepTime: recipe.prepTime})}
                      className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                        selectedBatchRecipe.name === recipe.name 
                          ? 'bg-indigo-50 border-indigo-200' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <h4 className="font-medium text-gray-800 text-sm">{recipe.name}</h4>
                      <div className="text-xs text-gray-600 mt-1">
                        <div>Yield: {recipe.yield}</div>
                        <div>Time: {recipe.prepTime}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Recipe Display */}
              <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedBatchRecipe.name}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="font-medium">Yield: {selectedBatchRecipe.yield}</span>
                    <span className="font-medium">Prep Time: {selectedBatchRecipe.prepTime}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Ingredients */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Ingredients</h3>
                      <ul className="space-y-1 text-sm">
                        {selectedBatchRecipe.ingredients.map((ingredient, index) => (
                          <li key={index} className="text-gray-700 flex items-start">
                            <span className="text-indigo-500 mr-2">•</span>
                            {ingredient}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Allergens */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Allergens</h3>
                      <ul className="space-y-1 text-sm">
                        {selectedBatchRecipe.allergens.map((allergen, index) => (
                          <li key={index} className="text-red-600 font-medium flex items-start">
                            <span className="text-red-500 mr-2">⚠</span>
                            {allergen}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Storage */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Storage</h3>
                      <p className="text-gray-700 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400 text-sm">
                        {selectedBatchRecipe.storage}
                      </p>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div>
                    {/* Instructions */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Instructions</h3>
                      <ol className="space-y-2">
                        {selectedBatchRecipe.instructions.map((instruction, index) => (
                          <li key={index} className="text-gray-700 flex text-sm">
                            <span className="bg-indigo-100 text-indigo-700 font-bold rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0">
                              {index + 1}
                            </span>
                            <span>{instruction}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}