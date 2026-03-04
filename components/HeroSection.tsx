"use client";

import { motion } from "framer-motion";

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden py-16 md:py-24 mb-10 rounded-3xl bg-gradient-to-br from-primary/10 via-background to-accent/10 border border-border/50">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-cyan-400/20 blur-[100px]" />
            </div>

            <div className="relative z-10 container mx-auto px-4 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6"
                >
                    Entdecke die <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-400">Unterwasserwelt</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
                >
                    Dein ultimativer Guide für die Aquaristik. Finde Fische, prüfe Wasserwerte und gestalte dein perfektes Biotop.
                </motion.p>
            </div>
        </section>
    );
}
