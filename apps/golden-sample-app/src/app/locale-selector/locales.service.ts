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
    const currentLocale = this.locale;

    // Get base href without locale
    const baseHref = this.location
      .getBaseHref()
      .replace(new RegExp(`/${currentLocale}/?$`), '');

    const cookieValue = `${encodeURIComponent(
      'bb-locale'
    )}=${encodeURIComponent(locale)}`;
    const cookiePath = `path=${baseHref === '' ? '/' : baseHref}`;

    this.document.cookie = [cookieValue, cookiePath, COOKIE_ATTRIBUTES].join(
      '; '
    );

    if (locale !== currentLocale) {
      // Force reload with the new locale
      const currentPath = this.document.location.pathname;
      const localePattern = new RegExp(`^${baseHref}/${currentLocale}/`);
      
      let newPath;
      if (localePattern.test(currentPath)) {
        // Replace current locale in the path
        newPath = currentPath.replace(localePattern, `${baseHref}/${locale}/`);
      } else {
        // Add new locale to the path
        newPath = `${baseHref}/${locale}${currentPath.startsWith(baseHref) ? currentPath.substring(baseHref.length) : currentPath}`;
      }
      
      // Preserve query parameters and hash
      const queryAndHash = this.document.location.search + this.document.location.hash;
      this.document.location.href = newPath + queryAndHash;
    }
  }

  get currentLocale() {
    return this.locale;
  }
}
