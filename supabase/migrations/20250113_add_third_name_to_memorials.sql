-- Add third_name field to memorials table for complete German name formatting
-- This field stores the third given name (e.g., "Moritz" in "Max Wolfgang Moritz")
-- Used in formatFullName() to display: Titel Vorname ZweiterVorname DritterVorname "Spitzname" Namenszusatz Nachname (geb. Geburtsname)

ALTER TABLE memorials ADD COLUMN third_name TEXT;
