'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import InitialsAvatar from '@/components/ui/InitialsAvatar';
import PopoverRegister from '@/components/ui/PopoverRegister';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, authUser, loading: authLoading } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Navbar nur verstecken, wenn wir mehr als 300px gescrollt haben
      if (currentScrollY > 300) {
        if (currentScrollY > lastScrollY) {
          // Scrolling down
          setIsVisible(false);
        } else {
          // Scrolling up
          setIsVisible(true);
        }
      } else {
        // Im oberen Bereich immer sichtbar
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);

      // Aktive Section aktualisieren
      const sections = ['so-what', 'preview', 'create', 'faq'];
      const currentSection = sections.find(sectionId => {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      setActiveSection(currentSection || '');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const navHeight = 80; // Höhe der Navbar
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setIsMenuOpen(false);
    }
  };

  const navLinkClasses = (sectionId: string) => `
    text-primary 
    hover:text-[#7D86C1] 
    active:text-[#475EEC] 
    transition-colors 
    font-inter 
    text-base 
    leading-[100%] 
    tracking-[-0.0025em] 
    font-medium
    ${activeSection === sectionId ? 'text-[#475EEC]' : ''}
  `;

  // Don't render navbar on confirm page
  if (pathname?.includes('/confirm')) {
    return null;
  }

  return (
    <>
      <PopoverRegister open={popoverOpen} onClose={() => setPopoverOpen(false)} />
      <nav
        className={`fixed top-0 left-0 right-0 z-[90] transition-all duration-300 ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="w-full max-w-[1820px] mx-auto px-5 md:px-8 lg:px-[60px]">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-1">
                <Image
                  src="/images/logo-gedenkseiten.ai-white-x4.png"
                  alt="Gedenkseiten.ai - Digitale Erinnerungsstücke für Ihre Liebsten"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
                <span className="text-primary font-satoshi text-xl font-medium">
                  Gedenkseiten.ai
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('so-what')}
                className={navLinkClasses('so-what')}
              >
                Vorteile
              </button>
              <button 
                onClick={() => scrollToSection('preview')}
                className={navLinkClasses('preview')}
              >
                Gedenkseiten-Arten
              </button>
              <button 
                onClick={() => scrollToSection('ai-unterstuetzung')}
                className={navLinkClasses('ai-unterstuetzung')}
              >
                KI-Unterstützung
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className={navLinkClasses('faq')}
              >
                FAQ
              </button>
              {/* Auth Buttons / User Menu */}
              {!authLoading && (
                authUser ? (
                  // Logged in: Avatar + Name as clickable link to dashboard
                  // Use user (from users table) for display, authUser for auth check
                  <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <InitialsAvatar
                      name={user?.name || user?.email || 'U'}
                      size="sm"
                      imageUrl={user?.avatar_url}
                    />
                    <span className="text-primary font-medium text-body-m">
                      {user?.name || user?.email || 'Benutzer'}
                    </span>
                  </Link>
                ) : process.env.NEXT_PUBLIC_ENABLE_LOGIN_BUTTON === 'true' ? (
                  // Not logged in: Show login buttons
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => router.push('/auth/login')}
                    >
                      Einloggen
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setPopoverOpen(true)}
                    >
                      Jetzt starten
                    </Button>
                  </div>
                ) : null
              )}
              <ThemeToggle />
              
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          <div
            className={`md:hidden transition-all duration-300 ease-in-out ${
              isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            } overflow-hidden`}
          >
            <div className="py-4 space-y-4">
              <button 
                onClick={() => scrollToSection('so-what')}
                className={`block w-full text-left ${navLinkClasses('so-what')} px-4 py-2`}
              >
                Vorteile
              </button>
              <button 
                onClick={() => scrollToSection('preview')}
                className={`block w-full text-left ${navLinkClasses('preview')} px-4 py-2`}
              >
                Gedenkseiten-Arten
              </button>
              <button 
                onClick={() => scrollToSection('ai-unterstuetzung')}
                className={`block w-full text-left ${navLinkClasses('create')} px-4 py-2`}
              >
                KI-Unterstützung
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className={`block w-full text-left ${navLinkClasses('faq')} px-4 py-2`}
              >
                FAQ
              </button>
              {/* Mobile Auth Buttons / User Menu */}
              {!authLoading && (
                authUser ? (
                  // Logged in: Avatar + Name as clickable link to dashboard
                  // Use user (from users table) for display, authUser for auth check
                  <div className="flex flex-col gap-2 px-4">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 py-2 hover:opacity-80 transition-opacity"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <InitialsAvatar
                        name={user?.name || user?.email || 'U'}
                        size="sm"
                        imageUrl={user?.avatar_url}
                      />
                      <span className="text-primary font-medium text-body-m">
                        {user?.name || user?.email || 'Benutzer'}
                      </span>
                    </Link>
                    <div className="flex justify-center pt-2">
                      <ThemeToggle />
                    </div>
                  </div>
                ) : process.env.NEXT_PUBLIC_ENABLE_LOGIN_BUTTON === 'true' ? (
                  // Not logged in: Show login buttons
                  <div className="flex flex-col gap-2 px-4">
                    <Button
                      variant="secondary"
                      size="md"
                      fullWidth
                      onClick={() => router.push('/auth/login')}
                    >
                      Einloggen
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      fullWidth
                      onClick={() => setPopoverOpen(true)}
                    >
                      Jetzt starten
                    </Button>
                    <div className="flex justify-center pt-2">
                      <ThemeToggle />
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center pt-2 px-4">
                    <ThemeToggle />
                  </div>
                )
              )}
            </div>
          </div>
        </div>
        {/* Blurred background */}
        <div className="absolute inset-0 bg-primary/60 backdrop-blur-xl -z-10" />
      </nav>
    </>
  );
} 