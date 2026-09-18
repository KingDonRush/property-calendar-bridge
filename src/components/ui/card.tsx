import * as React from "react"
import { cn } from "@/components/lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    "data-ui"?: string
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, "data-ui": dataUi, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "rounded-xl border border-slate-200 bg-white text-slate-950 shadow dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50",
                className
            )}
            data-ui={dataUi}
            {...props}
        />
    )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, "data-ui": dataUi, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("flex flex-col space-y-1.5 p-6", className)}
            data-ui={dataUi}
            {...props}
        />
    )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement> & { "data-ui"?: string }>(
    ({ className, "data-ui": dataUi, ...props }, ref) => (
        <h3
            ref={ref}
            className={cn("font-semibold leading-none tracking-tight", className)}
            data-ui={dataUi}
            {...props}
        />
    )
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement> & { "data-ui"?: string }>(
    ({ className, "data-ui": dataUi, ...props }, ref) => (
        <p
            ref={ref}
            className={cn("text-sm text-slate-500 dark:text-slate-400", className)}
            data-ui={dataUi}
            {...props}
        />
    )
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, "data-ui": dataUi, ...props }, ref) => (
        <div ref={ref} className={cn("p-6 pt-0", className)} data-ui={dataUi} {...props} />
    )
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, "data-ui": dataUi, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("flex items-center p-6 pt-0", className)}
            data-ui={dataUi}
            {...props}
        />
    )
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
