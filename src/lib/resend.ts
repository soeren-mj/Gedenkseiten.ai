import { Resend } from 'resend';

// API-Schlüssel aus Umgebungsvariable laden
const apiKey = process.env.RESEND_API_KEY;

// Debug-Info nur in Entwicklungsumgebung
if (process.env.NODE_ENV === 'development') {
  console.log('RESEND: API-Schlüssel vorhanden:', !!apiKey);
}

// Einfache Initialisierung
let resend: Resend | null = null;

if (!apiKey) {
  console.error('❌ RESEND_API_KEY Umgebungsvariable fehlt');
} else {
  try {
    // Initialisiere Resend mit dem API-Schlüssel aus der Umgebungsvariable
    resend = new Resend(apiKey);
    // Erfolgreiche Initialisierung, keine Logs beim Import
  } catch (error) {
    console.error('❌ Fehler bei der Initialisierung von Resend:', error);
  }
}

// Verbindungstest nur on-demand ausführen, nicht beim Import
export const testResendConnection = async () => {
  if (!resend) {
    console.error('❌ Resend ist nicht initialisiert');
    return false;
  }
  
  try {
    const domainResponse = await resend.domains.list();
    console.log('✅ Resend-Verbindung getestet, verfügbare Domains:', 
      domainResponse.data && Array.isArray(domainResponse.data) 
        ? domainResponse.data.map((d: { name: string }) => d.name).join(', ') 
        : 'Keine');
    return true;
  } catch (error) {
    console.error('❌ Fehler beim Testen der Resend-Verbindung:', error);
    return false;
  }
};

export default resend; 