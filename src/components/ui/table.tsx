import * as React from "react"
import { cn } from "@/components/lib/utils"

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
    "data-ui"?: string
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
    ({ className, "data-ui": dataUi, ...props }, ref) => (
        <div className="relative w-full overflow-auto">
            <table
                ref={ref}
                className={cn("w-full caption-bottom text-sm", className)}
                data-ui={dataUi}
                {...props}
            />
        </div>
    )
)
Table.displayName = "Table"

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement> & { "data-ui"?: string }>(
    ({ className, "data-ui": dataUi, ...props }, ref) => (
        <thead ref={ref} className={cn("[&_tr]:border-b", className)} data-ui={dataUi} {...props} />
    )
)
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement> & { "data-ui"?: string }>(
    ({ className, "data-ui": dataUi, ...props }, ref) => (
        <tbody
            ref={ref}
            className={cn("[&_tr:last-child]:border-0", className)}
            data-ui={dataUi}
            {...props}
        />
    )
)
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement> & { "data-ui"?: string }>(
    ({ className, "data-ui": dataUi, ...props }, ref) => (
        <tfoot
            ref={ref}
            className={cn("border-t bg-slate-100/50 font-medium dark:bg-slate-800/50 [&>tr]:last:border-b-0", className)}
            data-ui={dataUi}
            {...props}
        />
    )
)
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement> & { "data-ui"?: string }>(
    ({ className, "data-ui": dataUi, ...props }, ref) => (
        <tr
            ref={ref}
            className={cn(
                "border-b border-slate-200 transition-colors hover:bg-slate-100/50 data-[state=selected]:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800/50 dark:data-[state=selected]:bg-slate-800",
                className
            )}
            data-ui={dataUi}
            {...props}
        />
    )
)
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement> & { "data-ui"?: string }>(
    ({ className, "data-ui": dataUi, ...props }, ref) => (
        <th
            ref={ref}
            className={cn(
                "h-10 px-2 text-left align-middle font-medium text-slate-500 dark:text-slate-400 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
                className
            )}
            data-ui={dataUi}
            {...props}
        />
    )
)
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement> & { "data-ui"?: string }>(
    ({ className, "data-ui": dataUi, ...props }, ref) => (
        <td
            ref={ref}
            className={cn("p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]", className)}
            data-ui={dataUi}
            {...props}
        />
    )
)
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement> & { "data-ui"?: string }>(
    ({ className, "data-ui": dataUi, ...props }, ref) => (
        <caption
            ref={ref}
            className={cn("mt-4 text-sm text-slate-500 dark:text-slate-400", className)}
            data-ui={dataUi}
            {...props}
        />
    )
)
TableCaption.displayName = "TableCaption"

export {
    Table,
    TableHeader,
    TableBody,
    TableFooter,
    TableHead,
    TableRow,
    TableCell,
    TableCaption,
}
