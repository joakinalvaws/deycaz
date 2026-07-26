"use client";

import { useRef, useState } from "react";
import {
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

// Virtualiza recién pasadas ~50 filas — con la escala actual (decenas) casi
// nunca se activa, pero el componente queda listo para cuando un listado
// crezca a cientos/miles de filas sin tener que volver a tocarlo.
const VIRTUALIZE_THRESHOLD = 50;
const ROW_HEIGHT = 53;

type DataTableProps<TData> = {
  columns: ColumnDef<TData>[];
  data: TData[];
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  columnVisibility?: VisibilityState;
  getRowId?: (row: TData) => string;
  emptyMessage?: string;
  onRowClick?: (row: TData) => void;
};

export function DataTable<TData>({
  columns,
  data,
  sorting,
  onSortingChange,
  rowSelection,
  onRowSelectionChange,
  columnVisibility,
  getRowId,
  emptyMessage = "Sin resultados.",
  onRowClick,
}: DataTableProps<TData>) {
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const [internalSelection, setInternalSelection] = useState<RowSelectionState>({});

  const effectiveSorting = sorting ?? internalSorting;
  const effectiveSelection = rowSelection ?? internalSelection;

  const table = useReactTable({
    data,
    columns,
    state: { sorting: effectiveSorting, rowSelection: effectiveSelection, columnVisibility },
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(effectiveSorting) : updater;
      if (onSortingChange) onSortingChange(next);
      else setInternalSorting(next);
    },
    onRowSelectionChange: (updater) => {
      const next = typeof updater === "function" ? updater(effectiveSelection) : updater;
      if (onRowSelectionChange) onRowSelectionChange(next);
      else setInternalSelection(next);
    },
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const rows = table.getRowModel().rows;
  const parentRef = useRef<HTMLDivElement>(null);
  const shouldVirtualize = rows.length > VIRTUALIZE_THRESHOLD;

  const virtualizer = useVirtualizer({
    count: shouldVirtualize ? rows.length : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  });

  const virtualRows = shouldVirtualize ? virtualizer.getVirtualItems() : [];
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom =
    virtualRows.length > 0 ? virtualizer.getTotalSize() - virtualRows[virtualRows.length - 1].end : 0;

  const visibleRows = shouldVirtualize ? virtualRows.map((vr) => rows[vr.index]) : rows;

  return (
    <div ref={parentRef} className="max-h-[70vh] overflow-auto rounded-md border">
      <Table>
        <TableHeader className="bg-background sticky top-0 z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className={cn(header.column.getCanSort() && "cursor-pointer select-none")}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getIsSorted() === "asc" && " ↑"}
                  {header.column.getIsSorted() === "desc" && " ↓"}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-muted-foreground h-24 text-center">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
          {shouldVirtualize && paddingTop > 0 && (
            <TableRow>
              <TableCell colSpan={columns.length} style={{ height: paddingTop, padding: 0 }} />
            </TableRow>
          )}
          {visibleRows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() ? "selected" : undefined}
              onClick={onRowClick ? () => onRowClick(row.original) : undefined}
              className={cn(onRowClick && "cursor-pointer")}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
              ))}
            </TableRow>
          ))}
          {shouldVirtualize && paddingBottom > 0 && (
            <TableRow>
              <TableCell colSpan={columns.length} style={{ height: paddingBottom, padding: 0 }} />
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
