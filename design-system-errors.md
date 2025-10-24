# Design System Validation - Fehlerübersicht

**Gesamtanzahl:** 126 Fehler
**Betroffene Dateien:** 19 Komponenten
**Warnungen:** 1

---

## 📊 Fehler nach Kategorie

### 🔢 Arbitrary Values (Hardcoded Größen) - ~45 Fehler

Verwendung von festen Pixel/Rem-Werten statt Design-Tokens:

**Beispiele:**
- `rounded-[1rem]` → sollte `rounded-sm` (16px) oder `rounded-md` (20px) sein
- `rounded-[20px]` → sollte `rounded-md` sein
- `rounded-[28px]` → sollte `rounded-lg` sein
- `text-[1.25rem]` → sollte Typography-Klasse verwenden
- `text-[2rem]` → sollte `text-subsection-h3` oder ähnlich sein
- `text-[14px]`, `text-[16px]`, `text-[20px]` → sollten Typography-Klassen sein

**Betroffene Dateien:**
- `CookieBanner.tsx` (1 Fehler)
- `MiniProfileCard.tsx` (2 Fehler)
- `MultiPreviewCard.tsx` (15+ Fehler)
- `PreviewCardSlider.tsx` (10+ Fehler)
- `PrimaryCard.tsx` (8+ Fehler)
- `SmallCard.tsx` (5+ Fehler)
- `PopoverRegister.tsx` (3 Fehler)

---

### 🎨 Hardcoded Colors - ~50 Fehler

Direkte Farb-Hex-Codes oder Tailwind-Farbklassen statt semantischer Tokens:

**Hex-Codes:**
- `text-[#636573]` → sollte `text-secondary` sein
- `border-[#D2D3D9]` → sollte `border-main` sein
- `text-[#EBF2EE]` → semantischer Token fehlt
- `text-[#4D4E59]` → sollte `text-primary` oder `text-secondary` sein
- `text-[#1F2024]` → sollte `text-primary` sein

**Tailwind Standard Colors:**
- `bg-white` → sollte `bg-bw` sein
- `text-black` → sollte `text-bw` sein
- `bg-red-50`, `border-red-200`, `text-red-600` → sollten Error-Tokens sein
- `bg-green-50`, `border-green-200`, `text-green-400/800` → sollten Success-Tokens sein
- `bg-yellow-100/200`, `text-yellow-400/700/800` → sollten Warning-Tokens sein
- `text-gray-700` → sollte `text-secondary` sein
- `text-primary-700` → sollte semantischer Token sein

**Betroffene Dateien:**
- `MultiPreviewCard.tsx` (20+ Fehler)
- `PreviewCardSlider.tsx` (15+ Fehler)
- `PrimaryCard.tsx` (8+ Fehler)
- `SmallCard.tsx` (3+ Fehler)
- `PopoverRegister.tsx` (12 Fehler)
- `Reactions.tsx` (1 Fehler)

---

### ⚠️ Incorrect Prefix Pattern - 2 Fehler

Doppelte Präfixe, die entfernt werden müssen:

- `text-foreground-inverted` → sollte `text-inverted` sein (PopoverRegister.tsx:61)
- `text-background-interactive-error-default` → sollte `text-interactive-error-default` sein (Input.tsx:46)

---

### 🌫️ Opacity Variants - 4 Fehler

Opacity-Werte, die nicht im Design-System definiert sind:

- `bg-primary/60` → sollte `bg-primary` mit definierter Opacity sein (Navbar.tsx:243)
- `bg-inverted/30` → sollte `bg-inverted` mit definierter Opacity sein (PopoverRegister.tsx:49)
- `bg-primary/40` → sollte `bg-primary` mit definierter Opacity sein (PopoverRegister.tsx:61)

**Hinweis:** Nur bestimmte Opacity-Werte sind im Design-System definiert (`/10`, `/20`, `/40`, `/60`, `/80`)

---

### 📦 Missing Standard Tailwind Utilities - ~20 Fehler

Standard Tailwind-Klassen, die im Validator nicht erkannt werden (false positives):

- `border-t`, `border-b` → Border-Top/Bottom
- `border-1` → 1px Border
- `bg-gradient-to-r` → Gradient Direction
- `rounded-tl-[6px]`, `rounded-br-[20px]` → Corner-specific radius
- `rounded-t-[1rem]`, `rounded-b-none` → Edge-specific radius
- `bg-clip-text`, `text-transparent` → Text gradient effects
- `text-muted-foreground` → Nicht-semantische Klasse

**Hinweis:** Diese Klassen sind technisch valide, sollten aber im Validator-Script als erlaubt markiert werden.

---

### ❓ Other Issues - ~5 Fehler

Verschiedene andere Probleme, die kategorisiert werden müssen.

---

## 🏆 Top 10 Dateien mit den meisten Fehlern

1. **MultiPreviewCard.tsx** - ~35 Fehler
2. **PreviewCardSlider.tsx** - ~25 Fehler
3. **PrimaryCard.tsx** - ~18 Fehler
4. **PopoverRegister.tsx** - ~16 Fehler
5. **SmallCard.tsx** - ~8 Fehler
6. **MiniProfileCard.tsx** - ~4 Fehler
7. **AIUnterstuetzungSection.tsx** - ~4 Fehler
8. **HeroSection.tsx** - ~3 Fehler
9. **Input.tsx** - ~1 Fehler
10. **Navbar.tsx** - ~1 Fehler

