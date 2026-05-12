"use client";

import { useState } from "react";

interface Props {
  trailId: string;
  trailName: string;
}

type Status = "idle" | "sending" | "ok" | "error";

export function TrailInquiryForm({ trailId, trailName }: Props) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [email, setEmail] = useState("");
  const [dates, setDates] = useState("");
  const [groupSize, setGroupSize] = useState("");
  const [notes, setNotes] = useState("");
  const [errMsg, setErrMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrMsg("");
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trailId, trailName, email, dates, groupSize, notes }),
      });
      const json = await res.json();
      if (!res.ok) {
        setStatus("error");
        setErrMsg(json.error ?? "Something went wrong. Try again?");
        return;
      }
      setStatus("ok");
    } catch (e: any) {
      setStatus("error");
      setErrMsg(e?.message ?? "Network error. Try again?");
    }
  }

  if (status === "ok") {
    return (
      <section className="my-10 rounded-2xl border border-forest-300/30 bg-forest-500/[0.08] p-6">
        <h3 className="text-[16px] font-semibold text-forest-100">Got it — we'll be in touch within 24 hours.</h3>
        <p className="mt-2 text-[13.5px] leading-relaxed text-white/65">
          Your custom plan for {trailName} is on the way. Reply to our email
          with any constraints (fitness, dates, budget) and we'll tune it.
        </p>
      </section>
    );
  }

  if (!open) {
    return (
      <section className="my-10 rounded-2xl border border-forest-300/25 bg-gradient-to-br from-forest-500/[0.08] to-violet-500/[0.05] p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <h3 className="text-[17px] font-semibold text-white">
              Get a custom trip plan for {trailName}
            </h3>
            <p className="mt-1 text-[13px] leading-relaxed text-white/65">
              Tell us when you're going. We'll hand-craft a day-by-day plan —
              permits, parking, drives, gear — and reply within 24h.
            </p>
            <p className="mt-2 text-[11px] uppercase tracking-wider text-forest-300/85">
              Free during beta
            </p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="shrink-0 rounded-xl bg-forest-400 px-5 py-2.5 text-[14px] font-semibold text-black transition hover:bg-forest-300 sm:self-center"
          >
            Plan this trip →
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="my-10 rounded-2xl border border-forest-300/30 bg-forest-500/[0.06] p-6">
      <h3 className="text-[16px] font-semibold text-white">
        Plan a trip around {trailName}
      </h3>
      <p className="mt-1 text-[12.5px] text-white/60">
        We'll email you a tailored plan within 24 hours. Free during beta.
      </p>

      <form onSubmit={submit} className="mt-5 grid gap-4">
        <label className="block">
          <span className="text-[11px] uppercase tracking-wider text-white/55">Email *</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-[14px] text-white placeholder-white/30 focus:border-forest-300/60 focus:outline-none"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-[11px] uppercase tracking-wider text-white/55">Trip dates</span>
            <input
              type="text"
              value={dates}
              onChange={(e) => setDates(e.target.value)}
              placeholder="e.g. July 12–15, 2026"
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-[14px] text-white placeholder-white/30 focus:border-forest-300/60 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-wider text-white/55">Group size</span>
            <input
              type="text"
              value={groupSize}
              onChange={(e) => setGroupSize(e.target.value)}
              placeholder="e.g. 2 adults"
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-[14px] text-white placeholder-white/30 focus:border-forest-300/60 focus:outline-none"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-[11px] uppercase tracking-wider text-white/55">
            Anything we should know? <span className="text-white/30">(fitness, must-haves, constraints)</span>
          </span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="First-time backpackers, want to avoid crowds, kid-friendly, etc."
            className="mt-1 w-full resize-none rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-[14px] text-white placeholder-white/30 focus:border-forest-300/60 focus:outline-none"
          />
        </label>

        {status === "error" && (
          <p className="text-[12.5px] text-red-400">{errMsg}</p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={status === "sending"}
            className="rounded-xl bg-forest-400 px-5 py-2.5 text-[14px] font-semibold text-black transition hover:bg-forest-300 disabled:opacity-60"
          >
            {status === "sending" ? "Sending…" : "Get my custom plan"}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-[13px] text-white/55 hover:text-white/80"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
