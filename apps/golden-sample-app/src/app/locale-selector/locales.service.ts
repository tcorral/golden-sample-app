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
    
    if (cookieLocale && this.availableLocales.includes(cookieLocale)) {
      console.log(`Applying cookie locale: ${cookieLocale}`);
      this._currentLocale = cookieLocale;
      
      // Check if the URL needs to be updated to match the cookie locale
      const currentPath = this.document.location.pathname;
      const baseHref = this.location.getBaseHref();
      
      // Check if the current URL contains any of the available locales
      let hasLocaleInPath = false;
      for (const availableLocale of this.availableLocales) {
        const localePattern = new RegExp(`^${baseHref}/${availableLocale}/`);
        if (localePattern.test(currentPath)) {
          hasLocaleInPath = true;
          // If URL has a different locale than the cookie, update it
          if (availableLocale !== cookieLocale) {
            console.log(`URL has locale ${availableLocale} but cookie has ${cookieLocale}, redirecting...`);
            this.setLocale(cookieLocale);
          }
          break;
        }
      }
      
      // If no locale in path, add the cookie locale
      if (!hasLocaleInPath) {
        console.log(`URL doesn't have any locale, adding ${cookieLocale}...`);
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

    // Get base href
    const baseHref = this.location.getBaseHref();
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
      
      // Check if the current path already has a locale
      let localeFound = false;
      let newPath = currentPath;
      
      for (const availableLocale of this.availableLocales) {
        const localePattern = new RegExp(`^${baseHref}/${availableLocale}/`);
        if (localePattern.test(currentPath)) {
          // Replace existing locale in the path
          newPath = currentPath.replace(localePattern, `${baseHref}/${locale}/`);
          console.log(`Replacing locale ${availableLocale} with ${locale} in path: ${newPath}`);
          localeFound = true;
          break;
        }
      }
      
      if (!localeFound) {
        // No locale in path, add the new locale
        if (currentPath === baseHref || currentPath === `${baseHref}/`) {
          // If we're at the root path, simply append the locale
          newPath = `${baseHref}/${locale}/`;
        } else {
          // Otherwise, insert the locale after the base href
          const pathAfterBaseHref = currentPath.startsWith(baseHref) 
            ? currentPath.substring(baseHref.length) 
            : currentPath;
          
          // Ensure path starts with a slash if needed
          const normalizedPath = pathAfterBaseHref.startsWith('/') 
            ? pathAfterBaseHref 
            : `/${pathAfterBaseHref}`;
          
          newPath = `${baseHref}/${locale}${normalizedPath}`;
        }
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
