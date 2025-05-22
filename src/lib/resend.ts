import { Resend } from 'resend';

// Der korrekte API-Schlüssel - DIREKT VERWENDEN
const CORRECT_API_KEY = 're_YZeesR6E_CrRVbyusQxvdHkTcrPb7ADqM';

// Verwende immer den hardcoded API-Schlüssel, ignoriere Umgebungsvariablen
const apiKey = CORRECT_API_KEY;

console.log('RESEND SETUP INFO:');
console.log('- API-Schlüssel vorhanden:', !!apiKey);
console.log('- Verwendeter API-Schlüssel Anfang:', apiKey ? apiKey.substring(0, 8) + '...' : 'N/A');

// Einfache Initialisierung
let resend: Resend | null = null;

try {
  // Initialisiere Resend mit dem korrekten API-Schlüssel
  resend = new Resend(apiKey);
  console.log('✅ Resend wurde erfolgreich initialisiert');
} catch (error) {
  console.error('❌ Fehler bei der Initialisierung von Resend:', error);
}

// Teste die Verbindung
if (resend) {
  const testConnection = async () => {
    try {
      const domainResponse = await resend.domains.list();
      console.log('✅ Resend-Verbindung getestet, verfügbare Domains:', 
        domainResponse.data && Array.isArray(domainResponse.data) 
          ? domainResponse.data.map((d: { name: string }) => d.name).join(', ') 
          : 'Keine');
    } catch (error) {
      console.error('❌ Fehler beim Testen der Resend-Verbindung:', error);
    }
  };
  
  testConnection();
}

export default resend; 