"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "ok" | "error";

/** Inline email-capture used on the landing hero. No trail context — we just
 *  want the lead so Yibo can follow up manually. Same POST endpoint as the
 *  per-trail form. */
export function LandingHeroForm() {
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errMsg, setErrMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrMsg("");
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, notes, trailId: "landing-hero", trailName: "Landing page inquiry" }),
      });
      const json = await res.json();
      if (!res.ok) {
        setStatus("error");
        setErrMsg(json.error ?? "Something went wrong.");
        return;
      }
      setStatus("ok");
    } catch (e: any) {
      setStatus("error");
      setErrMsg(e?.message ?? "Network error.");
    }
  }

  if (status === "ok") {
    return (
      <div className="rounded-2xl border border-forest-300/30 bg-forest-500/[0.08] p-5 text-center">
        <p className="text-[15px] font-semibold text-forest-100">
          Got it — we'll be in touch within 24 hours.
        </p>
        <p className="mt-1 text-[13px] text-white/65">
          Reply to our email with where you want to go and we'll send a plan.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-[15px] text-white placeholder-white/40 focus:border-forest-300/60 focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-xl bg-forest-400 px-6 py-3 text-[15px] font-semibold text-black transition hover:bg-forest-300 disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Plan my trip →"}
        </button>
      </div>
      <input
        type="text"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Where + when? e.g. Yosemite, late July, 2 people"
        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-[14px] text-white placeholder-white/35 focus:border-forest-300/60 focus:outline-none"
      />
      {status === "error" && <p className="text-[12.5px] text-red-400">{errMsg}</p>}
      <p className="text-[11.5px] text-white/40">
        Free during beta · No credit card · We reply within 24h
      </p>
    </form>
  );
}
