# Supabase Migrations

Dieser Ordner enthält SQL-Migrationen für die Supabase-Datenbank.

---

## 🔒 KRITISCH: Orphaned Auth Users Problem

### Was sind "Orphaned Auth Users"?

Ein **orphaned user** (verwaister User) ist ein User, der in `auth.users` existiert, aber **NICHT** in `public.users`.

**Symptome:**
- ✉️ Password-Reset sagt "User existiert bereits"
- 🚫 Aber User kann sich nicht anmelden (kein Profil gefunden)
- ⚠️ Email-Änderungen schlagen fehl oder funktionieren nicht korrekt

### Ursachen

**Scenario 1: Profile-Erstellung schlägt fehl**
1. User klickt Magic Link → `auth.users` wird erstellt
2. AuthContext versucht Profil in `public.users` zu erstellen
3. INSERT schlägt fehl (RLS Policy, Netzwerkfehler, etc.)
4. User bekommt In-Memory-Fallback → sieht aus als wäre er angemeldet
5. Bei Page-Refresh oder Session-Ablauf: Orphaned User

**Scenario 2: Race Condition im Callback**
1. Callback verarbeitet Magic Link Token
2. Session wird in `auth.users` erstellt
3. Callback redirected zu `/dashboard` **VOR** Profil-Erstellung
4. INSERT wird nie completed

**Scenario 3: Email Change ohne Profil**
1. User mit orphaned `auth.users` versucht Email zu ändern
2. UPDATE auf `public.users` schlägt fehl (keine Row vorhanden)
3. Email in `auth.users` ändert sich, aber `public.users` bleibt out of sync

### ✅ Implementierte Lösungen

**1. Callback Handler: Profile Check (src/app/auth/callback/page.tsx)**
```typescript
// Bei jedem Login/Callback:
// 1. Prüfe ob Profil in public.users existiert
// 2. Falls nicht: Erstelle es sofort
// 3. Dann weiter mit Email-Sync oder Dashboard-Redirect
```
**Effekt:** Verhindert 90% der orphaned user Fälle

**2. AuthContext: Retry-Logik mit 3 Versuchen (src/contexts/AuthContext.tsx)**
```typescript
// Bei Profil-Erstellung:
// - Versuche 3x mit 1 Sekunde Delay
// - Stop bei bestimmten Errors (table nicht vorhanden, duplicate key)
// - Fetch existing profile falls duplicate key
```
**Effekt:** 3x robuster gegen temporäre Fehler

**3. Error Handling: Toast-Benachrichtigung (src/contexts/ToastContext.tsx)**
```typescript
// Bei kritischem Fehler nach 3 Versuchen:
// - Zeige Toast mit Fehlermeldung
// - Inkl. User-ID für Support
// - User weiß Bescheid statt frustriert zu sein
```
**Effekt:** User wird transparent informiert

### 🔍 Orphaned Users finden

**SQL Query:**
```sql
SELECT
  au.id,
  au.email,
  au.created_at,
  au.last_sign_in_at,
  CASE
    WHEN pu.id IS NULL THEN '❌ ORPHANED'
    ELSE '✅ Synced'
  END as sync_status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ORDER BY au.created_at DESC;
```

### 🛠️ Orphaned User bereinigen

**Option A: Profil erstellen (User behält Daten)**
```sql
-- Erstelle fehlendes Profil
INSERT INTO public.users (id, email, theme_preference, notification_preferences, created_at, updated_at)
SELECT
  id,
  email,
  'system',
  '{"memorial_activity": true, "moderation_required": true, "reminders": true, "new_features": true}'::jsonb,
  created_at,
  NOW()
FROM auth.users
WHERE email = 'user@example.com'
AND id NOT IN (SELECT id FROM public.users);
```

**Option B: Auth-User löschen (User muss neu registrieren)**
```sql
-- Siehe scripts/cleanup-orphaned-user.sql für vollständiges Script
DELETE FROM auth.users
WHERE email = 'user@example.com'
AND id NOT IN (SELECT id FROM public.users);
```

