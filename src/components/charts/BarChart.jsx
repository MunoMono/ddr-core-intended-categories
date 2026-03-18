import React, { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import ChartLegend from "./ChartLegend";
import ChartControls from "./ChartControls";
import "../../styles/_charts_economist.scss";

export default function BarChart({
  data = [],
  title,
  color = "#276FBF",
  horizontal = false,
  legendTitle = "Categories",
  valueLabel = "items",
  sort = "value-desc", // value-desc | value-asc | label-asc | none
}) {
  const ref = useRef();
  const [legendItems, setLegendItems] = useState([]);

  const sortData = (arr, mode) => {
    const copy = Array.isArray(arr) ? [...arr] : [];
    switch (mode) {
      case "value-asc":
        return copy.sort((a, b) => a[1] - b[1]);
      case "label-asc":
        return copy.sort((a, b) => {
          const aNum = Number(a[0]);
          const bNum = Number(b[0]);
          if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) return aNum - bNum;
          return String(a[0]).localeCompare(String(b[0]));
        });
      case "none":
        return copy;
      case "value-desc":
      default:
        return copy.sort((a, b) => b[1] - a[1]);
    }
  };

  const sortedData = useMemo(() => sortData(data, sort), [data, sort]);

  useEffect(() => {
    if (!data.length) return;

    const el = ref.current;
    const width = el.clientWidth || 640;
    const height = horizontal ? 420 : 360;
    const margin = horizontal
      ? { t: 40, r: 40, b: 40, l: 180 }
      : { t: 50, r: 30, b: 70, l: 70 };

    // clear old chart
    d3.select(el).selectAll("*").remove();

    const svg = d3.select(el).append("svg").attr("width", width).attr("height", height);

    const tooltip = d3
      .select(el)
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    // data prep
    const sorted = sortedData;
    const [maxLabel, maxValue] = sorted[0];
    const xDomain = horizontal
      ? [0, d3.max(sorted, (d) => d[1])]
      : sorted.map((d) => d[0]);
    const yDomain = horizontal
      ? sorted.map((d) => d[0])
      : [0, d3.max(sorted, (d) => d[1])];

    // scales
    const x = horizontal
      ? d3.scaleLinear().domain(xDomain).nice().range([margin.l, width - margin.r])
      : d3.scaleBand().domain(xDomain).range([margin.l, width - margin.r]).padding(0.25);

    const y = horizontal
      ? d3.scaleBand().domain(yDomain).range([margin.t, height - margin.b]).padding(0.25)
      : d3.scaleLinear().domain(yDomain).nice().range([height - margin.b, margin.t]);

    const colorScale = d3
      .scaleOrdinal()
      .domain(sorted.map((d) => d[0]))
      .range(d3.schemeTableau10);

    setLegendItems(
      sorted.slice(0, 8).map(([label]) => ({ label, color: colorScale(label) }))
    );

    // gridlines
    svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", horizontal ? `translate(0,${margin.t})` : `translate(${margin.l},0)`)
      .call(
        (horizontal ? d3.axisTop(x) : d3.axisLeft(y))
          .tickSize(horizontal ? height - margin.t - margin.b : -width + margin.l + margin.r)
          .tickFormat("")
      )
      .selectAll("line")
      .attr("stroke", "#eee");

    // bars
    const barGroup = svg.append("g").attr("fill-opacity", 0.9);

    const bars = barGroup
      .selectAll("rect")
      .data(sorted)
      .join("rect")
      .attr("class", "bar")
      .attr("fill", (d) => colorScale(d[0]))
      .attr("x", (d) => (horizontal ? x(0) : x(d[0])))
      .attr("y", (d) => (horizontal ? y(d[0]) : y(0)))
      .attr("width", horizontal ? 0 : x.bandwidth())
      .attr("height", horizontal ? y.bandwidth() : 0)
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(150).style("opacity", 1);
        tooltip
          .html(`<strong>${d[0]}</strong><br/>${d[1]} ${valueLabel}`)
          .style("left", `${event.offsetX + 12}px`)
          .style("top", `${event.offsetY - 28}px`);
        d3.select(event.currentTarget).style("fill-opacity", 1);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", `${event.offsetX + 12}px`)
          .style("top", `${event.offsetY - 28}px`);
      })
      .on("mouseout", (event) => {
        tooltip.transition().duration(200).style("opacity", 0);
        d3.select(event.currentTarget).style("fill-opacity", 0.9);
      });

    // transitions
    bars
      .transition()
      .delay((_, i) => i * 40)
      .duration(900)
      .ease(d3.easeCubicOut)
      .attr("width", (d) => (horizontal ? Math.max(0, x(d[1]) - x(0)) : x.bandwidth()))
      .attr("height", (d) =>
        horizontal ? y.bandwidth() : Math.max(0, y(0) - y(d[1]))
      )
      .attr("y", (d) => (horizontal ? y(d[0]) : y(d[1])));

    // axes
    svg
      .append("g")
      .attr("class", "axis")
      .attr("transform", horizontal ? null : `translate(0,${height - margin.b})`)
      .call(horizontal ? d3.axisTop(x).ticks(6) : d3.axisBottom(x))
      .selectAll("text")
      .attr("text-anchor", horizontal ? "start" : "end")
      .attr("transform", horizontal ? null : "rotate(-30)");

    svg
      .append("g")
      .attr("class", "axis")
      .attr("transform", `translate(${margin.l},0)`)
      .call(horizontal ? d3.axisLeft(y) : d3.axisLeft(y));

    // chart title
    svg
      .append("text")
      .attr("x", margin.l)
      .attr("y", 25)
      .attr("class", "chart-title")
      .text(title);
  }, [data, title, color, horizontal, valueLabel, sort, sortedData]);

  const sorted = sortedData;
  const topRole = sorted?.[0]?.[0];
  const topValue = sorted?.[0]?.[1];
  const [maxLabel, maxValue] = sorted[0] || ["N/A", 0];

  return (
    <div className="chart-block">
      <div ref={ref} className="chart-container" />
      <ChartControls svgRef={ref} data={data} title={title} />
      <ChartLegend title={legendTitle} items={legendItems} align="left" />

      {data.length ? (
        <>
          <p className="chart-insight">
            The leading category is <strong>{topRole}</strong> with{" "}
            <strong>{topValue}</strong> {valueLabel}.
          </p>
          <p className="chart-annotation">
            Most common: <strong>{maxLabel}</strong> ({maxValue} {valueLabel})
          </p>
        </>
      ) : (
        <p className="chart-insight">No data available for this chart.</p>
      )}
    </div>
  );
}
