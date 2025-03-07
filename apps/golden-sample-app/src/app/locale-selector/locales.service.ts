import { DOCUMENT, LocationStrategy } from '@angular/common';
import { Inject, Injectable, InjectionToken, LOCALE_ID } from '@angular/core';

// eslint-disable-next-line @typescript-eslint/array-type
export const LOCALES_LIST = new InjectionToken<Array<string>>(
  'List of locales available'
);

// Use 2038 year to avoid issues with some browsers that don't support dates after 2038
const COOKIE_ATTRIBUTES =
  'expires=Tue, 19 Jan 2038 04:14:07 GMT; secure; samesite=Lax;';

@Injectable()
export class LocalesService {
  constructor(
    private location: LocationStrategy,
    @Inject(LOCALE_ID) private locale: string,
    @Inject(DOCUMENT) private document: Document
  ) {}

  setLocale(locale: string) {
    if (!locale) {
      console.error('Attempted to set empty locale');
      return;
    }
    
    const currentLocale = this.locale;

    // Get base href without locale
    const baseHref = this.location
      .getBaseHref()
      .replace(new RegExp(`/${currentLocale}/?$`), '');

    const cookieValue = `${encodeURIComponent(
      'bb-locale'
    )}=${encodeURIComponent(locale)}`;
    const cookiePath = `path=${baseHref === '' ? '/' : baseHref}`;

    // Set the cookie
    this.document.cookie = [cookieValue, cookiePath, COOKIE_ATTRIBUTES].join(
      '; '
    );

    if (locale !== currentLocale) {
      const fullPath = this.location.path(true);
      const basePathRegex = new RegExp(`^${baseHref}/${currentLocale}/?`);

      // If the path doesn't include the current locale pattern, just reload the page
      // This handles the case where the app might be at the root path
      if (!basePathRegex.test(fullPath)) {
        // Construct a URL with the new locale
        const newUrl = `${baseHref}/${locale}/`;
        this.document.location.href = newUrl;
        return;
      }

      // Get path without base href and locale
      const path = fullPath.replace(basePathRegex, '');

      // Navigate to the same path but with the new locale
      this.document.location.href = `${baseHref}/${locale}/${path}`;
    }
  }

  get currentLocale() {
    return this.locale;
  }
}
