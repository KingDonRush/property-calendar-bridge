import * as React from "react"
import { cn } from "@/components/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
    "data-ui"?: string
}

const badgeVariants = {
    base: "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2",
    variant: {
        default: "border-transparent bg-slate-900 text-slate-50 shadow hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200",
        secondary: "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-700",
        destructive: "border-transparent bg-red-500 text-slate-50 shadow hover:bg-red-600 dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-800",
        outline: "text-slate-950 dark:text-slate-50",
        success: "border-transparent bg-emerald-500 text-slate-50 shadow hover:bg-emerald-600 dark:bg-emerald-600 dark:text-slate-50 dark:hover:bg-emerald-700",
        warning: "border-transparent bg-amber-500 text-slate-900 shadow hover:bg-amber-600 dark:bg-amber-500 dark:text-slate-900 dark:hover:bg-amber-600",
    },
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
    ({ className, variant = "default", "data-ui": dataUi, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(badgeVariants.base, badgeVariants.variant[variant], className)}
                data-ui={dataUi}
                {...props}
            />
        )
    }
)
Badge.displayName = "Badge"

export { Badge, badgeVariants }
