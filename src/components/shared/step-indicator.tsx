import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const STEPS = ["Datos personales", "Condiciones médicas", "Contactos", "Permisos y QR"];

export function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center py-4 px-2 sm:px-4 max-w-full overflow-hidden">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <div className="flex items-center" key={step}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold border-2 transition-colors",
                  done
                    ? "bg-green-500 border-green-500 text-white"
                    : active
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-gray-300 text-gray-400",
                )}
              >
                {done ? <Check size={14} /> : step}
              </div>
              <span
                className={cn(
                  "text-[10px] sm:text-xs mt-1 font-medium text-center leading-tight max-w-[58px] sm:max-w-[76px]",
                  active ? "text-blue-600 font-semibold" : done ? "text-green-600" : "text-gray-400",
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-6 xs:w-10 sm:w-16 md:w-20 mx-1 mb-5 transition-colors",
                  done ? "bg-green-500" : "bg-gray-200",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}