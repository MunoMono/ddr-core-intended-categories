import React from "react";
import {
  Download,
  Maximize,
  DocumentExport,
  Image as ImageIcon,
} from "@carbon/icons-react";

export default function ChartControls({ svgRef, data, title }) {
  const exportPNG = () => {
    const svg = svgRef.current?.querySelector("svg");
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      canvas.width = svg.clientWidth * 2;
      canvas.height = svg.clientHeight * 2;
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);
      const link = document.createElement("a");
      link.download = `${title}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const exportCSV = () => {
    const csv = data.map((d) => d.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${title}.csv`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleFullscreen = () => {
    const el = svgRef.current;
    if (!document.fullscreenElement && el) el.requestFullscreen();
    else document.exitFullscreen();
  };

  return (
    <div className="chart-controls flex gap-2 justify-end items-center mt-2">
      <button
        className="chart-btn"
        onClick={toggleFullscreen}
        title="Expand"
        aria-label="Expand chart"
      >
        <Maximize size={20} />
      </button>
      <button
        className="chart-btn"
        onClick={exportPNG}
        title="Download PNG"
        aria-label="Download PNG"
      >
        <ImageIcon size={20} />
      </button>
      <button
        className="chart-btn"
        onClick={exportCSV}
        title="Download CSV"
        aria-label="Download CSV"
      >
        <DocumentExport size={20} />
      </button>
      <button
        className="chart-btn"
        onClick={() => window.print()}
        title="Export PDF"
        aria-label="Export PDF"
      >
        <Download size={20} />
      </button>
    </div>
  );
}
