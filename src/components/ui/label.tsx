import * as React from "react"
import { cn } from "@/components/lib/utils"

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    "data-ui"?: string
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
    ({ className, "data-ui": dataUi, ...props }, ref) => {
        return (
            <label
                ref={ref}
                className={cn(
                    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                    className
                )}
                data-ui={dataUi}
                {...props}
            />
        )
    }
)
Label.displayName = "Label"

export { Label }
