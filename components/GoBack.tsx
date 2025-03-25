'use client';
import { ArrowLongLeftIcon } from '@heroicons/react/20/solid';

export default function GoBack() {
  return (
    <div className="border-t mt-8 pt-6">
      <a
        className="flex items-center align-items cursor-pointer my-4 mb-4 md:-ml-4 hover:underline"
        onClick={() => {
          history.back();
        }}
      >
        <span>
          <ArrowLongLeftIcon className="h-4 w-4 mr-2" />
        </span>
        Back
      </a>
    </div>
  );
}
