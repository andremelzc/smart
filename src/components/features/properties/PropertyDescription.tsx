"use client";

interface PropertyDescriptionProps {
  description: string;

  className?: string;
}

export function PropertyDescription({
  description,

  className = "",
}: PropertyDescriptionProps) {
  if (!description || typeof description !== "string") {
    return null;
  }

  return (
    <div className={`border-b border-gray-200 pb-6 ${className}`}>
      <h3 className="mb-3 text-xl font-semibold">Acerca de este lugar</h3>

      <p className="leading-relaxed text-gray-700">{description}</p>
    </div>
  );
}
