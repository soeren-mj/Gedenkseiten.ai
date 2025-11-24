'use client';

import React from 'react';

interface ProgressIndicatorProps {
  currentStep: number; // 1, 2, or 3
  totalSteps: number; // Usually 3
  className?: string;
}

/**
 * ProgressIndicator Component
 *
 * Shows "Schritt X von Y" text only
 *
 * Features:
 * - Simple text label showing current step
 * - Responsive
 */
export function ProgressIndicator({ currentStep, totalSteps, className = '' }: ProgressIndicatorProps) {
  return (
    <div className={`w-full ${className}`}>
      {/* Text Label */}
      <div className="text-body-s text-secondary text-center">
        Schritt {currentStep} von {totalSteps}
      </div>
    </div>
  );
}
