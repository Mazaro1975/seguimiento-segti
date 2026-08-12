"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { EstadoBadge } from "./EstadoBadge";
import { CLASIFICACION_LABELS, TIPO_SOLICITUD_LABELS, TRIMESTRE_LABELS } from "@/lib/labels";
import type { Clasificacion, InitiativeWithRelations, TipoSolicitud, Trimestre } from "@/lib/types";

interface InitiativeTableProps {
  initiatives: InitiativeWithRelations[];
  showDirectionColumn?: boolean;
}

export function InitiativeTable({ initiatives, showDirectionColumn = true }: InitiativeTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<InitiativeWithRelations>[]>(() => {
    const cols: ColumnDef<InitiativeWithRelations>[] = [
      {
        accessorKey: "legacyNumber",
        header: "N°",
        cell: (info) => info.getValue() ?? "—",
      },
      {
        accessorKey: "title",
        header: "Iniciativa",
        cell: (info) => (
          <Link
            href={`/iniciativas/${info.row.original.id}`}
            className="font-medium text-slate-900 hover:underline"
          >
            {info.getValue() as string}
          </Link>
        ),
      },
    ];

    if (showDirectionColumn) {
      cols.push({
        accessorFn: (row) => row.direction.name,
        id: "direction",
        header: "Dirección",
      });
    }

    cols.push(
      {
        accessorKey: "trimestre",
        header: "Trimestre",
        cell: (info) => TRIMESTRE_LABELS[info.getValue() as Trimestre] ?? info.getValue(),
      },
      {
        accessorKey: "clasificacion",
        header: "Clasificación",
        cell: (info) => CLASIFICACION_LABELS[info.getValue() as Clasificacion] ?? info.getValue(),
      },
      {
        accessorKey: "estado",
        header: "Estado",
        cell: (info) => <EstadoBadge estado={info.getValue() as string} />,
      },
      {
        accessorKey: "esfuerzo",
        header: "Esfuerzo",
        cell: (info) => info.getValue() ?? "SD",
      },
      {
        accessorKey: "prioridad",
        header: "Prioridad",
        cell: (info) => info.getValue() ?? "N/D",
      },
      {
        accessorKey: "tipoSolicitud",
        header: "Tipo Solicitud",
        cell: (info) => {
          const v = info.getValue() as TipoSolicitud | null;
          return v ? TIPO_SOLICITUD_LABELS[v] : "—";
        },
      },
      {
        accessorKey: "liderTI",
        header: "Líder TI",
        cell: (info) => info.getValue() ?? "—",
      },
      {
        accessorKey: "liderNegocio",
        header: "Líder Negocio",
        cell: (info) => info.getValue() ?? "—",
      }
    );

    return cols;
  }, [showDirectionColumn]);

  const table = useReactTable({
    data: initiatives,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="card overflow-x-auto p-0">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-100 text-xs uppercase text-slate-500">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  className="cursor-pointer select-none whitespace-nowrap px-3 py-2"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {{ asc: " ▲", desc: " ▼" }[header.column.getIsSorted() as string] ?? ""}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50">
              {row.getVisibleCells().map((c) => (
                <td key={c.id} className="whitespace-nowrap px-3 py-2">
                  {flexRender(c.column.columnDef.cell, c.getContext())}
                </td>
              ))}
            </tr>
          ))}
          {table.getRowModel().rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-3 py-6 text-center text-slate-400">
                No hay iniciativas que coincidan con los filtros.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
