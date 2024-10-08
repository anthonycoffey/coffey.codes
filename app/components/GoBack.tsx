'use client';
import { ArrowLongLeftIcon } from '@heroicons/react/20/solid';

export default function GoBack() {
  return (
    <a
      className="flex items-center align-items cursor-pointer mb-4 md:-ml-4 text-sm hover:underline"
      onClick={() => {
        history.back();
      }}
    >
      <span>
        <ArrowLongLeftIcon className="h-4 w-4 mr-2" />
      </span>
      go back
    </a>
  );
}
