"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement>
>(({ className, checked, defaultChecked, disabled, onChange, ...props }, ref) => {
    const [uncontrolledChecked, setUncontrolledChecked] = React.useState(Boolean(defaultChecked))
    const isControlled = checked !== undefined
    const isChecked = isControlled ? Boolean(checked) : uncontrolledChecked

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!isControlled) {
            setUncontrolledChecked(event.target.checked)
        }
        onChange?.(event)
    }

    return (
        <label
            className={cn(
                "relative inline-flex h-[24px] w-[44px] shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
                disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                isChecked ? "bg-orange-600" : "bg-gray-200",
                className
            )}
        >
            <input
                type="checkbox"
                className="sr-only"
                ref={ref}
                checked={checked}
                defaultChecked={isControlled ? undefined : defaultChecked}
                disabled={disabled}
                onChange={handleChange}
                {...props}
            />
            <span
                className={cn(
                    "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out",
                    isChecked ? "translate-x-5" : "translate-x-0"
                )}
            />
        </label>
    )
})
Switch.displayName = "Switch"

export { Switch }
