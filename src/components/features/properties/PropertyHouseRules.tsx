"use client";

interface PropertyHouseRulesProps {
  houseRules?: string;

  checkinTime?: string;

  checkoutTime?: string;

  className?: string;
}

export function PropertyHouseRules({
  houseRules,

  checkinTime,

  checkoutTime,

  className = "",
}: PropertyHouseRulesProps) {
  // Si no hay reglas ni horarios, no mostrar el componente

  if (!houseRules && !checkinTime && !checkoutTime) {
    return null;
  }

  return (
    <div className={`border-b border-gray-200 pb-6 ${className}`}>
      <h3 className="mb-3 text-xl font-semibold">Reglas de la casa</h3>

      <div className="space-y-2">
        {checkinTime && (
          <div className="flex items-center gap-2">
            <span>Check-in: {checkinTime}</span>
          </div>
        )}

        {checkoutTime && (
          <div className="flex items-center gap-2">
            <span>Check-out: {checkoutTime}</span>
          </div>
        )}

        {houseRules && <p className="mt-3 text-gray-700">{houseRules}</p>}
      </div>
    </div>
  );
}
