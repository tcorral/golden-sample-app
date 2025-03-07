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
      // Handle string values as well, which might come from the dropdown
      const foundLocale = this.findLocale(value as string);
      if (foundLocale) {
        this.currentLanguage = foundLocale;
        this.localeService.setLocale(foundLocale.code);
      }
      return;
    }
    
    const locale = value as Locale;
    this.currentLanguage = locale;
    this.localeService.setLocale(locale.code);
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
    if (this.locales.includes(locale)) {
      return localesCatalog[locale];
    }

    return undefined;
  }
}
