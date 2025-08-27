"use client";
import { Button, Paper, TextInput, Title } from "@mantine/core";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setAuth } from "../../../lib/store";
import { authService } from "../../../services/AuthService";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const dispatch = useDispatch();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authService.login(email, password);
      const who = await authService.me();
      dispatch(setAuth({ userId: who.userId, isAdmin: who.isAdmin }));
      router.push("/tasks");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
      <Paper p="lg" withBorder style={{ width: 360 }}>
        <form onSubmit={onSubmit}>
          <Title order={3} mb="md">
            Login
          </Title>
          <TextInput
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            mb="sm"
            required
          />
          <TextInput
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            mb="md"
            required
          />
          {error && (
            <div style={{ color: "crimson", marginBottom: 8 }}>{error}</div>
          )}
          <Button type="submit" fullWidth loading={loading}>
            Sign in
          </Button>
        </form>
      </Paper>
    </main>
  );
}
