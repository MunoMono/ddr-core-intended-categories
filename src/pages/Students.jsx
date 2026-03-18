import Papa from "papaparse";
import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Column,
  Content,
  DataTable,
  Grid,
  InlineLoading,
  InlineNotification,
  Search,
} from "@carbon/react";
import { Download } from "@carbon/icons-react";
import { handleDownload, highlight } from "../utils/csvUtils.jsx";

const STUDENT_HEADERS = [
  { key: "label", header: "Label" },
  { key: "surname", header: "Surname" },
  { key: "given_name", header: "Given Name" },
  { key: "year", header: "Year" },
  { key: "degree", header: "Degree" },
  { key: "thesis_title", header: "Thesis Title" },
  { key: "ddr_deu", header: "DDR/DEU" },
];

function normalizeCsvRows(rows = []) {
  return rows
    .map((row) => {
      const cleaned = {};
      STUDENT_HEADERS.forEach(({ key }) => {
        const value = row?.[key];
        if (value == null) return;
        const trimmed = typeof value === "string" ? value.trim() : value;
        if (trimmed !== "") cleaned[key] = trimmed;
      });
      return cleaned;
    })
    .filter((row) => Object.keys(row).length);
}

function formatCell(value) {
  if (value == null) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return value;
}

export default function Students() {
  const [students, setStudents] = useState([]);
  const [status, setStatus] = useState("loading");
  const [query, setQuery] = useState("");
  const basePath = import.meta.env.BASE_URL || "/";

  useEffect(() => {
    const controller = new AbortController();

    async function loadStudents() {
      setStatus("loading");
      try {
        const res = await fetch(`${basePath}ddr_students.csv`, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const csvText = await res.text();
        const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
        const rows = normalizeCsvRows(parsed.data || []);
        setStudents(rows);
        setStatus(rows.length ? "ready" : "empty");
      } catch (err) {
        if (controller.signal.aborted) return;
        console.warn("ddr_students.csv unavailable", err);
        setStudents([]);
        setStatus("error");
      }
    }

    loadStudents();
    return () => controller.abort();
  }, [basePath]);

  const filtered = useMemo(() => {
    if (!query.trim()) return students;
    const q = query.toLowerCase();
    return students.filter((record) =>
      Object.values(record || {}).some((value) => formatCell(value).toString().toLowerCase().includes(q))
    );
  }, [students, query]);

  const hasRows = filtered.length > 0;
  const showTable = status === "ready" && hasRows;
  const showEmptyState = status === "ready" && !hasRows;

  const headers = STUDENT_HEADERS;
  const tableRows = hasRows
    ? filtered.map((row, idx) => ({ id: `student-${idx}`, ...row }))
    : [];

  return (
    <Content>
      <Grid fullWidth>
        <Column lg={12} md={8} sm={4}>
          <h1>Students</h1>
          <p>
            Explore DDR student records. Drop the latest <code>ddr_students.csv</code> into <code>public/</code>
            &nbsp;to populate this table.
          </p>

          {status === "loading" && <InlineLoading description="Loading students" />}

          {status === "error" && (
            <InlineNotification
              kind="error"
              title="ddr_students.csv not found"
              subtitle="Place the CSV at public/ddr_students.csv."
              hideCloseButton
            />
          )}

          {status === "empty" && (
            <InlineNotification
              kind="info"
              title="Waiting for students data"
              subtitle="Once the CSV is available, the table and download will appear here."
              hideCloseButton
            />
          )}

          {showTable && (
            <>
              <Search
                id="students-search"
                labelText="Search students"
                placeholder="Type to filter..."
                size="lg"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="responsive-search"
              />

              <Button
                kind="tertiary"
                size="sm"
                renderIcon={Download}
                onClick={() => handleDownload(filtered, "ddr_students.csv")}
                className="download-btn"
              >
                Download CSV
              </Button>

              <div className="table-container">
                <DataTable
                  rows={tableRows}
                  headers={headers}
                  render={({ rows, headers, getHeaderProps, getTableProps }) => (
                    <table {...getTableProps()} className="cds--data-table cds--data-table--zebra">
                      <thead>
                        <tr>
                          {headers.map((header) => (
                            <th key={header.key} {...getHeaderProps({ header })}>
                              {header.header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row) => (
                          <tr key={row.id}>
                            {headers.map((header) => {
                              const raw = row.cells.find((cell) => cell.info.header === header.key)?.value;
                              const value = formatCell(raw);
                              return <td key={header.key}>{highlight(value, query)}</td>;
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                />
              </div>
            </>
          )}

          {showEmptyState && (
            <InlineNotification
              kind="warning"
              title="No students match the current filter"
              subtitle="Clear or adjust the search to see results."
              hideCloseButton
            />
          )}
        </Column>
      </Grid>
    </Content>
  );
}
