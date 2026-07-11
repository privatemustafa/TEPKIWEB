"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "ok" | "error";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMsg(data.error ?? "Bir şeyler ters gitti.");
        return;
      }
      setStatus("ok");
      setMsg(data.already ? "Zaten kayıtlısın." : "Listeye eklendin.");
      setEmail("");
    } catch {
      setStatus("error");
      setMsg("Bağlantı hatası.");
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto flex w-full max-w-md flex-col gap-3">
      <div className="flex border border-white/20 focus-within:border-gold">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e-posta adresin"
          className="flex-1 bg-transparent px-4 py-3 text-sm text-chalk placeholder:text-white/30 focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-chalk px-6 text-xs uppercase tracking-ultra text-ink transition hover:bg-gold disabled:opacity-50"
        >
          {status === "loading" ? "…" : "Kayıt Ol"}
        </button>
      </div>
      {msg && (
        <p
          className={`text-xs ${
            status === "error" ? "text-red-400" : "text-gold"
          }`}
        >
          {msg}
        </p>
      )}
    </form>
  );
}
