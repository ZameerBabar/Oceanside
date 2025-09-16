'use client'
import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Play, ChefHat, Clock } from 'lucide-react';

// Recipe details generator function
const getRecipeDetails = (recipe) => ({
  ...recipe,
  videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
  ingredients: [
    '1 lb large shrimp',
    '2 tbsp olive oil',
    '1 tsp chili powder',
    '1/2 tsp cumin',
    '8 corn tortillas',
    '1 cup cabbage',
    '1 avocado, sliced',
    'Salt and pepper'
  ],
  preparation: [
    'Heat oil in a large pan over medium-high heat.',
    'Season shrimp with chili powder, cumin, salt and pepper.',
    'Cook shrimp for 2-3 minutes per side until pink.',
    'Warm tortillas in a dry skillet.',
    'Fill tortillas with shrimp, cabbage, and avocado.',
    'Serve immediately with lime wedges.'
  ]
});

// A new component to handle the logic that uses useSearchParams
function ViewProceduresContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    const recipeParam = searchParams.get('recipe');
    if (recipeParam) {
      try {
        const decodedRecipe = JSON.parse(decodeURIComponent(recipeParam));
        setRecipe(decodedRecipe);
      } catch (error) {
        console.error('Error parsing recipe data:', error);
        router.push('/recipe-library');
      }
    } else {
      router.push('/recipe_library');
    }
  }, [searchParams, router]);

  const handleBackToLibrary = () => {
    router.replace('/recipe_library');
  };

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#34916aff] to-[#d4edc9] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-3"></div>
          <p className="text-gray-600 text-center text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const recipeDetails = getRecipeDetails(recipe);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#34916aff] to-[#d4edc9]">
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button 
              onClick={handleBackToLibrary}
              className="flex items-center gap-2  px-3 py-2 rounded-lg hover:bg-white/30 transition-all text-sm"
            >
              <ArrowLeft size={18} />
              Back
            </button>
            <h1 className="text-2xl font-bold text-center flex-1 mx-4">
              {recipeDetails.name}
            </h1>
            <div className="w-16"></div> {/* Spacer for center alignment */}
          </div>
        </div>
      </div>

      {/* Main Content - Compact Layout */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Side - Video */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="relative group">
              <video 
                className="w-full h-64 bg-gray-900 object-cover"
                controls
                poster={recipeDetails.imageUrl}
              >
                <source src={recipeDetails.videoUrl} type="video/mp4" />
                Your browser does not support video.
              </video>
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all flex items-center justify-center pointer-events-none">
                <div className="bg-white/90 rounded-full p-4 group-hover:scale-110 transition-transform">
                  <Play size={24} className="text-green-600 ml-1" />
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 text-green-600">
                <Play size={16} />
                <span className="font-medium text-sm">Cooking Instructions</span>
              </div>
              <p className="text-gray-600 text-sm mt-1">Follow the step-by-step video guide</p>
            </div>
          </div>

          {/* Right Side - Ingredients */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <ChefHat className="text-green-600" size={20} />
              <h3 className="text-lg font-bold text-gray-800">Ingredients</h3>
            </div>
            <div className="space-y-2">
              {recipeDetails.ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-green-50 transition-colors">
                  <span className="bg-green-100 text-green-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 text-sm">{ingredient}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom - Preparation Steps */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-blue-600" size={20} />
            <h3 className="text-lg font-bold text-gray-800">Preparation Steps</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recipeDetails.preparation.map((step, index) => (
              <div key={index} className="flex gap-3 p-3 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors">
                <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-gray-700 text-sm leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ViewProcedures() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#34916aff] to-[#d4edc9] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-3"></div>
          <p className="text-gray-600 text-center text-sm">Loading recipe...</p>
        </div>
      </div>
    }>
      <ViewProceduresContent />
    </Suspense>
  );
}