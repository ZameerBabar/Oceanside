'use client'
import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Apni firebaseConfig file ka path sahi rakhna
import { ArrowLeft, Play, ChefHat, Clock } from 'lucide-react';

// A new component to handle the logic that uses useSearchParams
function ViewProceduresInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const recipeId = searchParams.get('recipeId');

    const fetchRecipeFromFirebase = async () => {
      if (!recipeId) {
        setLoading(false);
        setError("No recipe ID provided.");
        return;
      }
      
      try {
        const docRef = doc(db, "SingleRecipe", recipeId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const fetchedRecipe = { id: docSnap.id, ...docSnap.data() };
          // Ensure nested fields are arrays to prevent errors
          if (!Array.isArray(fetchedRecipe.ingredients)) fetchedRecipe.ingredients = [];
          if (!Array.isArray(fetchedRecipe.preparation)) fetchedRecipe.preparation = [];
          
          setRecipe(fetchedRecipe);
        } else {
          setError("No such recipe exists!");
        }
      } catch (e) {
        console.error("Error fetching document: ", e);
        setError("Error fetching recipe data.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeFromFirebase();
  }, [searchParams]);

  const handleBackToLibrary = () => {
    router.replace('/recipe_library');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#34916aff] to-[#d4edc9] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-3"></div>
          <p className="text-gray-600 text-center text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#34916aff] to-[#d4edc9] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center text-red-600 font-bold">
          <p>Error: {error}</p>
          <button
            onClick={handleBackToLibrary}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!recipe) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#34916aff] to-[#d4edc9] flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <p className="text-gray-600">Recipe not found.</p>
            <button
              onClick={handleBackToLibrary}
              className="mt-4 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              Back to Library
            </button>
          </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#34916aff] to-[#d4edc9]">
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button 
              onClick={handleBackToLibrary}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/30 transition-all text-sm"
            >
              <ArrowLeft size={18} />
              Back
            </button>
            <h1 className="text-2xl font-bold text-center flex-1 mx-4">
              {recipe.name}
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
                poster={recipe.imageUrl}
              >
                <source src={recipe.videoUrl} type="video/mp4" />
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
              {recipe.ingredients?.map((ingredient, index) => (
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
            {recipe.preparation?.map((step, index) => (
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

// Main component, now just wraps the inner component in Suspense
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
      <ViewProceduresInner />
    </Suspense>
  );
}