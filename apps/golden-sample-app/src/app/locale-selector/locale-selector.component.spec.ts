import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocaleSelectorComponent, Locale, DropdownSelection } from './locale-selector.component';
import { LOCALES_LIST, LocalesService } from './locales.service';
import { localesCatalog } from './locales-catalog';

describe('LocaleSelectorComponent', () => {
  let component: LocaleSelectorComponent;
  let fixture: ComponentFixture<LocaleSelectorComponent>;
  let localesService: jasmine.SpyObj<LocalesService>;
  
  const mockLocales = ['en', 'es'];
  const mockCurrentLocale = 'en';

  beforeEach(async () => {
    const localesServiceSpy = jasmine.createSpyObj('LocalesService', ['setLocale'], {
      currentLocale: mockCurrentLocale
    });

    await TestBed.configureTestingModule({
      declarations: [LocaleSelectorComponent],
      providers: [
        { provide: LocalesService, useValue: localesServiceSpy },
        { provide: LOCALES_LIST, useValue: mockLocales }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LocaleSelectorComponent);
    component = fixture.componentInstance;
    localesService = TestBed.inject(LocalesService) as jasmine.SpyObj<LocalesService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with locales from the catalog', () => {
    expect(component.localesCatalog.length).toBe(mockLocales.length);
    expect(component.localesCatalog[0]).toEqual(localesCatalog[mockLocales[0]]);
  });

  it('should set the current language based on the service locale', () => {
    expect(component.language).toEqual(localesCatalog[mockCurrentLocale]);
  });

  it('should handle string value in language setter', () => {
    // Arrange
    const newLocale = 'es';
    
    // Act
    component.language = newLocale;
    
    // Assert
    expect(localesService.setLocale).toHaveBeenCalledWith(localesCatalog[newLocale].code);
  });

  it('should handle Locale object in language setter', () => {
    // Arrange
    const newLocale: Locale = localesCatalog['es'];
    
    // Act
    component.language = newLocale;
    
    // Assert
    expect(localesService.setLocale).toHaveBeenCalledWith(newLocale.code);
  });

  it('should handle dropdown selection object in language setter', () => {
    // Arrange
    const newLocale: Locale = localesCatalog['es'];
    const dropdownSelection: DropdownSelection = { value: newLocale };
    
    // Act
    component.language = dropdownSelection;
    
    // Assert
    expect(localesService.setLocale).toHaveBeenCalledWith(newLocale.code);
  });

  it('should handle dropdown selection with string value', () => {
    // Arrange
    const localeCode = 'es';
    const dropdownSelection: DropdownSelection = { value: localeCode };
    
    // Act
    component.language = dropdownSelection;
    
    // Assert
    expect(localesService.setLocale).toHaveBeenCalledWith(localesCatalog[localeCode].code);
  });

  it('should not call setLocale if the same locale is selected', () => {
    // Arrange
    const currentLocale: Locale = localesCatalog[mockCurrentLocale];
    localesService.setLocale.calls.reset();
    
    // Act
    component.language = currentLocale;
    
    // Assert
    expect(localesService.setLocale).not.toHaveBeenCalled();
  });

  it('should handle errors gracefully', () => {
    // Arrange
    spyOn(console, 'error');
    localesService.setLocale.and.throwError('Test error');
    
    // Act
    component.language = 'es';
    
    // Assert
    expect(console.error).toHaveBeenCalled();
  });

  it('should fallback to first locale if no matching locale is found', () => {
    // Arrange
    localesService.currentLocale = 'invalid-locale';
    
    // Act
    component.ngOnInit();
    
    // Assert
    expect(component.language).toEqual(localesCatalog[mockLocales[0]]);
  });

  it('should load all the languages configured', () => {
    // Act
    component.ngOnInit();
    
    // Assert
    const locales = mockLocales.map(
      (locale) => localesCatalog[locale].name
    );
    expect(locales).toEqual(['English', 'Spanish']);
  });
});
