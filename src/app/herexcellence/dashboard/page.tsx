'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getWaitlistData } from '../actions';
import { LogOut, Users, Mail, Phone, MapPin, Calendar, Star, Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const CREDENTIALS = {
  username: 'herexcellencefashion',
  password: 'Herexcellence14'
};

export default function HerExcellenceDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const session = localStorage.getItem('herexcellence_session');
    if (session === 'active') {
      setIsLoggedIn(true);
      fetchData();
    } else {
      setIsLoggedIn(false);
      setLoading(false);
    }
  }, []);

  async function fetchData() {
    setLoading(true);
    const data = await getWaitlistData();
    setWaitlist(data);
    setLoading(false);
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
      localStorage.setItem('herexcellence_session', 'active');
      setIsLoggedIn(true);
      fetchData();
    } else {
      setError('Invalid username or password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('herexcellence_session');
    setIsLoggedIn(false);
    setWaitlist([]);
  };

  const filteredWaitlist = waitlist.filter(item => 
    item.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoggedIn === null) return <div className="min-h-screen bg-[#0a0a0a]" />;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 font-inter">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl"
        >
          <div className="text-center mb-8">
            <div className="inline-block p-4 rounded-full bg-white/5 mb-4">
              <Image src="/herexcellence.jpeg" alt="Logo" width={60} height={60} className="rounded-full" />
            </div>
            <h1 className="text-2xl font-playfair font-bold text-white uppercase tracking-widest">Admin Access</h1>
            <p className="text-white/50 text-sm mt-2">Enter credentials to view the waitlist</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-white/60 mb-2">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#d4af37] focus:outline-none transition-colors"
                placeholder="Enter username"
                required
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-white/60 mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#d4af37] focus:outline-none transition-colors"
                placeholder="Enter password"
                required
              />
            </div>
            
            {error && <p className="text-red-400 text-xs text-center">{error}</p>}

            <button 
              type="submit"
              className="w-full bg-white text-black font-bold uppercase tracking-widest py-4 rounded-lg hover:bg-[#d4af37] transition-all"
            >
              Enter Dashboard
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <Link href="/herexcellence" className="text-white/30 text-xs uppercase tracking-widest hover:text-white transition-colors">
              Return to Landing Page
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#f5f5f5] font-inter">
      {/* Sidebar / Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Image src="/herexcellence.jpeg" alt="Logo" width={40} height={40} className="rounded-full" />
             <div>
               <h2 className="font-playfair font-bold text-lg tracking-tight">HER EXCELLENCE</h2>
               <p className="text-[10px] uppercase tracking-[0.3em] text-[#d4af37]">Waitlist Management</p>
             </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 py-12">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-[#d4af37]/20 rounded-xl text-[#d4af37]">
                <Users size={24} />
              </div>
              <p className="text-white/50 text-sm font-medium uppercase tracking-widest">Total Signups</p>
            </div>
            <p className="text-4xl font-playfair font-bold text-white">{waitlist.length}</p>
          </div>
          
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                <MapPin size={24} />
              </div>
              <p className="text-white/50 text-sm font-medium uppercase tracking-widest">Lagos Based</p>
            </div>
            <p className="text-4xl font-playfair font-bold text-white">
              {waitlist.filter(i => i.location === 'Lagos').length}
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl text-green-400">
                <Calendar size={24} />
              </div>
              <p className="text-white/50 text-sm font-medium uppercase tracking-widest">Last 24 Hours</p>
            </div>
            <p className="text-4xl font-playfair font-bold text-white">
              {waitlist.filter(i => {
                const date = new Date(i.created_at);
                return (Date.now() - date.getTime()) < 24 * 60 * 60 * 1000;
              }).length}
            </p>
          </div>
        </div>

        {/* Table Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h3 className="text-2xl font-playfair font-semibold">Registered Candidates</h3>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, email, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-[#d4af37] focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Waitlist List */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] text-white/40 font-semibold">Name</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] text-white/40 font-semibold">Contact Info</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] text-white/40 font-semibold">Location</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] text-white/40 font-semibold">Birthday</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] text-white/40 font-semibold">Style Preference</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] text-white/40 font-semibold text-right">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence mode='popLayout'>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-white/30 italic">Loading records...</td>
                    </tr>
                  ) : filteredWaitlist.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-white/30 italic">No records found.</td>
                    </tr>
                  ) : (
                    filteredWaitlist.map((person, idx) => (
                      <motion.tr 
                        key={person.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="px-6 py-5">
                          <p className="font-semibold text-white group-hover:text-[#d4af37] transition-colors">{person.first_name}</p>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-sm text-white/70">
                            <Mail size={14} className="text-[#d4af37]/60" />
                            <span>{person.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-white/70 mt-1">
                            <Phone size={14} className="text-[#d4af37]/60" />
                            <span>{person.phone_number}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full text-xs font-medium text-white/80 border border-white/10">
                            <MapPin size={12} className="text-blue-400" />
                            {person.location}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          {person.birthday ? (
                            <div className="flex items-center gap-2 text-sm text-white/70">
                              <Calendar size={14} className="text-[#d4af37]/60" />
                              <span>{new Date(person.birthday).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </div>
                          ) : (
                            <span className="text-white/20 text-xs italic">Not specified</span>
                          )}
                        </td>
                        <td className="px-6 py-5">
                           {person.personal_style ? (
                             <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#d4af37]/10 rounded-full text-xs font-medium text-[#d4af37] border border-[#d4af37]/20">
                               <Star size={12} />
                               {person.personal_style}
                             </div>
                           ) : (
                             <span className="text-white/20 text-xs italic">Not specified</span>
                           )}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <p className="text-xs text-white/40 uppercase tracking-widest">
                            {new Date(person.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
