# 🎯 Implementierungsplan: Memorial Creation Flow

**Status:** In Arbeit
**Start:** 2025-01-10
**Verantwortlich:** Søren & Claude
**Geschätzter Aufwand:** 5-6 Arbeitstage

---

## 📋 Übersicht

Implementierung des kompletten "Neue Gedenkseite erstellen" Flows mit 6 Schritten:
1. Typ-Auswahl (Person/Tier/Familie/Ereignis)
2. Stammdaten erfassen (Step 1 von 3)
3. Avatar wählen (Step 2 von 3)
4. Sichtbarkeit einstellen (Step 3 von 3)
5. Zusammenfassung + optionale Inhalte
6. Redirect zu Verwaltungs-Page

---

## 🎨 User Flow

```
Dashboard
  → /gedenkseite/neu (Typ-Auswahl)
    → /gedenkseite/neu/person (Stammdaten Person)
      → /gedenkseite/neu/person/avatar (Avatar)
        → /gedenkseite/neu/person/sichtbarkeit (Privacy)
          → /gedenkseite/neu/person/zusammenfassung (Summary)
            → POST /api/memorials
              → /gedenkseite/{id}/verwalten?welcome=true

    → /gedenkseite/neu/tier (Stammdaten Tier)
      → /gedenkseite/neu/tier/avatar
        → /gedenkseite/neu/tier/sichtbarkeit
          → /gedenkseite/neu/tier/zusammenfassung
            → POST /api/memorials
              → /gedenkseite/{id}/verwalten?welcome=true
```

---

## 📊 Datenbank-Status

### ✅ Vorhandene Tabellen
- `memorials` - Haupt-Tabelle (muss erweitert werden)
- `tierarten` - Tierarten (existiert in Supabase)
- `rassengruppen` - Rassengruppen (existiert in Supabase)
- `rassen` - Rassen (existiert in Supabase)

### ❌ Fehlende Felder in `memorials`

**Person-spezifisch:**
- `gender` (text, nullable) - Geschlecht (männlich/weiblich/divers/keine Angabe)
- `salutation` (text, nullable) - Ansprache (Herr/Frau/keine Angabe)
- `title` (text, nullable) - Titel (Dr., Prof., Prof. Dr.)
- `second_name` (text, nullable) - Zweiter Vorname
- `name_suffix` (text, nullable) - Namenszusatz

**Tier-spezifisch (FK-Änderungen):**
- `animal_type_id` (uuid, FK → tierarten) - ersetzt `animal_type` (string)
- `breed_group_id` (uuid, FK → rassengruppen) - ersetzt `breed_group` (string)
- `breed_id` (uuid, FK → rassen) - ersetzt `breed` (string)

### 📦 Supabase Storage
- **Bucket:** `memorial-avatars` (muss erstellt werden)
- **RLS Policies:**
  - Upload: Nur authentifizierte User
  - Read: Public für öffentliche Memorials, restricted für private
- **Settings:** Max 2MB, JPG/PNG/WebP

---

## 🏗️ Phase 1: Datenbank & Infrastruktur Setup

### 1.1 Supabase TypeScript Types generieren
**Ziel:** Types für tierarten/rassengruppen/rassen Tabellen verfügbar machen

**Tasks:**
- [ ] `npm run supabase:types` ausführen
- [ ] Generierte Types in `src/lib/supabase.ts` prüfen
- [ ] Type Definitions für `Tierart`, `Rassengruppe`, `Rasse` exportieren

**Datei:** `src/lib/supabase.ts`

---

### 1.2 Memorial-Tabelle erweitern

**Migration 1: Person-Felder hinzufügen**
```sql
-- supabase/migrations/YYYYMMDDHHMMSS_add_person_fields_to_memorials.sql

ALTER TABLE memorials
ADD COLUMN gender text,
ADD COLUMN salutation text,
ADD COLUMN title text,
ADD COLUMN second_name text,
ADD COLUMN name_suffix text;

COMMENT ON COLUMN memorials.gender IS 'Geschlecht: männlich, weiblich, divers, keine Angabe';
COMMENT ON COLUMN memorials.salutation IS 'Ansprache: Herr, Frau, keine Angabe';
COMMENT ON COLUMN memorials.title IS 'Titel: Dr., Prof., Prof. Dr., etc.';
COMMENT ON COLUMN memorials.second_name IS 'Zweiter Vorname';
COMMENT ON COLUMN memorials.name_suffix IS 'Namenszusatz';
```

**Migration 2: Tier-Felder zu Foreign Keys ändern**
```sql
-- supabase/migrations/YYYYMMDDHHMMSS_convert_animal_fields_to_fk.sql

-- Neue FK-Spalten hinzufügen
ALTER TABLE memorials
ADD COLUMN animal_type_id uuid REFERENCES tierarten(id),
ADD COLUMN breed_group_id uuid REFERENCES rassengruppen(id),
ADD COLUMN breed_id uuid REFERENCES rassen(id);

-- Alte String-Spalten löschen (nach Datenmigration wenn nötig)
ALTER TABLE memorials
DROP COLUMN animal_type,
DROP COLUMN breed_group,
DROP COLUMN breed;

-- Kommentare
COMMENT ON COLUMN memorials.animal_type_id IS 'FK zu tierarten Tabelle';
COMMENT ON COLUMN memorials.breed_group_id IS 'FK zu rassengruppen Tabelle';
COMMENT ON COLUMN memorials.breed_id IS 'FK zu rassen Tabelle';
```

