import React from 'react';

const ProgressBar = ({ value }) => {
  return (
    <div className="w-full bg-white rounded-full h-4">
      <div
        className="bg-rose-400 h-4 rounded-full transition-all duration-500"
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
