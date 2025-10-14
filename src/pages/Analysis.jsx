import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Content, Grid, Column, Tile } from "@carbon/react";

/**
 * DDR Data Analysis — D3 + Carbon
 * Reads ddr_staff.csv & va_ddr_projects.csv from /public
 * Renders 5 interactive charts with Carbon theming
 */
export default function Analysis() {
  const chartRefs = Array.from({ length: 5 }, () => useRef(null));

  useEffect(() => {
    Promise.all([
      d3.csv("ddr_staff.csv"),
      d3.csv("va_ddr_projects.csv"),
    ]).then(([staff, projects]) => {
      if (!staff?.length || !projects?.length) {
        console.warn("⚠️ CSV files not loaded or empty");
        return;
      }

      /* ---------- Data Cleaning ---------- */
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

      /* ---------- 1. Staff by Role ---------- */
      const roleCounts = d3
        .rollups(
          staff,
          (v) => v.length,
          (d) => {
            const base = d.Role ? d.Role.split(",")[0] : "Unknown";
            return base.split(" ")[0];
          }
        )
        .sort((a, b) => d3.descending(a[1], b[1]));
      renderBarChart(chartRefs[0].current, roleCounts, {
        title: "Staff by Role",
        color: "var(--cds-interactive-01)",
      });

      /* ---------- 2. Staff Active Over Time ---------- */
      const validStaff = staff.filter((d) => d.start && d.end);
      const yearExtent = [
        d3.min(validStaff, (d) => d.start),
        d3.max(validStaff, (d) => d.end),
      ];
      const years = d3.range(yearExtent[0], yearExtent[1] + 1);
      const activeCounts = years.map((y) => ({
        year: y,
        count: validStaff.filter((d) => d.start <= y && d.end >= y).length,
      }));
      renderLineChart(chartRefs[1].current, activeCounts, {
        title: "Active Staff Over Time",
      });

      /* ---------- 3. Projects per Year ---------- */
      const projCounts = d3
        .rollups(
          projects.filter((d) => d.start),
          (v) => v.length,
          (d) => d.start
        )
        .sort((a, b) => a[0] - b[0]);
      renderBarChart(chartRefs[2].current, projCounts, {
        title: "Projects per Year",
        color: "var(--cds-support-success)",
      });

      /* ---------- 4. Top Funders ---------- */
      const funders = d3
        .rollups(
          projects,
          (v) => v.length,
          (d) => (d.Funder && d.Funder.trim()) || "Unknown"
        )
        .sort((a, b) => d3.descending(a[1], b[1]))
        .slice(0, 10);
      renderDonut(chartRefs[3].current, funders, {
        title: "Top Funders",
      });

      /* ---------- 5. Top Project Leads ---------- */
      const leads = d3
        .rollups(
          projects,
          (v) => v.length,
          (d) => (d["Project lead"] && d["Project lead"].trim()) || "Unknown"
        )
        .sort((a, b) => d3.descending(a[1], b[1]))
        .slice(0, 10);
      renderBarChart(chartRefs[4].current, leads, {
        title: "Top Project Leads",
        horizontal: true,
        color: "var(--cds-interactive-03)",
      });
    });
  }, []);

  /* ---------- Reusable D3 Chart Renderers ---------- */

  const renderBarChart = (el, data, opts) => {
    if (!el || !data?.length) return;
    const width = el.clientWidth || 600;
    const height = 300;
    const margin = { t: 30, r: 20, b: 40, l: opts.horizontal ? 100 : 60 };
    d3.select(el).selectAll("*").remove();

    const svg = d3
      .select(el)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("background", "var(--cds-layer)")
      .style("border-radius", "6px");

    const xDomain = data.map((d) => d[0]);
    const yDomain = [0, d3.max(data, (d) => d[1])];

    const x = opts.horizontal
      ? d3.scaleLinear().domain(yDomain).range([margin.l, width - margin.r])
      : d3.scaleBand().domain(xDomain).range([margin.l, width - margin.r]).padding(0.25);
    const y = opts.horizontal
      ? d3.scaleBand().domain(xDomain).range([margin.t, height - margin.b]).padding(0.25)
      : d3.scaleLinear().domain(yDomain).nice().range([height - margin.b, margin.t]);

    const bar = svg.append("g").attr("fill", opts.color);
    bar
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("rx", 3)
      .attr(opts.horizontal ? "y" : "x", (d) => (opts.horizontal ? y(d[0]) : x(d[0])))
      .attr(opts.horizontal ? "x" : "y", (d) => (opts.horizontal ? x(0) : y(d[1])))
      .attr(opts.horizontal ? "height" : "width", opts.horizontal ? y.bandwidth() : x.bandwidth())
      .attr(opts.horizontal ? "width" : "height", (d) =>
        opts.horizontal ? x(d[1]) - x(0) : y(0) - y(d[1])
      );

    // axes
    if (!opts.horizontal) {
      svg
        .append("g")
        .attr("transform", `translate(0,${height - margin.b})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("fill", "var(--cds-text-secondary)")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-30)");
    } else {
      svg
        .append("g")
        .attr("transform", `translate(${margin.l},0)`)
        .call(d3.axisLeft(y))
        .selectAll("text")
        .attr("fill", "var(--cds-text-secondary)")
        .attr("font-size", 10);
    }

    svg
      .append("text")
      .attr("x", margin.l)
      .attr("y", 20)
      .attr("fill", "var(--cds-text-primary)")
      .attr("font-weight", 600)
      .text(opts.title);
  };

  const renderLineChart = (el, data, opts) => {
    if (!el || !data?.length) return;
    const width = el.clientWidth || 600;
    const height = 300;
    const margin = { t: 30, r: 20, b: 40, l: 60 };
    d3.select(el).selectAll("*").remove();

    const svg = d3
      .select(el)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("background", "var(--cds-layer)")
      .style("border-radius", "6px");

    const x = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.year))
      .range([margin.l, width - margin.r]);
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.count)])
      .nice()
      .range([height - margin.b, margin.t]);

    const line = d3
      .line()
      .x((d) => x(d.year))
      .y((d) => y(d.count))
      .curve(d3.curveMonotoneX);

    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "var(--cds-interactive-01)")
      .attr("stroke-width", 2)
      .attr("d", line);

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.b})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format("d")))
      .selectAll("text")
      .attr("fill", "var(--cds-text-secondary)")
      .attr("font-size", 10);

    svg
      .append("g")
      .attr("transform", `translate(${margin.l},0)`)
      .call(d3.axisLeft(y))
      .selectAll("text")
      .attr("fill", "var(--cds-text-secondary)")
      .attr("font-size", 10);

    svg
      .append("text")
      .attr("x", margin.l)
      .attr("y", 20)
      .attr("fill", "var(--cds-text-primary)")
      .attr("font-weight", 600)
      .text(opts.title);
  };

  const renderDonut = (el, data, opts) => {
    if (!el || !data?.length) return;
    const width = el.clientWidth || 600;
    const height = 300;
    const radius = Math.min(width, height) / 2 - 10;
    d3.select(el).selectAll("*").remove();

    const svg = d3
      .select(el)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const color = d3.scaleOrdinal(d3.schemeTableau10);
    const pie = d3.pie().value((d) => d[1]);
    const arc = d3.arc().innerRadius(radius * 0.5).outerRadius(radius);

    svg
      .selectAll("path")
      .data(pie(data))
      .join("path")
      .attr("fill", (d) => color(d.data[0]))
      .attr("d", arc)
      .append("title")
      .text((d) => `${d.data[0]}: ${d.data[1]}`);

    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("y", -radius - 10)
      .attr("fill", "var(--cds-text-primary)")
      .attr("font-weight", 600)
      .text(opts.title);
  };

  /* ---------- Render Layout ---------- */
  return (
    <Content>
      <Grid fullWidth>
        <Column lg={12} md={8} sm={4}>
          <h1>DDR Analysis</h1>
          <p>Automatically generated visual insights using D3 with Carbon styling.</p>
          {chartRefs.map((r, i) => (
            <Tile key={i} style={{ marginTop: "2rem", padding: "2rem" }}>
              <div ref={r} style={{ width: "100%" }} className="chart-container" />
            </Tile>
          ))}
        </Column>
      </Grid>
    </Content>
  );
}
