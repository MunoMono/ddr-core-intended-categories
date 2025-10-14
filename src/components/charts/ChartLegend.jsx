import React from "react";
import "../../styles/_charts_economist.scss";

/**
 * Reusable Economist-style legend component
 * @param {Object[]} items - [{ label, color }]
 * @param {string} [title] - Optional legend title
 * @param {"left"|"center"|"right"} [align] - Alignment of legend
 */
export default function ChartLegend({ items = [], title, align = "center" }) {
  if (!items.length) return null;

  return (
    <div className={`chart-legend chart-legend--${align}`}>
      {title && <div className="chart-legend__title">{title}</div>}
      <ul>
        {items.map((item, i) => (
          <li key={i}>
            <span
              className="chart-legend__swatch"
              style={{ backgroundColor: item.color }}
            />
            <span className="chart-legend__label">{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
