# Memorial Creation Flow - Implementierungsplan

## Projektübersicht
Implementiere den kompletten "Neue Gedenkseite erstellen" Flow als mehrstufigen Wizard. Dies ist eine der wichtigsten User Journeys der Plattform.

## Geschäftlicher Kontext
- **Zielgruppe**: Menschen in Trauersituation oder Vorsorge
- **Emotionaler Kontext**: Sensibler Bereich, würdevolle Gestaltung essentiell
- **Conversion-Ziel**: User soll schnell und einfach eine Gedenkseite erstellen können
- **Upsell-Potenzial**: Premium-Features sichtbar machen aber nicht blockieren

## Flow-Struktur

### Einstiegspunkt
- Dashboard → "Gedenkseite hinzufügen" Button (Dashed Box mit + Icon)
- Alternativ: Nach Registrierung direkt in Flow leiten

### Step 1: Memorial-Typ Auswahl
**Titel**: "Welche Art von Gedenkseite möchtest du anlegen?"

**Optionen** (2x2 Grid Layout):
1. **Eine Person** 
   - Status: Verfügbar in V1
   - Beschreibung: "Ideal für eine zu gedenkende Person"
   
2. **Ein Tier**
   - Status: Verfügbar in V1
   - Beschreibung: "Für ein Tier dem eine Gedenkseite gewidmet werden soll"
   
3. **Familie** 
   - Status: "BALD VERFÜGBAR" + Premium Badge
   - Beschreibung: "Für Familien die gern gemeinsam auf einer Gedenkseite erscheinen wollen"
   
4. **Ereignis**
   - Status: "BALD VERFÜGBAR" + Premium Badge  
   - Beschreibung: "Ideal für Unfälle und Ereignisse mit mehreren Verstorbenen"

### Step 2: Stammdaten erfassen
**Titel**: "Für wen möchtest du eine Gedenkseite anlegen?"

**Felder für Person**:
- Vorname* (Pflichtfeld)
- Nachname* (Pflichtfeld)
- Link: "Weitere Felder hinzufügen" (erweitert um optionale Felder)
- Geburtsdatum* (Pflichtfeld, Format: TT.MM.JJJJ)
- Geburtsort (Optional)
- Sterbedatum* (Pflichtfeld, Format: TT.MM.JJJJ)
- Sterbeort (Optional)

**Felder für Tier**:
- Name* (Pflichtfeld)
- Link: "Weitere Felder hinzufügen"
- Tierart (Dropdown: Hund, Katze, Pferd, Vogel, etc.)
- Rassengruppe (Optional, z.B. "Retriever")
- Rasse (Optional, z.B. "Golden Retriever")
- Geburtsdatum* (Pflichtfeld)
- Geburtsort (Optional)
- Sterbedatum* (Pflichtfeld)
- Sterbeort (Optional)

**Hinweis unter Formular**: 
"*Pflichtfeld – Du kannst später entscheiden, ob die Gedenkseite öffentlich oder privat sein soll."

### Step 3: Darstellung wählen
**Titel**: "Wähle deine Darstellung"

**Große Vorschau** (300x300px Bereich)

**Drei Optionen**:
1. **Initialen** 
   - Default-Auswahl
   - Automatisch generiert aus eingegebenen Namen
   - Farbiger Hintergrund (Gradient)

2. **Icon**
   - Person-Silhouette für Menschen
   - Tier-Silhouette für Tiere
   
3. **Bild**
   - Upload-Funktion
   - Max. 2MB (JPG, PNG, WebP)
   - Form wählbar: Quadratisch oder Rund
   - Zoom/Crop Funktionalität

### Step 4: Erfolg & Inhalte hinzufügen
**Titel**: "Glückwunsch, du bist so gut wie fertig."
**Untertitel**: "Du hast bereits genügend Informationen angegeben, um deine Seite zu veröffentlichen. Füge weitere Inhalte hinzu, um deine Seite erlebbarer zu gestalten."

**Kostenfreie Inhalte**:

1. **Spruch** (Empfehlung)
   - Beschreibung: "Als dezentes Element ist der Spruch die erste persönliche Note und wie eine kurze Nachricht zu sehen (stellvertretend dem Grabsteinspruch)"
   - Max. 160 Zeichen
   - Action: "Schreiben"

2. **Nachruf** (Empfehlung)
   - Beschreibung: "Mit dem Nachruf hast du die Möglichkeit eine Würdigung des Lebens und der Leistungen zu hinterlassen"
   - Max. 5000 Zeichen
   - Action: "Schreiben"

3. **Kondolenzbuch** (Empfehlung)
   - Beschreibung: "Erstelle eine Möglichkeit für Gäste ihre Anteilnahme und persönlichen Worte zu verewigen"
   - Beinhaltet: Cover-Gestaltung, Moderation
   - Action: "Erstellen"