**Tasks:**
- [ ] Migration-Dateien erstellen
- [ ] In Supabase ausführen
- [ ] `Memorial` Type in `src/lib/supabase.ts` aktualisieren
- [ ] Type-Check durchführen

---

### 1.3 Supabase Storage Bucket erstellen

**Supabase Dashboard:**
- [ ] Storage → New Bucket: `memorial-avatars`
- [ ] Public Bucket: Nein (wir steuern Access über RLS)
- [ ] File Size Limit: 2MB
- [ ] Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`

**RLS Policies:**

```sql
-- Policy 1: Authentifizierte User können Avatars hochladen
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'memorial-avatars');

-- Policy 2: Creator kann eigene Avatars löschen/updaten
CREATE POLICY "Users can update own memorial avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'memorial-avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: Öffentliche Memorials → Avatars public lesbar
CREATE POLICY "Public memorials avatars are readable"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'memorial-avatars'
  AND EXISTS (
    SELECT 1 FROM memorials
    WHERE id::text = (storage.foldername(name))[1]
    AND privacy_level = 'public'
  )
);

-- Policy 4: Private Memorials → nur Creator + invited
CREATE POLICY "Private memorial avatars restricted"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'memorial-avatars'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM memorial_invitations
      WHERE memorial_id::text = (storage.foldername(name))[1]
      AND invited_email = auth.email()
      AND status = 'accepted'
    )
  )
);
```

**Tasks:**
- [ ] Bucket erstellen
- [ ] RLS Policies anlegen
- [ ] Upload testen (z.B. via Supabase Dashboard)

---

## 🧩 Phase 2: Shared Components & Utilities

### 2.1 Form Components

**Erstellen in `/components/forms/`:**

#### DateInput.tsx
```typescript
// Deutsches Datumsformat (TT.MM.JJJJ) mit date-fns
// Features:
// - Placeholder: "TT.MM.JJJJ"
// - Format: DD.MM.YYYY
// - Validierung: Valides Datum
// - Min/Max Datum Support
// - Error States
// - Integration mit react-hook-form
```

**Tasks:**
- [ ] `DateInput.tsx` erstellen
- [ ] date-fns Integration
- [ ] Storybook/Test erstellen

---

#### Select.tsx
```typescript
// Custom Dropdown mit Design System
// Features:
// - Suche/Filter
// - Keyboard Navigation
// - Error States
// - Loading State (für API-Calls)
// - Placeholder
// - react-hook-form Integration
```

**Tasks:**
- [ ] `Select.tsx` erstellen
- [ ] Accessibility (ARIA)
- [ ] Storybook/Test erstellen

---

#### Autocomplete.tsx
```typescript
// Autocomplete mit Typeahead
// Features:
// - Async Data Loading
// - Debounced Search
// - Highlighting matched text
// - "Keine Ergebnisse" State
// - react-hook-form Integration
```

**Tasks:**
- [ ] `Autocomplete.tsx` erstellen
- [ ] Debounce Logic
- [ ] Storybook/Test erstellen

---

#### AccordionSection.tsx
```typescript
// Expandable Section für "Weitere Felder hinzufügen"
// Features:
// - Smooth Animation
// - Chevron Icon
// - Accessible (ARIA)
// - Controlled/Uncontrolled Mode
```

**Tasks:**
- [ ] `AccordionSection.tsx` erstellen
- [ ] Animation mit Tailwind
- [ ] Storybook/Test erstellen

---

### 2.2 Memorial-spezifische Components

**Erstellen in `/components/memorial/`:**

#### WizardLayout.tsx
```typescript
// Haupt-Layout für alle Wizard-Steps
// Struktur:
// - Linke Sidebar (Logo, Support-Buttons)
// - Content Area (Form/Steps)
// - Responsive (Mobile: Sidebar oben)
```

**Tasks:**
- [ ] Layout-Komponente erstellen
- [ ] Blur-Hintergrund einbinden
- [ ] Responsive Design
- [ ] Dark Mode Support

---

#### ProgressIndicator.tsx
```typescript
// "Schritt X von 3" Anzeige
// Features:
// - Step Dots/Line Visualisierung
// - Current Step highlighted
// - Completed Steps mit Checkmark
```

**Tasks:**
- [ ] Komponente erstellen
- [ ] Step-States (pending/current/completed)
- [ ] Responsive Design

---

#### InitialsGenerator.tsx
```typescript
// Auto-Generierung Initialen aus Namen
// Logic:
// - "Max Mustermann" → "MM"
// - "Bella" (Tier) → "BE"
// - Gradient Background (Brand Colors)
// - Circle/Square Shape Support
```

**Tasks:**
- [ ] Initialen-Logic implementieren
- [ ] Gradient-Generator
- [ ] Wiederverwendung von InitialsAvatar.tsx prüfen

---

#### AvatarCropModal.tsx
```typescript
// react-easy-crop Integration
// Features:
// - Shape Toggle (Kreis/Quadrat)
// - Zoom Slider (0.5x - 3x)
// - Drag to reposition
// - Preview
// - Buttons: [Bild ändern] [Übernehmen]
```

**Tasks:**
- [ ] Modal-Komponente erstellen
- [ ] react-easy-crop Integration
- [ ] Canvas-basierte Crop-Export
- [ ] Shape-Toggle UI

---

#### PrivacyToggle.tsx
```typescript
// Öffentlich/Privat Switcher
// Features:
// - Toggle UI
// - Beschreibung der Optionen
// - "Volle Kontrolle" (Premium, disabled)
```

**Tasks:**
- [ ] Toggle-Komponente erstellen
- [ ] Premium-Badge für "Volle Kontrolle"
- [ ] Accessibility

---

### 2.3 Hooks & Utils

#### useMemorialWizard.ts
```typescript
// Zentrales State Management für Wizard
// State:
// - currentStep
// - memorialType ('person' | 'pet')
// - formData (alle Felder)
// - Navigation (next/prev/goToStep)
```

**Tasks:**
- [ ] Hook erstellen
- [ ] State-Management Logic
- [ ] Navigation Logic
- [ ] TypeScript Types

---

#### useLocalStorageDraft.ts
```typescript
// Auto-Save Draft in LocalStorage
// Features:
// - Debounced Save (500ms)
// - Load Draft on Mount
// - Clear Draft after Submit
// - Storage Key: `memorial-draft-${userId}`
```

**Tasks:**
- [ ] Hook erstellen
- [ ] Debounce Implementation
- [ ] Error Handling (QuotaExceeded)

---

#### /lib/validation/memorial-schema.ts
```typescript
// Zod Schemas für Validierung
// Schemas:
// - personBasicInfoSchema
// - petBasicInfoSchema
// - avatarSchema
// - privacySchema
// - memorialCreateSchema (combined)
```

**Tasks:**
- [ ] Zod Schemas definieren
- [ ] Custom Validatoren (z.B. Datum-Logic)
- [ ] Error Messages in Deutsch

---

#### /lib/utils/initials.ts
```typescript
// Initialen-Generierung Utility
// Functions:
// - generateInitials(firstName, lastName?)
// - generateGradient(initials) → CSS gradient
```

**Tasks:**
- [ ] Utility-Funktionen erstellen
- [ ] Tests schreiben

---

#### /lib/utils/date-validation.ts
```typescript
// Datums-Validierung
// Functions:
// - isValidDate(dateString)
// - isDeathAfterBirth(birthDate, deathDate)
// - formatDateToISO(germanDate)
```

**Tasks:**
- [ ] Validierungs-Funktionen
- [ ] date-fns Integration
- [ ] Tests schreiben

---

## 🛣️ Phase 3: Wizard Flow - Routes & Pages

### 3.1 Entry Point - Dashboard

**Datei:** `/app/dashboard/page.tsx` (Line 247)

**Änderung:**
```typescript
const handleCreateMemorial = () => {
  router.push('/gedenkseite/neu');
};
```

**Tasks:**
- [ ] Handler implementieren
- [ ] Testen (Navigation funktioniert)

---

### 3.2 Typ-Auswahl

**Route:** `/app/gedenkseite/neu/page.tsx`

**UI-Layout:**
- WizardLayout
- Headline: "Neue Gedenkseite erstellen"
- Subtitle: "Welche Art von Gedenkseite möchtest du anlegen?"
- 2x2 Grid mit 4 Cards

**Cards:**
1. **Person** ✅ - Klickbar → `/gedenkseite/neu/person`
2. **Tier** ✅ - Klickbar → `/gedenkseite/neu/tier`
3. **Familie** ⏸️ - Badge "BALD VERFÜGBAR" + Premium + disabled
4. **Ereignis** ⏸️ - Badge "BALD VERFÜGBAR" + Premium + disabled

**Navigation:**
- Abbrechen → Dashboard
- Keine "Weiter" - User muss Card wählen

**Tasks:**
- [ ] Route erstellen
- [ ] UI implementieren
- [ ] Card-Component (wiederverwendbar)
- [ ] Premium-Badge Component
- [ ] Navigation Logic
- [ ] Responsive Design
- [ ] Dark Mode testen

**Screenshot:** `docs/Screenshots-Flow-neue-Gedenkseite/gedenkseite/neu.jpg`

---

### 3.3 Stammdaten - Person

**Route:** `/app/gedenkseite/neu/person/page.tsx`

**Progress:** Schritt 1 von 3

**UI-Layout:**
- WizardLayout + ProgressIndicator
- Headline: "Für wen möchtest du eine Gedenkseite anlegen?"

**Form-Felder:**

**Pflichtfelder (immer sichtbar):**
- Vorname* (TextInput, max 100 Zeichen)
- Nachname* (TextInput, max 100 Zeichen)
- Geburtsdatum* (DateInput)
- Geburtsort (TextInput, optional)
- Sterbedatum* (DateInput)
- Sterbeort (TextInput, optional)

**Accordion "Weitere Felder hinzufügen":**
- Geschlecht (Select: männlich, weiblich, divers, keine Angabe)
- Ansprache (Select: Herr, Frau, keine Angabe)
- Titel (TextInput: Dr., Prof., Prof. Dr.)
- Spitzname (TextInput, max 50)
- Zweiter Vorname (TextInput, max 100)
- Geburtsname (TextInput, max 100)
- Namenszusatz (TextInput, max 50)

**Validierung:**
- Live-Validierung während Eingabe
- Sterbedatum > Geburtsdatum
- Pflichtfelder markiert mit *
- Error Messages in Deutsch

**Navigation:**
- Zurück → Typ-Auswahl (`/gedenkseite/neu`)
- Weiter (disabled bis alle Pflichtfelder valid) → Avatar (`/gedenkseite/neu/person/avatar`)

**Features:**
- react-hook-form Integration
- Zod Schema Validierung
- Auto-Save Draft (useLocalStorageDraft)
- Load Draft on Mount

**Tasks:**
- [ ] Route erstellen
- [ ] Form mit react-hook-form
- [ ] Validierung mit Zod
- [ ] Accordion für optionale Felder
- [ ] Auto-Save Implementation
- [ ] Navigation Logic
- [ ] Error Handling
- [ ] Responsive Design
- [ ] Dark Mode testen

**Screenshot:** `docs/Screenshots-Flow-neue-Gedenkseite/gedenkseite/neu/person-oder-tier.jpg`

---

### 3.4 Stammdaten - Tier

**Route:** `/app/gedenkseite/neu/tier/page.tsx`

**Progress:** Schritt 1 von 3

**UI-Layout:**
- WizardLayout + ProgressIndicator
- Headline: "Für wen möchtest du eine Gedenkseite anlegen?"

**Form-Felder:**

**Pflichtfelder:**
- Name* (TextInput, max 100 Zeichen, Label: "Name deines Tieres")
- Geburtsdatum* (DateInput)
- Geburtsort (TextInput, optional)
- Sterbedatum* (DateInput)
- Sterbeort (TextInput, optional)

**Tierart-Kaskade (Hauptbereich):**
- Tierart (Autocomplete/Select, lädt von `tierarten` Tabelle via API)
- Rassengruppe (Autocomplete/Select, aktiviert nach Tierart, filtered by `animal_type_id`)
- Rasse (Autocomplete/Select, aktiviert nach Rassengruppe, filtered by `breed_group_id`)
- Alle 3 optional aber empfohlen

**Accordion "Weitere Felder hinzufügen":**
- Geschlecht (Select: männlich, weiblich)
- Spitzname (TextInput, max 50)

**Cascade Logic:**
- Tierart auswählen → Rassengruppe-Dropdown aktiviert + lädt Daten
- Rassengruppe auswählen → Rasse-Dropdown aktiviert + lädt Daten
- Änderung Tierart → Rassengruppe + Rasse zurücksetzen
- Änderung Rassengruppe → Rasse zurücksetzen

**Navigation:**
- Zurück → Typ-Auswahl
- Weiter (disabled bis Name + Daten valid) → Avatar

**Tasks:**
- [ ] Route erstellen
- [ ] Form mit react-hook-form
- [ ] Tierart-Kaskade implementieren
- [ ] API-Calls für Tierarten/Rassen
- [ ] Cascade-Reset Logic
- [ ] Auto-Save Implementation
- [ ] Responsive Design
- [ ] Dark Mode testen

**Screenshot:** `docs/Screenshots-Flow-neue-Gedenkseite/gedenkseite/neu/person-oder-tier.jpg`

---

### 3.5 Avatar-Auswahl

**Route:** `/app/gedenkseite/neu/[person|tier]/avatar/page.tsx`

**Progress:** Schritt 2 von 3

**UI-Layout:**
- WizardLayout + ProgressIndicator
- Large Preview-Area (300x300px, zeigt aktuellen Avatar)
- Tab-Navigation (3 Tabs unter Preview)

**Tab 1: Initialen (Default)**
- Auto-generiert aus Vorname + Nachname (Person) oder Name (Tier)
- Beispiel: "Max Mustermann" → "MM"
- Beispiel: "Bella" → "BE"
- Kreisförmiger Badge mit Gradient-Background
- Keine Customization

**Tab 2: Icon**
- Vordefinierte Icons zur Auswahl
- Person: Person-Silhouette
- Tier: Paw/Pfote
- Keine Customization im MVP

**Tab 3: Bild hochladen**
- File Upload (max 2 MB)
- Supported: JPG, PNG, WebP
- Nach Upload → AvatarCropModal öffnet
  - Shape Toggle: Kreis/Quadrat
  - Zoom Slider: 0.5x - 3x
  - Drag to reposition
  - Live Preview
  - Buttons: [Bild ändern] [Übernehmen]
- Upload zu Supabase Storage `memorial-avatars/{userId}/temp_avatar.{ext}`

**State Management:**
- `avatarType`: 'initials' | 'icon' | 'image'
- `avatarFile`: File | null
- `avatarUrl`: string | null (nach Upload)
- `cropSettings`: { shape, zoom, position }

**Navigation:**
- Zurück → Stammdaten
- Weiter → Sichtbarkeit

**Tasks:**
- [ ] Route mit Dynamic Segment `[type]` erstellen
- [ ] Tab-UI implementieren
- [ ] Initialen-Generator Integration
- [ ] Icon-Auswahl UI
- [ ] File Upload Input
- [ ] AvatarCropModal Integration
- [ ] Supabase Storage Upload
- [ ] Preview aktualisiert sich bei Änderung
- [ ] Error Handling (File zu groß, falsches Format)
- [ ] Responsive Design
- [ ] Dark Mode testen

**Screenshot:** `docs/Screenshots-Flow-neue-Gedenkseite/gedenkseite/neu/person-oder-tier/avatar.jpg`

---

### 3.6 Sichtbarkeit

**Route:** `/app/gedenkseite/neu/[person|tier]/sichtbarkeit/page.tsx`

**Progress:** Schritt 3 von 3

**UI-Layout:**
- WizardLayout + ProgressIndicator
- Headline: "Sichtbarkeit der Gedenkseite"
- Subtitle: Erklärung der Privacy-Levels

**Privacy Options:**
1. **Öffentlich** (Default, Radio selected)
   - Icon: Welt/Globe
   - Titel: "Öffentlich"
   - Beschreibung: "In Suche sichtbar, jeder kann die Seite besuchen"

2. **Privat** (Radio)
   - Icon: Schloss
   - Titel: "Privat"
   - Beschreibung: "Nur per Einladungs-Link zugänglich"

3. **Volle Kontrolle** (Disabled, Premium)
   - Badge: "PREMIUM" + "BALD VERFÜGBAR"
   - Icon: Einstellungen
   - Titel: "Volle Kontrolle"
   - Beschreibung: "Mit Passwort, individuellen Berechtigungen"

**State:**
- `privacyLevel`: 'public' | 'private'

**Navigation:**
- Zurück → Avatar
- Weiter → Zusammenfassung

**Tasks:**
- [ ] Route erstellen
- [ ] Radio-Group UI
- [ ] Premium-Badge für "Volle Kontrolle"
- [ ] State Management
- [ ] Responsive Design
- [ ] Dark Mode testen

**Screenshot:** `docs/Screenshots-Flow-neue-Gedenkseite/gedenkseite/neu/person-oder-tier/sichtbarkeit.jpg`

---

### 3.7 Zusammenfassung

**Route:** `/app/gedenkseite/neu/[person|tier]/zusammenfassung/page.tsx`

**Kein Progress Indicator** (optionaler Schritt)

**UI-Layout:**

**Linke Sidebar (innerhalb WizardLayout):**
- Preview Card:
  - Avatar (large, 200x200px)
  - Vollständiger Name (H2)
  - ✱ Geburtsdatum
  - ✝ Sterbedatum
  - 📍 Orte (falls angegeben)
  - Status-Badge: "Öffentlich" oder "Privat"

**Rechts Content:**
- Headline: "Glückwunsch, du bist so gut wie fertig."
- Subtitle: "Deine Gedenkseite ist bereit zur Veröffentlichung. Du kannst jetzt noch optionale Inhalte hinzufügen oder direkt erstellen."

**Liste: Kostenfreie Inhalte**
Jeder Eintrag: Icon + Titel + Tag + Subline + Button

1. **Spruch**
   - Tag: "EMPFEHLUNG"
   - Subline: "Ein kurzer Spruch oder Zitat (max 160 Zeichen)"
   - Button: "Schreiben" (disabled in V1)

2. **Nachruf**
   - Tag: "EMPFEHLUNG"
   - Subline: "Eine ausführliche Würdigung (max 5000 Zeichen)"
   - Button: "Schreiben" (disabled in V1)

3. **Wissenswertes**
   - Tag: "EMPFEHLUNG"
   - Subline: "Besondere Eigenschaften als Badges anzeigen"
   - Button: "Hinzufügen" (disabled in V1)

4. **Kondolenzbuch**
   - Tag: "EMPFEHLUNG"
   - Subline: "Besuchern ermöglichen Kondolenzeinträge zu hinterlassen"
   - Button: "Erstellen" (disabled in V1)

5. **Termine**
   - Subline: "Jahrestage, Beerdigung, Gedenkfeiern"
   - Button: "Bald verfügbar" (disabled)

**Liste: Premium Inhalte**

6. **Erinnerungen**
   - Badge: "PREMIUM"
   - Subline: "Foto- und Video-Galerien"
   - Button: "Bald verfügbar" (disabled)

7. **Familienstammbaum**
   - Badge: "PREMIUM"
   - Subline: "Familienzusammenhänge visualisieren"
   - Button: "Bald verfügbar" (disabled)

**Primary Action:**
- Button: "Seite erstellen" (primary, prominent, full-width oder rechts)

**Navigation:**
- Zurück → Sichtbarkeit
- "Seite erstellen" → API Call → Redirect

**Tasks:**
- [ ] Route erstellen
- [ ] Preview Card Component
- [ ] Content-Options Liste UI
- [ ] "Seite erstellen" Handler
- [ ] API Call zu `/api/memorials`
- [ ] Success/Error Handling
- [ ] Loading State während API-Call
- [ ] Responsive Design
- [ ] Dark Mode testen

**Screenshot:** `docs/Screenshots-Flow-neue-Gedenkseite/gedenkseite/neu/person-oder-tier/zusammenfassung.jpg`

---

## 🔌 Phase 4: API Endpoints

### 4.1 Memorial Creation API

**Route:** `/app/api/memorials/route.ts`

**Method:** POST

**Authentication:** Required (Supabase Auth)

**Request Body:**
```typescript
{
  type: 'person' | 'pet',

  // Person fields
  first_name: string,
  last_name?: string,
  gender?: string,
  salutation?: string,
  title?: string,
  second_name?: string,
  birth_name?: string,
  name_suffix?: string,
  nickname?: string,

  // Pet fields
  pet_name?: string,
  pet_gender?: string,
  animal_type_id?: uuid,
  breed_group_id?: uuid,
  breed_id?: uuid,

  // Common
  birth_date: string, // ISO format
  death_date: string, // ISO format
  birth_place?: string,
  death_place?: string,

  // Avatar
  avatar_type: 'initials' | 'icon' | 'image',
  avatar_url?: string, // URL from Storage Upload

  // Privacy
  privacy_level: 'public' | 'private'
}
```

**Response 201 Created:**
```typescript
{
  success: true,
  memorial: {
    id: uuid,
    created_at: string,
    // ... full memorial object
  },
  redirect_url: "/gedenkseite/{id}/verwalten?welcome=true"
}
```

**Response 400 Bad Request:**
```typescript
{
  success: false,
  error: "Validation error",
  details: {
    field: "death_date",
    message: "Sterbedatum muss nach Geburtsdatum liegen"
  }
}
```

**Logic:**
1. Validate Request Body (Zod Schema)
2. Check Authentication
3. Validate Dates (death > birth)
4. Insert into `memorials` table
5. Generate `invite_link` if privacy = 'private'
6. Return Memorial + Redirect URL

**Tasks:**
- [ ] Route Handler erstellen
- [ ] Zod Validation
- [ ] Supabase Insert Logic
- [ ] Error Handling
- [ ] Invite Link Generation (für private)
- [ ] Tests schreiben

---

### 4.2 Avatar Upload API

**Route:** `/app/api/memorials/avatar/route.ts`

**Method:** POST

**Content-Type:** multipart/form-data

**Authentication:** Required

**Request:**
```typescript
FormData {
  file: File, // Image file
  shape: 'circle' | 'square',
  zoom: number,
  cropData: JSON // { x, y, width, height }
}
```

**Logic:**
1. Validate File (max 2MB, JPG/PNG/WebP)
2. Get User ID from Auth
3. Apply Crop (Canvas API server-side oder client-side vor Upload)
4. Generate Filename: `temp_${userId}_${timestamp}.{ext}`
5. Upload zu Supabase Storage `memorial-avatars/`
6. Return Public URL

**Response 200:**
```typescript
{
  success: true,
  avatar_url: "https://supabase.co/storage/v1/object/public/memorial-avatars/..."
}
```

**Tasks:**
- [ ] Route Handler erstellen
- [ ] File Upload Handling
- [ ] Supabase Storage Integration
- [ ] Crop Logic (client oder server?)
- [ ] Error Handling (File zu groß, falsches Format)
- [ ] Tests schreiben

---

### 4.3 Tierarten Fetch APIs

#### GET /api/animals/types
**Zweck:** Alle Tierarten abrufen

**Response:**
```typescript
{
  success: true,
  data: [
    { id: uuid, name: "Hund" },
    { id: uuid, name: "Katze" },
    { id: uuid, name: "Pferd" },
    // ...
  ]
}
```

**Tasks:**
- [ ] Route erstellen
- [ ] Supabase Query
- [ ] Caching (optional)

---

#### GET /api/animals/breed-groups/[typeId]
**Zweck:** Rassengruppen für eine Tierart

**Response:**
```typescript
{
  success: true,
  data: [
    { id: uuid, name: "Retriever", animal_type_id: uuid },
    { id: uuid, name: "Hütehunde", animal_type_id: uuid },
    // ...
  ]
}
```

**Tasks:**
- [ ] Route erstellen
- [ ] Filtered Query (by animal_type_id)

---

#### GET /api/animals/breeds/[groupId]
**Zweck:** Rassen für eine Rassengruppe

**Response:**
```typescript
{
  success: true,
  data: [
    { id: uuid, name: "Golden Retriever", breed_group_id: uuid },
    { id: uuid, name: "Labrador Retriever", breed_group_id: uuid },
    // ...
  ]
}
```

**Tasks:**
- [ ] Route erstellen
- [ ] Filtered Query (by breed_group_id)

---

## 🎨 Phase 5: Memorial Verwaltung (Post-Creation)

### 5.1 Verwaltungs-Page

**Route:** `/app/gedenkseite/[id]/verwalten/page.tsx`

**Authentication:** Required (nur Creator + invited Users)

**Query Params:**
- `?welcome=true` → Zeigt Welcome Banner

**UI-Layout:**

**Welcome Banner** (nur bei `?welcome=true`)
- Confetti Animation (optional)
- Icon: ✅
- Headline: "Gedenkseite erfolgreich erstellt!"
- Subtitle: "Deine Gedenkseite ist jetzt live. Du kannst sie jetzt vervollständigen."
- CTA Button: "Jetzt vervollständigen" (scrollt zu Checklist)
- Dismiss Button: "X" (entfernt Banner + Query Param)

**Sidebar-Navigation:**

**Header:**
- Avatar (80x80px)
- Name (H3)
- Status-Badge: "🌐 Live" (public) oder "🔒 Privat" (private)

**Gedenkseiten-Inhalte:**
- ✓ Stammdaten angeben (Icon: Checkmark, completed)
- ✓ Darstellung (Icon: Checkmark, completed)
- ✏️ Spruch und Nachruf (Icon: Edit)
- 📖 Kondolenzbuch (Icon: Book)
- 😊 Wissenswertes (Icon: Star)
- 📷 Fotos (Icon: Image)
- 📅 Termine (disabled, grayed out)
- ▶️ Erinnerungen (disabled, Premium Badge)
- 💬 Gedenkbeiträge (disabled, grayed out)
- 🌳 Familienstammbaum (disabled, Premium Badge)

**Einstellungen:**
- 📧 Einladungen
- 🔒 Privatsphäre
- 🔗 Verknüpfungen (disabled)

**Content Area:**

**Widgets (3-Column Grid auf Desktop):**

1. **Profilfortschritt**
   - Progress Bar: "40% vervollständigt"
   - Text: "2 von 5 Bereichen ausgefüllt"

2. **Besucherzahl**
   - Number: "0 Besucher"
   - Icon: 👁️
   - Text: "Seit Veröffentlichung"

3. **Schnellzugriff**
   - Button: "Gedenkseite ansehen" → `/gedenkseite/[id]`
   - Icon: External Link

**Checklist: Fehlende MLP-Features**

Headline: "Vervollständige deine Gedenkseite"

- [ ] Gedenkspruch hinzufügen (max 160 Zeichen) → "Schreiben"
- [ ] Nachruf schreiben (max 5000 Zeichen) → "Schreiben"
- [ ] Kondolenzbuch aktivieren → "Erstellen"
- [ ] Wissenswertes ergänzen (Badges) → "Hinzufügen"
- [ ] Fotos hochladen → "Hochladen"

**Tasks:**
- [ ] Route erstellen
- [ ] Welcome Banner Component
- [ ] Sidebar Navigation
- [ ] Widgets erstellen
- [ ] Checklist Component
- [ ] "Gedenkseite ansehen" Link
- [ ] Authorization Check (nur Creator)
- [ ] Responsive Design (Sidebar → Top Nav auf Mobile)
- [ ] Dark Mode testen

**Screenshot:** `docs/Screenshots-Flow-neue-Gedenkseite/gedenkseite/_id/settings_welcome=true.jpg`

---

## 📦 Phase 6: Dependencies & Konfiguration

### 6.1 NPM Packages installieren

```bash
npm install react-hook-form @hookform/resolvers zod
npm install react-easy-crop
npm install date-fns
npm install @supabase/storage-js
```

**Packages:**
- `react-hook-form` - Form State Management
- `@hookform/resolvers` - Zod Integration
- `zod` - Schema Validation
- `react-easy-crop` - Image Crop Component
- `date-fns` - Date Formatting (Deutsch)
- `@supabase/storage-js` - Supabase Storage Helper

**Tasks:**
- [ ] Dependencies installieren
- [ ] `package.json` prüfen
- [ ] Type Definitions prüfen (@types)

---

### 6.2 Tailwind Config

**Blur-Hintergründe registrieren** (falls dynamisch)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      backgroundImage: {
        'blur-default': "url('/images/blur-default-0.75.webp')",
        'blur-90r': "url('/images/blur-90r-0.75.webp')",
        // ... weitere
      }
    }
  }
}
```

