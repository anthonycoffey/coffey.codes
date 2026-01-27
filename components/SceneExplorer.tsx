'use client';

import React, { useState } from 'react';

interface SceneExplorerProps {
  sceneNames: string[];
  children: React.ReactNode;
}

const SceneExplorer: React.FC<SceneExplorerProps> = ({
  sceneNames,
  children,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const scenes = React.Children.toArray(children);

  // If we have names but not enough scenes, or vice versa, handle gracefully
  const validScenes = scenes.slice(0, sceneNames.length);

  if (validScenes.length === 0) {
    return null;
  }

  return (
    <div className="w-full my-8 flex flex-col rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-950 shadow-sm">
      <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        {sceneNames.map((name, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`
              px-5 py-3 text-sm font-medium transition-all duration-200 ease-in-out relative
              ${
                activeTab === index
                  ? 'text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-950 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
              }
            `}
          >
            {name}
            {activeTab === index && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 dark:bg-blue-400" />
            )}
          </button>
        ))}
      </div>
      
      <div className="p-1 sm:p-4 bg-white dark:bg-gray-950 min-h-[300px] flex items-center justify-center">
        {validScenes.map((scene, index) => (
          <div 
            key={index} 
            className={`w-full transition-opacity duration-300 ${activeTab === index ? 'block opacity-100' : 'hidden opacity-0'}`}
          >
             {/* Only render the active scene to save WebGL resources */}
             {activeTab === index ? scene : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SceneExplorer;
