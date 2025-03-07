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
    
    // Only proceed if we have a valid cookie locale that's in our available locales
    if (cookieLocale && this.availableLocales.includes(cookieLocale)) {
      console.log(`Applying cookie locale: ${cookieLocale}`);
      this._currentLocale = cookieLocale;
      
      // Check if the URL needs to be updated to match the cookie locale
      const currentPath = this.document.location.pathname;
      const baseHref = this.location.getBaseHref();
      
      // Check if the current URL contains any of the available locales
      let hasLocaleInPath = false;
      let currentPathLocale = '';
      
      for (const availableLocale of this.availableLocales) {
        const localePattern = new RegExp(`^${baseHref}/${availableLocale}(/|$)`);
        if (localePattern.test(currentPath)) {
          hasLocaleInPath = true;
          currentPathLocale = availableLocale;
          break;
        }
      }
      
      // If URL has a different locale than the cookie, update it
      if (hasLocaleInPath && currentPathLocale !== cookieLocale) {
        console.log(`URL has locale ${currentPathLocale} but cookie has ${cookieLocale}, redirecting...`);
        this.setLocale(cookieLocale);
      }
      
      // If no locale in path, add the cookie locale
      if (!hasLocaleInPath) {
        console.log(`URL doesn't have any locale, adding ${cookieLocale}...`);
        this.setLocale(cookieLocale);
      }
    } else {
      // If no valid cookie locale, use the default locale from LOCALE_ID
      console.log(`No valid cookie locale, using default: ${this.locale}`);
      this._currentLocale = this.locale;
    }
  }

  private getCookieValue(name: string): string | null {
    const cookies = this.document.cookie.split(';');
    console.log('All cookies:', this.document.cookie);
    
    for (const cookie of cookies) {
      if (!cookie.trim()) continue;
      
      const parts = cookie.trim().split('=');
      const cookieName = parts[0].trim();
      const cookieValue = parts.length > 1 ? parts[1].trim() : '';
      
      console.log(`Checking cookie: ${cookieName} = ${cookieValue}`);
      
      if (cookieName === name || cookieName === encodeURIComponent(name)) {
        const decodedValue = decodeURIComponent(cookieValue);
        console.log(`Found cookie ${name} with value ${decodedValue}`);
        return decodedValue;
      }
    }
    
    console.log(`Cookie ${name} not found`);
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
    // Make sure the cookie is set with the correct domain and path
    const cookieValue = `${COOKIE_NAME}=${encodeURIComponent(locale)}`;
    const cookiePath = `path=${baseHref === '' ? '/' : baseHref}`;
    
    // Clear any existing cookie first
    this.document.cookie = `${COOKIE_NAME}=; ${cookiePath}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    
    // Set the new cookie
    this.document.cookie = [cookieValue, cookiePath, COOKIE_ATTRIBUTES].join(
      '; '
    );
    console.log(`Set cookie: ${cookieValue}`);

    // Always redirect to apply the locale change
    // Force reload with the new locale
    const currentPath = this.document.location.pathname;
    console.log(`Current path: ${currentPath}`);
    
    // Check if the current path already has a locale
    let localeFound = false;
    let newPath = currentPath;
    
    // Escape special characters in baseHref for regex
    const escapedBaseHref = baseHref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // First check if the path already contains the target locale
    const targetLocalePattern = new RegExp(`^${escapedBaseHref}/${locale}(/|$)`);
    if (targetLocalePattern.test(currentPath)) {
      console.log(`Path already contains the target locale ${locale}, no need to change URL`);
      return; // No need to redirect if we're already on the correct locale
    }
    
    for (const availableLocale of this.availableLocales) {
      // Create a pattern that matches the locale at the beginning of the path or after baseHref
      const localePattern = new RegExp(`^${escapedBaseHref}/${availableLocale}(/|$)`);
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

  get currentLocale() {
    return this._currentLocale;
  }
}
