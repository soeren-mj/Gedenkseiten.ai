'use client';

import React from 'react';
import BackendHeader from '@/components/dashboard/BackendHeader';
import Button from '@/components/ui/Button';
import { ChevronLeft } from 'lucide-react';
import ChevronRightIcon from '@/components/icons/ChevronRightIcon';

interface WizardStepLayoutProps {
  /** Current step number (1-indexed) */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Main title displayed in left column */
  title: string;
  /** Description text below title */
  description: string;
  /** Optional secondary description (tertiary color) */
  secondaryDescription?: string;
  /** Optional additional content for left column (below description) */
  leftContent?: React.ReactNode;
  /** Form/Content for right column */
  children: React.ReactNode;
  /** Back button handler */
  onBack: () => void;
  /** Next button handler (optional if using formId) */
  onNext?: () => void;
  /** Next button label (default: "Weiter") */
  nextLabel?: string;
  /** Back button label (default: "Zurück") */
  backLabel?: string;
  /** Disable next button */
  nextDisabled?: boolean;
  /** Show loading state on next button */
  nextLoading?: boolean;
  /** Form ID for submit button (if next button should submit a form) */
  formId?: string;
}

/**
 * WizardStepLayout Component
 *
 * New layout for memorial creation wizard steps.
 * Features horizontal two-column design with BackendHeader and sticky pill footer.
 *
 * Layout:
 * - BackendHeader with "Gedenkseite erstellen" action label
 * - Left column (50%): Step indicator, title, description, optional leftContent
 * - Right column (50%): Form content (children)
 * - Sticky footer: Pill with back/next buttons
 */
export default function WizardStepLayout({
  currentStep,
  totalSteps,
  title,
  description,
  secondaryDescription,
  leftContent,
  children,
  onBack,
  onNext,
  nextLabel = 'Weiter',
  backLabel = 'Zurück',
  nextDisabled = false,
  nextLoading = false,
  formId,
}: WizardStepLayoutProps) {
  const handleNext = () => {
    if (onNext) {
      onNext();
    }
  };

  return (
    <main className="flex flex-col min-h-screen bg-light-dark-mode">
      {/* Header */}
      <BackendHeader actionLabel="Gedenkseite erstellen" />

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-12">
          {/* Left Column - Text */}
          <div className="lg:w-1/2 flex flex-col gap-4">
            <p className="text-body-s text-secondary">
              Schritt {currentStep} von {totalSteps}
            </p>
            <h1 className="text-webapp-section text-primary">
              {title}
            </h1>
            <p className="text-body-m text-secondary">
              {description}
            </p>
            {secondaryDescription && (
              <p className="text-body-m text-tertiary">
                {secondaryDescription}
              </p>
            )}
            {leftContent}
          </div>

          {/* Right Column - Form */}
          <div className="lg:w-1/2">
            {children}
          </div>
        </div>
      </div>

      {/* Sticky Footer with Pill */}
      <div className="sticky bottom-0 flex justify-center p-4">
        <div className="flex items-center p-1 bg-bw-opacity-40 backdrop-blur-md rounded-full shadow-lg">
          {/* Zurück Button Container */}
          <div className="rounded-full">
            <Button
              variant="text"
              size="sm"
              leftIcon={<ChevronLeft className="w-4 h-4" />}
              onClick={onBack}
            >
              {backLabel}
            </Button>
          </div>
          {/* Weiter Button Container - colored background */}
          <div className={`rounded-full ${nextDisabled ? 'bg-interactive-disabled' : 'bg-interactive-primary-default hover:bg-interactive-primary-hover'}`}>
            <Button
              variant="text"
              size="sm"
              rightIcon={<ChevronRightIcon size={16} />}
              onClick={formId ? undefined : handleNext}
              disabled={nextDisabled}
              loading={nextLoading}
              type={formId ? 'submit' : 'button'}
              form={formId}
              className={nextDisabled ? '' : '!text-interactive-default hover:!text-interactive-default'}
            >
              {nextLabel}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
