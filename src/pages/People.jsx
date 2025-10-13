import React, { useEffect, useState, useMemo } from "react";
import { Content, Grid, Column, DataTable, Button, Search } from "@carbon/react";
import { Download } from "@carbon/icons-react";
import { loadCSV, highlight, handleDownload } from "../utils/csvUtils.jsx";

export default function People() {
  const [people, setPeople] = useState([]);
  const [query, setQuery] = useState("");
  const basePath = import.meta.env.BASE_URL || "/";

  useEffect(() => {
    loadCSV(`${basePath}ddr_staff.csv`, setPeople);
  }, [basePath]);

  const filtered = useMemo(() => {
    if (!query.trim()) return people;
    const q = query.toLowerCase();
    return people.filter((r) =>
      Object.values(r).some((v) => v?.toString().toLowerCase().includes(q))
    );
  }, [people, query]);

  if (!filtered?.length) return null;

  const headers = Object.keys(filtered[0]).map((key) => ({ key, header: key }));
  const tableRows = filtered.map((r, i) => ({ id: `person-${i}`, ...r }));

  return (
    <Content>
      <Grid fullWidth>
        <Column lg={12} md={8} sm={4}>
          <h1>Compiled by Bruce Archer 26 February 1998, revised 14 April 1998. 12 March 1999</h1>

          {/* Search + Download CSV actions */}
          <div className="search-actions">
            <Search
              id="people-search"
              labelText="Search people"
              placeholder="Search people..."
              size="lg"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="responsive-search"
            />

            <Button
              kind="tertiary"
              size="sm"
              renderIcon={Download}
              onClick={() => handleDownload(filtered, "people.csv")}
              className="download-btn"
            >
              Download CSV
            </Button>
          </div>

          {/* Table */}
          <div className="table-container">
            <DataTable
              rows={tableRows}
              headers={headers}
              render={({ rows, headers, getHeaderProps, getTableProps }) => (
                <table
                  {...getTableProps()}
                  className="cds--data-table cds--data-table--zebra"
                >
                  <thead>
                    <tr>
                      {headers.map((h) => (
                        <th key={h.key} {...getHeaderProps({ header: h })}>
                          {h.header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id}>
                        {headers.map((h) => {
                          const v = r.cells.find(
                            (c) => c.info.header === h.key
                          )?.value;
                          return <td key={h.key}>{highlight(v, query)}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            />
          </div>
        </Column>
      </Grid>
    </Content>
  );
}