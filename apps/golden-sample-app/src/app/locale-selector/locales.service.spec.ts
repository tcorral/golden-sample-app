import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { LOCALE_ID } from '@angular/core';
import { LocationStrategy } from '@angular/common';
import { LocalesService, LOCALES_LIST, CookieOptions } from './locales.service';

describe('LocalesService', () => {
  let service: LocalesService;
  let documentMock: any;
  let locationStrategyMock: jasmine.SpyObj<LocationStrategy>;
  
  const mockLocales = ['en', 'es', 'fr'];
  const mockLocaleId = 'en';
  const cookieName = 'bb-locale';

  beforeEach(() => {
    // Create mock document with cookie handling
    documentMock = {
      cookie: '',
      location: {
        pathname: '/test-app/en/some/path',
        search: '',
        hash: '',
        href: 'http://localhost:4200/test-app/en/some/path',
        reload: jasmine.createSpy('reload')
      }
    };

    // Create mock location strategy
    locationStrategyMock = jasmine.createSpyObj('LocationStrategy', ['getBaseHref']);
    locationStrategyMock.getBaseHref.and.returnValue('/test-app/en/');

    TestBed.configureTestingModule({
      providers: [
        LocalesService,
        { provide: DOCUMENT, useValue: documentMock },
        { provide: LocationStrategy, useValue: locationStrategyMock },
        { provide: LOCALE_ID, useValue: mockLocaleId },
        { provide: LOCALES_LIST, useValue: mockLocales }
      ]
    });
    
    service = TestBed.inject(LocalesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with the default locale', () => {
    expect(service.currentLocale).toBe(mockLocaleId);
  });

  describe('setLocale', () => {
    it('should set a cookie when setting locale', () => {
      // Arrange
      const newLocale = 'es';
      spyOn(documentMock.location, 'href').and.callFake((value: string) => {
        documentMock.location._href = value;
      });
      
      // Act
      service.setLocale(newLocale);
      
      // Assert
      expect(documentMock.cookie).toContain(`${cookieName}=${newLocale}`);
    });

    it('should redirect to the new locale URL', () => {
      // Arrange
      const newLocale = 'es';
      let redirectUrl = '';
      spyOn(Object.getOwnPropertyDescriptor(documentMock.location, 'href'), 'set').and.callFake((value: string) => {
        redirectUrl = value;
      });
      
      // Act
      service.setLocale(newLocale);
      
      // Assert
      expect(redirectUrl).toContain(`/test-app/${newLocale}/`);
    });

    it('should reload the page if already on the correct locale path', () => {
      // Arrange
      documentMock.location.pathname = '/test-app/es/some/path';
      const newLocale = 'es';
      
      // Act
      service.setLocale(newLocale);
      
      // Assert
      expect(documentMock.location.reload).toHaveBeenCalled();
    });

    it('should not redirect if the locale is already set', () => {
      // Arrange
      const currentLocale = service.currentLocale;
      spyOn(Object.getOwnPropertyDescriptor(documentMock.location, 'href'), 'set');
      
      // Act
      service.setLocale(currentLocale);
      
      // Assert
      expect(Object.getOwnPropertyDescriptor(documentMock.location, 'href')!.set).not.toHaveBeenCalled();
    });
  });

  describe('cookie handling', () => {
    it('should set cookie with correct options', () => {
      // Arrange
      const newLocale = 'fr';
      
      // Act
      service.setLocale(newLocale);
      
      // Assert
      expect(documentMock.cookie).toContain('path=/test-app');
      expect(documentMock.cookie).toContain('secure');
      expect(documentMock.cookie).toContain('samesite=Lax');
    });

    it('should read cookie value correctly', () => {
      // Arrange
      documentMock.cookie = `${cookieName}=fr`;
      
      // Act
      (service as any).initLocaleFromCookie();
      
      // Assert
      expect(service.currentLocale).toBe('fr');
    });

    it('should handle URL with no locale', () => {
      // Arrange
      documentMock.location.pathname = '/test-app/some/path';
      documentMock.cookie = `${cookieName}=es`;
      let redirectUrl = '';
      spyOn(Object.getOwnPropertyDescriptor(documentMock.location, 'href'), 'set').and.callFake((value: string) => {
        redirectUrl = value;
      });
      
      // Act
      (service as any).initLocaleFromCookie();
      
      // Assert
      expect(redirectUrl).toContain('/test-app/es/');
    });
  });

  describe('error handling', () => {
    it('should handle errors gracefully when initializing from cookie', () => {
      // Arrange
      spyOn(console, 'error');
      spyOn((service as any), 'getCookieValue').and.throwError('Test error');
      
      // Act
      (service as any).initLocaleFromCookie();
      
      // Assert
      expect(console.error).toHaveBeenCalled();
      expect(service.currentLocale).toBe(mockLocaleId); // Should fall back to default
    });
  });

  describe('URL handling', () => {
    it('should construct path with locale correctly for root path', () => {
      // Arrange
      const baseHref = '/test-app/';
      const locale = 'fr';
      const currentPath = '/test-app/';
      
      // Act
      const result = (service as any).constructPathWithLocale(locale, baseHref, currentPath);
      
      // Assert
      expect(result).toBe('/test-app/fr/');
    });

    it('should construct path with locale correctly for non-root path', () => {
      // Arrange
      const baseHref = '/test-app/';
      const locale = 'fr';
      const currentPath = '/test-app/some/path';
      
      // Act
      const result = (service as any).constructPathWithLocale(locale, baseHref, currentPath);
      
      // Assert
      expect(result).toBe('/test-app/fr/some/path');
    });
  });
});
