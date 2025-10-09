// This file is a Server Component by default, handling the Suspense boundary.
import { Suspense } from 'react';
// Correctly import the component from the new file:
import ShiftNoteContent from './ShiftNoteContent'; 

export default function ShiftNotePage() {
  return (
    <Suspense fallback={
      <div className="text-center p-12 bg-white/80 rounded-2xl shadow-xl">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800">Loading Shift Notes System...</h2>
      </div>
    }>
      {/* The ShiftNoteContent component contains 'useSearchParams' and is now a Client Component */}
      <ShiftNoteContent /> 
    </Suspense>
  );
}