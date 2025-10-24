'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function ConfirmPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Kein Bestätigungstoken gefunden.');
      return;
    }

    const confirmEmail = async () => {
      try {
        const response = await fetch(`/api/confirm?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.error);
        }
      } catch {
        setStatus('error');
        setMessage('Ein Fehler ist aufgetreten. Bitte versuche es später erneut.');
      }
    };

    confirmEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Hero Image */}
      <div className="relative w-full h-[450px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src="/images/dankeseite-foto.webp" 
          alt="Gruppe von Menschen, die sich umarmen" 
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
        />
        <Link 
          href="/" 
          className="absolute top-4 left-4 flex items-center space-x-2 h-[50px] py-2 px-4 rounded-[1.25rem] bg-black/60 backdrop-blur transition-colors hover:bg-black/70"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/images/logo-gedenkseiten.ai-white-x4.png" 
            alt="Gedenkseiten.ai Logo" 
            width={80} 
            height={20}
            className="h-full"
          />
          <span className="text-white font-satoshi font-bold">Gedenkseiten.ai</span>
        </Link>
      </div>

      {/* Content */}
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {status === 'loading' && (
            <div className="flex flex-col items-center space-y-4">
              <h1 className="text-3xl font-bold text-gray-800">Bestätigung läuft...</h1>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center space-y-4">
              <h1 className="text-3xl font-bold text-gray-800">Bestätigung fehlgeschlagen</h1>
              <p className="text-gray-600">{message}</p>
              <Link 
                href="/" 
                className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
              >
                Zur Startseite
              </Link>
            </div>
          )}

          {status === 'success' && (
            <>
              <h1 className="text-4xl font-bold text-gray-800">Erfolgreich angemeldet.</h1>
              <p className="text-xl text-gray-600">Wir freuen uns sehr über dein Interesse und bedanken uns recht herzlich.</p>
              
              <div className="flex items-center mt-6 space-x-3">
                <div className="flex -space-x-4">
                  <div className="relative w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                    <Image 
                      src="/images/foto of a man with basecap on a light background.png" 
                      alt="Mann mit Basecap" 
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className="relative w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                    <Image 
                      src="/images/portrait of a woman-2.png" 
                      alt="Porträt einer Frau" 
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className="relative w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                    <Image 
                      src="/images/selfie of a couple.png" 
                      alt="Selfie eines Paares" 
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                </div>
                <p className="text-gray-600">Menschen wie du, die bereits angemeldet sind</p>
              </div>
              
              <div className="mt-6 space-y-4">
                <p className="text-gray-700">
                  Du hast dich angemeldet, um zu gedenken und Anteilnahme zu erhalten. Wir möchten dich dabei begleiten und dir ein würdevolles Erlebnis bieten.
                </p>
                
                <p className="text-gray-700">
                  Die Gedenkseiten von Memorial Journey sind neu und befinden sich aktuell im Aufbau, deshalb bist du nicht direkt in deinem Dashboard gelandet.
                  Wir informieren dich sobald unser Service verfügbar ist. Du erhältst von uns auch eine Einladung optional an der Testphase teilzunehmen.
                </p>
                
                <div className="pt-4">
                  <Link 
                    href="/" 
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Zur Startseite
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 