"use client";
import AppHeader from "../../components/AppHeader";
import { useSelector } from "react-redux";
import { RootState } from "../../lib/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TasksPage() {
  const { userId } = useSelector((s: RootState) => s.auth);
  const router = useRouter();

  useEffect(() => {
    if (!userId) router.replace("/login");
  }, [userId, router]);

  return (
    <main>
      <AppHeader />
      <div style={{ padding: 24 }}>Tasks UI coming next.</div>
    </main>
  );
}
