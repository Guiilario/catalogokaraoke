// BarberPro — Firebase Setup Page
// Theme: Dark Precision — configuration wizard
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Settings, ExternalLink, CheckCircle, Copy, ChevronDown, ChevronUp } from "lucide-react";

const AMBER = "oklch(0.769 0.188 70.08)";
const CARD_BG = "oklch(0.12 0 0)";

interface SetupPageProps {
  onClose: () => void;
}

export default function SetupPage({ onClose }: SetupPageProps) {
  const [expanded, setExpanded] = useState(true);
  const [config, setConfig] = useState({
    apiKey: localStorage.getItem("fb_apiKey") || "",
    authDomain: localStorage.getItem("fb_authDomain") || "",
    projectId: localStorage.getItem("fb_projectId") || "",
    storageBucket: localStorage.getItem("fb_storageBucket") || "",
    messagingSenderId: localStorage.getItem("fb_messagingSenderId") || "",
    appId: localStorage.getItem("fb_appId") || "",
  });

  function handleSave() {
    if (!config.apiKey || !config.projectId) {
      toast.error("Preencha pelo menos a API Key e o Project ID.");
      return;
    }
    Object.entries(config).forEach(([k, v]) => {
      localStorage.setItem(`fb_${k}`, v);
    });
    toast.success("Configuração salva! Recarregando...");
    setTimeout(() => window.location.reload(), 1000);
  }

  const envExample = `VITE_FIREBASE_API_KEY=${config.apiKey || "sua-api-key"}
VITE_FIREBASE_AUTH_DOMAIN=${config.authDomain || "seu-projeto.firebaseapp.com"}
VITE_FIREBASE_PROJECT_ID=${config.projectId || "seu-projeto-id"}
VITE_FIREBASE_STORAGE_BUCKET=${config.storageBucket || "seu-projeto.appspot.com"}
VITE_FIREBASE_MESSAGING_SENDER_ID=${config.messagingSenderId || "000000000000"}
VITE_FIREBASE_APP_ID=${config.appId || "1:000:web:000"}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "oklch(0 0 0 / 80%)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-lg rounded-xl border overflow-hidden animate-slide-up"
        style={{ background: "oklch(0.10 0 0)", borderColor: "oklch(1 0 0 / 10%)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-5 border-b"
          style={{ borderColor: "oklch(1 0 0 / 8%)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${AMBER}20` }}
            >
              <Settings className="w-4 h-4" style={{ color: AMBER }} />
            </div>
            <div>
              <div className="text-white font-medium">Configurar Firebase</div>
              <div className="text-white/30 text-xs">Conecte seu banco de dados Firestore</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white/70 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Instructions */}
          <div
            className="p-4 rounded-lg border text-sm space-y-2"
            style={{ background: `${AMBER}08`, borderColor: `${AMBER}20` }}
          >
            <div className="font-medium" style={{ color: AMBER }}>
              Como configurar:
            </div>
            <ol className="text-white/50 space-y-1 list-decimal list-inside text-xs">
              <li>Acesse <a href="https://console.firebase.google.com" target="_blank" rel="noopener" className="underline" style={{ color: AMBER }}>console.firebase.google.com</a></li>
              <li>Crie um projeto (ou use um existente)</li>
              <li>Vá em Configurações do Projeto → Seus apps → Web</li>
              <li>Copie as credenciais e cole abaixo</li>
              <li>No Firestore, crie um banco em modo de teste</li>
            </ol>
          </div>

          {/* Form */}
          <div className="space-y-3">
            {[
              { key: "apiKey", label: "API Key", placeholder: "AIzaSy..." },
              { key: "authDomain", label: "Auth Domain", placeholder: "projeto.firebaseapp.com" },
              { key: "projectId", label: "Project ID", placeholder: "meu-projeto-id" },
              { key: "storageBucket", label: "Storage Bucket", placeholder: "projeto.appspot.com" },
              { key: "messagingSenderId", label: "Messaging Sender ID", placeholder: "000000000000" },
              { key: "appId", label: "App ID", placeholder: "1:000:web:000" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <Label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">
                  {label}
                </Label>
                <Input
                  value={config[key as keyof typeof config]}
                  onChange={(e) => setConfig((c) => ({ ...c, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="h-9 text-sm font-mono"
                  style={{
                    background: "oklch(0.14 0 0)",
                    borderColor: "oklch(1 0 0 / 10%)",
                    color: "oklch(0.9 0 0)",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Firestore Rules hint */}
          <div
            className="p-3 rounded-lg border text-xs"
            style={{ background: "oklch(0.12 0 0)", borderColor: "oklch(1 0 0 / 8%)" }}
          >
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center justify-between w-full text-white/50 hover:text-white/70 transition-colors"
            >
              <span className="font-medium">Regras do Firestore (modo teste)</span>
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {expanded && (
              <pre
                className="mt-2 p-2 rounded text-xs overflow-x-auto"
                style={{
                  background: "oklch(0.08 0 0)",
                  color: "oklch(0.6 0.18 145)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}</pre>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex gap-3 p-5 border-t"
          style={{ borderColor: "oklch(1 0 0 / 8%)" }}
        >
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-white/10 text-white/50 hover:text-white/80"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 font-semibold"
            style={{ background: AMBER, color: "oklch(0.08 0 0)" }}
          >
            Salvar e Reconectar
          </Button>
        </div>
      </div>
    </div>
  );
}