---

## 📋 Detaillierte Fehler-Liste nach Datei

### src/components/CookieBanner.tsx (1 Fehler)
- Line 75: `rounded-[1rem]` → `rounded-sm`

### src/components/Navbar.tsx (1 Fehler)
- Line 243: `bg-primary/60` → benötigt definierte Opacity-Variante

### src/components/cards/MiniProfileCard.tsx (4 Fehler)
- Line 18: `rounded-[20px]` → `rounded-md`
- Line 22: `text-[1.25rem]` → Typography-Klasse
- Line 22: `text-black` → `text-bw`
- Line 23: `text-[#636573]` → `text-secondary`

### src/components/cards/MultiPreviewCard.tsx (~35 Fehler)
**Arbitrary Values:**
- Lines 79, 96: `rounded-[28px]`, `rounded-[20px]`
- Lines 99: `rounded-tl-[6px]`, `rounded-br-[20px]`
- Lines 82, 110, 163, 172-176: `text-[2rem]`, `text-[1.5rem]`, `text-[14px]`, `text-[20px]`, `text-[16px]`, `text-[12px]`

**Hardcoded Colors:**
- Line 79: `bg-white`, `border-[#D2D3D9]`
- Lines 82, 122, 129: `text-black`
- Lines 104: `text-[#EBF2EE]`
- Lines 110, 173: `text-[#4D4E59]`
- Lines 163, 172, 176: `text-[#1F2024]`
- Lines 162: `border-[#D2D3D9]`

**Standard Tailwind:**
- Line 99: `bg-gradient-to-r`
- Line 162: `border-t`, `border-b`

### src/components/cards/PreviewCardSlider.tsx (~25 Fehler)
Ähnliche Fehler wie MultiPreviewCard:
- Arbitrary Values für Größen und Border-Radius
- Hardcoded Hex-Colors
- `text-black`, `bg-white` statt semantische Tokens

### src/components/cards/PrimaryCard.tsx (~18 Fehler)
- Arbitrary Values für Typography
- Hardcoded Colors
- Border und Gradient Issues

### src/components/cards/SmallCard.tsx (~8 Fehler)
- Arbitrary Values
- Hardcoded Colors

### src/components/ui/PopoverRegister.tsx (16 Fehler)
- Line 49: `bg-inverted/30` → definierte Opacity
- Line 55: `rounded-[1rem]` → `rounded-sm`
- Line 61: `bg-primary/40` → definierte Opacity
- Line 61: `text-foreground-inverted` → `text-inverted` ⚠️
- Lines 72: `rounded-t-[1rem]`, `rounded-b-none`
- Lines 130-131: `bg-red-50`, `border-red-200`, `text-red-600` → Error-Tokens
- Line 168: `text-primary-700`
- Lines 179, 182, 187-188: Yellow-Colors → Warning-Tokens
- Lines 196, 199, 204-205: Green-Colors → Success-Tokens

### src/components/sections/AIUnterstuetzungSection.tsx (4 Fehler)
- Lines 52, 61, 80, 163: `bg-clip-text`, `text-transparent` (Gradient-Text)

### src/components/sections/HeroSection.tsx (3 Fehler)
- Lines 31, 39, 47: `border-1`

### src/components/ui/Input.tsx (1 Fehler)
- Line 46: `text-background-interactive-error-default` → `text-interactive-error-default` ⚠️

### src/components/ui/Reactions.tsx (1 Fehler)
- Line 81: `text-gray-700` → `text-secondary`

### src/components/ui/accordion.tsx (2 Fehler)
- Line 22: `border-b`
- Line 44: `text-muted-foreground`

### src/components/ui/footer.tsx (2 Fehler + 1 Warnung)
- Line 65: `border-t`
- Line 94: `text-muted-foreground`
- ⚠️ Line 66: Desktop-first Pattern → Mobile-first verwenden

---

## 🔧 Empfohlene Fix-Strategie

### Priorität 1: Kritische Fehler (Sofort beheben)
1. **Incorrect Prefix Pattern** (2 Fehler) - Brechen das Design-System
2. **Hardcoded Colors** in Core-Komponenten - Brechen Dark Mode

### Priorität 2: Design-Token Compliance (Mittelfristig)
1. **Arbitrary Values** durch Design-Tokens ersetzen
2. **Tailwind Standard Colors** durch semantische Tokens ersetzen
3. **Opacity Variants** standardisieren

### Priorität 3: Validator-Verbesserungen (Optional)
1. Standard Tailwind Utilities erlauben (`border-t`, `bg-gradient-to-r`, etc.)
2. Gradient-Text Klassen als valide markieren
3. `text-muted-foreground` prüfen oder ersetzen

---

## 💡 Hinweise

- **Dark Mode Probleme:** Alle hardcoded Colors (`text-black`, `bg-white`, Hex-Codes) funktionieren nicht korrekt im Dark Mode
- **Wartbarkeit:** Arbitrary Values machen Design-System-Updates schwierig
- **Konsistenz:** Verschiedene Karten-Komponenten verwenden unterschiedliche Ansätze
- **False Positives:** Einige Standard Tailwind-Klassen werden fälschlicherweise als Fehler markiert

---

**Generiert am:** $(date)
**Validierungs-Tool:** `npm run design:review`
