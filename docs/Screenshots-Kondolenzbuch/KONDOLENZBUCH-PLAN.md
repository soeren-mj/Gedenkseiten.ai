# Kondolenzbuch Feature - Implementierungsplan

**Feature:** Digitales Kondolenzbuch für Gedenkseiten  
**Projekt:** Gedenkseiten.ai  
**Erstellt:** 22.12.2024  

---

## 1. Übersicht

Das Kondolenzbuch ermöglicht Besuchern einer Gedenkseite, ihre Anteilnahme und persönlichen Worte zu hinterlassen. Der Admin erstellt zunächst ein Deckblatt (Cover), danach können authentifizierte Besucher jeweils einen Eintrag mit Text und Bildern verfassen.

---

## 2. Kern-Entscheidungen

| Aspekt | Entscheidung |
|--------|-------------|
| **Moderation** | Post-Moderation (sofort sichtbar, Admin kann löschen) |
| **Einträge pro Nutzer** | 1 pro Kondolenzbuch |
| **Text-Limit** | 2.000 Zeichen |
| **Bild-Limit** | 12 Bilder pro Eintrag |
| **Cover-Titel** | Pflicht, Default: "In Erinnerung an [Name]" |
| **Textfarbe Cover** | Auto-Switch basierend auf Hintergrund-Helligkeit |
| **Zeitstempel** | Nicht anzeigen (v1) |
| **Lange Texte** | Feste Card-Höhe, scrollbar |
| **Leeres Kondolenzbuch** | Section auf öffentlicher Seite nicht anzeigen |
| **Kondolenzbuch löschen** | Nicht möglich (v1) |
| **Privacy** | Folgt Memorial-Privacy |
| **Account-Löschung** | Eintrag bleibt, Name → "Ehemaliger Nutzer" |
| **Auth-Flow** | Erst schreiben, dann anmelden |

### Nicht in V1

- Benachrichtigungen (E-Mail bei neuem Eintrag)
- Spezieller Kondolenz-Einladungslink
- Sortierung ändern (fest: Neueste zuerst)
- Kondolenzbuch deaktivieren

---

## 3. User Journeys

### Journey A: Admin erstellt Kondolenzbuch

**Route:** `/gedenkseite/[id]/verwalten/kondolenzbuch`

1. **Empty State** → "Das Kondolenzbuch ist noch leer." + Button "Titelseite erstellen"
2. **Deckblatt Setup** (Single Page mit 3 Tabs):
   - Tab 1: Bild hochladen
   - Tab 2: Farbpalette (6 Farben)
   - Tab 3: Vorlagen (6 vorgefertigte Bilder)
   - Titel-Input (Pflicht, Default mit Name)
   - Textfarbe-Toggle (Auto-Switch)
   - "Profil anzeigen" Toggle
   - Live-Preview des Covers
3. **Management View** (gleiche Route, nach Erstellung):
   - Erfolgsmeldung
   - Buttons: "Beitrag schreiben" / "Personen einladen" (später)
   - Cover-Preview (Hover → Bearbeiten-Tooltip → Klick öffnet Setup erneut)
   - Einträge-Liste mit "Neu" Badges

### Journey B: Nutzer schreibt Eintrag

1. **Editor öffnet** (Modal)
   - Autor-Header (Avatar + Name, auto-filled)
   - Textarea mit Zeichenzähler (0/2.000)
   - "Bilder hinzufügen (Optional)" Button
2. **Mit Bildern:**
   - Thumbnail-Grid mit +X Indikator
   - Carousel-Ansicht zum Sortieren/Löschen
   - "Max. 12 Bilder" Hinweis
3. **Fertig** → Eintrag wird gespeichert

### Journey C: Besucher auf öffentlicher Gedenkseite

1. **Kondolenzbuch-Section** (nur sichtbar wenn Cover existiert)
   - Cover + Einträge-Liste
   - "Kondolenz schreiben" Button (nur wenn User noch keinen Eintrag hat)
2. **Klick auf Button** → Editor öffnet sofort (kann tippen ohne Login)
3. **"Fertig"** (nicht eingeloggt) → Auth-Modal erscheint
4. **Nach Auth** → Eintrag wird gespeichert → Zurück zur Gedenkseite

### Journey D: Eingeloggter Nutzer sieht eigenen Eintrag

