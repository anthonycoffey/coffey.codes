'use client';
import { ArrowLongLeftIcon } from '@heroicons/react/20/solid';
import { useRouter } from 'next/navigation';

export default function GoBack() {
  const router = useRouter();

  const onClick = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      router.push('/articles');
    }
  };

  return (
    <div className="t-8 pt-6">
      <button
        type="button"
        className="flex items-center align-items cursor-pointer my-4 mb-4 md:-ml-4 hover:underline"
        onClick={onClick}
      >
        <span>
          <ArrowLongLeftIcon className="h-4 w-4 mr-2" aria-hidden="true" />
        </span>
        Back
      </button>
    </div>
  );
}
