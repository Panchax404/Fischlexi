"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { GlobeAltIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

const LANGUAGES = [
    { code: 'de', name: 'Deutsch' },
    { code: 'en', name: 'English' }
];

export function LanguageSwitcher() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Das aktuelle Sprachkürzel aus dem Pfad ermitteln (z.B. "/de/fish/..." -> "de")
    const currentLangCode = pathname.split('/')[1] || 'de';
    const currentLang = LANGUAGES.find(l => l.code === currentLangCode) || LANGUAGES[0];

    const switchLanguage = (langCode: string) => {
        if (langCode === currentLangCode) {
            setIsOpen(false);
            return;
        }
        
        // Ersetzt das Sprach-Segment im Pfad
        const segments = pathname.split('/');
        segments[1] = langCode;
        const newPath = segments.join('/');
        
        // Hard-Reload anstatt router.push, da ein Wechsel der Root-Locale (<html> lang-Attribut) 
        // zu React-Hydration-Fehlern mit next-themes (<script> Tags) führen kann.
        window.location.href = newPath;
    };

    // Schließen, wenn außerhalb geklickt wird
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-full bg-accent/50 hover:bg-accent border border-border transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Sprache wechseln"
                aria-expanded={isOpen}
            >
                <GlobeAltIcon className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium hidden sm:inline-block">{currentLang.name}</span>
                {/* Fallback für Mobile (nur Globe + Code) */}
                <span className="text-sm font-medium sm:hidden uppercase">{currentLang.code}</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-40 rounded-xl bg-card border border-border shadow-lg overflow-hidden z-50"
                    >
                        <ul className="py-1">
                            {LANGUAGES.map((lang) => (
                                <li key={lang.code}>
                                    <button
                                        onClick={() => switchLanguage(lang.code)}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors ${
                                            lang.code === currentLangCode ? 'text-primary font-bold bg-accent/30' : 'text-foreground'
                                        }`}
                                    >
                                        {lang.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
