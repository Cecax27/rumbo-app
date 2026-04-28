"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked);
      props.onChange?.(e);
    };

    return (
      <div className="flex items-center">
        <input
          ref={ref}
          type="checkbox"
          className={cn(
            "h-4 w-4 rounded border border-neutral-300 bg-white cursor-pointer accent-neutral-700 dark:border-neutral-600 dark:bg-neutral-800 dark:accent-neutral-200",
            className
          )}
          onChange={handleChange}
          {...props}
        />
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox"

export { Checkbox }
