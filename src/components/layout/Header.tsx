'use client'

import { useState } from 'react'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background-secondary/80 backdrop-blur-md border-b border-border-primary">
      <div className="genesis-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="text-2xl font-bold text-accent-teal">
              GENESIS <span className="text-accent-gold">1.1</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#plex-coin" className="text-text-secondary hover:text-text-primary transition-colors">
              Токен
            </a>
            <a href="#genesis-auth-section" className="text-text-secondary hover:text-text-primary transition-colors">
              Авторизация
            </a>
            <a href="#deposits" className="text-text-secondary hover:text-text-primary transition-colors">
              Планы
            </a>
            <a href="#faq" className="text-text-secondary hover:text-text-primary transition-colors">
              FAQ
            </a>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Открыть меню</span>
            <div className="w-6 h-6 relative">
              <span className={`absolute block h-0.5 w-full bg-text-primary transition-all ${mobileMenuOpen ? 'rotate-45 top-3' : 'top-1'}`} />
              <span className={`absolute block h-0.5 w-full bg-text-primary transition-all ${mobileMenuOpen ? 'opacity-0' : 'top-3'}`} />
              <span className={`absolute block h-0.5 w-full bg-text-primary transition-all ${mobileMenuOpen ? '-rotate-45 top-3' : 'top-5'}`} />
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border-primary">
            <div className="flex flex-col space-y-4">
              <a href="#plex-coin" className="text-text-secondary hover:text-text-primary transition-colors">
                Токен PLEX ONE
              </a>
              <a href="#genesis-auth-section" className="text-text-secondary hover:text-text-primary transition-colors">
                Авторизация
              </a>
              <a href="#deposits" className="text-text-secondary hover:text-text-primary transition-colors">
                Планы доходности
              </a>
              <a href="#faq" className="text-text-secondary hover:text-text-primary transition-colors">
                FAQ
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
