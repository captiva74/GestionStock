import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    const entetes: Record<string, string> = {
      Authorization: `Bearer ${token}`
    };

    // Le siège peut consulter une autre agence (le serveur revérifie le rôle)
    const agence = authService.getAgenceChoisie();
    if (agence !== null) {
      entetes['X-Agence'] = String(agence);
    }

    req = req.clone({ setHeaders: entetes });
  }

  return next(req);
};