type QuantityFieldControlProps = {
  label: string;
  description: string;
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
};

export function QuantityFieldControl({
  label,
  description,
  value,
  onIncrement,
  onDecrement,
}: QuantityFieldControlProps) {
  return (
    <div className="border-blue-light-150 bg-blue-light-50 mx-auto flex w-full max-w-[520px] items-center justify-between rounded-2xl border px-6 py-4">
      <div className="flex-1 pr-6">
        <p className="text-gray-dark-700 text-sm font-semibold">{label}</p>
        <p className="text-gray-dark-500 text-xs">{description}</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onDecrement}
          className="border-blue-light-200 text-blue-light-600 hover:border-blue-light-300 disabled:border-blue-light-100 disabled:text-blue-light-200 flex h-8 w-8 items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed"
          aria-label={`Disminuir ${label}`}
          disabled={value === 0}
        >
          -
        </button>

        <span className="text-gray-dark-700 w-6 text-center text-sm font-semibold">
          {value}
        </span>

        <button
          type="button"
          onClick={onIncrement}
          className="border-blue-light-200 text-blue-light-600 hover:border-blue-light-300 flex h-8 w-8 items-center justify-center rounded-full border transition-colors"
          aria-label={`Incrementar ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
