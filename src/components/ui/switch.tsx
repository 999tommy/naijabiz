"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
    <div className={cn("relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        props.checked || props.defaultChecked ? "bg-orange-600" : "bg-gray-200")}>
        <input type="checkbox" className="sr-only" ref={ref} {...props} />
        <span
            className={cn(
                "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform duration-200 ease-in-out bg-white",
                props.checked || props.defaultChecked ? "translate-x-5" : "translate-x-0"
            )}
        />
    </div>
))
Switch.displayName = "Switch"

export { Switch }
