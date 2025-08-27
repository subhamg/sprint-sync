"use client";
import { Badge } from "@mantine/core";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

function colorFor(status: TaskStatus) {
  if (status === "TODO") return "gray" as const;
  if (status === "IN_PROGRESS") return "blue" as const;
  return "green" as const;
}

function nextStatus(status: TaskStatus): TaskStatus {
  if (status === "TODO") return "IN_PROGRESS";
  if (status === "IN_PROGRESS") return "DONE";
  return "DONE";
}

export default function StatusChip({
  status,
  onChange,
}: {
  status: TaskStatus;
  onChange: (next: TaskStatus) => void;
}) {
  return (
    <Badge
      color={colorFor(status)}
      onClick={() => onChange(nextStatus(status))}
      style={{ cursor: "pointer" }}
    >
      {status.replace("_", " ")}
    </Badge>
  );
}
