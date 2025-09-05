import React from "react";

export default function Card({ title, actions, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      {(title || actions) && (
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="flex gap-2">{actions}</div>
        </div>
      )}
      {children}
    </div>
  );
}