**Tasks:**
- [ ] Blur-Bilder in Config eintragen (optional)
- [ ] Build testen

---

### 6.3 CLAUDE.md Update

**Änderungen:**
- ✅ Auth-Phase als "Completed" markieren
- ✅ Memorial Creation Flow Status aktualisieren
- ✅ Neue Routes dokumentieren
- Account Deletion Status beibehalten (bereits gelöst)

**Tasks:**
- [ ] `CLAUDE.md` aktualisieren
- [ ] Phase 2 als "Completed" markieren
- [ ] Phase 3 "Memorial Creation" als "In Progress" dokumentieren

---

## 🎯 Implementierungs-Reihenfolge (Empfohlen)

### Tag 1: Setup & Infrastruktur
- [ ] Phase 1.1: Supabase Types generieren
- [ ] Phase 1.2: DB-Migrationen erstellen + ausführen
- [ ] Phase 1.3: Storage Bucket + RLS Policies
- [ ] Phase 6.1: Dependencies installieren
- [ ] Phase 6.2: Tailwind Config

### Tag 2: Components & Utils
- [ ] Phase 2.1: Form Components (DateInput, Select, Autocomplete, Accordion)
- [ ] Phase 2.3: Hooks & Utils (useMemorialWizard, useLocalStorageDraft, Validierung)

