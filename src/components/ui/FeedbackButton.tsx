'use client';

import Link from 'next/link';
import FeedbackIcon from '@/components/icons/FeedbackIcon';

export default function FeedbackButton() {
  return (
    <Link
      href="/dashboard/feedback"
      className="fixed bottom-6 right-6 flex items-center gap-2 px-3 py-2 text-body-s text-tertiary hover:text-primary bg-transparent hover:bg-bw-opacity-60 rounded-md transition-all z-50"
    >
      <FeedbackIcon className="w-4 h-4" />
      <span>Feedback senden</span>
    </Link>
  );
}
