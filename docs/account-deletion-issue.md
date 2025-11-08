# Account Deletion Issue - Foreign Key Constraints

**Status:** ✅ GELÖST - Hard Delete funktioniert
**Erstellt:** 2025-01-04
**Gelöst:** 2025-01-05
**Priorität:** ~~Medium~~ Erledigt

---

## Problem-Zusammenfassung

User-Account-Deletion schlug bei **Hard Delete** fehl mit dem Fehler:
```
Database error deleting user (error code: unexpected_failure)
```

**Root Cause:** Mehrere Foreign Key Constraints auf `auth.users` hatten **NO ACTION** konfiguriert statt `ON DELETE CASCADE`:
- `memorial_invitations.invited_by_fkey`
- `memorials.creator_id_fkey`
- `users.id_fkey` (public.users)

**Lösung:** Alle 3 FKs auf `ON DELETE CASCADE` geändert → Hard Delete funktioniert jetzt.

---

## Technische Details

### Betroffene Tabellen (GELÖST)
Folgende FKs wurden von `NO ACTION` auf `CASCADE` geändert:

1. **memorial_invitations**
   - Vorher: `FOREIGN KEY (invited_by) REFERENCES auth.users(id)` (NO ACTION)
   - Nachher: `FOREIGN KEY (invited_by) REFERENCES auth.users(id) ON DELETE CASCADE`

2. **memorials**
   - Vorher: `FOREIGN KEY (creator_id) REFERENCES auth.users(id)` (NO ACTION)
   - Nachher: `FOREIGN KEY (creator_id) REFERENCES auth.users(id) ON DELETE CASCADE`

3. **users** (public schema)
   - Vorher: `FOREIGN KEY (id) REFERENCES auth.users(id)` (NO ACTION)
   - Nachher: `FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE`

### Auswirkungen (BEHOBEN)
1. ✅ **Hard Delete funktioniert** - User wird komplett aus `auth.users` gelöscht
2. ✅ **Email-Wiederverwendung möglich** - Email ist nach Löschung wieder frei
3. ✅ **GDPR-Compliance** - User-Records werden komplett entfernt

---

## Aktuelle Implementierung (FUNKTIONIERT)

### Hard Delete mit Soft Delete Fallback
**Datei:** `src/app/api/user/delete-account/route.ts:300-342`

**Ablauf:**
1. **Versuch: Hard Delete** → `supabaseAdmin.auth.admin.deleteUser(user.id)`
2. **Bei Fehler: Soft Delete Fallback** → `supabaseAdmin.auth.admin.deleteUser(user.id, true)`

**Hard Delete (funktioniert jetzt):**
- ✅ User wird **komplett aus `auth.users` gelöscht** (permanent)
- ✅ `public.users` wird durch CASCADE automatisch gelöscht
- ✅ `memorials` werden durch CASCADE automatisch gelöscht
- ✅ `memorial_invitations` werden durch CASCADE automatisch gelöscht
- ✅ Email-Adresse ist **sofort wiederverwendbar**

**Soft Delete Fallback (nur bei Fehler):**
- Der Code behält den Fallback für Robustheit
- Wird aber nicht mehr benötigt, da FKs jetzt CASCADE haben

---

## Durchgeführte Lösung ✅

### FK-Constraints auf CASCADE geändert

**SQL-Script (ausgeführt via psql):**
```sql
-- 1. Alle FKs zu auth.users finden
SELECT
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  confdeltype AS delete_action,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE confrelid = 'auth.users'::regclass
  AND contype = 'f';

-- 2. memorial_invitations FK auf CASCADE ändern
ALTER TABLE memorial_invitations
  DROP CONSTRAINT memorial_invitations_invited_by_fkey,
  ADD CONSTRAINT memorial_invitations_invited_by_fkey
    FOREIGN KEY (invited_by)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;

-- 3. memorials FK auf CASCADE ändern
ALTER TABLE memorials
  DROP CONSTRAINT memorials_creator_id_fkey,
  ADD CONSTRAINT memorials_creator_id_fkey
    FOREIGN KEY (creator_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;

-- 4. users (public) FK auf CASCADE ändern
ALTER TABLE users
  DROP CONSTRAINT users_id_fkey,
  ADD CONSTRAINT users_id_fkey
    FOREIGN KEY (id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;

-- 5. Verifizierung
SELECT
  conname,
  conrelid::regclass,
  CASE confdeltype
    WHEN 'c' THEN '✅ CASCADE'
    WHEN 'a' THEN '❌ NO ACTION'
  END as status
FROM pg_constraint
WHERE confrelid = 'auth.users'::regclass
  AND contype = 'f'
  AND conrelid::regclass::text IN ('memorial_invitations', 'memorials', 'users');
```

**Ergebnis:**
- ✅ User wird aus `auth.users` **komplett gelöscht** (hard delete)
- ✅ Alle abhängigen Tabellen werden durch CASCADE automatisch aufgeräumt
- ✅ Email-Adressen können **sofort wiederverwendet** werden
- ✅ GDPR-konform - keine User-Daten bleiben zurück

---

## Umsetzung ✅ ERLEDIGT

**Methode:** psql (direkte Datenbankverbindung)

**Durchgeführt am:** 2025-01-05

**Schritte:**
1. ✅ Verbindung zu Supabase DB via psql hergestellt
2. ✅ Alle FKs zu `auth.users` analysiert
3. ✅ 3 problematische FKs identifiziert (NO ACTION)
4. ✅ Alle 3 FKs auf CASCADE geändert
5. ✅ Verifiziert dass CASCADE aktiv ist
6. ✅ Hard Delete getestet - funktioniert!

---

## Test-Prozedur ✅ BESTANDEN

**Test durchgeführt:** 2025-01-05

1. ✅ **Dev-Server neu gestartet**
2. ✅ **Test-User erstellt** (neue Email)
3. ✅ **Account-Löschung durchgeführt**
4. ✅ **Terminal-Logs bestätigt:**

**Ergebnis (SUCCESS):**
```
[Delete Account] Step 8: Deleting from auth.users...
[Delete Account] ✅ User hard-deleted (permanently removed)
[Delete Account] ✅ Account deletion completed successfully
```

**Kein Soft Delete Fallback mehr nötig:**
```
# Diese Meldung erscheint NICHT mehr:
[Delete Account] ⚠️ Hard delete failed, attempting soft delete...
```

5. ✅ **Verifiziert in Supabase Dashboard:**
   - Authentication → Users → User ist **komplett weg**
   - Nicht als "Deleted" markiert, sondern permanent entfernt

6. ✅ **Email-Wiederverwendung möglich:**
   - Email-Adresse ist sofort nach Löschung wieder verfügbar

---

## Related Issues

- GitHub: https://github.com/supabase/storage/issues/65
- GitHub: https://github.com/supabase/supabase/issues/30879
- Docs: https://supabase.com/docs/guides/auth/managing-user-data

---

## Nächste Schritte ✅ ALLE ERLEDIGT

- [x] ~~Support-Ticket bei Supabase erstellen~~ → Nicht nötig, psql-Fix durchgeführt
- [x] ~~ODER: pgAdmin-Fix durchführen~~ → Via psql erfolgreich durchgeführt
- [x] Test-Prozedur durchführen → Bestanden
- [x] Dokumentation aktualisieren wenn gelöst → Dokumentation aktualisiert
- [ ] Soft Delete Fallback-Code entfernen (optional) → **Behalten für Robustheit**

**Entscheidung:** Soft Delete Fallback bleibt im Code als Sicherheitsnetz, wird aber in der Praxis nicht mehr benötigt.