### Tag 3: Memorial Components & Typ-Auswahl
- [ ] Phase 2.2: Memorial Components (WizardLayout, ProgressIndicator, InitialsGenerator)
- [ ] Phase 3.1: Dashboard Entry Point
- [ ] Phase 3.2: Typ-Auswahl Route

### Tag 4: Stammdaten-Flows
- [ ] Phase 4.3: Tierarten APIs
- [ ] Phase 3.3: Stammdaten Person
- [ ] Phase 3.4: Stammdaten Tier (mit Tierart-Kaskade)

### Tag 5: Avatar, Sichtbarkeit, Zusammenfassung
- [ ] Phase 2.2: AvatarCropModal + PrivacyToggle
- [ ] Phase 4.2: Avatar Upload API
- [ ] Phase 3.5: Avatar-Auswahl Route
- [ ] Phase 3.6: Sichtbarkeit Route
- [ ] Phase 3.7: Zusammenfassung Route

### Tag 6: API, Verwaltung, Testing
- [ ] Phase 4.1: Memorial Creation API
- [ ] Phase 5.1: Verwaltungs-Page
- [ ] Phase 6.3: CLAUDE.md Update
- [ ] Testing (E2E Flow Person + Tier)
- [ ] Responsive Testing (Mobile, Tablet)
- [ ] Dark Mode Testing
- [ ] Bug Fixes + Polish