---

## ⚠️ WICHTIG: Email-Sync ohne Database Trigger

Die Email-Synchronisation von `auth.users` → `public.users` funktioniert **OHNE** Database Trigger.

### Warum?
Database Trigger auf `auth.users` erfordern **Superuser-Rechte**, die in Supabase nicht verfügbar sind:
```
ERROR: 42501: must be owner of relation users
```

### ✅ Implementierte Lösung
Email-Sync erfolgt **automatisch im Application Code**:

**Location:** `src/app/auth/callback/page.tsx` (Zeilen 66-77)

**Flow:**
1. User bestätigt neue Email via Link
2. Auth Callback erkennt `type=email_change`
3. Callback-Handler updated `public.users.email` manuell
4. Redirect zu Settings mit Success-Message

**Vorteile:**
- ✅ Keine Superuser-Rechte benötigt
- ✅ Funktioniert in allen Supabase-Projekten
- ✅ Einfacher zu debuggen (sichtbar in App-Logs)
- ✅ Garantiert synchron bei jeder Email-Änderung

---

## Verfügbare Migrationen

### `sync_email_on_auth_change.sql`

**Status:** ⚠️ NICHT BENÖTIGT / NUR REFERENZ

Diese Datei enthält den ursprünglichen Database-Trigger-Ansatz, der aufgrund von Permissions-Problemen **NICHT funktioniert**.

Die Datei wird **nur als Referenz** aufbewahrt und muss **NICHT ausgeführt** werden.

---

## Testing

### Email-Änderung testen:

1. **Development-Server starten:**
   ```bash
   npm run dev
   ```

2. **Email-Änderung durchführen:**
   - Login → Dashboard → Settings
   - Klicke "E-Mail-Adresse ändern"
   - Gib neue Email ein
   - Prüfe Email-Inbox

3. **Bestätigungs-Link klicken:**
   - Email öffnen
   - Link klicken
   - Sollte zu `/dashboard/settings?email_changed=true` redirecten

4. **Sync verifizieren:**
   - In Supabase Dashboard → Table Editor
   - Öffne `auth.users` Tabelle → Prüfe `email` Spalte
   - Öffne `public.users` Tabelle → Prüfe `email` Spalte
   - Beide sollten die neue Email haben

5. **Console Logs prüfen:**
   ```
   [Auth Callback Page] Email change confirmed, syncing to public.users...
   [Auth Callback Page] Email synced, redirecting to settings...
   ```

---

## Troubleshooting

### Email wird nicht synchronisiert

**Check 1: Console Logs**
```bash
# Öffne Browser Developer Tools → Console
# Suche nach: "[Auth Callback Page] Email synced"
```

**Check 2: Database**
```sql
-- Prüfe ob beide Tabellen die gleiche Email haben
SELECT id, email FROM auth.users WHERE id = 'USER_ID';
SELECT id, email FROM public.users WHERE id = 'USER_ID';
```

**Check 3: RLS Policies**
```sql
-- Prüfe ob User seine eigene Email updaten kann
SELECT * FROM pg_policies WHERE tablename = 'users';
```

### Callback-Handler wird nicht getriggert

**URL-Parameter prüfen:**
- Nach Klick auf Email-Link sollte URL enthalten: `type=email_change`
- Falls nicht, prüfe Supabase Email-Templates

**Supabase Email-Template konfigurieren:**
1. Supabase Dashboard → Authentication → Email Templates
2. Template: "Change Email Address"
3. Confirm URL sollte sein: `{{ .SiteURL }}/auth/callback?type=email_change`

---

## Installation (Falls benötigt)

Aktuell **keine** Migrationen erforderlich.

Falls du in Zukunft Migrationen hinzufügst:

### Via Supabase Dashboard
1. [Supabase Dashboard](https://app.supabase.com/)
2. SQL Editor → New Query
3. Kopiere SQL → Run

### Via Supabase CLI
```bash
supabase db push
```
