import React, { useEffect, useState, useMemo } from "react";
import {
  Content,
  Grid,
  Column,
  DataTable,
  Button,
  TextInput,
} from "@carbon/react";
import { Download, Search } from "@carbon/icons-react";

import Papa from "papaparse";

export default function Home() {
  const [archerData, setArcherData] = useState([]);
  const [vaData, setVaData] = useState([]);
  const [query, setQuery] = useState("");

  // Dynamic base path for GH Pages or local dev
  const basePath = import.meta.env.BASE_URL || "/";

  // Load both CSVs
  useEffect(() => {
    const loadCSV = (path, setter) => {
      Papa.parse(path, {
        download: true,
        header: true,
        complete: (result) => setter(result.data.filter(Boolean)),
        error: (err) => console.error(`Error loading ${path}:`, err),
      });
    };
    loadCSV(`${basePath}va_ddr_projects.csv`, setVaData);
    loadCSV(`${basePath}archer_projects.csv`, setArcherData);
  }, [basePath]);

  // Escape regex special characters
  const escapeRegExp = (string) =>
    string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Highlight matches in yellow
  const highlight = (text, query) => {
    if (!query || !text) return text;
    const regex = new RegExp(`(${escapeRegExp(query)})`, "gi");
    return (
      <span
        dangerouslySetInnerHTML={{
          __html: String(text).replace(
            regex,
            `<mark style="background: yellow; color: inherit;">$1</mark>`
          ),
        }}
      />
    );
  };

  // Filter function for search query
  const filterRows = (rows) => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) =>
      Object.values(r).some((val) => val?.toString().toLowerCase().includes(q))
    );
  };

  // Download CSV handler
  const handleDownload = (data, filename) => {
    if (!data || data.length === 0) return;
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render Carbon DataTable
  const renderTable = (rows, title, filename) => {
    const filtered = useMemo(() => filterRows(rows), [rows, query]);
    if (!filtered || filtered.length === 0) return null;

    const headers = Object.keys(filtered[0] || {}).map((key) => ({
      key,
      header: key,
    }));

    const tableRows = filtered.map((row, index) => ({
      id: `${filename}-${index}`,
      ...row,
    }));

    return (
      <div style={{ marginBottom: "3rem" }}>
        {/* Title + Download Button */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h2 className="cds--type-heading-03">{title}</h2>
          <Button
            kind="tertiary"
            size="sm"
            renderIcon={Download}
            iconDescription="Download CSV"
            onClick={() => handleDownload(filtered, filename)}
          >
            Download CSV
          </Button>
        </div>

        {/* Table */}
        <DataTable
          rows={tableRows}
          headers={headers}
          render={({ rows, headers, getHeaderProps, getTableProps }) => (
            <table
              {...getTableProps()}
              className="cds--data-table cds--data-table--zebra"
              style={{ width: "100%" }}
            >
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
                      const cellValue = row.cells.find(
                        (c) => c.info.header === header.key
                      )?.value;
                      return (
                        <td key={header.key}>{highlight(cellValue, query)}</td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        />
      </div>
    );
  };

  return (
    <Content>
      <Grid fullWidth className="p-6">
        <Column lg={12}>
          <h1 className="cds--type-heading-03">DDR Core Intended Categories</h1>
          <p
            className="cds--type-body-long-02"
            style={{ marginBottom: "2rem" }}
          >
            This page lists datasets from the RCA Department of Design Research
            (1962–1981).
          </p>

          {/* 🔍 Carbon Search with inline Search icon */}
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              marginBottom: "2rem",
              maxWidth: "480px",
            }}
          >
            <TextInput
              id="search"
              labelText=""
              placeholder="Type to filter..."
              size="lg"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                flex: 1,
                paddingLeft: "2rem", // space for icon
                backgroundColor: "var(--cds-layer)",
                borderColor: "var(--cds-border-subtle)",
              }}
            />
            <Search
              size={20}
              style={{
                position: "absolute",
                left: "10px",
                color: "var(--cds-icon-primary)",
                pointerEvents: "none",
              }}
            />
          </div>
          {/* 🧾 Tables: V&A first, Archer second */}
          {renderTable(vaData, "V&A DDR Projects", "va_ddr_projects.csv")}
          {renderTable(archerData, "Archer Projects", "archer_projects.csv")}
        </Column>
      </Grid>
    </Content>
  );
}
