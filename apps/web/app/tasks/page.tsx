"use client";
import AppHeader from "../../components/AppHeader";
import { useSelector } from "react-redux";
import { RootState } from "../../lib/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { tasksService, TaskStatus } from "../../services/TasksService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Container, Group, Table, Title } from "@mantine/core";
import TaskRow from "../../components/TaskRow";
import AiDrawer from "../../components/AiDrawer";

export default function TasksPage() {
  const { userId } = useSelector((s: RootState) => s.auth);
  const router = useRouter();
  const qc = useQueryClient();

  useEffect(() => {
    if (!userId) router.replace("/login");
  }, [userId, router]);

  const { data } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => tasksService.list(),
    enabled: !!userId,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, next }: { id: string; next: TaskStatus }) =>
      tasksService.updateStatus(id, next),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const logTimeMutation = useMutation({
    mutationFn: ({ id, minutes }: { id: string; minutes: number }) =>
      tasksService.logTime(id, minutes),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  return (
    <main>
      <AppHeader />
      <Container py="md">
        <Group justify="space-between" mb="sm">
          <Title order={3}>My Tasks</Title>
          <AiDrawer />
        </Group>
        <Table striped highlightOnHover withRowBorders={false}>
          <Table.Tbody>
            {(data || []).map((t) => (
              <TaskRow
                key={t.id}
                task={{
                  id: t.id,
                  title: t.title,
                  description: t.description,
                  status: t.status,
                  totalMinutes: t.totalMinutes,
                }}
                onStatusChange={(id, next) =>
                  statusMutation.mutate({ id, next })
                }
                onLogTime={(id, minutes) =>
                  logTimeMutation.mutate({ id, minutes })
                }
              />
            ))}
          </Table.Tbody>
        </Table>
      </Container>
    </main>
  );
}
