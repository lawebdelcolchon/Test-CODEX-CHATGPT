import React from "react";

export default function Input({ label, className = "", ...props }) {
  return (
    <label className="block w-full">
      {label && <span className="block text-sm text-gray-600 mb-1">{label}</span>}
      <input
        className={`w-full rounded-2xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`}
        {...props}
      />
    </label>
  );
}
