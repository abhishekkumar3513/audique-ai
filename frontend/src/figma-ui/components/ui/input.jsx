import React from "react";

export function Input({ className = "", ...props }) {
  return (
    <input
      className={
        "w-full rounded-xl border bg-transparent px-3 py-2 text-sm outline-none " +
        "border-white/10 text-white placeholder:text-gray-500 " +
        "focus:border-pink-500/50 focus:ring-0 " +
        className
      }
      {...props}
    />
  );
}
