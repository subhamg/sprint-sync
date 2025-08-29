"use client";

import { Card } from "@mantine/core";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function AnalyticsChart(props: {
  data: { day: string; milliseconds: number }[];
}) {
  const minutes = props.data.map((d) => ({ day: d.day, minutes: Math.round(d.milliseconds / 60000) }));
  return (
    <Card withBorder>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <LineChart data={minutes} margin={{ left: 8, right: 8 }}>
            <XAxis dataKey="day" hide={false} interval={Math.floor(minutes.length / 7)} />
            <YAxis width={40} />
            <Tooltip formatter={(v) => `${v} min`} />
            <Line type="monotone" dataKey="minutes" stroke="#1971c2" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}


