# BarberPro — Sistema de Barbearia

## Três Abordagens de Design

### 1. Luxury Black Steel
**Tema:** Interface premium com fundo preto absoluto, acentos dourados e tipografia serifada. Evoca barbearias clássicas de alto padrão.
**Probabilidade:** 0.07

### 2. Industrial Brutalist
**Tema:** Estética crua e direta, fontes condensadas bold, bordas visíveis, sem arredondamentos. Sensação de garra e autenticidade urbana.
**Probabilidade:** 0.02

### 3. Dark Precision (ESCOLHIDA)
**Tema:** Interface escura de alta precisão, como um painel de controle profissional. Preto profundo com acentos âmbar/laranja quente, tipografia moderna sem serifa. Combina a seriedade de um sistema de gestão com a identidade visual de uma barbearia contemporânea.
**Probabilidade:** 0.08

---

## Design Escolhido: Dark Precision

### Design Movement
Neomorphic Dark + Precision UI — painéis de controle de alta tecnologia com calor humano dos acentos âmbar.

### Core Principles
1. **Contraste máximo** — fundo quase preto (#0A0A0A), texto branco puro, acentos âmbar vibrante
2. **Hierarquia clara** — cada elemento tem seu peso visual definido, sem ambiguidade
3. **Densidade informacional elegante** — muita informação sem sensação de poluição
4. **Feedback imediato** — cada ação tem resposta visual instantânea

### Color Philosophy
- Background: `#0A0A0A` (preto quase absoluto — profundidade e foco)
- Surface: `#141414` / `#1A1A1A` (cards e painéis — separação sutil)
- Primary: `#F59E0B` (âmbar — calor, energia, ação)
- Primary Dark: `#D97706` (hover states)
- Success: `#10B981` (confirmações, caixa aberto)
- Danger: `#EF4444` (cancelamentos, alertas)
- Text: `#FAFAFA` / `#A1A1AA` (primário / secundário)
- Border: `rgba(255,255,255,0.08)` (separadores discretos)

### Layout Paradigm
Layout assimétrico com sidebar fixa para o barbeiro e layout de cartões para o cliente. Não usa grid centralizado genérico — cada seção tem sua própria lógica espacial.

### Signature Elements
1. **Linha âmbar** — borda esquerda âmbar em cards de destaque
2. **Glassmorphism sutil** — `backdrop-blur` em modais e overlays
3. **Indicadores de status animados** — pulso verde para "aberto", vermelho para "fechado"

### Interaction Philosophy
Cada interação é confirmada visualmente. Botões têm `scale(0.97)` no clique. Transições suaves de 150-250ms. Feedback de loading em todas as operações async.

### Animation
- Entradas de cards: `translateY(8px) → 0` + `opacity 0→1` em 200ms ease-out
- Modais: `scale(0.96) → 1` + `opacity` em 220ms
- Status pulse: keyframe infinito para indicadores de caixa aberto/fechado
- Stagger de 40ms entre itens de lista

### Typography System
- Display: **Bebas Neue** — para títulos grandes e números de destaque
- Body: **Inter** — para textos corridos e labels
- Mono: **JetBrains Mono** — para horários e valores monetários

### Brand Essence
**BarberPro** — o sistema que coloca o barbeiro no controle. Para profissionais que levam o ofício a sério.
Personalidade: **Preciso. Confiável. Profissional.**

### Brand Voice
- Headlines: diretas, imperativas. Ex: "Seu dia, sob controle." / "Agende em segundos."
- CTAs: ativas. Ex: "Reservar horário" / "Abrir caixa" / "Ver agendamentos"
- Sem "Bem-vindo ao nosso sistema" ou "Clique aqui para começar"

### Wordmark & Logo
Tesoura estilizada com lâmina formando a letra "B" — símbolo bold, monocromático, reconhecível em qualquer tamanho.

### Signature Brand Color
`#F59E0B` — âmbar quente, inconfundível no fundo preto.

## Style Decisions
- Tema dark como padrão absoluto, sem toggle de tema
- Fontes: Bebas Neue (display) + Inter (body) via Google Fonts
- Cards com borda sutil `rgba(255,255,255,0.08)` e fundo `#141414`
- Acentos âmbar exclusivamente para ações primárias e destaques
- Verde para status positivo (caixa aberto, confirmado), vermelho para negativo
