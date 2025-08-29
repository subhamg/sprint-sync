"use client";

import { Card } from "@mantine/core";
import { LineChart } from "@mantine/charts";

export function AnalyticsChart(props: {
  data: { day: string; milliseconds: number }[];
}) {
  const minutes = props.data.map((d) => ({
    day: d.day,
    minutes: Math.round(d.milliseconds / 60000),
  }));
  return (
    <Card withBorder>
      <div style={{ width: "100%", height: 260 }}>
        <LineChart
          h={260}
          data={minutes}
          dataKey="day"
          series={[{ name: "minutes", color: "indigo.6" }]}
          curveType="linear"
        />
      </div>
    </Card>
  );
}
