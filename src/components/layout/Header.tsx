'use client';

import React from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/theme-toggle'; // Assuming ThemeToggle is here

interface HeaderProps {
  owner: string;
  repo: string;
}

const Header: React.FC<HeaderProps> = ({ owner, repo }) => {
  return (
    <header className="bg-gray-100 dark:bg-gray-800 p-4 shadow-md flex justify-between items-center">
      <div className="flex items-center">
        <Link href="/" className="text-2xl font-bold text-gray-800 dark:text-white">
          SLIME
        </Link>
        {owner && repo && (
          <span className="ml-4 text-sm text-gray-600 dark:text-gray-300">
            {owner}/{repo}
          </span>
        )}
      </div>
      <div>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header; 