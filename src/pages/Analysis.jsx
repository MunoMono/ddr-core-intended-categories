import React from "react";
import { Content, Grid, Column, Tile } from "@carbon/react";

export default function Analysis() {
  return (
    <Content>
      <Grid fullWidth>
        <Column lg={12} md={8} sm={4}>
          <h1>Analysis</h1>
          <p>
            This page will display interactive Carbon data visualisations once the charting
            dependencies are stable.
          </p>

          <Tile style={{ marginTop: "2rem", padding: "2rem", textAlign: "center" }}>
            <h2>Chart placeholder</h2>
            <p>No charting library currently active.</p>
            <p style={{ color: "gray" }}>Coming soon: Bar, Pie, Donut, and Scatter insights.</p>
          </Tile>
        </Column>
      </Grid>
    </Content>
  );
}