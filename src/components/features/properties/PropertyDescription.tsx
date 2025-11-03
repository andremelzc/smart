'use client';

interface PropertyDescriptionProps {
  description: string;
  className?: string;
}

export function PropertyDescription({ 
  description, 
  className = '' 
}: PropertyDescriptionProps) {
  if (!description || typeof description !== 'string') {
    return null;
  }

  return (
    <div className={`border-b border-gray-200 pb-6 ${className}`}>
      <h3 className="text-xl font-semibold mb-3">Acerca de este lugar</h3>
      <p className="text-gray-700 leading-relaxed">
        {description}
      </p>
    </div>
  );
}