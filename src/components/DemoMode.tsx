"use client";

import * as React from "react";
import { Database, Radio } from "lucide-react";

type Origin = "live" | "demo";

interface Ctx {
  origin: Origin;
  reason?: string;
  report: (origin: Origin, reason?: string) => void;
}

const DemoModeContext = React.createContext<Ctx>({
  origin: "demo",
  report: () => {},
});

export function useDemoMode() {
  return React.useContext(DemoModeContext);
}

export function DemoModeProvider({ children }: { children: React.ReactNode }) {
  const [origin, setOrigin] = React.useState<Origin>("demo");
  const [reason, setReason] = React.useState<string | undefined>(
    "Seeded dataset — no live forecast run yet"
  );

  const report = React.useCallback((next: Origin, why?: string) => {
    setOrigin(next);
    setReason(why);
  }, []);

  const value = React.useMemo(
    () => ({ origin, reason, report }),
    [origin, reason, report]
  );

  return (
    <DemoModeContext.Provider value={value}>
      {children}
      <DemoModeIndicator />
    </DemoModeContext.Provider>
  );
}

function DemoModeIndicator() {
  const { origin, reason } = useDemoMode();
  const demo = origin === "demo";

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-50">
      <div
        title={reason}
        className={
          demo
            ? "pointer-events-auto flex items-center gap-2 rounded-full border border-[#f0b429]/30 bg-[#0d0f13]/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#f0b429] backdrop-blur"
            : "pointer-events-auto flex items-center gap-2 rounded-full border border-[#3fb950]/30 bg-[#0d0f13]/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5fd06f] backdrop-blur"
        }
      >
        {demo ? (
          <Database className="h-3 w-3" />
        ) : (
          <Radio className="h-3 w-3" />
        )}
        {demo ? "Demo mode" : "Live forecast"}
      </div>
    </div>
  );
}
