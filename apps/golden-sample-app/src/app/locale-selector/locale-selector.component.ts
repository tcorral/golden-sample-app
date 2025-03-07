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
    
    if (!value) {
      console.log('No value provided to language setter');
      return;
    }
    
    if (typeof value === 'string') {
      // Handle string values as well, which might come from the dropdown
      const foundLocale = this.findLocale(value as string);
      if (foundLocale) {
        console.log('Found locale for string value:', foundLocale);
        this.currentLanguage = foundLocale;
        this.localeService.setLocale(foundLocale.code);
      } else {
        console.log('Could not find locale for string value:', value);
      }
      return;
    }
    
    if (typeof value === 'object') {
      try {
        // Handle different object formats that might come from the dropdown
        if ('code' in value) {
          // It's a Locale object
          const locale = value as Locale;
          console.log('Setting language to Locale object:', locale);
          this.currentLanguage = locale;
          this.localeService.setLocale(locale.code);
        } else if ('value' in value) {
          // It's a dropdown selection object
          const dropdownValue = (value as any).value;
          console.log('Dropdown value:', dropdownValue);
          
          if (typeof dropdownValue === 'object' && 'code' in dropdownValue) {
            // It's a dropdown selection with a Locale value
            const locale = dropdownValue as Locale;
            console.log('Setting language from dropdown selection object:', locale);
            this.currentLanguage = locale;
            this.localeService.setLocale(locale.code);
          } else if (typeof dropdownValue === 'string') {
            // It's a dropdown selection with a string value
            const foundLocale = this.findLocale(dropdownValue);
            if (foundLocale) {
              console.log('Setting language from dropdown string value:', foundLocale);
              this.currentLanguage = foundLocale;
              this.localeService.setLocale(foundLocale.code);
            }
          }
        } else {
          console.log('Unrecognized object format:', value);
        }
      } catch (error) {
        console.error('Error processing language selection:', error);
      }
    }
  }

  get language(): Locale | undefined {
    return this.currentLanguage;
  }

  ngOnInit() {
    console.log('LocaleSelectorComponent initializing');
    
    try {
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
      
      if (this.localesCatalog.length === 0) {
        console.error('No valid locales found in the catalog');
      }
      
      console.log('Available locales:', this.localesCatalog);
      console.log('Available locale codes:', this.locales);

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
      
      // Ensure the component always has a valid language selected
      if (!this.currentLanguage && this.localesCatalog.length > 0) {
        this.currentLanguage = this.localesCatalog[0];
        console.log('Fallback to first available language:', this.currentLanguage);
      }
    } catch (error) {
      console.error('Error initializing locale selector:', error);
      // Fallback to first locale if available
      if (this.localesCatalog.length > 0) {
        this.currentLanguage = this.localesCatalog[0];
        console.log('Error recovery: setting default language:', this.currentLanguage);
      }
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
