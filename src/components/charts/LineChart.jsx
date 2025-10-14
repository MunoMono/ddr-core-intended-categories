import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import ChartLegend from "./ChartLegend";
import ChartControls from "./ChartControls";
import "../../styles/_charts_economist.scss";

export default function LineChart({ data = [], title }) {
  const ref = useRef();
  const [legendItems, setLegendItems] = useState([]);

  useEffect(() => {
    if (!data.length) return;

    const el = ref.current;
    const width = el.clientWidth || 640;
    const height = 360;
    const margin = { t: 40, r: 30, b: 50, l: 60 };

    d3.select(el).selectAll("*").remove();

    const svg = d3.select(el).append("svg").attr("width", width).attr("height", height);
    const tooltip = d3.select(el).append("div").attr("class", "tooltip").style("opacity", 0);

    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.year))
      .range([margin.l, width - margin.r]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count)])
      .nice()
      .range([height - margin.b, margin.t]);

    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.l},0)`)
      .call(d3.axisLeft(y).tickSize(-width + margin.l + margin.r).tickFormat(""))
      .selectAll("line")
      .attr("stroke", "#eee");

    const color = "#276FBF";
    setLegendItems([{ label: "Active Staff", color }]);

    const line = d3.line()
      .x(d => x(d.year))
      .y(d => y(d.count))
      .curve(d3.curveMonotoneX);

    const area = d3.area()
      .x(d => x(d.year))
      .y0(y(0))
      .y1(d => y(d.count))
      .curve(d3.curveMonotoneX);

    svg.append("path").datum(data).attr("fill", `${color}22`).attr("d", area);

    const path = svg.append("path")
      .datum(data)
      .attr("class", "line-path")
      .attr("stroke", color)
      .attr("fill", "none")
      .attr("stroke-width", 2)
      .attr("d", line);

    const totalLength = path.node().getTotalLength();
    path.attr("stroke-dasharray", totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(2000)
      .ease(d3.easeCubicOut)
      .attr("stroke-dashoffset", 0);

    svg.selectAll(".dot")
      .data(data)
      .join("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.year))
      .attr("cy", d => y(d.count))
      .attr("r", 0)
      .attr("fill", color)
      .transition()
      .delay((_, i) => 1000 + i * 30)
      .duration(500)
      .attr("r", 3);

    svg.selectAll(".dot")
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(150).style("opacity", 1);
        tooltip.html(`<strong>${d.year}</strong><br/>${d.count} staff`)
          .style("left", `${event.offsetX + 10}px`)
          .style("top", `${event.offsetY - 20}px`);
      })
      .on("mousemove", (event) => {
        tooltip.style("left", `${event.offsetX + 10}px`).style("top", `${event.offsetY - 20}px`);
      })
      .on("mouseout", () => tooltip.transition().duration(200).style("opacity", 0));

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.b})`)
      .attr("class", "axis")
      .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format("d")));

    svg.append("g")
      .attr("transform", `translate(${margin.l},0)`)
      .attr("class", "axis")
      .call(d3.axisLeft(y));

    svg.append("text")
      .attr("x", margin.l)
      .attr("y", 25)
      .attr("class", "chart-title")
      .text(title);

    const peak = data.reduce((a, b) => (b.count > a.count ? b : a));
    svg.append("text")
      .attr("class", "annotation")
      .attr("x", x(peak.year) + 8)
      .attr("y", y(peak.count) - 10)
      .text(`Peak: ${peak.year}`);
  }, [data, title]);

  return (
    <div>
      <div ref={ref} className="chart-container" />
      <ChartControls svgRef={ref} data={data} title={title} />
      <ChartLegend title="Trend" items={legendItems} align="left" />
    </div>
  );
}
