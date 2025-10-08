import React, { Suspense } from 'react';
// Import the client component you renamed/created
import ShiftNotesSystem from './ShiftNotesSystem'; 
import { AlertTriangle } from 'lucide-react';

// This component is a Server Component by default

export default function ShiftNoteWrapper() {
  return (
    // 💡 The fix: Wrap the client component that uses useSearchParams()
    // in a Suspense boundary. This tells Next.js to skip rendering 
    // ShiftNotesSystem on the server and show the 'fallback' until 
    // the client takes over.
    <Suspense fallback={<LoadingFallback />}>
      <ShiftNotesSystem />
    </Suspense>
  );
}

// Optional: A minimal loading component to show during the client-side load
function LoadingFallback() {
  return (
    <div className="text-center p-8 min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-800">Loading Shift Notes System...</h2>
      <p className="text-gray-500 mt-2 flex items-center">
        <AlertTriangle className="w-4 h-4 mr-1 text-yellow-500"/>
        Initializing client-side features
      </p>
    </div>
  );
}