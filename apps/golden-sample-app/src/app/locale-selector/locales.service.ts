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
    console.log(`Setting locale from ${currentLocale} to ${locale}`);

    // Get base href without locale
    const baseHref = this.location
      .getBaseHref()
      .replace(new RegExp(`/${currentLocale}/?$`), '');
    console.log(`Base href: ${baseHref}`);

    const cookieValue = `${encodeURIComponent(
      'bb-locale'
    )}=${encodeURIComponent(locale)}`;
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
    return this.locale;
  }
}
