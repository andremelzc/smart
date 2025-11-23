import { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

type CollapsibleSectionProps = {
  id: string | number;
  title: string;
  isOpen: boolean;
  onToggle: (id: string | number) => void;
  children: ReactNode;
};

export function CollapsibleSection({
  id,
  title,
  isOpen,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-blue-light-150 bg-blue-light-50">
      <button
        type="button"
        onClick={() => onToggle(id)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-gray-dark-700 transition-colors hover:bg-blue-light-100"
      >
        <span>{title}</span>
        <ChevronDown
          className={`h-4 w-4 text-blue-light-600 transition-transform duration-200 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      <div
        className={`px-4 pb-4 pt-0 transition-[max-height,opacity] duration-200 ease-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
