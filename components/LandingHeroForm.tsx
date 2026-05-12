"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "ok" | "error";

const DURATION_OPTIONS = ["3 days", "5 days", "7 days", "10 days", "2+ weeks"];
const REGION_OPTIONS   = ["California", "Oregon", "Washington", "Open — surprise me"];
const EXPERIENCE_OPTIONS = [
  "Beginner — first time hiking out here",
  "Some day hikes under my belt",
  "Comfortable with overnight backpacking",
  "Veteran — looking for a challenge",
];
const GROUP_OPTIONS = ["Solo", "Couple", "Family with kids", "Friend group"];
const DRIVING_OPTIONS = ["Yes, happy to rent", "Some driving, prefer to base in one place", "No driving"];
const PREFERENCE_OPTIONS = [
  "Iconic must-sees",
  "Off the beaten path",
  "Photography",
  "Physical challenge",
  "Kid-friendly",
  "Not sure — suggest for me",
];

interface Props {
  /** Distinguish the hero form from the footer/repeat form in the inquiry log. */
  source?: string;
}

/** Wide intake form used on the landing page. Captures the constraints we
 *  need to hand-craft a multi-day trip plan: when, where, who, fitness,
 *  preferences, driving comfort. Single POST to /api/inquiry. */
export function LandingHeroForm({ source = "landing-hero" }: Props) {
  const [email, setEmail] = useState("");
  const [duration, setDuration] = useState("");
  const [region, setRegion] = useState("");
  const [experience, setExperience] = useState("");
  const [group, setGroup] = useState("");
  const [driving, setDriving] = useState("");
  const [preferences, setPreferences] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errMsg, setErrMsg] = useState("");

  function togglePreference(p: string) {
    setPreferences((curr) => (curr.includes(p) ? curr.filter((x) => x !== p) : [...curr, p]));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrMsg("");

    // Pack the structured fields into the `notes` body so they show up
    // cleanly in the inquiry email. The API doesn't have dedicated columns
    // for these — we keep it free-form during validation.
    const composedNotes = [
      duration   && `Duration: ${duration}`,
      region     && `Region: ${region}`,
      experience && `Experience: ${experience}`,
      group      && `Group: ${group}`,
      driving    && `Driving: ${driving}`,
      preferences.length > 0 && `Preferences: ${preferences.join(", ")}`,
      notes      && `Notes: ${notes}`,
    ].filter(Boolean).join("\n");

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          notes: composedNotes,
          trailId: source,
          trailName: "Trip planning inquiry",
        }),
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
      <div className="rounded-2xl border border-forest-300/30 bg-forest-500/[0.08] p-5">
        <p className="text-[15px] font-semibold text-forest-100">
          You're on the beta list — plan arrives within 24h.
        </p>
        <p className="mt-1 text-[13px] text-white/65">
          Our AI will draft your trip; one of us reviews and emails it back. Reply to that email with anything to refine.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-[15px] text-white placeholder-white/40 focus:border-forest-300/60 focus:outline-none"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <SelectField label="How long?" value={duration} onChange={setDuration} options={DURATION_OPTIONS} placeholder="Duration" />
        <SelectField label="Where?"    value={region}   onChange={setRegion}   options={REGION_OPTIONS}   placeholder="Region" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <SelectField label="Experience level" value={experience} onChange={setExperience} options={EXPERIENCE_OPTIONS} placeholder="How experienced?" />
        <SelectField label="Who's going?"     value={group}      onChange={setGroup}      options={GROUP_OPTIONS}     placeholder="Group" />
      </div>

      <SelectField
        label="Driving?"
        value={driving}
        onChange={setDriving}
        options={DRIVING_OPTIONS}
        placeholder="Are you renting a car?"
      />

      <div>
        <label className="block text-[11px] uppercase tracking-wider text-white/55">
          What kind of experience? (pick any)
        </label>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {PREFERENCE_OPTIONS.map((opt) => {
            const on = preferences.includes(opt);
            return (
              <button
                type="button"
                key={opt}
                onClick={() => togglePreference(opt)}
                className={
                  on
                    ? "rounded-full border border-forest-300/60 bg-forest-500/20 px-3 py-1 text-[12.5px] text-forest-100"
                    : "rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[12.5px] text-white/65 hover:border-white/30"
                }
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        placeholder="Anything else? (budget, must-have, fitness limits, dates of arrival, etc.)"
        className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-[14px] text-white placeholder-white/35 focus:border-forest-300/60 focus:outline-none"
      />

      {status === "error" && <p className="text-[12.5px] text-red-400">{errMsg}</p>}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11.5px] text-white/40">
          Free during beta · No credit card · AI plan within 24h
        </p>
        <button
          type="submit"
          disabled={status === "sending" || !email}
          className="rounded-xl bg-forest-400 px-6 py-3 text-[14.5px] font-semibold text-black transition hover:bg-forest-300 disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Get my AI trip plan →"}
        </button>
      </div>
    </form>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-white/55">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 text-[14px] text-white focus:border-forest-300/60 focus:outline-none"
      >
        <option value="" className="bg-[#0a1612]">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-[#0a1612]">
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}