---

## ✅ Success Criteria

### Funktional
- [ ] User kann Person-Gedenkseite erstellen (Vollständiger Flow)
- [ ] User kann Tier-Gedenkseite erstellen (mit Tierart-Kaskade)
- [ ] Avatar-Upload mit Crop funktioniert (Kreis + Quadrat)
- [ ] Draft wird in LocalStorage gespeichert
- [ ] Zurück-Navigation behält Daten bei
- [ ] Validierung verhindert ungültige Eingaben (Sterbedatum > Geburtsdatum)
- [ ] API erstellt Memorial in DB
- [ ] Redirect zu Verwaltungs-Page nach Erstellung
- [ ] Welcome Banner wird angezeigt
- [ ] Private Memorials erhalten Invite Link

### Technisch
- [ ] TypeScript ohne Errors
- [ ] Alle Components haben PropTypes
- [ ] Zod Validierung funktioniert
- [ ] Supabase Storage Upload funktioniert
- [ ] RLS Policies greifen korrekt
- [ ] LocalStorage Drafts werden gelöscht nach Submit

### UI/UX
- [ ] Responsive Design (Mobile, Tablet, Desktop)
- [ ] Dark Mode Support vollständig
- [ ] Loading States bei API-Calls
- [ ] Error States bei Validierung
- [ ] Smooth Transitions zwischen Steps
- [ ] Accordion-Animation smooth
- [ ] Premium-Features korrekt disabled + Badge

