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
    <div className="mx-auto flex w-full max-w-[520px] items-center justify-between rounded-2xl border border-blue-light-150 bg-blue-light-50 px-6 py-4">
      <div className="flex-1 pr-6">
        <p className="text-sm font-semibold text-gray-dark-700">{label}</p>
        <p className="text-xs text-gray-dark-500">{description}</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onDecrement}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-light-200 text-blue-light-600 transition-colors hover:border-blue-light-300 disabled:cursor-not-allowed disabled:border-blue-light-100 disabled:text-blue-light-200"
          aria-label={`Disminuir ${label}`}
          disabled={value === 0}
        >
          -
        </button>

        <span className="w-6 text-center text-sm font-semibold text-gray-dark-700">
          {value}
        </span>

        <button
          type="button"
          onClick={onIncrement}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-light-200 text-blue-light-600 transition-colors hover:border-blue-light-300"
          aria-label={`Incrementar ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
