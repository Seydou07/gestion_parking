import * as React from "react";
import { 
    ChevronLeft, 
    ChevronRight, 
    ChevronsLeft, 
    ChevronsRight 
} from "lucide-react";
import { Button } from "./button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./select";
import { cn } from "@/lib/utils";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    pageSizeOptions?: number[];
    totalItems?: number;
}

export function Pagination({
    currentPage,
    totalPages,
    pageSize,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [5, 10, 20, 50, 100],
    totalItems
}: PaginationProps) {
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 transition-all">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">
                        Lignes par page
                    </p>
                    <Select
                        value={pageSize.toString()}
                        onValueChange={(value) => onPageSizeChange(Number(value))}
                    >
                        <SelectTrigger className="h-9 w-[70px] rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold">
                            <SelectValue placeholder={pageSize} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                            {pageSizeOptions.map((option) => (
                                <SelectItem key={option} value={option.toString()} className="text-xs font-bold">
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {totalItems !== undefined && (
                    <p className="text-xs font-bold text-slate-500 hidden md:block">
                        Total: <span className="text-fleet-blue font-black">{totalItems}</span> éléments
                    </p>
                )}
            </div>

            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 mr-4">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                        Page <span className="text-slate-900 dark:text-white">{currentPage}</span> sur <span className="text-slate-900 dark:text-white">{totalPages || 1}</span>
                    </p>
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 border-slate-200 dark:border-slate-800 disabled:opacity-30"
                        onClick={() => onPageChange(1)}
                        disabled={currentPage <= 1}
                        title="Première page"
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 border-slate-200 dark:border-slate-800 disabled:opacity-30"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        title="Page précédente"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 border-slate-200 dark:border-slate-800 disabled:opacity-30"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        title="Page suivante"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 border-slate-200 dark:border-slate-800 disabled:opacity-30"
                        onClick={() => onPageChange(totalPages)}
                        disabled={currentPage >= totalPages}
                        title="Dernière page"
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
