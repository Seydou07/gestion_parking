import * as React from "react";
import { Eye, Edit2, Trash2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Column<T> {
    key: string;
    header: string;
    render?: (item: T) => React.ReactNode;
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
}: DataTableProps<T>) {
    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400"
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
                    {data.length > 0 ? (
                        data.map((item) => (
                            <tr
                                key={keyExtractor(item)}
                                className={cn(
                                    "group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors",
                                    rowClassName && rowClassName(item)
                                )}
                            >
                                {columns.map((column) => (
                                    <td key={column.key} className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
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
                                className="px-6 py-12 text-center text-slate-400 italic"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
