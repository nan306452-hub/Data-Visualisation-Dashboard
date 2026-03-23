"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed.");
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    }
  }

  return (
    <main className="min-h-screen bg-green-50 p-8 text-slate-900">
      <div className="mx-auto max-w-md rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight">Login</h1>
        <p className="mt-2 text-sm text-slate-500">
          Enter your username and password to continue.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-green-500"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-green-500"
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
          >
            Log in
          </button>
        </form>

        {message && (
          <p className="mt-4 rounded-lg bg-green-100 px-3 py-2 text-sm text-green-800">
            {message}
          </p>
        )}

        {error && (
          <p className="mt-4 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}