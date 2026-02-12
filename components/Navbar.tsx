import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { NavItem } from '../types';

interface NavbarProps {
  onOpenResume: () => void;
}

const NAV_ITEMS: NavItem[] = [
  { label: '首页', href: '#hero' },
  { label: '关于', href: '#about' },
  { label: '项目', href: '#projects' },
  { label: '联系', href: '#contact' },
];

export const Navbar: React.FC<NavbarProps> = ({ onOpenResume }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="text-xl font-bold tracking-tighter text-cyan-400 cursor-pointer">
          PORTFOLIO.
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex space-x-8 text-sm uppercase tracking-widest font-medium text-white/70">
          {NAV_ITEMS.map((item) => (
            <a 
              key={item.label}
              href={item.href}
              className="hover:text-cyan-400 transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:block">
            <button 
              onClick={onOpenResume}
              className="bg-cyan-500 hover:bg-cyan-400 text-black px-5 py-2 rounded-full text-xs font-bold transition-all transform hover:scale-105"
            >
                获取简历
            </button>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-black/95 border-b border-white/10 p-6 md:hidden flex flex-col gap-6 text-center">
          {NAV_ITEMS.map((item) => (
            <a 
              key={item.label}
              href={item.href}
              className="text-white hover:text-cyan-400 font-medium tracking-widest uppercase"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <button 
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenResume();
            }}
            className="bg-cyan-500 w-full py-3 rounded text-black font-bold uppercase tracking-widest"
          >
            获取简历
          </button>
        </div>
      )}
    </nav>
  );
};