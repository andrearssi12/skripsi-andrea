import React from "react";

/**
 * Generic, reusable DataTable component.
 *
 * Props:
 *  - columns: Array of column definitions
 *      { key, label, className?, cellClassName?, render?(row) }
 *      If render(row) is provided it takes priority over the global renderCell callback.
 *  - rows: Array of data objects
 *  - rowKey: (optional) Field name used as the React key. Defaults to "id".
 *  - renderCell: (optional) Fallback (row, key) => ReactNode for columns without their own render().
 *  - emptyState: (optional) ReactNode shown when rows is empty.
 */
export default function DataTable({
    columns,
    rows,
    rowKey = "id",
    renderCell,
    emptyState,
}) {
    if (rows.length === 0 && emptyState) return emptyState;

    return (
        <div className="table-wrapper">
            <table className="data-table">
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key} className={col.className}>
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, index) => (
                        <tr key={row[rowKey] ?? index}>
                            {columns.map((col) => (
                                <td key={col.key} className={col.cellClassName}>
                                    {col.render
                                        ? col.render(row)
                                        : renderCell
                                          ? renderCell(row, col.key)
                                          : row[col.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
