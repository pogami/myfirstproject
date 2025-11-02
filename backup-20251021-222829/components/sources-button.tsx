"use client";

import { useState } from "react";

export default function SourcesButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen(!open)}
        className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors duration-200"
      >
        {open ? "Hide Sources" : "Show Sources"}
      </button>

      {open && (
        <ul className="mt-2 list-disc list-inside text-sm text-gray-700">
          <li>
            <a 
              href="https://apnews.com/article/0847ee76eedecbd5e9baa6888b567d66" 
              target="_blank" 
              rel="noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              AP News – Trump makes unfounded claims about Tylenol
            </a>
          </li>
          <li>
            <a 
              href="https://www.washingtonpost.com/health/2025/09/22/tylenol-pregnancy-autism-risk-rfk-jr" 
              target="_blank" 
              rel="noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Washington Post – Trump gave medical advice about Tylenol
            </a>
          </li>
          <li>
            <a 
              href="https://apnews.com/article/65e9c04d05014345364212ecaec4ee3e" 
              target="_blank" 
              rel="noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              AP News – Autism families react to Trump's comments
            </a>
          </li>
        </ul>
      )}
    </div>
  );
}
