import { Suspense } from 'react';
import TrainingDayContent from './TrainingDayContent';

export default function ServerTrainingDay() {
  return (
    <Suspense fallback={<div>Loading training day...</div>}>
      <TrainingDayContent />
    </Suspense>
  );
}