- Eigener Eintrag zeigt 3-Punkte-Menü (⋮)
- Optionen: Bearbeiten / Löschen
- Fremde Einträge: Kein Menü

### Journey E: Admin verwaltet Einträge

- Alle Einträge sichtbar mit "Neu" Badges
- Eigener Eintrag: Bearbeiten + Löschen
- Fremde Einträge: Nur Löschen
- Button wechselt: "Beitrag schreiben" ↔ "Beitrag bearbeiten"

---

## 4. Datenbank-Struktur

### Tabellen

**condolence_books** (1:1 mit Memorial)
- Cover-Typ (color / preset / custom)
- Cover-Farbe oder Bild-URL
- Cover-Titel
- Textfarbe (white / black)
- Profil anzeigen (boolean)

**condolence_entries**
- Verknüpfung zu Book + User
- Content (max 2000 Zeichen)
- is_read_by_admin (für "Neu" Badge)
- UNIQUE Constraint: Ein Eintrag pro User pro Book

**condolence_entry_images**
- Verknüpfung zu Entry
- Bild-URL
- Sortierung

### Storage

- Bucket: `condolence-images` für Cover- und Entry-Bilder

---

## 5. API Endpoints

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| GET | `/api/memorials/[id]/condolence-book` | Kondolenzbuch + Einträge abrufen |
| POST | `/api/memorials/[id]/condolence-book` | Kondolenzbuch erstellen (Admin) |
| PATCH | `/api/memorials/[id]/condolence-book` | Cover bearbeiten (Admin) |
| POST | `/api/memorials/[id]/condolence-book/entries` | Eintrag erstellen |
| PATCH | `/api/memorials/[id]/condolence-book/entries/[entryId]` | Eintrag bearbeiten |
| DELETE | `/api/memorials/[id]/condolence-book/entries/[entryId]` | Eintrag löschen |

---

## 6. UI Spezifikationen

### Cover-Optionen

- **6 Farben:** Dunkel (neutral-900), Grau (neutral-800), Blau (primary-700), Grün (green-900), Lila (purple-800), Rot (red-900)
- **6 Bild-Presets:** Kerzen, Blumen, Natur, Himmel, Ozean, Wald
- **Custom Upload:** Max 2MB, JPG/PNG/WebP

### Textfarbe Auto-Switch

- Bei Farbwahl: Berechnung der Helligkeit → automatisch weiß oder schwarz
- Bei Bildern: Durchschnittliche Helligkeit analysieren, Default weiß

### Entry Cards

- Feste Höhe
- Text scrollbar wenn zu lang
- Thumbnail-Grid für Bilder (+X Indikator bei >4)

---

## 7. Implementierungs-Phasen

### Phase 1: Foundation
- DB Migration erstellen und ausführen
- Storage Bucket einrichten
- TypeScript Types generieren

### Phase 2: Admin - Deckblatt erstellen
- Route `/verwalten/kondolenzbuch`
- Empty State
- Deckblatt-Setup (3 Tabs, Live-Preview)
- Cover speichern

### Phase 3: Admin - Cover bearbeiten
- Hover-Edit auf Cover
- Setup als Modal wiederverwenden
- Management View

### Phase 4: Entry Editor
- Editor-Modal (Text + Bilder)
- Bild-Upload und -Verwaltung
- Erstellen + Bearbeiten

### Phase 5: Admin - Einträge verwalten
- Einträge-Liste mit Badges
- Löschen-Funktion
- "Neu" Markierung

### Phase 6: Öffentliche Ansicht
- Kondolenzbuch-Section auf Gedenkseite
- Einträge anzeigen
- Eigener Eintrag mit Menü

### Phase 7: Auth-Flow für Besucher
- Editor öffnet ohne Auth
- Temporäre Speicherung
- Auth-Modal bei "Fertig"
- Nach Login speichern

### Phase 8: Polish
- Responsive Design
- Dark Mode
- Edge Cases (gelöschte Accounts, etc.)

---

## 8. Referenz-Screenshots

Die Design-Screenshots zeigen:
- Empty State mit Gradient-Hintergrund
- Deckblatt-Setup mit Tab-Navigation
- Cover-Preview mit Farbauswahl
- Entry-Editor mit Bild-Carousel
- Management View mit Einträge-Liste

---

*Erstellt: 22.12.2024*
