import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import { Content, Grid, Column, Tile } from "@carbon/react";
import BarChart from "../components/charts/BarChart";
import LineChart from "../components/charts/LineChart";
import DonutChart from "../components/charts/DonutChart";

export default function Analysis() {
  const [data, setData] = useState({
    roleCounts: [],
    activeCounts: [],
    projCounts: [],
    funders: [],
    leads: [],
  });

  useEffect(() => {
    Promise.all([d3.csv("ddr_staff.csv"), d3.csv("va_ddr_projects.csv")]).then(([staff, projects]) => {
      const parseYear = (str) => {
        if (!str) return null;
        const m = str.match(/\d{4}/g);
        return m ? m.map(Number) : null;
      };

      staff.forEach((d) => {
        const yrs = parseYear(d.Tenure);
        d.start = yrs ? d3.min(yrs) : null;
        d.end = yrs ? d3.max(yrs) : null;
      });

      projects.forEach((d) => {
        const s = parseYear(d["Start date"]);
        const e = parseYear(d["End date"]);
        d.start = s ? s[0] : null;
        d.end = e ? e[0] : d.start;
      });

      const roleCounts = d3.rollups(staff, (v) => v.length, (d) => (d.Role?.split(",")[0] || "Unknown").split(" ")[0])
        .sort((a, b) => d3.descending(a[1], b[1]));

      const validStaff = staff.filter((d) => d.start && d.end);
      const years = d3.range(d3.min(validStaff, (d) => d.start), d3.max(validStaff, (d) => d.end) + 1);
      const activeCounts = years.map((y) => ({
        year: y,
        count: validStaff.filter((d) => d.start <= y && d.end >= y).length,
      }));

      const projCounts = d3.rollups(projects.filter((d) => d.start), (v) => v.length, (d) => d.start)
        .sort((a, b) => a[0] - b[0]);

      const funders = d3.rollups(projects, (v) => v.length, (d) => (d.Funder?.trim() || "Unknown"))
        .sort((a, b) => d3.descending(a[1], b[1]))
        .slice(0, 10);

      const leads = d3.rollups(projects, (v) => v.length, (d) => (d["Project lead"]?.trim() || "Unknown"))
        .sort((a, b) => d3.descending(a[1], b[1]))
        .slice(0, 10);

      setData({ roleCounts, activeCounts, projCounts, funders, leads });
    });
  }, []);

  return (
    <Content>
      <Grid fullWidth>
        <Column lg={12}>
          <h1>DDR Analysis</h1>
          <p>Interactive visual insights using D3 with Carbon theming and animations.</p>

          <Tile style={{ marginTop: "2rem", padding: "2rem" }}>
            <BarChart data={data.roleCounts} title="Staff by Role" color="var(--cds-interactive-01)" />
          </Tile>

          <Tile style={{ marginTop: "2rem", padding: "2rem" }}>
            <LineChart data={data.activeCounts} title="Active Staff Over Time" />
          </Tile>

          <Tile style={{ marginTop: "2rem", padding: "2rem" }}>
            <BarChart data={data.projCounts} title="Projects per Year" color="var(--cds-support-success)" />
          </Tile>

          <Tile style={{ marginTop: "2rem", padding: "2rem" }}>
            <DonutChart data={data.funders} title="Top Funders" />
          </Tile>

          <Tile style={{ marginTop: "2rem", padding: "2rem" }}>
            <BarChart
              data={data.leads}
              title="Top Project Leads"
              horizontal
              color="var(--cds-interactive-03)"
            />
          </Tile>
        </Column>
      </Grid>
    </Content>
  );
}
