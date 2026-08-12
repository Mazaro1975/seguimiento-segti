"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Direction } from "@prisma/client";
import { RoleProvider } from "./RoleContext";
import { RoleSwitcher } from "./RoleSwitcher";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={`block rounded-md px-3 py-1.5 text-sm ${
        active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-200"
      }`}
    >
      {children}
    </Link>
  );
}

export function Shell({
  directions,
  children,
}: {
  directions: Direction[];
  children: React.ReactNode;
}) {
  return (
    <RoleProvider>
      <div className="flex min-h-screen">
        <aside className="flex w-64 flex-shrink-0 flex-col gap-6 border-r border-slate-200 bg-white p-4">
          <div>
            <h1 className="text-sm font-bold uppercase tracking-wide text-slate-900">
              SEGTI 2026
            </h1>
            <p className="text-xs text-slate-500">Seguimiento estratégico</p>
          </div>

          <nav className="flex flex-col gap-1">
            <NavLink href="/cronograma">Cronograma</NavLink>
            <NavLink href="/analisis">Análisis General</NavLink>
            <NavLink href="/riesgos">Riesgos y Alertas</NavLink>
          </nav>

          <div>
            <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Por Dirección
            </p>
            <nav className="flex max-h-64 flex-col gap-0.5 overflow-y-auto">
              {directions.map((d) => (
                <NavLink key={d.id} href={`/direccion/${d.slug}`}>
                  {d.name}
                </NavLink>
              ))}
            </nav>
          </div>

          <Link href="/iniciativas/nueva" className="btn-primary">
            + Nueva iniciativa
          </Link>
          <a href="/api/export/excel" className="btn-secondary">
            Exportar a Excel
          </a>

          <div className="mt-auto border-t border-slate-200 pt-4">
            <RoleSwitcher />
          </div>
        </aside>

        <main className="flex-1 overflow-x-auto p-6">{children}</main>
      </div>
    </RoleProvider>
  );
}
