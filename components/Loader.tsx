
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-b-blue-300 rounded-full animate-pulse"></div>
      </div>
      <p className="mt-4 text-slate-500 font-medium animate-pulse">Taking a deep breath...</p>
    </div>
  );
};

export default Loader;
