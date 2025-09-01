// src/app/practical_check/page.js
// No 'use client' here
import { Suspense } from 'react';
import PracticalCheckContent from './PracticalCheckContent';

export default function PracticalCheckScreen() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PracticalCheckContent />
    </Suspense>
  );
}