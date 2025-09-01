// src/app/quiz_screen/page.js
import { Suspense } from 'react';
import QuizContent from './QuizContent';

export default function QuizScreen() {
    return (
        <Suspense fallback={<div>Loading quiz...</div>}>
            <QuizContent />
        </Suspense>
    );
}