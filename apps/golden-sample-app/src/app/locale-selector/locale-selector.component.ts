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
    
    try {
      // Handle different value types
      if (typeof value === 'string') {
        // Handle string values
        const foundLocale = this.findLocale(value);
        if (foundLocale) {
          console.log('Found locale for string value:', foundLocale);
          if (this.currentLanguage?.code !== foundLocale.code) {
            this.currentLanguage = foundLocale;
            this.localeService.setLocale(foundLocale.code);
          }
        } else {
          console.log('Could not find locale for string value:', value);
        }
        return;
      }
      
      if (typeof value === 'object') {
        // Handle dropdown menu selection which comes as {value: Locale}
        if ('value' in value) {
          const dropdownValue = (value as any).value;
          console.log('Dropdown value:', dropdownValue);
          
          if (typeof dropdownValue === 'object' && 'code' in dropdownValue) {
            // It's a dropdown selection with a Locale value
            const locale = dropdownValue as Locale;
            console.log('Setting language from dropdown selection object:', locale);
            if (this.currentLanguage?.code !== locale.code) {
              this.currentLanguage = locale;
              this.localeService.setLocale(locale.code);
            }
          } else if (typeof dropdownValue === 'string') {
            // It's a dropdown selection with a string value
            const foundLocale = this.findLocale(dropdownValue);
            if (foundLocale) {
              console.log('Setting language from dropdown string value:', foundLocale);
              if (this.currentLanguage?.code !== foundLocale.code) {
                this.currentLanguage = foundLocale;
                this.localeService.setLocale(foundLocale.code);
              }
            }
          }
        } 
        // Handle direct Locale object
        else if ('code' in value && typeof value.code === 'string') {
          // It's a Locale object
          const locale = value as Locale;
          console.log('Setting language to Locale object:', locale);
          if (this.currentLanguage?.code !== locale.code) {
            this.currentLanguage = locale;
            this.localeService.setLocale(locale.code);
          }
        } else {
          console.log('Unrecognized object format:', value);
        }
      }
    } catch (error) {
      console.error('Error processing language selection:', error);
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
        return; // Exit early if no locales are available
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
      if (!this.currentLanguage) {
        this.currentLanguage = this.localesCatalog[0];
        console.log('Setting default language:', this.currentLanguage);
        
        // Apply the default language if it's different from the current locale
        if (this.currentLanguage.code !== currentLocale) {
          console.log('Applying default language as current locale is different');
          this.localeService.setLocale(this.currentLanguage.code);
        }
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
