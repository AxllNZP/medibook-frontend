import { ApplicationConfig, provideBrowserGlobalErrorListeners, LOCALE_ID } from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

// 1. Importamos la función que registra los datos del idioma
import { registerLocaleData } from '@angular/common';
// 2. Importamos los datos específicos del español
import localeEs from '@angular/common/locales/es';

// 3. Ejecutamos el registro UNA sola vez al iniciar la app
registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withRouterConfig({ onSameUrlNavigation: 'reload' })),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
    // 4. Le decimos a toda la app que use 'es' como idioma
    { provide: LOCALE_ID, useValue: 'es' }
  ]
};