4. **Wissenswertes**
   - Beschreibung: "Du kannst hier interessante Details zum Leben der Person festhalten"
   - Format: Badges mit Icon + Text
   - Action: "Schreiben"

5. **Termine**
   - Beschreibung: "Füge Termine und Jahrestage hinzu"
   - Teilweise implementiert in V1
   - Action: "Erstellen"

**Premium Inhalte** (anzeigen aber deaktiviert):

6. **Erinnerungen** (Premium Badge)
   - Beschreibung: "Erinnerungen sind Foto und Video Rückblicke die du erstellen kannst"
   - Status: Gesperrt in V1

7. **Familienstammbaum** (Bald verfügbar Badge)
   - Status: Nicht verfügbar in V1

### Step 5: Sichtbarkeit
**Titel**: "Seite erstellen"

**Optionen**:

1. **Öffentlich** (Default)
   - Toggle: AN
   - Beschreibung: "Deine Gedenkseite ist öffentlich zu finden und erscheint auch in der Suche"

2. **Privat**
   - Toggle: AUS
   - Beschreibung: "Deine Seite ist privat und nur über einen Einladungs-Link zu erreichen. In unserer Suche erscheint nur der Name, Personen dürfen eine Anfrage auf Zugriff stellen"

3. **Volle Kontrolle** (Premium + Coming Soon)
   - Toggle: Deaktiviert
   - Beschreibung: "Du hast die volle Kontrolle. Entscheide in den Einstellungen, wie deine Seite zu finden ist und wer Zugriff erhält. Zusätzlich zum Einladungs-Link kannst du deine Seite mit einem Passwort sichern."

**Button**: "Seite erstellen"

## Nach der Erstellung

### Erfolgsfall
- Weiterleitung zur Memorial-Verwaltungsseite
- Oder direkt zur öffentlichen Ansicht
- Success-Message anzeigen

### Verwaltungsbereich (Sidebar)
Der User landet in einem Verwaltungsbereich mit folgender Struktur:

**Gedenkseiten-Inhalte**:
- Stammdaten angeben
- Darstellung
- Spruch und Nachruf
- Kondolenzbuch
- Wissenswertes
- Termine
- Erinnerungen (Premium)
- Gedenkbeiträge
- Familienstammbaum (Bald verfügbar)

**Einstellungen**:
- Einladungen
- Verknüpfungen (Bald verfügbar)
- Privatsphäre

## Wichtige Anforderungen

### Datenvalidierung
- Pflichtfelder müssen ausgefüllt sein
- Geburtsdatum muss vor Sterbedatum liegen
- Datumsformat: Deutsch (TT.MM.JJJJ)
- Bildupload: Max 2MB, nur JPG/PNG/WebP

### User Experience
- Progress Indicator zeigt aktuellen Schritt (z.B. "Schritt 2 von 5")
- Zurück-Navigation behält eingegebene Daten
- "Abbrechen" mit Bestätigungsdialog bei vorhandenen Daten
- Responsive: Mobile, Tablet, Desktop
- Dark Mode Support

### Sprache & Ton
- Durchgehend Deutsch
- Respektvolle, würdevolle Sprache
- Klare, einfache Anweisungen
- Positive Bestärkung ("Glückwunsch", "gut gemacht")

### Performance
- Step-Transitions smooth (300ms)
- Bild-Upload mit Fortschrittsanzeige
- Optimistische UI Updates
- Draft in LocalStorage speichern

## Technischer Kontext

**Vorhandene Ressourcen**:
- Screenshots aller Screens (im Projekt-Ordner)
- Design System (colors.md, typography.md, button.md)
- Technische Dokumentation (Gedenkseiten_ai_Technical_Documentation-v2.md)
- Existierende Supabase Tabellen
- Auth-System bereits implementiert

**Tech Stack**:
- Next.js 14 (App Router)
- Tailwind CSS
- Supabase
- TypeScript

## Definition of Success

✅ Flow ist erfolgreich implementiert wenn:
1. User kann in unter 2 Minuten eine Basis-Gedenkseite erstellen
2. Alle Pflichtfelder werden korrekt validiert
3. Daten werden in Supabase gespeichert
4. Avatar/Bilder werden korrekt hochgeladen
5. Privacy-Settings funktionieren (öffentlich/privat)
6. Flow funktioniert auf allen Geräten
7. User Experience ist würdevoll und angemessen

## Hinweise für Entwicklung

- Nutze bestehende Patterns aus dem Projekt
- Orientiere dich exakt an den Screenshots
- Design System Tokens verwenden (keine hard-coded Werte)
- Supabase Schema prüfen und ggf. erweitern
- Fehlerbehandlung nicht vergessen
- Accessibility beachten (Keyboard Navigation, Screen Reader)

Die technische Implementierung liegt in deiner Expertise als Entwickler. Dieser Plan gibt dir das "Was" und "Warum" - das "Wie" entscheidest du basierend auf Best Practices und vorhandenem Code.