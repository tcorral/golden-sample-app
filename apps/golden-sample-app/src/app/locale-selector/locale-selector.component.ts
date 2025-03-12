import { Component, Inject, OnInit } from '@angular/core';
import { LOCALES_LIST, LocalesService } from './locales.service';
import { localesCatalog } from './locales-catalog';

type Locale = (typeof localesCatalog)[string];

@Component({
  selector: 'app-locale-selector',
  templateUrl: 'locale-selector.component.html',
})
export class LocaleSelectorComponent implements OnInit {
  localesCatalog: Locale[] = [];
  private currentLanguage: Locale | undefined;

  constructor(
    private localeService: LocalesService,
    @Inject(LOCALES_LIST) public locales: string[]
  ) {}

  set language(value: string | object | Locale | undefined) {
    if (typeof value === 'string') {
      return;
    }
    
    if (value && typeof value === 'object' && 'code' in value) {
      this.currentLanguage = value as Locale;
      this.localeService.setLocale(this.currentLanguage.code);
    }
  }

  get language(): Locale | undefined {
    return this.currentLanguage;
  }

  ngOnInit() {
    this.localesCatalog = this.locales.reduce(
      (acc: Locale[], locale) => {
        if (localesCatalog[locale]) {
          return [...acc, localesCatalog[locale]];
        }
        return acc;
      },
      []
    );

    this.currentLanguage = this.findLocale(this.localeService.currentLocale);
    
    // If no locale is found, use the first available one
    if (!this.currentLanguage && this.localesCatalog.length > 0) {
      this.currentLanguage = this.localesCatalog[0];
    }
    
    // Log the current language for debugging
    console.log('Current language:', this.currentLanguage);
  }

  private findLocale(locale: string): Locale | undefined {
    // First try exact match
    if (this.locales.includes(locale) && localesCatalog[locale]) {
      return localesCatalog[locale];
    }
    
    // Then try matching just the language part (e.g., 'en' from 'en-US')
    const langCode = locale.split('-')[0];
    const matchingLocale = this.locales.find(l => l.startsWith(langCode));
    
    if (matchingLocale && localesCatalog[matchingLocale]) {
      return localesCatalog[matchingLocale];
    }
    
    return undefined;
  }
}
