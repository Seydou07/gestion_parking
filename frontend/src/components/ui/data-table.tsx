import * as React from "react";
import { Eye, Edit2, Trash2, ChevronRight, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { Pagination } from "./pagination";

interface Column<T> {
    key: string;
    header: string;
    render?: (item: T) => React.ReactNode;
    className?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyExtractor: (item: T) => string | number;
    onView?: (item: T) => void;
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    emptyMessage?: string;
    rowClassName?: (item: T) => string;
    showPagination?: boolean;
    initialPageSize?: number;
}

export function DataTable<T>({
    data,
    columns,
    keyExtractor,
    onView,
    onEdit,
    onDelete,
    emptyMessage = "Aucune donnée trouvée",
    rowClassName,
    showPagination = true,
    initialPageSize = 10,
}: DataTableProps<T>) {
    const [currentPage, setCurrentPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(initialPageSize);

    // Reset to first page when data changes (e.g., after filtering)
    React.useEffect(() => {
        setCurrentPage(1);
    }, [data.length]);

    const totalPages = Math.ceil(data.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = showPagination 
        ? data.slice(startIndex, startIndex + pageSize)
        : data;

    return (
        <div className="w-full">
            <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className={cn(
                                    "text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400",
                                    column.className
                                )}
                            >
                                {column.header}
                            </th>
                        ))}
                        {(onView || onEdit || onDelete) && (
                            <th className="text-right px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">
                                Actions
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {paginatedData.length > 0 ? (
                        paginatedData.map((item) => (
                            <tr
                                key={keyExtractor(item)}
                                className={cn(
                                    "group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors",
                                    rowClassName && rowClassName(item)
                                )}
                            >
                                {columns.map((column) => (
                                    <td key={column.key} className={cn("px-6 py-4 text-sm text-slate-600 dark:text-slate-300", column.className)}>
                                        {column.render ? column.render(item) : (item as any)[column.key]}
                                    </td>
                                ))}
                                {(onView || onEdit || onDelete) && (
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 transition-opacity">
                                            {onView && (
                                                <button
                                                    onClick={() => onView(item)}
                                                    className="p-2 text-fleet-blue hover:bg-fleet-blue hover:text-white rounded-lg transition-all"
                                                    title="Voir"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            )}
                                            {onEdit && (
                                                <button
                                                    onClick={() => onEdit(item)}
                                                    className="p-2 text-amber-500 hover:bg-amber-500 hover:text-white rounded-lg transition-all"
                                                    title="Modifier"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button
                                                    onClick={() => onDelete(item)}
                                                    className="p-2 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={columns.length + (onView || onEdit || onDelete ? 1 : 0)}
                                className="px-6 py-20 text-center"
                            >
                                <div className="flex flex-col items-center justify-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center">
                                        <Inbox className="w-6 h-6 text-slate-300" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-400 italic">
                                        {emptyMessage}
                                    </p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            </div>

            {showPagination && data.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalItems={data.length}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setCurrentPage(1);
                    }}
                />
            )}
        </div>
    );
}
