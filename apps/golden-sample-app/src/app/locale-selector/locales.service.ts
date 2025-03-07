import { DOCUMENT, LocationStrategy } from '@angular/common';
import { Inject, Injectable, InjectionToken, LOCALE_ID, OnInit } from '@angular/core';

// eslint-disable-next-line @typescript-eslint/array-type
export const LOCALES_LIST = new InjectionToken<Array<string>>(
  'List of locales available'
);

// Use 2038 year to avoid issues with some browsers that don't support dates after 2038
const COOKIE_ATTRIBUTES =
  'expires=Tue, 19 Jan 2038 04:14:07 GMT; secure; samesite=Lax;';

const COOKIE_NAME = 'bb-locale';

@Injectable()
export class LocalesService implements OnInit {
  private _currentLocale: string;

  constructor(
    private location: LocationStrategy,
    @Inject(LOCALE_ID) private locale: string,
    @Inject(DOCUMENT) private document: Document,
    @Inject(LOCALES_LIST) private availableLocales: string[]
  ) {
    this._currentLocale = locale;
    this.initLocaleFromCookie();
  }

  ngOnInit(): void {
    this.initLocaleFromCookie();
  }

  private initLocaleFromCookie(): void {
    const cookieLocale = this.getCookieValue(COOKIE_NAME);
    console.log(`Cookie locale: ${cookieLocale}`);
    
    if (cookieLocale && this.availableLocales.includes(cookieLocale) && cookieLocale !== this._currentLocale) {
      console.log(`Applying cookie locale: ${cookieLocale}`);
      this._currentLocale = cookieLocale;
      
      // Apply the locale from cookie if it's different from the current URL
      const currentPath = this.document.location.pathname;
      const baseHref = this.location.getBaseHref();
      const localePattern = new RegExp(`^${baseHref}/${this.locale}/`);
      
      if (!localePattern.test(currentPath)) {
        console.log(`Current URL doesn't match cookie locale, redirecting...`);
        this.setLocale(cookieLocale);
      }
    }
  }

  private getCookieValue(name: string): string | null {
    const cookies = this.document.cookie.split(';');
    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split('=');
      if (cookieName === encodeURIComponent(name)) {
        return decodeURIComponent(cookieValue);
      }
    }
    return null;
  }

  setLocale(locale: string) {
    const currentLocale = this._currentLocale;
    console.log(`Setting locale from ${currentLocale} to ${locale}`);

    // Update internal state
    this._currentLocale = locale;

    // Get base href without locale
    const baseHref = this.location
      .getBaseHref()
      .replace(new RegExp(`/${currentLocale}/?$`), '');
    console.log(`Base href: ${baseHref}`);

    // Set the cookie with the new locale
    const cookieValue = `${encodeURIComponent(COOKIE_NAME)}=${encodeURIComponent(locale)}`;
    const cookiePath = `path=${baseHref === '' ? '/' : baseHref}`;

    this.document.cookie = [cookieValue, cookiePath, COOKIE_ATTRIBUTES].join(
      '; '
    );
    console.log(`Set cookie: ${cookieValue}`);

    if (locale !== currentLocale) {
      // Force reload with the new locale
      const currentPath = this.document.location.pathname;
      console.log(`Current path: ${currentPath}`);
      const localePattern = new RegExp(`^${baseHref}/${currentLocale}/`);
      console.log(`Locale pattern: ${localePattern}`);
      
      let newPath;
      if (localePattern.test(currentPath)) {
        // Replace current locale in the path
        newPath = currentPath.replace(localePattern, `${baseHref}/${locale}/`);
        console.log(`Replacing locale in path: ${newPath}`);
      } else {
        // Add new locale to the path
        newPath = `${baseHref}/${locale}${currentPath.startsWith(baseHref) ? currentPath.substring(baseHref.length) : currentPath}`;
        console.log(`Adding locale to path: ${newPath}`);
      }
      
      // Preserve query parameters and hash
      const queryAndHash = this.document.location.search + this.document.location.hash;
      const finalUrl = newPath + queryAndHash;
      console.log(`Redirecting to: ${finalUrl}`);
      this.document.location.href = finalUrl;
    }
  }

  get currentLocale() {
    return this._currentLocale;
  }
}
