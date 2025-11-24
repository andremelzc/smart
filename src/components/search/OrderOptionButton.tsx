type OrderOptionButtonProps = {
  value: "price" | "rating";
  label: string;
  description: string;
  active: boolean;
  onSelect: (value: "price" | "rating") => void;
};

export function OrderOptionButton({
  value,
  label,
  description,
  active,
  onSelect,
}: OrderOptionButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`flex flex-1 items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
        active
          ? "border-blue-vivid-500 bg-blue-vivid-50 text-blue-vivid-700 shadow-sm"
          : "border-blue-light-150 bg-blue-light-50 text-gray-dark-600 hover:border-blue-light-300"
      }`}
      aria-pressed={active}
    >
      <span
        className={`mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full border ${
          active
            ? "border-blue-vivid-500 bg-blue-vivid-500"
            : "border-blue-light-300 bg-white"
        }`}
        aria-hidden="true"
      >
        <span
          className={`h-2 w-2 rounded-full ${active ? "bg-white" : "bg-transparent"}`}
        />
      </span>

      <span className="flex-1">
        <p className="text-gray-dark-700 text-sm font-semibold">{label}</p>
        <p className="text-gray-dark-500 text-xs">{description}</p>
      </span>
    </button>
  );
}
