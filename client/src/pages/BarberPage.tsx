// BarberPro — Barber Dashboard
// Theme: Dark Precision — full control panel with realtime updates
import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import {
  db,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  orderBy,
  Timestamp,
} from "@/lib/firebase";
import {
  SERVICES,
  formatCurrency,
  formatDate,
  getTodayString,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  LogOut,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Scissors,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  Lock,
  Unlock,
} from "lucide-react";

const AMBER = "oklch(0.769 0.188 70.08)";
const CARD_BG = "oklch(0.12 0 0)";
const GREEN = "oklch(0.6 0.18 145)";
const RED = "oklch(0.65 0.22 27)";

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

interface CashSession {
  id: string;
  date: string;
  openedAt: any;
  closedAt: any;
  status: "open" | "closed";
  totalRevenue: number;
  totalAppointments: number;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export default function BarberPage() {
  const { logout } = useApp();
  const today = getTodayString();

  const [activeTab, setActiveTab] = useState<"agenda" | "controle">("agenda");
  const [selectedDate, setSelectedDate] = useState(today);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [cashSession, setCashSession] = useState<CashSession | null>(null);
  const [openCashLoading, setOpenCashLoading] = useState(false);
  const [controlDate, setControlDate] = useState(today);
  const [controlAppointments, setControlAppointments] = useState<Appointment[]>([]);
  const [controlSession, setControlSession] = useState<CashSession | null>(null);

  // Listen to today's cash session
  useEffect(() => {
    const q = query(
      collection(db, "cashSessions"),
      where("date", "==", today)
    );
    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) {
        setCashSession(null);
      } else {
        const d = snap.docs[0];
        setCashSession({ id: d.id, ...d.data() } as CashSession);
      }
    });
    return unsub;
  }, [today]);

  // Listen to appointments for selected date (agenda tab)
  useEffect(() => {
    const q = query(
      collection(db, "appointments"),
      where("date", "==", selectedDate)
    );
    const unsub = onSnapshot(q, (snap) => {
      const apps = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as Appointment))
        .sort((a, b) => (a.time > b.time ? 1 : -1));
      setAppointments(apps);
    });
    return unsub;
  }, [selectedDate]);

  // Listen to control date data
  useEffect(() => {
    const q1 = query(
      collection(db, "appointments"),
      where("date", "==", controlDate)
    );
    const unsub1 = onSnapshot(q1, (snap) => {
      const apps = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as Appointment))
        .sort((a, b) => (a.time > b.time ? 1 : -1));
      setControlAppointments(apps);
    });

    const q2 = query(
      collection(db, "cashSessions"),
      where("date", "==", controlDate)
    );
    const unsub2 = onSnapshot(q2, (snap) => {
      if (snap.empty) setControlSession(null);
      else {
        const d = snap.docs[0];
        setControlSession({ id: d.id, ...d.data() } as CashSession);
      }
    });

    return () => { unsub1(); unsub2(); };
  }, [controlDate]);

  async function handleOpenCash() {
    // Check if there's an unclosed session from a previous day
    const q = query(
      collection(db, "cashSessions"),
      where("status", "==", "open")
    );
    const snap = await getDocs(q);
    const openSessions = snap.docs.filter((d) => d.data().date !== today);
    if (openSessions.length > 0) {
      const prevDate = openSessions[0].data().date;
      toast.error(
        `Feche o caixa do dia ${formatDate(prevDate)} antes de abrir um novo.`,
        { duration: 5000 }
      );
      return;
    }

    setOpenCashLoading(true);
    try {
      await addDoc(collection(db, "cashSessions"), {
        date: today,
        openedAt: serverTimestamp(),
        closedAt: null,
        status: "open",
        totalRevenue: 0,
        totalAppointments: 0,
      });
      toast.success("Caixa aberto! Bom trabalho hoje.");
    } catch {
      toast.error("Erro ao abrir caixa.");
    } finally {
      setOpenCashLoading(false);
    }
  }

  async function handleCloseCash() {
    if (!cashSession) return;
    const confirmed = window.confirm(
      "Fechar o caixa de hoje? Esta ação finaliza o dia."
    );
    if (!confirmed) return;

    // Calculate totals
    const q = query(
      collection(db, "appointments"),
      where("date", "==", today),
      where("status", "==", "confirmed")
    );
    const snap = await getDocs(q);
    const total = snap.docs.reduce((sum, d) => sum + (d.data().price || 0), 0);

    try {
      await updateDoc(doc(db, "cashSessions", cashSession.id), {
        status: "closed",
        closedAt: serverTimestamp(),
        totalRevenue: total,
        totalAppointments: snap.size,
      });
      toast.success(`Caixa fechado! Total: ${formatCurrency(total)}`);
    } catch {
      toast.error("Erro ao fechar caixa.");
    }
  }

  async function handleConfirm(apptId: string) {
    await updateDoc(doc(db, "appointments", apptId), { status: "confirmed" });
    toast.success("Atendimento confirmado!");
  }

  async function handleCancel(apptId: string) {
    await updateDoc(doc(db, "appointments", apptId), { status: "cancelled" });
    toast.success("Agendamento cancelado.");
  }

  async function handleDelete(apptId: string) {
    const ok = window.confirm("Remover este agendamento?");
    if (!ok) return;
    await deleteDoc(doc(db, "appointments", apptId));
    toast.success("Agendamento removido.");
  }

  const activeAppts = appointments.filter((a) => a.status !== "cancelled");
  const confirmedAppts = appointments.filter((a) => a.status === "confirmed");
  const pendingAppts = appointments.filter((a) => a.status === "pending");
  const todayRevenue = confirmedAppts.reduce((sum, a) => sum + a.price, 0);

  const controlConfirmed = controlAppointments.filter((a) => a.status === "confirmed");
  const controlRevenue = controlConfirmed.reduce((sum, a) => sum + a.price, 0);
  const serviceBreakdown = SERVICES.map((s) => ({
    ...s,
    count: controlConfirmed.filter((a) => a.service === s.id).length,
    revenue: controlConfirmed.filter((a) => a.service === s.id).reduce((sum, a) => sum + a.price, 0),
  }));

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
          <div>
            <span
              className="text-xl text-white tracking-widest block"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              BARBERPRO
            </span>
            <span className="text-white/30 text-xs">Painel do Barbeiro</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Cash status badge */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              background: cashSession?.status === "open"
                ? "oklch(0.6 0.18 145 / 15%)"
                : "oklch(0.65 0.22 27 / 15%)",
              color: cashSession?.status === "open" ? GREEN : RED,
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: cashSession?.status === "open" ? GREEN : RED,
                animation: cashSession?.status === "open"
                  ? "pulse-green 2s ease-in-out infinite"
                  : undefined,
              }}
            />
            {cashSession?.status === "open" ? "Caixa Aberto" : "Caixa Fechado"}
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/8 transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Cash control banner */}
      {!cashSession && (
        <div
          className="flex items-center justify-between px-4 py-3 border-b border-amber-500/20"
          style={{ background: "oklch(0.769 0.188 70.08 / 8%)" }}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-4 h-4" style={{ color: AMBER }} />
            <span className="text-sm" style={{ color: AMBER }}>
              Abra o caixa para começar a receber agendamentos hoje.
            </span>
          </div>
          <Button
            onClick={handleOpenCash}
            disabled={openCashLoading}
            size="sm"
            className="font-semibold"
            style={{ background: AMBER, color: "oklch(0.08 0 0)" }}
          >
            <Unlock className="w-3.5 h-3.5 mr-1.5" />
            {openCashLoading ? "Abrindo..." : "Abrir Caixa"}
          </Button>
        </div>
      )}

      {cashSession?.status === "open" && (
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{
            background: "oklch(0.6 0.18 145 / 6%)",
            borderColor: "oklch(0.6 0.18 145 / 20%)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full status-open" style={{ background: GREEN }} />
            <span className="text-sm" style={{ color: GREEN }}>
              Salão aberto — {formatDate(today)} · {confirmedAppts.length} confirmados · {formatCurrency(todayRevenue)}
            </span>
          </div>
          <Button
            onClick={handleCloseCash}
            size="sm"
            variant="outline"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            <Lock className="w-3.5 h-3.5 mr-1.5" />
            Fechar Caixa
          </Button>
        </div>
      )}

      {/* Tabs */}
      <div
        className="flex border-b border-white/8"
        style={{ background: "oklch(0.10 0 0)" }}
      >
        {[
          { key: "agenda", label: "Agenda", icon: Calendar },
          { key: "controle", label: "Controle", icon: BarChart2 },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className="flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all"
            style={{
              color: activeTab === key ? AMBER : "oklch(0.55 0 0)",
              borderBottom: activeTab === key ? `2px solid ${AMBER}` : "2px solid transparent",
            }}
          >
            <Icon className="w-4 h-4" />
            {label}
            {key === "agenda" && pendingAppts.length > 0 && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-full font-mono"
                style={{ background: AMBER, color: "oklch(0.08 0 0)" }}
              >
                {pendingAppts.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* AGENDA TAB */}
        {activeTab === "agenda" && (
          <div className="animate-slide-up">
            {/* Date navigation */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setSelectedDate(addDays(selectedDate, -1))}
                className="p-2 rounded-lg border border-white/8 text-white/40 hover:text-white/80 hover:border-white/20 transition-all"
                style={{ background: CARD_BG }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex gap-2 flex-1 overflow-x-auto pb-1">
                {Array.from({ length: 7 }, (_, i) => addDays(today, i - 2)).map((d) => {
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
                        color: isSelected
                          ? "oklch(0.08 0 0)"
                          : isToday
                          ? AMBER
                          : "oklch(0.7 0 0)",
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

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: "Total", value: activeAppts.length, icon: Users, color: "oklch(0.7 0 0)" },
                { label: "Pendentes", value: pendingAppts.length, icon: Clock, color: AMBER },
                { label: "Confirmados", value: confirmedAppts.length, icon: CheckCircle, color: GREEN },
              ].map(({ label, value, icon: Icon, color }) => (
                <div
                  key={label}
                  className="p-3 rounded-lg border text-center"
                  style={{ background: CARD_BG, borderColor: "oklch(1 0 0 / 8%)" }}
                >
                  <Icon className="w-4 h-4 mx-auto mb-1" style={{ color }} />
                  <div
                    className="text-2xl font-bold"
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      color,
                    }}
                  >
                    {value}
                  </div>
                  <div className="text-white/30 text-xs">{label}</div>
                </div>
              ))}
            </div>

            {/* Appointments list */}
            {appointments.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="w-12 h-12 text-white/10 mx-auto mb-3" />
                <p className="text-white/30">Nenhum agendamento para {formatDate(selectedDate)}.</p>
              </div>
            ) : (
              <div className="stagger space-y-3">
                {appointments.map((appt) => {
                  const statusColor =
                    appt.status === "confirmed"
                      ? GREEN
                      : appt.status === "cancelled"
                      ? RED
                      : AMBER;
                  const statusLabel =
                    appt.status === "confirmed"
                      ? "Confirmado"
                      : appt.status === "cancelled"
                      ? "Cancelado"
                      : "Aguardando";

                  return (
                    <div
                      key={appt.id}
                      className="p-4 rounded-lg border"
                      style={{
                        background: CARD_BG,
                        borderColor: "oklch(1 0 0 / 8%)",
                        borderLeftWidth: "3px",
                        borderLeftColor: statusColor,
                        opacity: appt.status === "cancelled" ? 0.5 : 1,
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span
                              className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{
                                background: `${statusColor}20`,
                                color: statusColor,
                              }}
                            >
                              {statusLabel}
                            </span>
                            <span
                              className="font-mono text-xs"
                              style={{
                                color: "oklch(0.55 0 0)",
                                fontFamily: "'JetBrains Mono', monospace",
                              }}
                            >
                              {appt.time}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="text-white font-medium">{appt.userName}</div>
                            <span className="text-white/20">·</span>
                            <div className="text-white/50 text-sm">{appt.serviceName}</div>
                          </div>

                          <div className="flex items-center gap-3 mt-1">
                            <span
                              className="text-xs font-mono"
                              style={{
                                color: "oklch(0.45 0 0)",
                                fontFamily: "'JetBrains Mono', monospace",
                              }}
                            >
                              {appt.userPhone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")}
                            </span>
                            <span
                              className="text-sm font-mono font-medium"
                              style={{
                                color: AMBER,
                                fontFamily: "'JetBrains Mono', monospace",
                              }}
                            >
                              {formatCurrency(appt.price)}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        {appt.status !== "cancelled" && (
                          <div className="flex gap-2 shrink-0">
                            {appt.status === "pending" && (
                              <button
                                onClick={() => handleConfirm(appt.id)}
                                className="p-2 rounded-lg transition-all hover:scale-105"
                                style={{
                                  background: "oklch(0.6 0.18 145 / 15%)",
                                  color: GREEN,
                                }}
                                title="Confirmar atendimento"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleCancel(appt.id)}
                              className="p-2 rounded-lg transition-all hover:scale-105"
                              style={{
                                background: "oklch(0.65 0.22 27 / 15%)",
                                color: RED,
                              }}
                              title="Cancelar"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(appt.id)}
                              className="p-2 rounded-lg text-white/20 hover:text-white/50 hover:bg-white/8 transition-all"
                              title="Remover"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* CONTROLE TAB */}
        {activeTab === "controle" && (
          <div className="animate-slide-up">
            {/* Date navigation for control */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setControlDate(addDays(controlDate, -1))}
                className="p-2 rounded-lg border border-white/8 text-white/40 hover:text-white/80 hover:border-white/20 transition-all"
                style={{ background: CARD_BG }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div
                className="flex-1 text-center py-2 rounded-lg border"
                style={{ background: CARD_BG, borderColor: "oklch(1 0 0 / 8%)" }}
              >
                <span className="text-white font-medium">
                  {new Date(controlDate + "T12:00:00").toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                {controlDate === today && (
                  <span
                    className="ml-2 text-xs px-2 py-0.5 rounded-full"
                    style={{ background: `${AMBER}20`, color: AMBER }}
                  >
                    hoje
                  </span>
                )}
              </div>
              <button
                onClick={() => setControlDate(addDays(controlDate, 1))}
                className="p-2 rounded-lg border border-white/8 text-white/40 hover:text-white/80 hover:border-white/20 transition-all"
                style={{ background: CARD_BG }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Cash session status */}
            <div
              className="p-4 rounded-lg border mb-6"
              style={{
                background: CARD_BG,
                borderColor: controlSession?.status === "open"
                  ? "oklch(0.6 0.18 145 / 30%)"
                  : controlSession?.status === "closed"
                  ? "oklch(1 0 0 / 8%)"
                  : "oklch(1 0 0 / 8%)",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      background: controlSession?.status === "open"
                        ? GREEN
                        : controlSession?.status === "closed"
                        ? "oklch(0.55 0 0)"
                        : RED,
                      animation: controlSession?.status === "open"
                        ? "pulse-green 2s ease-in-out infinite"
                        : undefined,
                    }}
                  />
                  <div>
                    <div className="text-white font-medium text-sm">
                      {controlSession?.status === "open"
                        ? "Caixa Aberto"
                        : controlSession?.status === "closed"
                        ? "Caixa Fechado"
                        : "Sem caixa registrado"}
                    </div>
                    {controlSession && (
                      <div className="text-white/30 text-xs mt-0.5">
                        {controlSession.status === "closed" && controlSession.closedAt
                          ? `Fechado · ${controlSession.totalAppointments} atendimentos`
                          : "Em andamento"}
                      </div>
                    )}
                  </div>
                </div>

                {controlDate === today && controlSession?.status === "open" && (
                  <Button
                    onClick={handleCloseCash}
                    size="sm"
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <Lock className="w-3.5 h-3.5 mr-1.5" />
                    Fechar Caixa
                  </Button>
                )}
              </div>
            </div>

            {/* Revenue summary */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div
                className="p-4 rounded-lg border card-accent"
                style={{ background: CARD_BG, borderColor: "oklch(1 0 0 / 8%)" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4" style={{ color: AMBER }} />
                  <span className="text-white/40 text-xs uppercase tracking-wider">Receita</span>
                </div>
                <div
                  className="text-3xl font-bold"
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    color: AMBER,
                  }}
                >
                  {formatCurrency(controlRevenue)}
                </div>
                <div className="text-white/30 text-xs mt-1">
                  {controlConfirmed.length} atendimentos confirmados
                </div>
              </div>

              <div
                className="p-4 rounded-lg border"
                style={{ background: CARD_BG, borderColor: "oklch(1 0 0 / 8%)" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-white/40" />
                  <span className="text-white/40 text-xs uppercase tracking-wider">Atendimentos</span>
                </div>
                <div
                  className="text-3xl font-bold text-white"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  {controlConfirmed.length}
                  <span className="text-white/20 text-lg">/{controlAppointments.length}</span>
                </div>
                <div className="text-white/30 text-xs mt-1">
                  confirmados / total
                </div>
              </div>
            </div>

            {/* Service breakdown */}
            <div
              className="p-4 rounded-lg border mb-6"
              style={{ background: CARD_BG, borderColor: "oklch(1 0 0 / 8%)" }}
            >
              <h3 className="text-white/50 text-xs uppercase tracking-wider mb-4">
                Por serviço
              </h3>
              <div className="space-y-3">
                {serviceBreakdown.map((s) => (
                  <div key={s.id} className="flex items-center gap-3">
                    <span className="text-xl w-8 text-center">{s.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-sm">{s.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-white/40 text-xs">{s.count}x</span>
                          <span
                            className="text-sm font-mono font-medium"
                            style={{
                              color: AMBER,
                              fontFamily: "'JetBrains Mono', monospace",
                            }}
                          >
                            {formatCurrency(s.revenue)}
                          </span>
                        </div>
                      </div>
                      <div
                        className="h-1.5 rounded-full overflow-hidden"
                        style={{ background: "oklch(0.18 0 0)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: controlRevenue > 0 ? `${(s.revenue / controlRevenue) * 100}%` : "0%",
                            background: AMBER,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Appointments list for control date */}
            <div>
              <h3 className="text-white/50 text-xs uppercase tracking-wider mb-3">
                Todos os agendamentos
              </h3>
              {controlAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-10 h-10 text-white/10 mx-auto mb-2" />
                  <p className="text-white/30 text-sm">Sem agendamentos neste dia.</p>
                </div>
              ) : (
                <div className="stagger space-y-2">
                  {controlAppointments.map((appt) => {
                    const statusColor =
                      appt.status === "confirmed" ? GREEN
                      : appt.status === "cancelled" ? RED
                      : AMBER;
                    return (
                      <div
                        key={appt.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                        style={{
                          background: "oklch(0.10 0 0)",
                          borderColor: "oklch(1 0 0 / 6%)",
                          opacity: appt.status === "cancelled" ? 0.4 : 1,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="font-mono text-sm w-12"
                            style={{
                              color: "oklch(0.55 0 0)",
                              fontFamily: "'JetBrains Mono', monospace",
                            }}
                          >
                            {appt.time}
                          </span>
                          <div>
                            <div className="text-white text-sm">{appt.userName}</div>
                            <div className="text-white/30 text-xs">{appt.serviceName}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className="font-mono text-sm"
                            style={{
                              color: appt.status === "confirmed" ? AMBER : "oklch(0.4 0 0)",
                              fontFamily: "'JetBrains Mono', monospace",
                            }}
                          >
                            {formatCurrency(appt.price)}
                          </span>
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ background: statusColor }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
