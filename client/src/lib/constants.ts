// BarberPro — System Constants
// Theme: Dark Precision

export const BARBER_PASSWORD = "barbeiro123";

export const SERVICES = [
  { id: "cabelo", name: "Cabelo", price: 30, duration: 30, icon: "✂️" },
  { id: "barba", name: "Barba", price: 25, duration: 20, icon: "🪒" },
  { id: "pezinho", name: "Pezinho", price: 10, duration: 15, icon: "💈" },
] as const;

export type ServiceId = typeof SERVICES[number]["id"];

export const OPEN_HOUR = 8;
export const CLOSE_HOUR = 19;
export const SLOT_DURATION = 30; // minutes

// Generate time slots from 08:00 to 18:30
export function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = OPEN_HOUR; h < CLOSE_HOUR; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    if (h < CLOSE_HOUR - 1 || true) {
      slots.push(`${String(h).padStart(2, "0")}:30`);
    }
  }
  // Remove last slot if it's 19:00 or beyond
  return slots.filter((s) => {
    const [hh, mm] = s.split(":").map(Number);
    return hh < CLOSE_HOUR || (hh === CLOSE_HOUR && mm === 0);
  }).filter((s) => {
    const [hh] = s.split(":").map(Number);
    return hh < CLOSE_HOUR;
  });
}

export function formatCurrency(value: number): string {
  return `R$${value.toFixed(0)}`;
}

export function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

export function getDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}
