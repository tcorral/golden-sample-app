import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
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
    @Inject(LOCALES_LIST) public locales: string[],
    private cdr: ChangeDetectorRef
  ) {}

  set language(value: string | object | Locale | undefined) {
    if (typeof value === 'string') {
      // Find the locale object by code if a string is passed
      const localeObj = this.findLocale(value);
      if (localeObj) {
        this.currentLanguage = localeObj;
        this.localeService.setLocale(localeObj.code);
      }
      return;
    }

    if (value && typeof value === 'object' && 'code' in value) {
      this.currentLanguage = value as Locale;
      this.localeService.setLocale((value as Locale).code);
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
  }

  onLanguageSelect(value: Locale | string | object) {
    if (typeof value === 'object' && 'code' in value) {
      const locale = value as Locale;
      this.currentLanguage = locale;
      this.localeService.setLocale(locale.code);
      this.cdr.detectChanges();
    }
  }

  private findLocale(locale: string): Locale | undefined {
    if (this.locales.includes(locale)) {
      return localesCatalog[locale];
    }

    return undefined;
  }
}
