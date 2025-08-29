"use client";
import AppHeader from "../../components/AppHeader";
import { useSelector } from "react-redux";
import { RootState } from "../../lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { tasksService, TaskStatus } from "../../services/TasksService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Container,
  Grid,
  Group,
  SegmentedControl,
  Stack,
  Title,
} from "@mantine/core";
import TaskModal from "../../components/TaskModal";
import { IconPlus } from "@tabler/icons-react";
import QuickStatsCard from "../../components/QuickStatsCard";
import AiAssistantCard from "../../components/AiAssistantCard";
import TaskCard from "../../components/TaskCard";
import { authService } from "../../services/AuthService";
import { KanbanBoard } from "../../components/KanbanBoard";
import { AnalyticsChart } from "../../components/AnalyticsChart";
import { http } from "../../lib/http";

export default function TasksPage() {
  const { userId } = useSelector((s: RootState) => s.auth);
  const router = useRouter();
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<null | {
    id: string;
    title: string;
    description: string | null;
  }>(null);
  const [view, setView] = useState<"list" | "kanban">("list");

  useEffect(() => {
    const hasToken = typeof window !== "undefined" && !!authService.getToken();
    if (!userId && !hasToken) router.replace("/login");
  }, [userId, router]);

  const { data } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => tasksService.list(),
    enabled: !!userId || !!authService.getToken(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: { title: string; description?: string | null }) =>
      tasksService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { title?: string; description?: string | null };
    }) => tasksService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tasksService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, next }: { id: string; next: TaskStatus }) =>
      tasksService.updateStatus(id, next),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEditById(id: string) {
    const t = (data || []).find((x) => x.id === id);
    if (!t) return;
    setEditing({ id: t.id, title: t.title, description: t.description });
    setModalOpen(true);
  }

  async function handleSubmit(values: {
    title: string;
    description: string | null;
  }) {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, payload: values });
    } else {
      await createMutation.mutateAsync(values);
    }
  }

  // Helper to optimistically update a task in the cache
  function updateTaskInCache(
    id: string,
    patch: Partial<{
      startedAt: string | null;
      isRunning: boolean;
      totalMilliseconds: number;
      status: TaskStatus;
      title: string;
      description: string | null;
    }>,
  ) {
    qc.setQueryData(["tasks"], (old: any) => {
      if (!Array.isArray(old)) return old;
      return old.map((x) => (x.id === id ? { ...x, ...patch } : x));
    });
  }

  const startTimerMutation = useMutation({
    mutationFn: (id: string) => tasksService.startTimer(id),
    onSuccess: (res, id) => {
      updateTaskInCache(id, { startedAt: res.startedAt, isRunning: true });
    },
  });

  const stopTimerMutation = useMutation({
    mutationFn: (id: string) => tasksService.stopTimer(id),
    onSuccess: (res, id) => {
      updateTaskInCache(id, {
        totalMilliseconds: res.task.totalMilliseconds,
        startedAt: null,
        isRunning: false,
      });
    },
  });

  const tasks = data || [];

  const { data: analytics } = useQuery({
    queryKey: ["time-per-day"],
    queryFn: async () => {
      const { data } = await http.get("/tasks/analytics/time-per-day");
      return data as { day: string; milliseconds: number }[];
    },
    enabled: !!userId || !!authService.getToken(),
  });
  const todo = tasks.filter((t) => t.status === "TODO").length;
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const done = tasks.filter((t) => t.status === "DONE").length;

  console.log(analytics);

  return (
    <main>
      <AppHeader />
      <Container py="md" size="xl">
        <Group justify="space-between" mb="md">
          <Title order={3}>My Tasks</Title>
          <Group gap="xs">
            <SegmentedControl
              data={[
                { label: "List", value: "list" },
                { label: "Kanban", value: "kanban" },
              ]}
              value={view}
              onChange={(value) => setView(value as "list" | "kanban")}
            />
            <Button leftSection={<IconPlus size={16} />} onClick={openCreate}>
              New Task
            </Button>
          </Group>
        </Group>

        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
            <Stack>
              <QuickStatsCard todo={todo} inProgress={inProgress} done={done} />
              {analytics && <AnalyticsChart data={analytics} />}
              <AiAssistantCard />
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
            {view === "list" ? (
              <Stack>
                {tasks.map((t) => (
                  <TaskCard
                    key={t.id}
                    id={t.id}
                    title={t.title}
                    description={t.description}
                    status={t.status}
                    totalMilliseconds={t.totalMilliseconds}
                    startedAt={t.startedAt || undefined}
                    isRunning={!!t.isRunning}
                    onOpenEdit={openEditById}
                    onDelete={(id) => deleteMutation.mutate(id)}
                    onStatusChange={(id, next) =>
                      statusMutation.mutate({ id, next })
                    }
                    onStartTimer={(id) => startTimerMutation.mutate(id)}
                    onStopTimer={(id) => stopTimerMutation.mutate(id)}
                  />
                ))}
              </Stack>
            ) : (
              <KanbanBoard
                tasks={tasks as any}
                onMove={(id, next) => statusMutation.mutate({ id, next })}
                onOpenEdit={openEditById}
                onDelete={(id) => deleteMutation.mutate(id)}
                onStatusChange={(id, next) =>
                  statusMutation.mutate({ id, next })
                }
                onStartTimer={(id) => startTimerMutation.mutate(id)}
                onStopTimer={(id) => stopTimerMutation.mutate(id)}
              />
            )}
          </Grid.Col>
        </Grid>

        {modalOpen && (
          <TaskModal
            opened={modalOpen}
            onClose={() => setModalOpen(false)}
            initial={
              editing
                ? { title: editing.title, description: editing.description }
                : null
            }
            onSubmit={handleSubmit}
          />
        )}
      </Container>
    </main>
  );
}
