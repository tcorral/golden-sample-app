import { DOCUMENT, LocationStrategy } from '@angular/common';
import { Inject, Injectable, InjectionToken, LOCALE_ID, OnInit } from '@angular/core';

/**
 * Interface for cookie options
 */
export interface CookieOptions {
  path?: string;
  domain?: string;
  expires?: string | Date;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

/**
 * Interface for URL construction options
 */
export interface UrlOptions {
  baseHref: string;
  locale: string;
  currentPath: string;
}

// eslint-disable-next-line @typescript-eslint/array-type
export const LOCALES_LIST = new InjectionToken<Array<string>>(
  'List of locales available'
);

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
    const cookieOptions: CookieOptions = {
      path: baseHref === '' ? '/' : baseHref,
      secure: true,
      sameSite: 'Lax'
    };
    
    // Clear any existing cookie first
    const expiredOptions: CookieOptions = {
      ...cookieOptions,
      expires: 'Thu, 01 Jan 1970 00:00:00 GMT'
    };
    this.setCookieWithOptions(COOKIE_NAME, '', expiredOptions);
    
    // Set the new cookie with future expiration
    const futureOptions: CookieOptions = {
      ...cookieOptions,
      expires: 'Tue, 19 Jan 2038 04:14:07 GMT'
    };
    this.setCookieWithOptions(COOKIE_NAME, locale, futureOptions);
  }

  /**
   * Sets a cookie with the given options
   * @param name The cookie name
   * @param value The cookie value
   * @param options The cookie options
   */
  private setCookieWithOptions(name: string, value: string, options: CookieOptions): void {
    const cookieParts: string[] = [`${name}=${encodeURIComponent(value)}`];
    
    if (options.path) {
      cookieParts.push(`path=${options.path}`);
    }
    
    if (options.domain) {
      cookieParts.push(`domain=${options.domain}`);
    }
    
    if (options.expires) {
      if (options.expires instanceof Date) {
        cookieParts.push(`expires=${options.expires.toUTCString()}`);
      } else {
        cookieParts.push(`expires=${options.expires}`);
      }
    }
    
    if (options.secure) {
      cookieParts.push('secure');
    }
    
    if (options.sameSite) {
      cookieParts.push(`samesite=${options.sameSite}`);
    }
    
    this.document.cookie = cookieParts.join('; ');
  }

  /**
   * Updates the URL with the new locale
   * @param locale The locale to set in the URL
   * @param baseHref The base href for the URL
   */
  private updateUrlWithLocale(locale: string, baseHref: string): void {
    const currentPath = this.document.location.pathname;
    const urlOptions: UrlOptions = {
      baseHref,
      locale,
      currentPath
    };
    
    // Escape special characters in baseHref for regex
    const escapedBaseHref = urlOptions.baseHref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // First check if the path already contains the target locale
    const targetLocalePattern = new RegExp(`^${escapedBaseHref}/${urlOptions.locale}(/|$)`);
    if (targetLocalePattern.test(urlOptions.currentPath)) {
      // Even if the URL has the correct locale, we need to refresh to apply the locale change
      this.document.location.reload();
      return;
    }
    
    // Check if the current path already has a locale
    let localeFound = false;
    let newPath = urlOptions.currentPath;
    
    for (const availableLocale of this.availableLocales) {
      // Create a pattern that matches the locale at the beginning of the path or after baseHref
      const localePattern = new RegExp(`^${escapedBaseHref}/${availableLocale}(/|$)`);
      if (localePattern.test(urlOptions.currentPath)) {
        // Replace existing locale in the path
        newPath = urlOptions.currentPath.replace(localePattern, `${urlOptions.baseHref}/${urlOptions.locale}/`);
        localeFound = true;
        break;
      }
    }
    
    if (!localeFound) {
      newPath = this.constructPathWithLocale(urlOptions.locale, urlOptions.baseHref, urlOptions.currentPath);
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
    const options: UrlOptions = {
      baseHref,
      locale,
      currentPath
    };
    
    // No locale in path, add the new locale
    if (currentPath === baseHref || currentPath === `${baseHref}/`) {
      // If we're at the root path, simply append the locale
      return `${options.baseHref}/${options.locale}/`;
    } else {
      // Otherwise, insert the locale after the base href
      const pathAfterBaseHref = options.currentPath.startsWith(options.baseHref) 
        ? options.currentPath.substring(options.baseHref.length) 
        : options.currentPath;
      
      // Ensure path starts with a slash if needed
      const normalizedPath = pathAfterBaseHref.startsWith('/') 
        ? pathAfterBaseHref 
        : `/${pathAfterBaseHref}`;
      
      return `${options.baseHref}/${options.locale}${normalizedPath}`;
    }
  }

  get currentLocale() {
    return this._currentLocale;
  }
}
