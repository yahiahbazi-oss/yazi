"use client";

import { governorates } from "@/lib/governorates";

export default function GovernorateSelect({ value, onChange, ...props }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full border border-neutral-200 rounded-lg text-neutral-900 px-4 py-3 text-sm focus:outline-none focus:border-neutral-400 transition-colors bg-white"
      {...props}
    >
      <option value="">Sélectionnez votre gouvernorat</option>
      {governorates.map((gov) => (
        <option key={gov} value={gov}>
          {gov}
        </option>
      ))}
    </select>
  );
}
