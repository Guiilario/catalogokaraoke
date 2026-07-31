// BarberPro — Login Page
// Theme: Dark Precision — amber on black, asymmetric layout
// Left: hero image with brand. Right: login form.
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { db, doc, getDoc, setDoc, serverTimestamp } from "@/lib/firebase";
import { isConfigured } from "@/lib/firebase";
import { BARBER_PASSWORD } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Scissors, Lock, Phone, User, ChevronRight, Settings } from "lucide-react";
import SetupPage from "./SetupPage";

type Mode = "choose" | "user" | "barber";

export default function LoginPage() {
  const { setSession } = useApp();
  const [mode, setMode] = useState<Mode>("choose");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  async function handleUserLogin(e: React.FormEvent) {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (!name.trim() || digits.length < 10) {
      toast.error("Preencha nome e telefone corretamente.");
      return;
    }
    setLoading(true);
    try {
      const userRef = doc(db, "users", digits);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, {
          name: name.trim(),
          phone: digits,
          createdAt: serverTimestamp(),
        });
      }
      setSession({ role: "user", name: name.trim(), phone: digits });
      toast.success(`Bem-vindo, ${name.trim()}!`);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao conectar. Verifique a configuração do Firebase.");
    } finally {
      setLoading(false);
    }
  }

  async function handleBarberLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password !== BARBER_PASSWORD) {
      toast.error("Senha incorreta.");
      return;
    }
    setSession({ role: "barber", name: "Barbeiro" });
    toast.success("Bem-vindo, Barbeiro!");
  }

  return (
    <>
    {showSetup && <SetupPage onClose={() => setShowSetup(false)} />}
    <div className="min-h-screen flex">
      {/* Left: Hero */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden p-12"
        style={{
          background: `linear-gradient(135deg, oklch(0.06 0 0) 0%, oklch(0.10 0 0) 100%)`,
        }}
      >
        {/* Background image */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(/manus-storage/barber-hero-bg_237fe88a.jpg)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/40 to-transparent" />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <img
            src="/manus-storage/barber-logo_b789d9ef.png"
            alt="BarberPro"
            className="w-10 h-10 object-contain"
          />
          <span
            className="font-display text-3xl text-white tracking-widest"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            BARBERPRO
          </span>
        </div>

        {/* Tagline */}
        <div className="relative z-10">
          <h1
            className="text-6xl font-display text-white leading-none mb-4"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            SEU DIA,
            <br />
            <span style={{ color: "oklch(0.769 0.188 70.08)" }}>SOB CONTROLE.</span>
          </h1>
          <p className="text-white/50 text-lg max-w-xs">
            Agendamento inteligente para barbearias que levam o ofício a sério.
          </p>

          {/* Services preview */}
          <div className="mt-8 flex gap-4">
            {[
              { label: "Cabelo", price: "R$30" },
              { label: "Barba", price: "R$25" },
              { label: "Pezinho", price: "R$10" },
            ].map((s) => (
              <div
                key={s.label}
                className="px-4 py-2 rounded border border-white/10 bg-white/5 backdrop-blur-sm"
              >
                <div className="text-white/40 text-xs">{s.label}</div>
                <div
                  className="font-mono font-medium text-sm"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: "oklch(0.769 0.188 70.08)",
                  }}
                >
                  {s.price}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Login form */}
      <div
        className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16"
        style={{ background: "oklch(0.08 0 0)" }}
      >
        {/* Mobile brand */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <img
            src="/manus-storage/barber-logo_b789d9ef.png"
            alt="BarberPro"
            className="w-8 h-8 object-contain"
          />
          <span
            className="font-display text-2xl text-white tracking-widest"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            BARBERPRO
          </span>
        </div>

        <div className="w-full max-w-sm animate-slide-up">
          {mode === "choose" && (
            <div>
              <h2
                className="text-4xl text-white mb-2"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                ENTRAR
              </h2>
              <p className="text-white/40 text-sm mb-8">
                Escolha como deseja acessar o sistema.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => setMode("user")}
                  className="w-full flex items-center justify-between p-5 rounded-lg border border-white/8 bg-white/4 hover:bg-white/8 hover:border-amber-500/40 transition-all duration-200 group"
                  style={{ background: "oklch(0.12 0 0)" }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: "oklch(0.769 0.188 70.08 / 15%)" }}
                    >
                      <Phone
                        className="w-5 h-5"
                        style={{ color: "oklch(0.769 0.188 70.08)" }}
                      />
                    </div>
                    <div className="text-left">
                      <div className="text-white font-medium">Sou Cliente</div>
                      <div className="text-white/40 text-xs">Agendar horário</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
                </button>

                <button
                  onClick={() => setMode("barber")}
                  className="w-full flex items-center justify-between p-5 rounded-lg border border-white/8 hover:border-white/20 transition-all duration-200 group"
                  style={{ background: "oklch(0.12 0 0)" }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: "oklch(0.18 0 0)" }}
                    >
                      <Scissors className="w-5 h-5 text-white/60" />
                    </div>
                    <div className="text-left">
                      <div className="text-white font-medium">Sou Barbeiro</div>
                      <div className="text-white/40 text-xs">Área administrativa</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
                </button>
              </div>
            </div>
          )}

          {mode === "user" && (
            <div>
              <button
                onClick={() => setMode("choose")}
                className="text-white/40 hover:text-white/70 text-sm mb-6 flex items-center gap-1 transition-colors"
              >
                ← Voltar
              </button>
              <h2
                className="text-4xl text-white mb-2"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                AGENDAR
              </h2>
              <p className="text-white/40 text-sm mb-8">
                Entre com seu nome e WhatsApp.
              </p>

              <form onSubmit={handleUserLogin} className="space-y-4">
                <div>
                  <Label className="text-white/60 text-xs uppercase tracking-wider mb-2 block">
                    Seu nome
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Como te chamam?"
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-amber-500/60 h-12"
                      style={{ background: "oklch(0.14 0 0)" }}
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white/60 text-xs uppercase tracking-wider mb-2 block">
                    WhatsApp
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      placeholder="(11) 99999-9999"
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-amber-500/60 h-12 font-mono"
                      style={{
                        background: "oklch(0.14 0 0)",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 font-semibold text-sm tracking-wide"
                  style={{
                    background: "oklch(0.769 0.188 70.08)",
                    color: "oklch(0.08 0 0)",
                  }}
                >
                  {loading ? "Entrando..." : "Reservar horário →"}
                </Button>
              </form>
            </div>
          )}

          {mode === "barber" && (
            <div>
              <button
                onClick={() => setMode("choose")}
                className="text-white/40 hover:text-white/70 text-sm mb-6 flex items-center gap-1 transition-colors"
              >
                ← Voltar
              </button>
              <h2
                className="text-4xl text-white mb-2"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                BARBEIRO
              </h2>
              <p className="text-white/40 text-sm mb-8">
                Acesso restrito à área administrativa.
              </p>

              <form onSubmit={handleBarberLogin} className="space-y-4">
                <div>
                  <Label className="text-white/60 text-xs uppercase tracking-wider mb-2 block">
                    Senha de acesso
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-amber-500/60 h-12"
                      style={{ background: "oklch(0.14 0 0)" }}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 font-semibold text-sm tracking-wide"
                  style={{
                    background: "oklch(0.769 0.188 70.08)",
                    color: "oklch(0.08 0 0)",
                  }}
                >
                  Entrar no painel →
                </Button>
              </form>

              <p className="text-white/20 text-xs text-center mt-6">
                Senha padrão: <span className="font-mono text-white/40">barbeiro123</span>
              </p>
            </div>
        )}
      </div>
    </div>

      {/* Setup button */}
      <button
        onClick={() => setShowSetup(true)}
        className="fixed bottom-4 right-4 p-2.5 rounded-full border border-white/10 text-white/20 hover:text-white/50 hover:border-white/20 transition-all"
        style={{ background: "oklch(0.12 0 0)" }}
        title="Configurar Firebase"
      >
        <Settings className="w-4 h-4" />
      </button>

      {/* Firebase not configured warning */}
      {!isConfigured && (
        <div
          className="fixed bottom-16 right-4 max-w-xs p-3 rounded-lg border text-xs animate-slide-up"
          style={{
            background: "oklch(0.769 0.188 70.08 / 10%)",
            borderColor: "oklch(0.769 0.188 70.08 / 30%)",
            color: "oklch(0.769 0.188 70.08)",
          }}
        >
          <strong>Firebase não configurado.</strong>
          <br />
          Clique no ícone de configuração (canto inferior direito) para conectar seu Firestore.
        </div>
      )}
    </div>
    </>
  );
}
