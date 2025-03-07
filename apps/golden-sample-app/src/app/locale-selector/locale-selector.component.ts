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
    console.log('Language setter called with:', value);
    
    if (typeof value === 'string') {
      // Handle string values as well, which might come from the dropdown
      const foundLocale = this.findLocale(value as string);
      if (foundLocale) {
        console.log('Found locale for string value:', foundLocale);
        this.currentLanguage = foundLocale;
        this.localeService.setLocale(foundLocale.code);
      }
      return;
    }
    
    if (value && typeof value === 'object') {
      const locale = value as Locale;
      console.log('Setting language to object:', locale);
      this.currentLanguage = locale;
      this.localeService.setLocale(locale.code);
    }
  }

  get language(): Locale | undefined {
    return this.currentLanguage;
  }

  ngOnInit() {
    // Build the locale catalog from available locales
    this.localesCatalog = this.locales.reduce(
      (acc: Locale[], locale) => {
        if (localesCatalog[locale]) {
          return [...acc, localesCatalog[locale]];
        }
        return acc;
      },
      []
    );
    
    console.log('Available locales:', this.localesCatalog);

    // Get the current locale from the service
    const currentLocale = this.localeService.currentLocale;
    console.log('Current locale from service:', currentLocale);
    
    // Find the locale object for the current locale
    this.currentLanguage = this.findLocale(currentLocale);
    console.log('Current language object:', this.currentLanguage);
    
    // Initialize the language if not set
    if (!this.currentLanguage && this.localesCatalog.length > 0) {
      this.currentLanguage = this.localesCatalog[0];
      console.log('Setting default language:', this.currentLanguage);
      // Apply the default language
      this.localeService.setLocale(this.currentLanguage.code);
    }
  }

  private findLocale(locale: string): Locale | undefined {
    // First try direct match
    if (this.locales.includes(locale) && localesCatalog[locale]) {
      return localesCatalog[locale];
    }
    
    // Try case-insensitive match
    const lowerLocale = locale.toLowerCase();
    for (const availableLocale of this.locales) {
      if (availableLocale.toLowerCase() === lowerLocale && localesCatalog[availableLocale]) {
        return localesCatalog[availableLocale];
      }
    }
    
    // Try to match by code
    for (const availableLocale of this.locales) {
      const catalogEntry = localesCatalog[availableLocale];
      if (catalogEntry && catalogEntry.code === locale) {
        return catalogEntry;
      }
    }

    return undefined;
  }
}
