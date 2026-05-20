import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { downloadCsv } from "@/lib/admin/csv";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Download, Plus } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export type AdminColumn<Row> = {
  key: string;
  label: string;
  render?: (row: Row) => React.ReactNode;
  // value used for CSV export when render returns JSX
  csv?: (row: Row) => unknown;
  sortable?: boolean;
};

export type AdminFilter = {
  key: string;
  label: string;
  options: Array<{ value: string; label: string }>;
};

export type AdminTableProps<Row> = {
  title: string;
  table: string; // supabase table for query + csv filename
  columns: AdminColumn<Row>[];
  filters?: AdminFilter[];
  searchColumns?: string[]; // ilike OR search across these columns
  searchPlaceholder?: string;
  defaultSort?: { column: string; ascending?: boolean };
  // optional post-fetch enricher (e.g. join profile names)
  enrich?: (rows: Row[]) => Promise<Row[]>;
  // selector string for supabase .select(); default '*'
  select?: string;
  onRowClick?: (row: Row) => void;
  rightActions?: React.ReactNode;
  newButton?: { label: string; onClick: () => void };
  emptyDescription?: string;
  pageSize?: number;
  // bump this to force a refetch
  refreshKey?: number | string;
};

export function AdminTable<Row extends Record<string, unknown> & { id: string }>(
  props: AdminTableProps<Row>,
) {
  const pageSize = props.pageSize ?? 50;
  const [rows, setRows] = React.useState<Row[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(0);
  const [search, setSearch] = React.useState("");
  const [filterValues, setFilterValues] = React.useState<Record<string, string>>({});
  const [sort, setSort] = React.useState<{ column: string; ascending: boolean }>(
    {
      column: props.defaultSort?.column ?? "created_at",
      ascending: props.defaultSort?.ascending ?? false,
    },
  );

  const buildQuery = React.useCallback(() => {
    let q = supabase
      .from(props.table as never)
      .select(props.select ?? "*", { count: "exact" });
    for (const [k, v] of Object.entries(filterValues)) {
      if (!v || v === "__all__") continue;
      if (v === "true" || v === "false") q = q.eq(k, v === "true");
      else q = q.eq(k, v);
    }
    if (search.trim() && props.searchColumns && props.searchColumns.length) {
      const term = search.trim().replace(/[%,]/g, "");
      const or = props.searchColumns.map((c) => `${c}.ilike.%${term}%`).join(",");
      q = q.or(or);
    }
    q = q.order(sort.column, { ascending: sort.ascending });
    return q;
  }, [props.table, props.select, filterValues, search, sort, props.searchColumns]);

  React.useEffect(() => {
    let cancel = false;
    setLoading(true);
    const q = buildQuery().range(page * pageSize, page * pageSize + pageSize - 1);
    q.then(async ({ data, count, error }) => {
      if (cancel) return;
      if (error) {
        console.error(error);
        setRows([]);
        setTotal(0);
        setLoading(false);
        return;
      }
      let result = (data ?? []) as Row[];
      if (props.enrich) result = await props.enrich(result);
      if (!cancel) {
        setRows(result);
        setTotal(count ?? 0);
        setLoading(false);
      }
    });
    return () => {
      cancel = true;
    };
  }, [buildQuery, page, pageSize, props.refreshKey, props.enrich]);

  async function exportCsv() {
    const { data } = await buildQuery().range(0, 9999);
    let allRows = (data ?? []) as Row[];
    if (props.enrich) allRows = await props.enrich(allRows);
    const csvRows = allRows.map((r) => {
      const out: Record<string, unknown> = {};
      for (const c of props.columns) {
        out[c.label] = c.csv
          ? c.csv(r)
          : typeof r[c.key as keyof Row] === "object"
            ? JSON.stringify(r[c.key as keyof Row])
            : r[c.key as keyof Row];
      }
      return out;
    });
    downloadCsv(props.table, csvRows);
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl text-primary">{props.title}</h1>
        <Badge variant="secondary">{total.toLocaleString()}</Badge>
        <div className="ml-auto flex items-center gap-2">
          {props.rightActions}
          {props.newButton && (
            <Button onClick={props.newButton.onClick} size="sm">
              <Plus className="h-4 w-4" /> {props.newButton.label}
            </Button>
          )}
          <Button onClick={exportCsv} variant="ghost" size="sm">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        {props.searchColumns && props.searchColumns.length > 0 && (
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder={props.searchPlaceholder ?? "Search..."}
              value={search}
              onChange={(e) => {
                setPage(0);
                setSearch(e.target.value);
              }}
              className="h-9"
            />
          </div>
        )}
        {(props.filters ?? []).map((f) => (
          <div key={f.key} className="min-w-[160px]">
            <Select
              value={filterValues[f.key] ?? "__all__"}
              onValueChange={(v) => {
                setPage(0);
                setFilterValues((prev) => ({ ...prev, [f.key]: v }));
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder={f.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All {f.label}</SelectItem>
                {f.options.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              {props.columns.map((c) => (
                <th
                  key={c.key}
                  className={cn(
                    "px-3 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider whitespace-nowrap",
                    c.sortable && "cursor-pointer select-none",
                  )}
                  onClick={() => {
                    if (!c.sortable) return;
                    setSort((s) =>
                      s.column === c.key
                        ? { column: c.key, ascending: !s.ascending }
                        : { column: c.key, ascending: true },
                    );
                  }}
                >
                  {c.label}
                  {sort.column === c.key ? (sort.ascending ? " ↑" : " ↓") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-t border-border">
                  {props.columns.map((c) => (
                    <td key={c.key} className="px-3 py-2.5">
                      <Skeleton className="h-4 w-24" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={props.columns.length} className="p-0">
                  <EmptyState
                    title={`No ${props.title.toLowerCase()} yet`}
                    description={props.emptyDescription}
                  />
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-t border-border",
                    props.onRowClick && "cursor-pointer hover:bg-muted/40",
                  )}
                  onClick={() => props.onRowClick?.(row)}
                >
                  {props.columns.map((c) => (
                    <td key={c.key} className="px-3 py-2.5 text-foreground align-top">
                      {c.render ? c.render(row) : String(row[c.key as keyof Row] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Page {page + 1} of {totalPages} · {total.toLocaleString()} rows
        </span>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function fmtDate(v: unknown) {
  if (!v) return "—";
  const d = new Date(v as string);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export function fmtDateShort(v: unknown) {
  if (!v) return "—";
  const d = new Date(v as string);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { dateStyle: "medium" });
}

export function YesNo({ value }: { value: boolean | null | undefined }) {
  return value ? (
    <Badge className="bg-success text-success-foreground">Yes</Badge>
  ) : (
    <Badge variant="outline">No</Badge>
  );
}
