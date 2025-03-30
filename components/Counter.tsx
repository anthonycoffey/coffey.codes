'use client';
import React, { useState } from 'react';

export default function CounterComponent() {
  const [count, setCount] = useState<number>(0);

  const incrementCount = () => {
    setCount((prevCount) => prevCount + 1);
  };

  return (
    <div className="flex items-center justify-center bg-gradient-to-b from-blue-500 to-purple-500 p-8 my-4">
      <div className="bg-white rounded-lg p-8 shadow-lg">
        <span className="font-bold mb-4 block text-center text-black">
          Counter Example
        </span>
        <div className="flex items-center space-x-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
            onClick={incrementCount}
          >
            Press Me
          </button>
          <span className="text-sm text-black font-semibold p-2 border border-2 rounded">
            {count}
          </span>
        </div>
      </div>
    </div>
  );
}
