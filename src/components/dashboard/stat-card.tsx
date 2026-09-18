import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { cn } from "@/components/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
    title: string
    value: string | number
    description?: string
    icon?: LucideIcon
    trend?: "up" | "down" | "neutral"
    className?: string
    "data-ui"?: string
}

export function StatCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    className,
    "data-ui": dataUi,
}: StatCardProps) {
    return (
        <Card className={cn("relative overflow-hidden", className)} data-ui={dataUi}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {title}
                </CardTitle>
                {Icon && (
                    <Icon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                )}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                    {value}
                </div>
                {description && (
                    <p className={cn(
                        "text-xs mt-1",
                        trend === "up" && "text-emerald-600 dark:text-emerald-400",
                        trend === "down" && "text-red-600 dark:text-red-400",
                        !trend && "text-slate-500 dark:text-slate-400"
                    )}>
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
