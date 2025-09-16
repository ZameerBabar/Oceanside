'use client'
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronRight, Filter } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Apni firebaseConfig file ka path sahi rakhna

export default function RecipeLibrary() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('single');
  const [loading, setLoading] = useState(true);

  // Single Recipes States
  const [singleRecipes, setSingleRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Batch Recipes States
  const [batchRecipes, setBatchRecipes] = useState([]);
  const [batchSearchTerm, setBatchSearchTerm] = useState('');
  const [selectedBatchRecipe, setSelectedBatchRecipe] = useState(null);

  // Single Recipes data fetch karna
  useEffect(() => {
    const fetchSingleRecipes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'SingleRecipe'));
        const recipesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Ensure ingredients and preparation are arrays
          ingredients: doc.data().ingredients || [],
          preparation: doc.data().preparation || [],
        }));
        setSingleRecipes(recipesList);
      } catch (error) {
        console.error('Error fetching single recipes: ', error);
      }
    };
    fetchSingleRecipes();
  }, []);

  // Batch Recipes data fetch karna
  useEffect(() => {
    const fetchBatchRecipes = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'BatchRecipe'));
        const recipesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Ensure nested arrays are present
          ingredients: doc.data().ingredients || [],
          instructions: doc.data().instructions || [],
          allergens: doc.data().allergens || [],
        }));
        setBatchRecipes(recipesList);
        if (recipesList.length > 0) {
          setSelectedBatchRecipe(recipesList[0]);
        }
      } catch (error) {
        console.error('Error fetching batch recipes: ', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBatchRecipes();
  }, []);

  // Filtered single recipes based on search and category
  const filteredSingleRecipes = useMemo(() => {
    const matchesCategory = (recipe) => selectedCategory === 'All' || recipe.category === selectedCategory;
    const matchesSearch = (recipe) => recipe.name.toLowerCase().includes(searchTerm.toLowerCase());
    return singleRecipes.filter(recipe => matchesCategory(recipe) && matchesSearch(recipe));
  }, [singleRecipes, searchTerm, selectedCategory]);

  // Filtered batch recipes based on search term
  const filteredBatchRecipes = useMemo(() => {
    return batchRecipes.filter(recipe =>
      recipe.name.toLowerCase().includes(batchSearchTerm.toLowerCase())
    );
  }, [batchRecipes, batchSearchTerm]);

  // Categories list from fetched single recipes
  const categories = useMemo(() => {
    const allCategories = singleRecipes.map(recipe => recipe.category);
    return ['All', ...new Set(allCategories)];
  }, [singleRecipes]);

  const handleViewRecipe = (recipe) => {
    const recipeData = encodeURIComponent(JSON.stringify(recipe));
    router.push(`/view_procedure?recipeId=${recipe.id}`);
  };

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
              {loading ? (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-400 text-4xl mb-3 animate-spin">⏳</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Loading single recipes...</h3>
                </div>
              ) : filteredSingleRecipes.length > 0 ? (
                filteredSingleRecipes.map(recipe => (
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

            {loading ? (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400 text-4xl mb-3 animate-spin">⏳</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Loading batch recipes...</h3>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar with Recipe List */}
                <div className="w-full lg:w-80 bg-white rounded-xl shadow-lg border border-gray-200 p-4 shrink-0">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Batch Recipes</h3>
                  <div className="space-y-2">
                    {filteredBatchRecipes.length > 0 ? (
                      filteredBatchRecipes.map(recipe => (
                        <div 
                          key={recipe.id}
                          onClick={() => setSelectedBatchRecipe(recipe)}
                          className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                            selectedBatchRecipe?.id === recipe.id 
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
                      ))
                    ) : (
                      <div className="text-center text-sm text-gray-500 py-4">No batch recipes found.</div>
                    )}
                  </div>
                </div>

                {/* Main Recipe Display */}
                <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  {selectedBatchRecipe ? (
                    <>
                      <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedBatchRecipe.name}</h2>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
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
                              {selectedBatchRecipe.ingredients?.map((ingredient, index) => (
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
                              {selectedBatchRecipe.allergens?.map((allergen, index) => (
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
                              {selectedBatchRecipe.instructions?.map((instruction, index) => (
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
                    </>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      Select a batch recipe to view details.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}