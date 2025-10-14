import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import ChartLegend from "./ChartLegend";
import ChartControls from "./ChartControls";
import "../../styles/_charts_economist.scss";

export default function DonutChart({ data = [], title }) {
  const ref = useRef();
  const [legendItems, setLegendItems] = useState([]);

  useEffect(() => {
    if (!data.length) return;

    const el = ref.current;
    const width = el.clientWidth || 620;
    const height = 360;
    const radius = Math.min(width, height) / 2 - 15;

    d3.select(el).selectAll("*").remove();

    const svg = d3.select(el).append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const tooltip = d3.select(el).append("div").attr("class", "tooltip").style("opacity", 0);

    const sorted = [...data].sort((a, b) => b[1] - a[1]);
    const total = d3.sum(sorted, d => d[1]);

    const color = d3.scaleOrdinal(d3.schemeTableau10)
      .domain(sorted.map(d => d[0]));

    setLegendItems(sorted.slice(0, 8).map(([label]) => ({ label, color: color(label) })));

    const pie = d3.pie().value(d => d[1]).sort(null);
    const arc = d3.arc().innerRadius(radius * 0.55).outerRadius(radius);

    svg.selectAll("path")
      .data(pie(sorted))
      .join("path")
      .attr("fill", d => color(d.data[0]))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.3)
      .attr("class", "donut-slice")
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(150).style("opacity", 1);
        tooltip.html(`<strong>${d.data[0]}</strong><br/>${d.data[1]} projects`)
          .style("left", `${event.offsetX + 10}px`)
          .style("top", `${event.offsetY - 25}px`);
      })
      .on("mousemove", (event) => {
        tooltip.style("left", `${event.offsetX + 10}px`).style("top", `${event.offsetY - 25}px`);
      })
      .on("mouseout", () => tooltip.transition().duration(200).style("opacity", 0))
      .transition()
      .delay((_, i) => i * 100)
      .duration(800)
      .ease(d3.easeCubicOut)
      .attrTween("d", function (d) {
        const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return (t) => arc(i(t));
      });

    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("class", "chart-title")
      .attr("y", -radius - 20)
      .text(title);

    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("y", 10)
      .attr("fill", "#333")
      .style("font-size", "1.1rem")
      .style("font-weight", 600)
      .text(`${total} total`);

    const [topName, topVal] = sorted[0];
    svg.append("text")
      .attr("class", "annotation")
      .attr("text-anchor", "middle")
      .attr("y", radius + 30)
      .text(`Top: ${topName} (${((topVal / total) * 100).toFixed(1)}%)`);
  }, [data, title]);

  return (
    <div>
      <div ref={ref} className="chart-container" />
      <ChartControls svgRef={ref} data={data} title={title} />
      <ChartLegend title="Top Categories" items={legendItems} align="center" />
    </div>
  );
}
