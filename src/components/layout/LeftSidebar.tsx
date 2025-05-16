'use client';

import React from 'react';

const LeftSidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-gray-50 dark:bg-gray-700 p-4 shadow-md h-full">
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Sidebar</h2>
      {/* Placeholder for sidebar content, e.g., file tree, chat history */}
      <p className="text-sm text-gray-500 dark:text-gray-400">Future home of navigation or quick actions.</p>
    </aside>
  );
};

export default LeftSidebar; 