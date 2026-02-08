import { Card } from "@/components/ui/Card";

export function DataTable({
  columns,
  rows,
  empty,
}: {
  columns: { key: string; label: string; className?: string }[];
  rows: Record<string, any>[];
  empty?: string;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="w-full overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-white/[0.03]">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={"px-4 py-3 text-left font-medium text-zinc-300 " + (c.className ?? "")}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((r, idx) => (
                <tr key={idx} className="border-t border-white/5 hover:bg-white/[0.02]">
                  {columns.map((c) => (
                    <td key={c.key} className={"px-4 py-3 text-zinc-100 " + (c.className ?? "")}>
                      {r[c.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-10 text-center text-zinc-400" colSpan={columns.length}>
                  {empty ?? "Asnjë rezultat."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
