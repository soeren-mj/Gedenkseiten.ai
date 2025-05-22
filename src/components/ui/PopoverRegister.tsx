import React, { useRef, useState, useEffect } from 'react';
import Input from './Input';
import Checkbox from './Checkbox';
import Button from './Button';
import Image from 'next/image';

interface PopoverRegisterProps {
  open: boolean;
  onClose: () => void;
}

const PopoverRegister: React.FC<PopoverRegisterProps> = ({ open, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSaved, setRegistrationSaved] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose]);

  // Animation classes
  const animation = open
    ? 'opacity-100 scale-100 translate-y-0'
    : 'opacity-0 scale-95 translate-y-4 pointer-events-none';

  // Validation
  const emailValid = email.match(/^\S+@\S+\.\S+$/);
  const canSubmit = name && emailValid && accepted;

  if (!open) return null; // Don't render anything if not open

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 transition-all duration-200">
      <div
        ref={ref}
        className={`relative w-full max-w-3xl rounded-[1.5rem] shadow-xl transition-all duration-300 transform bg-white/60 backdrop-blur-md ${animation} p-3`}
        style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}
      >
        <div className="rounded-[1rem] overflow-hidden" style={{ background: '#F0F0F2' }}>
          {/* X schließen Button */}
          <button
            type="button"
            aria-label="Schließen"
            onClick={onClose}
            className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-gray-500 hover:text-gray-700 shadow transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <Image
            src="/images/gruppe-umarmung.webp"
            alt="Gruppe Umarmung"
            width={600}
            height={320}
            className="w-full h-64 md:h-[320px] object-cover rounded-t-[1rem] rounded-b-none"
            priority
            style={{ borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
          />
          <div className="p-6 pt-4">
            {!submitted ? (
              <form
                id="register-popover-form"
                data-gtm-form="register-popover"
                onSubmit={async e => {
                  e.preventDefault();
                  setTouched(true);
                  setError(null);
                  
                  if (canSubmit) {
                    setIsLoading(true);
                    try {
                      const response = await fetch('/api/register', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ name, email }),
                      });

                      let data;
                      try {
                        data = await response.json();
                      } catch (parseError) {
                        console.error('Fehler beim Parsen der JSON-Antwort:', parseError);
                        throw new Error('Fehler bei der Verarbeitung der Server-Antwort. Bitte versuche es später erneut.');
                      }

                      if (!response.ok) {
                        if (data && data.registrationSaved) {
                          setRegistrationSaved(true);
                          setError(data.error || 'E-Mail-Versand fehlgeschlagen');
                          setSubmitted(true);
                          return;
                        }
                        throw new Error(data && data.error ? data.error : 'Anmeldung fehlgeschlagen');
                      }

                      setSubmitted(true);
                    } catch (error) {
                      console.error('Registration error:', error);
                      setError(error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten');
                    } finally {
                      setIsLoading(false);
                    }
                  }
                }}
                className="space-y-4"
              >
                <h2 style={{ color: '#000000' }}>
                  Melde dich einfach mit deinem Namen und E-Mail-Adresse an. Wir informieren dich über die nächsten Schritte.
                </h2>
                {error && (
                  <div className={`p-4 ${registrationSaved ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'} rounded-md`}>
                    <p className={`text-sm ${registrationSaved ? 'text-yellow-600' : 'text-red-600'}`}>
                      {error}
                      {registrationSaved && (
                        <span className="block mt-1">
                          Deine Anmeldung wurde gespeichert. Wir werden dich manuell kontaktieren.
                        </span>
                      )}
                    </p>
                  </div>
                )}
                <div className="flex pt-4 gap-4">
                  <Input
                    name="name"
                    label="Name*"
                    placeholder="z.B. Jochen"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="flex-1"
                  />
                  <Input
                    name="email"
                    label="E-Mail-Adresse*"
                    type="email"
                    placeholder="z.B. jochen123@mail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="flex-1"
                    error={touched && !emailValid ? 'Bitte gib eine gültige E-Mail-Adresse ein.' : ''}
                  />
                </div>
                <p className="text-sm text-gray-600 mb-4">* Pflichtfelder</p>
                <Checkbox
                  name="privacy"
                  checked={accepted}
                  onChange={e => setAccepted(e.target.checked)}
                  label={<span>Ich stimme den <a href="/datenschutz" className="text-blue-600 underline">Datenschutzbestimmungen</a> zu.</span>}
                  required
                  error={touched && !accepted ? 'Bitte akzeptiere die Datenschutzbestimmungen.' : ''}
                />
                <Button type='submit' disabled={isLoading}>
                  {isLoading ? 'Wird gesendet...' : 'Jetzt anmelden'}
                </Button>
              </form>
            ) : (
              <div className="text-center animate-fade-in py-4">
                {registrationSaved ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">Anmeldung teilweise erfolgreich</h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>Du hast dich angemeldet, aber es gab ein Problem mit dem Versand der Bestätigungs-E-Mail. 
                          Deine Registrierung wurde dennoch gespeichert.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">Anmeldung erfolgreich!</h3>
                        <div className="mt-2 text-sm text-green-700">
                          <p>Bitte überprüfe deine E-Mails und bestätige deine Anmeldung über den zugesendeten Link.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <Button onClick={onClose} size="s">
                  Schließen
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopoverRegister; 