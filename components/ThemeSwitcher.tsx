"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon, BeakerIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeSwitcher() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-10 h-10" />; // Placeholder to avoid hydration mismatch
    }

    const cycleTheme = () => {
        if (theme === "light") setTheme("dark");
        else setTheme("light");
    };

    return (
        <button
            onClick={cycleTheme}
            className="relative flex items-center justify-center w-10 h-10 rounded-full bg-accent/50 hover:bg-accent border border-border transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Toggle theme"
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={theme}
                    initial={{ y: -20, opacity: 0, rotate: -90 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: 20, opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                >
                    {theme === "light" ? (
                        <SunIcon className="w-5 h-5 text-yellow-500" />
                    ) : (
                        <MoonIcon className="w-5 h-5 text-blue-400" />
                    )}
                </motion.div>
            </AnimatePresence>
        </button>
    );
}
