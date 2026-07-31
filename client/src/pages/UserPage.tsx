// BarberPro — User Dashboard
// Theme: Dark Precision — client booking interface
import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import {
  db,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  getDoc,
} from "@/lib/firebase";
import {
  SERVICES,
  generateTimeSlots,
  formatCurrency,
  formatDate,
  getTodayString,
  getDateString,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  Scissors,
  LogOut,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Trash2,
  AlertCircle,
} from "lucide-react";

interface Appointment {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  date: string;
  time: string;
  service: string;
  serviceName: string;
  price: number;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: any;
}

const AMBER = "oklch(0.769 0.188 70.08)";
const CARD_BG = "oklch(0.12 0 0)";
const SURFACE = "oklch(0.14 0 0)";

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + days);
  return getDateString(d);
}

export default function UserPage() {
  const { session, logout } = useApp();
  const user = session as { role: "user"; name: string; phone: string };

  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [view, setView] = useState<"book" | "appointments">("book");

  const slots = generateTimeSlots();
  const today = getTodayString();

  // Check if shop is open today
  useEffect(() => {
    const checkShop = async () => {
      const q = query(
        collection(db, "cashSessions"),
        where("date", "==", selectedDate),
        where("status", "==", "open")
      );
      const snap = await getDocs(q);
      setIsShopOpen(!snap.empty);
    };
    checkShop();
  }, [selectedDate]);

  // Listen to booked slots for selected date
  useEffect(() => {
    const q = query(
      collection(db, "appointments"),
      where("date", "==", selectedDate),
      where("status", "in", ["pending", "confirmed"])
    );
    const unsub = onSnapshot(q, (snap) => {
      setBookedSlots(snap.docs.map((d) => d.data().time));
    });
    return unsub;
  }, [selectedDate]);

  // Listen to my appointments
  useEffect(() => {
    const q = query(
      collection(db, "appointments"),
      where("userPhone", "==", user.phone)
    );
    const unsub = onSnapshot(q, (snap) => {
      const apps = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as Appointment))
        .sort((a, b) => {
          if (a.date !== b.date) return a.date > b.date ? 1 : -1;
          return a.time > b.time ? 1 : -1;
        });
      setMyAppointments(apps);
    });
    return unsub;
  }, [user.phone]);

  // Check if user already has appointment on selected date
  const myApptOnDate = myAppointments.find(
    (a) => a.date === selectedDate && a.status !== "cancelled"
  );

  async function handleBook() {
    if (!selectedTime || !selectedService) {
      toast.error("Selecione o horário e o serviço.");
      return;
    }
    if (myApptOnDate) {
      toast.error("Você já tem um agendamento neste dia.");
      return;
    }
    if (!isShopOpen && selectedDate === today) {
      toast.error("O salão está fechado hoje. Aguarde o barbeiro abrir o caixa.");
      return;
    }

    setLoading(true);
    try {
      const service = SERVICES.find((s) => s.id === selectedService)!;
      await addDoc(collection(db, "appointments"), {
        userId: user.phone,
        userName: user.name,
        userPhone: user.phone,
        date: selectedDate,
        time: selectedTime,
        service: service.id,
        serviceName: service.name,
        price: service.price,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      toast.success(`Agendado! ${service.name} às ${selectedTime} em ${formatDate(selectedDate)}`);
      setSelectedTime(null);
      setSelectedService(null);
      setView("appointments");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao agendar. Verifique a configuração do Firebase.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(apptId: string) {
    try {
      await deleteDoc(doc(db, "appointments", apptId));
      toast.success("Agendamento cancelado.");
    } catch {
      toast.error("Erro ao cancelar.");
    }
  }

  const statusColors: Record<string, string> = {
    pending: "oklch(0.769 0.188 70.08)",
    confirmed: "oklch(0.6 0.18 145)",
    cancelled: "oklch(0.65 0.22 27)",
  };
  const statusLabels: Record<string, string> = {
    pending: "Aguardando",
    confirmed: "Confirmado",
    cancelled: "Cancelado",
  };

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.08 0 0)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 border-b border-white/8"
        style={{ background: "oklch(0.10 0 0)" }}
      >
        <div className="flex items-center gap-3">
          <img
            src="/manus-storage/barber-logo_b789d9ef.png"
            alt="BarberPro"
            className="w-7 h-7 object-contain"
          />
          <span
            className="text-xl text-white tracking-widest"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            BARBERPRO
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-white text-sm font-medium">{user.name}</div>
            <div
              className="text-xs font-mono"
              style={{
                color: "oklch(0.55 0 0)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {user.phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")}
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/8 transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Tab nav */}
      <div
        className="flex border-b border-white/8"
        style={{ background: "oklch(0.10 0 0)" }}
      >
        {[
          { key: "book", label: "Agendar", icon: Calendar },
          { key: "appointments", label: "Meus Agendamentos", icon: Clock },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setView(key as any)}
            className="flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all relative"
            style={{
              color: view === key ? AMBER : "oklch(0.55 0 0)",
              borderBottom: view === key ? `2px solid ${AMBER}` : "2px solid transparent",
            }}
          >
            <Icon className="w-4 h-4" />
            {label}
            {key === "appointments" && myAppointments.filter(a => a.status !== "cancelled").length > 0 && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-full font-mono"
                style={{ background: AMBER, color: "oklch(0.08 0 0)" }}
              >
                {myAppointments.filter(a => a.status !== "cancelled").length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* BOOK VIEW */}
        {view === "book" && (
          <div className="space-y-6 animate-slide-up">
            {/* Date selector */}
            <div>
              <h3 className="text-white/50 text-xs uppercase tracking-wider mb-3">
                Escolha o dia
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const prev = addDays(selectedDate, -1);
                    if (prev >= today) setSelectedDate(prev);
                  }}
                  disabled={selectedDate <= today}
                  className="p-2 rounded-lg border border-white/8 text-white/40 hover:text-white/80 hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  style={{ background: CARD_BG }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Show 5 days */}
                <div className="flex gap-2 flex-1 overflow-x-auto pb-1">
                  {Array.from({ length: 7 }, (_, i) => addDays(today, i)).map((d) => {
                    const dateObj = new Date(d + "T12:00:00");
                    const dayName = dateObj.toLocaleDateString("pt-BR", { weekday: "short" });
                    const dayNum = dateObj.getDate();
                    const isSelected = d === selectedDate;
                    const isToday = d === today;
                    return (
                      <button
                        key={d}
                        onClick={() => setSelectedDate(d)}
                        className="flex flex-col items-center px-3 py-2 rounded-lg border min-w-[52px] transition-all duration-150"
                        style={{
                          background: isSelected ? AMBER : CARD_BG,
                          borderColor: isSelected ? AMBER : "oklch(1 0 0 / 8%)",
                          color: isSelected ? "oklch(0.08 0 0)" : isToday ? AMBER : "oklch(0.7 0 0)",
                        }}
                      >
                        <span className="text-xs capitalize">{dayName}</span>
                        <span className="text-lg font-bold leading-tight">{dayNum}</span>
                        {isToday && !isSelected && (
                          <span className="w-1 h-1 rounded-full mt-0.5" style={{ background: AMBER }} />
                        )}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                  className="p-2 rounded-lg border border-white/8 text-white/40 hover:text-white/80 hover:border-white/20 transition-all"
                  style={{ background: CARD_BG }}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Shop status */}
            {selectedDate === today && (
              <div
                className="flex items-center gap-3 p-3 rounded-lg border"
                style={{
                  background: isShopOpen ? "oklch(0.6 0.18 145 / 8%)" : "oklch(0.65 0.22 27 / 8%)",
                  borderColor: isShopOpen ? "oklch(0.6 0.18 145 / 30%)" : "oklch(0.65 0.22 27 / 30%)",
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: isShopOpen ? "oklch(0.6 0.18 145)" : "oklch(0.65 0.22 27)",
                    animation: "pulse-green 2s ease-in-out infinite",
                  }}
                />
                <span
                  className="text-sm"
                  style={{ color: isShopOpen ? "oklch(0.6 0.18 145)" : "oklch(0.65 0.22 27)" }}
                >
                  {isShopOpen ? "Salão aberto — pode agendar!" : "Salão fechado no momento"}
                </span>
              </div>
            )}

            {/* Already booked warning */}
            {myApptOnDate && (
              <div
                className="flex items-center gap-3 p-4 rounded-lg border"
                style={{
                  background: "oklch(0.769 0.188 70.08 / 8%)",
                  borderColor: "oklch(0.769 0.188 70.08 / 30%)",
                }}
              >
                <AlertCircle className="w-4 h-4 shrink-0" style={{ color: AMBER }} />
                <div>
                  <div className="text-sm font-medium" style={{ color: AMBER }}>
                    Você já tem agendamento neste dia
                  </div>
                  <div className="text-xs text-white/40 mt-0.5">
                    {myApptOnDate.serviceName} às {myApptOnDate.time}
                  </div>
                </div>
              </div>
            )}

            {/* Service selector */}
            {!myApptOnDate && (
              <>
                <div>
                  <h3 className="text-white/50 text-xs uppercase tracking-wider mb-3">
                    Serviço
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {SERVICES.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedService(s.id)}
                        className="p-4 rounded-lg border text-left transition-all duration-150"
                        style={{
                          background: selectedService === s.id ? "oklch(0.769 0.188 70.08 / 12%)" : CARD_BG,
                          borderColor: selectedService === s.id ? AMBER : "oklch(1 0 0 / 8%)",
                          borderLeftWidth: selectedService === s.id ? "3px" : "1px",
                        }}
                      >
                        <div className="text-2xl mb-2">{s.icon}</div>
                        <div className="text-white text-sm font-medium">{s.name}</div>
                        <div
                          className="text-sm font-mono mt-1"
                          style={{
                            color: AMBER,
                            fontFamily: "'JetBrains Mono', monospace",
                          }}
                        >
                          {formatCurrency(s.price)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time slots */}
                <div>
                  <h3 className="text-white/50 text-xs uppercase tracking-wider mb-3">
                    Horário disponível
                  </h3>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {slots.map((slot) => {
                      const isBooked = bookedSlots.includes(slot);
                      const isSelected = selectedTime === slot;
                      return (
                        <button
                          key={slot}
                          disabled={isBooked}
                          onClick={() => setSelectedTime(slot)}
                          className="py-2 px-1 rounded-lg text-sm font-mono text-center transition-all duration-150 disabled:cursor-not-allowed"
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            background: isBooked
                              ? "oklch(0.12 0 0)"
                              : isSelected
                              ? AMBER
                              : CARD_BG,
                            color: isBooked
                              ? "oklch(0.3 0 0)"
                              : isSelected
                              ? "oklch(0.08 0 0)"
                              : "oklch(0.8 0 0)",
                            border: `1px solid ${
                              isBooked
                                ? "oklch(1 0 0 / 4%)"
                                : isSelected
                                ? AMBER
                                : "oklch(1 0 0 / 8%)"
                            }`,
                            textDecoration: isBooked ? "line-through" : "none",
                            opacity: isBooked ? 0.4 : 1,
                          }}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Book button */}
                <Button
                  onClick={handleBook}
                  disabled={!selectedTime || !selectedService || loading}
                  className="w-full h-12 font-semibold text-sm tracking-wide"
                  style={{
                    background: selectedTime && selectedService ? AMBER : "oklch(0.18 0 0)",
                    color: selectedTime && selectedService ? "oklch(0.08 0 0)" : "oklch(0.4 0 0)",
                  }}
                >
                  {loading
                    ? "Agendando..."
                    : selectedTime && selectedService
                    ? `Confirmar — ${SERVICES.find((s) => s.id === selectedService)?.name} às ${selectedTime}`
                    : "Selecione serviço e horário"}
                </Button>
              </>
            )}
          </div>
        )}

        {/* APPOINTMENTS VIEW */}
        {view === "appointments" && (
          <div className="space-y-3 animate-slide-up">
            <h3 className="text-white/50 text-xs uppercase tracking-wider mb-4">
              Seus agendamentos
            </h3>

            {myAppointments.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="w-12 h-12 text-white/10 mx-auto mb-3" />
                <p className="text-white/30">Nenhum agendamento ainda.</p>
                <button
                  onClick={() => setView("book")}
                  className="mt-4 text-sm underline"
                  style={{ color: AMBER }}
                >
                  Agendar agora
                </button>
              </div>
            ) : (
              <div className="stagger space-y-3">
                {myAppointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="p-4 rounded-lg border flex items-center justify-between gap-3"
                    style={{
                      background: CARD_BG,
                      borderColor: "oklch(1 0 0 / 8%)",
                      borderLeftWidth: "3px",
                      borderLeftColor: statusColors[appt.status] || "oklch(1 0 0 / 8%)",
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            background: `${statusColors[appt.status]}20`,
                            color: statusColors[appt.status],
                          }}
                        >
                          {statusLabels[appt.status]}
                        </span>
                      </div>
                      <div className="text-white font-medium">{appt.serviceName}</div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-white/40 text-xs flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(appt.date)}
                        </span>
                        <span
                          className="text-xs font-mono flex items-center gap-1"
                          style={{
                            color: "oklch(0.55 0 0)",
                            fontFamily: "'JetBrains Mono', monospace",
                          }}
                        >
                          <Clock className="w-3 h-3" />
                          {appt.time}
                        </span>
                        <span
                          className="text-xs font-mono"
                          style={{
                            color: AMBER,
                            fontFamily: "'JetBrains Mono', monospace",
                          }}
                        >
                          {formatCurrency(appt.price)}
                        </span>
                      </div>
                    </div>

                    {appt.status !== "cancelled" && appt.date >= today && (
                      <button
                        onClick={() => handleCancel(appt.id)}
                        className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Cancelar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
