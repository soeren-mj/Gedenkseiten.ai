# Supabase Avatar Storage Setup

## Übersicht
Diese Anleitung beschreibt die Einrichtung des Supabase Storage Buckets für Profilfotos (Avatare).

## Voraussetzungen
- Zugriff auf das Supabase Dashboard (https://app.supabase.com)
- Admin-Rechte für das Projekt

## Setup-Schritte

### 1. Storage Bucket erstellen

1. Öffne das Supabase Dashboard
2. Navigiere zu **Storage** im linken Menü
3. Klicke auf **"New bucket"**
4. Konfiguriere den Bucket:
   - **Name**: `avatars`
   - **Public bucket**: ✅ **Aktiviert** (damit Avatare öffentlich sichtbar sind)
   - **File size limit**: `3 MB` (3145728 Bytes)
   - **Allowed MIME types**: Leer lassen oder: `image/jpeg,image/png,image/webp,image/gif`

5. Klicke auf **"Create bucket"**

### 2. Row Level Security (RLS) Policies einrichten

Nach dem Erstellen des Buckets müssen Security Policies konfiguriert werden:

#### Policy 1: Öffentlicher Lesezugriff
**Name**: `Public avatar read access`
**Operation**: SELECT
**Policy**:
```sql
-- Jeder kann Avatare lesen
true
```

#### Policy 2: Authentifizierte Nutzer können eigene Avatare hochladen
**Name**: `Users can upload own avatars`
**Operation**: INSERT
**Policy**:
```sql
-- Nutzer können nur Dateien hochladen, die mit ihrer User-ID beginnen
bucket_id = 'avatars'
AND (storage.foldername(name))[1] = auth.uid()::text
```

Oder vereinfachte Version:
```sql
-- Authentifizierte Nutzer können hochladen
bucket_id = 'avatars'
AND auth.role() = 'authenticated'
```

#### Policy 3: Nutzer können eigene Avatare löschen
**Name**: `Users can delete own avatars`
**Operation**: DELETE
**Policy**:
```sql
-- Nutzer können nur Dateien löschen, die mit ihrer User-ID beginnen
bucket_id = 'avatars'
AND (storage.foldername(name))[1] = auth.uid()::text
```

Oder vereinfachte Version:
```sql
-- Authentifizierte Nutzer können löschen
bucket_id = 'avatars'
AND auth.role() = 'authenticated'
```

### 3. RLS Policies über SQL erstellen (Alternative)

Alternativ können Sie die Policies über die SQL-Konsole erstellen:

```sql
-- Policy für öffentlichen Lesezugriff
CREATE POLICY "Public avatar read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Policy für Upload (nur eigene Dateien)
CREATE POLICY "Users can upload own avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);

-- Policy für Löschen (nur eigene Dateien)
CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);
```

### 4. Bucket-Konfiguration überprüfen

Stelle sicher, dass:
- ✅ Der Bucket "avatars" existiert
- ✅ Public bucket ist aktiviert
- ✅ File size limit ist auf 3 MB gesetzt
- ✅ RLS Policies sind aktiv

## Testing

Nach dem Setup kannst du die Funktion testen:

1. Starte die Entwicklungsumgebung: `npm run dev`
2. Gehe zu `/dashboard/settings`
3. Hovere über den Avatar → Tooltip "Foto wählen" sollte erscheinen
4. Klicke auf den Avatar → Datei-Auswahl sollte sich öffnen
5. Wähle ein Bild (max 3 MB, JPG/PNG/WebP/GIF)
6. Das Bild sollte hochgeladen werden und überall angezeigt werden
7. Hovere erneut über den Avatar → Tooltip "Foto ändern" + X-Button
8. Klicke auf X → Avatar wird gelöscht

## Troubleshooting

### Fehler: "Bucket not found"
- Überprüfe, ob der Bucket wirklich "avatars" heißt (Schreibweise beachten)
- Prüfe in der Supabase Console unter Storage

### Fehler: "Permission denied" beim Upload
- RLS Policies prüfen
- Stelle sicher, dass die Policy für INSERT aktiviert ist
- Prüfe, ob der Nutzer authentifiziert ist

### Fehler: "File too large"
- Maximale Dateigröße ist 3 MB
- Prüfe die Bucket-Konfiguration

### Bilder werden nicht angezeigt
- Überprüfe, ob "Public bucket" aktiviert ist
- Prüfe die SELECT Policy
- Prüfe die URL im Browser (sollte öffentlich zugänglich sein)

## Dateistruktur im Bucket

Avatare werden mit folgendem Namensschema gespeichert:
```
avatars/
  ├─ {userId}-{timestamp}.jpg
  ├─ {userId}-{timestamp}.png
  └─ {userId}-{timestamp}.webp
```

Beispiel:
```
avatars/
  └─ a1b2c3d4-e5f6-7890-abcd-ef1234567890-1703251234567.jpg
```

## Wichtige Hinweise

1. **Public Access**: Der Bucket ist öffentlich, damit Avatare auf der Webseite angezeigt werden können
2. **Alte Dateien**: Beim Hochladen eines neuen Avatars wird die alte Datei automatisch gelöscht
3. **Dateinamen**: Enthalten User-ID und Timestamp für Eindeutigkeit
4. **Cache**: Browser-Cache ist auf 3600 Sekunden (1 Stunde) gesetzt

## Nächste Schritte

Nach dem Setup sollte das Avatar-Upload-Feature vollständig funktionsfähig sein. Die Avatare werden automatisch:
- In den Settings angezeigt (mit Edit-Funktionalität)
- In der Sidebar angezeigt
- Im Dashboard angezeigt
- Überall wo InitialsAvatar verwendet wird




