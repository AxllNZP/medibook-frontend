import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withRouterConfig({ onSameUrlNavigation: 'reload' })),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // HttpClient disponible en toda la app + nuestro interceptor registrado
    provideHttpClient(withInterceptors([authInterceptor])),
    // Animaciones de Angular Material
    provideAnimationsAsync()
  ]
};