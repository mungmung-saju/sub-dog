"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HomeScreen from "./screens/HomeScreen";
import LoadingScreen from "./screens/LoadingScreen";
import ResultScreen from "./screens/ResultScreen";
import CalendarScreen from "./screens/CalendarScreen";
import { useSubscriptions } from "../lib/subscriptions";
import type { Platform } from "../lib/services";

type Step = "home" | "loading" | "result" | "calendar";

export default function DetectiveApp() {
  const [step, setStep] = useState<Step>("home");
  const [platform, setPlatform] = useState<Platform>("ios");
  const [prefill, setPrefill] = useState<{ serviceId: string; price?: number } | null>(null);
  const [calendarFrom, setCalendarFrom] = useState<Step>("home");
  const { views, add, remove } = useSubscriptions();

  const go = (s: Step) => {
    setStep(s);
    window.scrollTo({ top: 0 });
  };

  const openCalendar = (from: Step, pre: typeof prefill = null) => {
    setPrefill(pre);
    setCalendarFrom(from);
    go("calendar");
  };

  const finishLoading = useCallback(() => go("result"), []);

  return (
    <main className="paw-bg relative mx-auto min-h-dvh max-w-md overflow-x-hidden shadow-soft">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
        >
          {step === "home" && (
            <HomeScreen
              subCount={views.length}
              onStart={(p) => {
                setPlatform(p);
                go("loading");
              }}
              onOpenCalendar={() => openCalendar("home")}
            />
          )}
          {step === "loading" && <LoadingScreen onDone={finishLoading} />}
          {step === "result" && (
            <ResultScreen
              platform={platform}
              onSwitchPlatform={setPlatform}
              onBack={() => go("home")}
              onOpenCalendar={() => openCalendar("result")}
              onAddFromPaste={(serviceId, price) => openCalendar("result", { serviceId, price })}
            />
          )}
          {step === "calendar" && (
            <CalendarScreen
              views={views}
              onAdd={add}
              onRemove={remove}
              prefill={prefill}
              onBack={() => go(calendarFrom)}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
