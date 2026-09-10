import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { saveStoredLanguage } from '../../utils/storage';

export const LanguageSelector: React.FC<{ variant?: 'light' | 'dark' | 'minimal' }> = ({
  variant = 'dark'
}) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' }
  ];

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  const handleSelectLanguage = (code: string) => {
    i18n.changeLanguage(code);
    saveStoredLanguage(code);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const buttonStyle =
    variant === 'light'
      ? 'bg-stone-100/90 text-stone-800 border-stone-200 hover:bg-stone-200/80 shadow-2xs'
      : variant === 'dark'
      ? 'bg-stone-800 text-white border-stone-700 hover:bg-stone-700'
      : 'text-stone-700 hover:bg-stone-100 border-transparent';

  return (
    <div className="relative inline-block text-left" ref={dropdownRef} id="language-selector-wrapper">
      <button
        id="language-selector-button"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-xl border transition-all ${buttonStyle} focus:outline-none focus:ring-2 focus:ring-emerald-600`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className="w-4 h-4 text-[#2d6a4f]" />
        <span>{currentLang.native}</span>
        <ChevronDown className="w-3.5 h-3.5 opacity-60" />
      </button>

      {isOpen && (
        <div
          id="language-dropdown-menu"
          className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-stone-200 shadow-xl py-1.5 z-50 focus:outline-none animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="px-3.5 py-1.5 text-[10px] font-bold tracking-wider text-stone-400 uppercase">
            Select Language / ಭಾಷೆ / भाषा
          </div>
          {languages.map(lang => {
            const isSelected = i18n.language === lang.code;
            return (
              <button
                key={lang.code}
                id={`lang-opt-${lang.code}`}
                onClick={() => handleSelectLanguage(lang.code)}
                className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors ${
                  isSelected ? 'bg-emerald-50 text-[#1b4332] font-bold' : 'text-stone-700 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-stone-900">{lang.native}</span>
                  <span className="text-[10px] text-stone-500">{lang.label}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-[#2d6a4f]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