### Accessibility
- [ ] Keyboard Navigation funktioniert
- [ ] ARIA-Labels vorhanden
- [ ] Form-Fehler werden vorgelesen
- [ ] Focus States sichtbar

---

## 🐛 Bekannte Risiken & Herausforderungen

### 1. Tierart-Kaskade Komplexität
**Risiko:** Cascade Logic (Tierart → Rassengruppe → Rasse) kann komplex werden
**Mitigation:**
- Eigener Hook `useAnimalCascade`
- Klare State Management Logik
- Gute Error Handling

### 2. Avatar Crop Performance
**Risiko:** Large Images können Browser lahmlegen
**Mitigation:**
- Max File Size 2MB enforced
- Canvas-basierte Resize vor Upload
- Loading States

### 3. LocalStorage Limits
**Risiko:** QuotaExceeded Error bei großen Drafts
**Mitigation:**
- Try/Catch um localStorage Calls
- Fallback: Draft wird nicht gespeichert (warning shown)
- Avatar nicht im LocalStorage (nur URL)

### 4. DB Migration auf Production
**Risiko:** Bestehende Memorials könnten brechen
**Mitigation:**
- Migrations sorgfältig testen
- Nullable Felder verwenden
- Rollback-Plan haben

---

## 📝 Offene Fragen

- [ ] Sollen "Bald verfügbar" Features in Phase 1 schon klickbar sein (mit Coming Soon Modal)?
- [ ] Brauchen wir Analytics für Memorial Creation Funnel?
- [ ] Soll Draft-Autosave eine Notification zeigen ("Entwurf gespeichert")?

---

## 📚 Referenzen

- **Screenshots:** `/docs/Screenshots-Flow-neue-Gedenkseite/`
- **Design System:** `/docs/design-system/`
- **Technical Docs:** `/docs/technical-documentation.md`
- **DB Schema:** `/src/lib/supabase.ts`

---

**Letzte Aktualisierung:** 2025-01-10
**Version:** 1.0
