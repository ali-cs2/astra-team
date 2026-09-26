import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  WEATHER_URL,
  validateForecasts,
  nextEvening,
  readingAt,
  type Forecast,
} from "../lib/observations";
import sites from "../data/locations.json";

type Packet = { fetchedAt: string; data: Forecast[] };
type State = {
  packet: Packet | null;
  status: "loading" | "live" | "cached" | "unavailable";
  error: boolean;
};
const Context = createContext<State & { refresh: () => void }>({
  packet: null,
  status: "loading",
  error: false,
  refresh: () => {},
});
const CACHE = "astra-weather-v1";
function parsePacket(raw: unknown): Packet {
  if (!raw || typeof raw !== "object") throw new Error("Invalid cache");
  const v = raw as { fetchedAt: unknown; data: unknown };
  if (
    typeof v.fetchedAt !== "string" ||
    !Number.isFinite(Date.parse(v.fetchedAt)) ||
    Date.parse(v.fetchedAt) > Date.now() + 60_000
  )
    throw new Error("Invalid timestamp");
  return { fetchedAt: v.fetchedAt, data: validateForecasts(v.data) };
}
export function ObservationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({
    packet: null,
    status: "loading",
    error: false,
  });
  const [attempt, setAttempt] = useState(0);
  const current = useRef<Packet | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    let mounted = true;
    setState((previous) => ({ ...previous, status: "loading", error: false }));
    async function load() {
      try {
        const response = await fetch(WEATHER_URL, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Weather ${response.status}`);
        const packet = {
          fetchedAt: new Date().toISOString(),
          data: validateForecasts(await response.json()),
        };
        if (!mounted) return;
        current.current = packet;
        setState({ packet, status: "live", error: false });
        try {
          localStorage.setItem(CACHE, JSON.stringify(packet));
        } catch {
          /* Storage is optional. */
        }
      } catch {
        if (!mounted) return;
        let packet = current.current;
        if (!packet) {
          try {
            packet = parsePacket(
              JSON.parse(localStorage.getItem(CACHE) ?? "null"),
            );
          } catch {}
        }
        if (!packet) {
          try {
            const response = await fetch("/data/weather-snapshot.json");
            if (!response.ok) throw new Error("No saved response");
            packet = parsePacket(await response.json());
          } catch {}
        }
        if (mounted) {
          current.current = packet;
          setState({
            packet,
            status: packet ? "cached" : "unavailable",
            error: true,
          });
        }
      } finally {
        clearTimeout(timeout);
      }
    }
    void load();
    return () => {
      mounted = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt]);
  return (
    <Context.Provider
      value={{ ...state, refresh: () => setAttempt((n) => n + 1) }}
    >
      {children}
    </Context.Provider>
  );
}
export function useObservations() {
  const state = useContext(Context);
  const time = nextEvening();
  return {
    ...state,
    time,
    get: (id: string) =>
      readingAt(state.packet?.data[sites.findIndex((s) => s.id === id)], time),
  };
}
