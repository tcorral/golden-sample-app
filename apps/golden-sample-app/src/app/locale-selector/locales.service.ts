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

  /**
   * Initializes the locale from the cookie and updates URL if needed
   */
  private initLocaleFromCookie(): void {
    try {
      const cookieLocale = this.getCookieValue(COOKIE_NAME);
      
      // Only proceed if we have a valid cookie locale that's in our available locales
      if (cookieLocale && this.availableLocales.includes(cookieLocale)) {
        this._currentLocale = cookieLocale;
        
        // Check if the URL needs to be updated to match the cookie locale
        const currentPath = this.document.location.pathname;
        const baseHref = this.location.getBaseHref();
        
        // Escape special characters in baseHref for regex
        const escapedBaseHref = baseHref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Check if the current URL contains any of the available locales
        let hasLocaleInPath = false;
        let currentPathLocale = '';
        
        for (const availableLocale of this.availableLocales) {
          const localePattern = new RegExp(`^${escapedBaseHref}/${availableLocale}(/|$)`);
          if (localePattern.test(currentPath)) {
            hasLocaleInPath = true;
            currentPathLocale = availableLocale;
            break;
          }
        }
        
        // If URL has a different locale than the cookie, update it
        if (hasLocaleInPath && currentPathLocale !== cookieLocale) {
          this.setLocale(cookieLocale);
        }
        
        // If no locale in path, add the cookie locale
        if (!hasLocaleInPath) {
          this.setLocale(cookieLocale);
        }
      } else {
        // If no valid cookie locale, use the default locale from LOCALE_ID
        this._currentLocale = this.locale;
      }
    } catch (error) {
      console.error('Error initializing locale from cookie:', error);
      // Fallback to default locale
      this._currentLocale = this.locale;
    }
  }

  /**
   * Gets a cookie value by name
   * @param name The name of the cookie to retrieve
   * @returns The cookie value or null if not found
   */
  private getCookieValue(name: string): string | null {
    const cookies = this.document.cookie.split(';');
    
    for (const cookie of cookies) {
      if (!cookie.trim()) continue;
      
      const parts = cookie.trim().split('=');
      const cookieName = parts[0].trim();
      const cookieValue = parts.length > 1 ? parts[1].trim() : '';
      
      if (cookieName === name || cookieName === encodeURIComponent(name)) {
        return decodeURIComponent(cookieValue);
      }
    }
    
    return null;
  }

  /**
   * Sets the application locale and updates the URL
   * @param locale The locale code to set
   */
  setLocale(locale: string): void {
    const currentLocale = this._currentLocale;

    // Don't proceed if the locale is already set to the requested one
    if (locale === currentLocale) {
      return;
    }

    // Update internal state
    this._currentLocale = locale;

    // Get base href
    const baseHref = this.location.getBaseHref();

    // Set the cookie with the new locale
    this.setCookie(locale, baseHref);

    // Update the URL with the new locale
    this.updateUrlWithLocale(locale, baseHref);
  }

  /**
   * Sets the locale cookie
   * @param locale The locale to set in the cookie
   * @param baseHref The base href for the cookie path
   */
  private setCookie(locale: string, baseHref: string): void {
    const cookieValue = `${COOKIE_NAME}=${encodeURIComponent(locale)}`;
    const cookiePath = `path=${baseHref === '' ? '/' : baseHref}`;
    
    // Clear any existing cookie first
    this.document.cookie = `${COOKIE_NAME}=; ${cookiePath}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    
    // Set the new cookie
    this.document.cookie = [cookieValue, cookiePath, COOKIE_ATTRIBUTES].join(
      '; '
    );
  }

  /**
   * Updates the URL with the new locale
   * @param locale The locale to set in the URL
   * @param baseHref The base href for the URL
   */
  private updateUrlWithLocale(locale: string, baseHref: string): void {
    const currentPath = this.document.location.pathname;
    
    // Escape special characters in baseHref for regex
    const escapedBaseHref = baseHref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // First check if the path already contains the target locale
    const targetLocalePattern = new RegExp(`^${escapedBaseHref}/${locale}(/|$)`);
    if (targetLocalePattern.test(currentPath)) {
      // Even if the URL has the correct locale, we need to refresh to apply the locale change
      this.document.location.reload();
      return;
    }
    
    // Check if the current path already has a locale
    let localeFound = false;
    let newPath = currentPath;
    
    for (const availableLocale of this.availableLocales) {
      // Create a pattern that matches the locale at the beginning of the path or after baseHref
      const localePattern = new RegExp(`^${escapedBaseHref}/${availableLocale}(/|$)`);
      if (localePattern.test(currentPath)) {
        // Replace existing locale in the path
        newPath = currentPath.replace(localePattern, `${baseHref}/${locale}/`);
        localeFound = true;
        break;
      }
    }
    
    if (!localeFound) {
      newPath = this.constructPathWithLocale(locale, baseHref, currentPath);
    }
    
    // Preserve query parameters and hash
    const queryAndHash = this.document.location.search + this.document.location.hash;
    const finalUrl = newPath + queryAndHash;
    this.document.location.href = finalUrl;
  }

  /**
   * Constructs a new path with the locale added
   * @param locale The locale to add to the path
   * @param baseHref The base href for the URL
   * @param currentPath The current path
   * @returns The new path with the locale added
   */
  private constructPathWithLocale(locale: string, baseHref: string, currentPath: string): string {
    // No locale in path, add the new locale
    if (currentPath === baseHref || currentPath === `${baseHref}/`) {
      // If we're at the root path, simply append the locale
      return `${baseHref}/${locale}/`;
    } else {
      // Otherwise, insert the locale after the base href
      const pathAfterBaseHref = currentPath.startsWith(baseHref) 
        ? currentPath.substring(baseHref.length) 
        : currentPath;
      
      // Ensure path starts with a slash if needed
      const normalizedPath = pathAfterBaseHref.startsWith('/') 
        ? pathAfterBaseHref 
        : `/${pathAfterBaseHref}`;
      
      return `${baseHref}/${locale}${normalizedPath}`;
    }
  }

  get currentLocale() {
    return this._currentLocale;
  }
}
