'use client';

import React, { useRef, useActionState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { joinWaitlist } from './actions';
import Link from 'next/link';
import Image from 'next/image';

function WaitlistForm() {
  const [state, formAction, isPending] = useActionState(joinWaitlist, null);

  return (
    <div className="max-w-2xl mx-auto bg-white/5 backdrop-blur-md p-8 md:p-12 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-[#d4af37] rounded-full blur-[100px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-white rounded-full blur-[100px] opacity-10 pointer-events-none" />

      <h2 className="text-3xl md:text-5xl font-playfair font-semibold mb-4 text-white">
        You're early. That's exactly where you want to be.
      </h2>
      <p className="text-white/70 mb-10 text-lg">
        Her Excellence is almost here. Join the waitlist and be the first to shop the debut collection.
      </p>

      {state?.success && (
        <div className="mb-8 p-6 bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#d4af37] rounded-lg text-center animate-fadeIn">
          {state.message}
        </div>
      )}

      {state?.error && !state.success && (
        <div className="mb-8 p-4 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg text-center animate-fadeIn">
          {state.error}
        </div>
      )}

      {!state?.success && (
        <form action={formAction} className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium text-white/80 uppercase tracking-widest text-xs">Full Name</label>
              <input type="text" id="fullName" name="fullName" required
                className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white focus:border-[#d4af37] focus:outline-none transition-colors placeholder:text-white/30"
                placeholder="full name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-white/80 uppercase tracking-widest text-xs flex justify-between items-center">
                <span>Email Address</span>
                <span className="text-white/40 font-normal lowercase text-[10px] tracking-normal">optional</span>
              </label>
              <input type="email" id="email" name="email"
                className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white focus:border-[#d4af37] focus:outline-none transition-colors placeholder:text-white/30"
                placeholder="tony@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-white/80 uppercase tracking-widest text-xs flex justify-between items-center">
                <span>Phone Number</span>
                <span className="text-white/40 font-normal lowercase text-[10px] tracking-normal">optional</span>
              </label>
              <input type="tel" id="phone" name="phone"
                className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white focus:border-[#d4af37] focus:outline-none transition-colors placeholder:text-white/30"
                placeholder="+234..."
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="birthday" className="text-sm font-medium text-white/80 uppercase tracking-widest text-xs">Birthday</label>
              <input type="date" id="birthday" name="birthday"
                className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white focus:border-[#d4af37] focus:outline-none transition-colors placeholder:text-white/30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium text-white/80 uppercase tracking-widest text-xs">Where are you based?</label>
            <select id="location" name="location" required defaultValue=""
              className="w-full bg-[#0a0a0a] border-b border-white/20 px-0 py-3 text-white focus:border-[#d4af37] focus:outline-none transition-colors appearance-none">
              <option value="" disabled>Select your city...</option>
              <option value="Lagos">Lagos</option>
              <option value="Abuja">Abuja</option>
              <option value="Port Harcourt">Port Harcourt</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="style" className="text-sm font-medium text-white/80 uppercase tracking-widest text-xs">How would you describe your personal style? (Optional)</label>
            <select id="style" name="style" defaultValue=""
              className="w-full bg-[#0a0a0a] border-b border-white/20 px-0 py-3 text-white focus:border-[#d4af37] focus:outline-none transition-colors appearance-none">
              <option value="" disabled>Select an option...</option>
              <option value="Classic & Refined">Classic & Refined</option>
              <option value="Minimal & Clean">Minimal & Clean</option>
              <option value="Polished Professional">Polished Professional</option>
              <option value="A mix of all three">A mix of all three</option>
            </select>
          </div>

          <button type="submit" disabled={isPending}
            className="w-full mt-8 bg-white text-black py-4 font-semibold uppercase tracking-widest hover:bg-[#d4af37] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isPending ? 'Securing Spot...' : 'Secure my spot'}
          </button>
        </form>
      )}
    </div>
  );
}

export default function HerExcellenceLanding() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Hero Parallax
  const heroY = useTransform(scrollYProgress, [0, 0.2], ["0%", "50%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  // Image / Text 3D transforms
  const textScale = useTransform(scrollYProgress, [0.1, 0.3], [0.8, 1]);
  const textOpacity = useTransform(scrollYProgress, [0.1, 0.25], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.1, 0.3], ["100px", "0px"]);


  const quoteRotateX = useTransform(scrollYProgress, [0.6, 0.75], [45, 0]);
  const quoteOpacity = useTransform(scrollYProgress, [0.6, 0.75], [0, 1]);
  const quoteZ = useTransform(scrollYProgress, [0.6, 0.75], [-500, 0]);

  return (
    <div ref={containerRef} className="bg-[#0a0a0a] min-h-[300vh] relative overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 py-4 px-6 md:px-12 flex justify-between items-center bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-3">
          <Image src="/herexcellence.jpeg" alt="Her Excellence Logo" width={32} height={32} className="rounded-full border border-white/20" />
          <span className="font-playfair font-bold text-lg tracking-wider text-white">HER EXCELLENCE</span>
        </div>
        <div className="hidden md:flex gap-8 text-[10px] uppercase tracking-[0.3em] text-white/50">
          <span>Lagos</span>
          <span>·</span>
          <span>Ready-To-Wear</span>
        </div>
        <button onClick={() => {
          document.getElementById('waitlist-section')?.scrollIntoView({ behavior: 'smooth' });
        }} className="text-xs font-bold border-b border-[#d4af37] pb-0.5 uppercase tracking-widest text-[#d4af37] hover:text-white hover:border-white transition-colors">
          Join Waitlist
        </button>
      </nav>

      {/* Hero Section */}
      <motion.div
        style={{ y: heroY, opacity: heroOpacity }}
        className="h-screen flex flex-col justify-center items-center text-center px-4 relative z-10 pt-20 will-change-transform"
      >
        <div className="absolute inset-0 bg-[#0a0a0a] z-0" /> {/* Simplified background */}
        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="uppercase tracking-[0.4em] text-[#d4af37] mb-6 block text-xs font-semibold"
          >
            Launching 2026
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-5xl md:text-7xl lg:text-8xl font-playfair font-bold text-white leading-tight mb-8"
          >
            Dressed for <br />
            <span className="italic font-light text-white/90">every room</span> <br />
            you walk into.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="max-w-2xl mx-auto text-base md:text-lg text-white/60 leading-relaxed font-light mb-12"
          >
            Her Excellence is a ready-to-wear label for the professional Nigerian woman who commands presence without sacrificing ease. Refined silhouettes. Everyday elegance. Built for women who run things.
          </motion.p>
          <button
            onClick={() => document.getElementById('waitlist-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="group relative inline-flex items-center justify-center px-8 py-4 bg-white text-black font-semibold uppercase tracking-widest overflow-hidden transition-all hover:bg-[#d4af37] hover:text-white"
          >
            <span className="relative z-10">Reserve Your Place</span>
          </button>
        </div>
      </motion.div>

      {/* Philosophy Section (3D effect) */}
      <div className="h-screen flex items-center justify-center px-4 relative perspective-1000">
        <motion.div
          style={{ scale: textScale, opacity: textOpacity, y: textY }}
          className="text-center max-w-5xl mx-auto will-change-transform"
        >
          <h2 className="text-4xl md:text-6xl font-playfair font-medium text-white mb-8 leading-tight">
            First-access privileges. <br /> No spam. Ever.
          </h2>
          <div className="w-px h-24 bg-gradient-to-b from-[#d4af37] to-transparent mx-auto my-12" />
        </motion.div>
      </div>

      {/* Points Section */}
      <div className="min-h-screen flex flex-col justify-center px-4 py-24 overflow-hidden relative">
        <div className="max-w-6xl mx-auto w-full space-y-24">
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col md:flex-row items-center gap-8 md:gap-16 will-change-transform"
          >
            <div className="text-7xl md:text-9xl font-playfair font-bold text-[#d4af37]/20">01</div>
            <div className="flex-1">
              <h3 className="text-3xl md:text-5xl font-playfair text-white mb-4">Refined Silhouettes</h3>
              <p className="uppercase tracking-widest text-[#d4af37] text-sm font-semibold">For Daily Authority</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-16 text-right will-change-transform"
          >
            <div className="text-7xl md:text-9xl font-playfair font-bold text-[#d4af37]/20">02</div>
            <div className="flex-1">
              <h3 className="text-3xl md:text-5xl font-playfair text-white mb-4">Premium Fabrication</h3>
              <p className="uppercase tracking-widest text-[#d4af37] text-sm font-semibold">At Accessible Price Points</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col md:flex-row items-center gap-8 md:gap-16 will-change-transform"
          >
            <div className="text-7xl md:text-9xl font-playfair font-bold text-[#d4af37]/20">03</div>
            <div className="flex-1">
              <h3 className="text-3xl md:text-5xl font-playfair text-white mb-4">Rooted in Lagos</h3>
              <p className="uppercase tracking-widest text-[#d4af37] text-sm font-semibold">Worn Across Boardrooms</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 3D Quote Section */}
      <div className="h-[80vh] flex items-center justify-center px-4 relative" style={{ perspective: '1200px' }}>
        <motion.div
          style={{ rotateX: quoteRotateX, opacity: quoteOpacity, z: quoteZ }}
          className="text-center max-w-4xl mx-auto transform-style-3d will-change-transform"
        >
          <p className="text-3xl md:text-6xl font-playfair font-medium text-white leading-relaxed italic">
            "Excellence is not a look. <br />
            It is a standard you set <br />
            before you enter the room."
          </p>
        </motion.div>
      </div>

      {/* Waitlist Form Section */}
      <div id="waitlist-section" className="min-h-screen flex items-center justify-center px-4 py-24 relative z-20 bg-[#0a0a0a]">
        <div className="w-full">
          <WaitlistForm />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6 relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-3 text-center md:text-left">
            <Image src="/herexcellence.jpeg" alt="Her Excellence" width={32} height={32} className="rounded-full grayscale opacity-50 mb-2 md:mb-0" />
            <span className="text-white/50 text-xs md:text-sm">© 2026 HER EXCELLENCE. ALL RIGHTS RESERVED.</span>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-xs md:text-sm uppercase tracking-widest font-semibold text-white/50">
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
            <a href="mailto:herexcellencefashion@gmail.com" className="hover:text-white transition-colors text-[10px] md:text-sm">herexcellencefashion@gmail.com</a>
            <Link href="/herexcellence/dashboard" className="hover:text-[#d4af37] transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
