"use client";

import { useState } from "react";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";

// Multi-step trip-planning wizard for the landing hero. The user lands on
// the photo with a single CTA — clicking it walks them through 4 small
// steps before asking for an email. This is meaningfully better than the
// 9-field-at-once form on conversion AND lets the hero photo breathe.

type Step = "intro" | "trip" | "you" | "vibe" | "email" | "ok" | "error";

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

const STEPS_WITH_PROGRESS: Step[] = ["trip", "you", "vibe", "email"];

export function LandingTripWizard({ source = "landing-hero" }: { source?: string }) {
  const [step, setStep] = useState<Step>("intro");
  const [duration, setDuration] = useState("");
  const [region, setRegion] = useState("");
  const [experience, setExperience] = useState("");
  const [group, setGroup] = useState("");
  const [driving, setDriving] = useState("");
  const [preferences, setPreferences] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [errMsg, setErrMsg] = useState("");

  function togglePreference(p: string) {
    setPreferences((curr) => (curr.includes(p) ? curr.filter((x) => x !== p) : [...curr, p]));
  }

  async function submit() {
    setStep("email"); // ensure we're showing the email step in case of error
    setErrMsg("");
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
          trailName: "Trip planning wizard",
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrMsg(json.error ?? "Something went wrong.");
        return;
      }
      setStep("ok");
    } catch (e: any) {
      setErrMsg(e?.message ?? "Network error.");
    }
  }

  const progressIdx = STEPS_WITH_PROGRESS.indexOf(step);

  // ============== Intro (default) ==============
  if (step === "intro") {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          onClick={() => setStep("trip")}
          className="rounded-xl bg-forest-400 px-7 py-4 text-[16px] font-bold text-black shadow-lg shadow-black/30 transition hover:bg-forest-300 hover:shadow-xl"
        >
          Start planning my trip →
        </button>
        <p className="text-[12.5px] text-white/55 sm:ml-3">
          Free during beta · AI plan within 24h
        </p>
      </div>
    );
  }

  // ============== Success ==============
  if (step === "ok") {
    return (
      <div className="max-w-xl rounded-2xl border border-forest-300/30 bg-forest-500/[0.10] p-6 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest-400 text-black">
            <Check className="h-4 w-4" strokeWidth={3} />
          </span>
          <p className="text-[16px] font-semibold text-forest-100">
            You're on the beta list — plan arrives within 24h.
          </p>
        </div>
        <p className="mt-3 text-[13px] text-white/65">
          Our AI will draft your trip; one of us reviews and emails it back. Reply to that email with anything to refine.
        </p>
      </div>
    );
  }

  // ============== Numbered wizard steps ==============
  return (
    <div className="max-w-2xl rounded-2xl border border-white/[0.12] bg-black/40 p-6 backdrop-blur-md">
      {/* Progress */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {STEPS_WITH_PROGRESS.map((s, i) => (
            <span
              key={s}
              className={
                i <= progressIdx
                  ? "h-1 w-8 rounded-full bg-forest-300"
                  : "h-1 w-8 rounded-full bg-white/15"
              }
            />
          ))}
        </div>
        <span className="text-[11px] uppercase tracking-wider text-white/45">
          Step {progressIdx + 1} of {STEPS_WITH_PROGRESS.length}
        </span>
      </div>

      {/* TRIP — duration + region */}
      {step === "trip" && (
        <>
          <h3 className="font-display text-[24px] font-bold leading-tight text-white">
            When are you here, and where?
          </h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Select label="How long?" value={duration} onChange={setDuration} options={DURATION_OPTIONS} placeholder="Duration" />
            <Select label="Where?"    value={region}   onChange={setRegion}   options={REGION_OPTIONS}   placeholder="Region" />
          </div>
          <Nav
            onNext={() => setStep("you")}
            nextDisabled={!duration || !region}
          />
        </>
      )}

      {/* YOU — experience + group */}
      {step === "you" && (
        <>
          <h3 className="font-display text-[24px] font-bold leading-tight text-white">
            Who's hiking?
          </h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Select label="Experience" value={experience} onChange={setExperience} options={EXPERIENCE_OPTIONS} placeholder="How experienced?" />
            <Select label="Group"      value={group}      onChange={setGroup}      options={GROUP_OPTIONS}     placeholder="Who's coming?" />
          </div>
          <div className="mt-4">
            <Select label="Driving?" value={driving} onChange={setDriving} options={DRIVING_OPTIONS} placeholder="Renting a car?" />
          </div>
          <Nav
            onBack={() => setStep("trip")}
            onNext={() => setStep("vibe")}
            nextDisabled={!experience || !group || !driving}
          />
        </>
      )}

      {/* VIBE — preferences + free-form notes */}
      {step === "vibe" && (
        <>
          <h3 className="font-display text-[24px] font-bold leading-tight text-white">
            What kind of trip?
          </h3>
          <p className="mt-1.5 text-[13px] text-white/55">Pick any that sound right — or none, and we'll suggest.</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {PREFERENCE_OPTIONS.map((opt) => {
              const on = preferences.includes(opt);
              return (
                <button
                  type="button"
                  key={opt}
                  onClick={() => togglePreference(opt)}
                  className={
                    on
                      ? "rounded-full border border-forest-300/60 bg-forest-500/25 px-3 py-1.5 text-[13px] text-forest-100"
                      : "rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-[13px] text-white/70 hover:border-white/30 hover:text-white"
                  }
                >
                  {opt}
                </button>
              );
            })}
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Anything else? (budget, must-haves, fitness limits, etc.)"
            className="mt-4 w-full resize-none rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-[14px] text-white placeholder-white/35 focus:border-forest-300/60 focus:outline-none"
          />
          <Nav
            onBack={() => setStep("you")}
            onNext={() => setStep("email")}
          />
        </>
      )}

      {/* EMAIL — only thing left is identity */}
      {step === "email" && (
        <>
          <h3 className="font-display text-[24px] font-bold leading-tight text-white">
            Where should we send the plan?
          </h3>
          <p className="mt-1.5 text-[13px] text-white/55">
            We'll email a draft within 24 hours. Reply to refine.
          </p>
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-4 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-[15px] text-white placeholder-white/40 focus:border-forest-300/60 focus:outline-none"
          />
          {errMsg && <p className="mt-2 text-[12.5px] text-red-400">{errMsg}</p>}
          <Nav
            onBack={() => setStep("vibe")}
            onNext={submit}
            nextLabel="Get my AI trip plan →"
            nextDisabled={!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
          />
          <p className="mt-3 text-[11.5px] text-white/40">
            Free during beta · No credit card · we're hand-onboarding our first 50 trips
          </p>
        </>
      )}
    </div>
  );
}

function Select({
  label, value, onChange, options, placeholder,
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
        className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-[14px] text-white focus:border-forest-300/60 focus:outline-none"
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

function Nav({
  onBack, onNext, nextLabel = "Continue", nextDisabled = false,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}) {
  return (
    <div className="mt-6 flex items-center justify-between gap-3">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] text-white/60 transition hover:bg-white/[0.05] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      ) : <span />}
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="inline-flex items-center gap-1.5 rounded-xl bg-forest-400 px-5 py-2.5 text-[14px] font-bold text-black transition hover:bg-forest-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {nextLabel}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
