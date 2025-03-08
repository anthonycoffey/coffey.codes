'use client';
import { useState } from 'react';

export default function PortfolioGrid({ items }) {
  const [selectedItem, setSelectedItem] = useState(null);

  const closeModal = () => setSelectedItem(null);

  return (
    <>
      {/* Content Grid */}
      <div className="mt-8 grid gap-6">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => setSelectedItem(item)}
            className="text-left block p-6 bg-neutral-800 rounded-lg shadow hover:shadow-lg hover:bg-neutral-700 transition"
          >
            <h2 className="text-lg font-semibold text-white mb-2">
              {item.title}
            </h2>
            <p className="">{item.description}</p>
          </button>
        ))}
      </div>

      {/* Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
          onClick={closeModal}
        >
          <div
            className="relative bg-neutral-900 text-white rounded-lg p-8 w-11/12 max-w-md shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 hover:text-white"
              onClick={closeModal}
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">{selectedItem.title}</h2>
            <p className="mb-4">{selectedItem.details}</p>

            <div className="flex flex-col justify-center items-center">
              {selectedItem?.projectUrl && (
                <a
                  href={selectedItem.projectUrl}
                  className="bg-blue-500 text-white py-2 px-4 rounded"
                  target="_blank"
                >
                  View Project
                </a>
              )}

              {selectedItem?.githubUrl && (
                <a
                  href={selectedItem.githubUrl}
                  className="bg-transparent text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                  target="_blank"
                >
                  View Source Code
                </a>
              )}
            </div>
            {selectedItem?.playStoreLink && (
              <>
                <a
                  href={selectedItem.playStoreLink}
                  className="hover:underline"
                  target="_blank"
                >
                  View App in Play Store
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
