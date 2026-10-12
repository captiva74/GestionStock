import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface AuthResponse {
  token: string;
  id: number;
  nomComplet: string;
  email: string;
  role: string;
}

export interface Utilisateur {
  id: number;
  nomComplet: string;
  email: string;
  role: string;
  estActif: boolean;
  dateCreation: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'http://localhost:5085/api/auth';
  private readonly cleToken = 'gs_token';
  private readonly cleUtilisateur = 'gs_utilisateur';

  private utilisateurCourantSubject = new BehaviorSubject<AuthResponse | null>(
    this.lireUtilisateurStocke()
  );
  utilisateurCourant$ = this.utilisateurCourantSubject.asObservable();

  constructor(private http: HttpClient) {}

  private lireUtilisateurStocke(): AuthResponse | null {
    const data = localStorage.getItem(this.cleUtilisateur);
    return data ? JSON.parse(data) : null;
  }

  login(email: string, motDePasse: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, { email, motDePasse })
      .pipe(tap((reponse) => this.enregistrerSession(reponse)));
  }

  register(
    nomComplet: string,
    email: string,
    motDePasse: string,
    codeStructure: number,
    codeInscription: string
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/register`, {
      nomComplet,
      email,
      motDePasse,
      codeStructure,
      codeInscription
    });
  }

  motDePasseOublie(email: string): Observable<string> {
    return this.http.post(`${this.apiUrl}/mot-de-passe-oublie`, { email }, { responseType: 'text' });
  }

  reinitialiserMotDePasse(email: string, token: string, nouveauMotDePasse: string): Observable<string> {
    return this.http.post(
      `${this.apiUrl}/reinitialiser-mot-de-passe`,
      { email, token, nouveauMotDePasse },
      { responseType: 'text' }
    );
  }

  getProfil(): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.apiUrl}/profil`);
  }

  modifierProfil(nomComplet: string, email: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/profil`, { nomComplet, email }).pipe(
      tap(() => {
        const courant = this.utilisateurCourantSubject.value;
        if (courant) {
          const maj = { ...courant, nomComplet, email };
          localStorage.setItem(this.cleUtilisateur, JSON.stringify(maj));
          this.utilisateurCourantSubject.next(maj);
        }
      })
    );
  }

  changerMotDePasse(ancienMotDePasse: string, nouveauMotDePasse: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/changer-mot-de-passe`, {
      ancienMotDePasse,
      nouveauMotDePasse
    });
  }

  private enregistrerSession(reponse: AuthResponse): void {
    localStorage.setItem(this.cleToken, reponse.token);
    localStorage.setItem(this.cleUtilisateur, JSON.stringify(reponse));
    this.utilisateurCourantSubject.next(reponse);
  }

    // Agence consultée par l'admin du siège (null = sa propre agence)
  private readonly cleAgenceChoisie = 'gs_agence_choisie';

  getAgenceChoisie(): number | null {
    if (!this.estSuperAdmin()) {
      return null;
    }
    const valeur = Number(localStorage.getItem(this.cleAgenceChoisie));
    return Number.isInteger(valeur) && valeur >= 201 && valeur <= 269 ? valeur : null;
  }

  choisirAgence(codeStructure: number | null): void {
    if (codeStructure === null) {
      localStorage.removeItem(this.cleAgenceChoisie);
    } else {
      localStorage.setItem(this.cleAgenceChoisie, String(codeStructure));
    }
  }

  deconnexion(): void {
    localStorage.removeItem(this.cleToken);
    localStorage.removeItem(this.cleUtilisateur);
    localStorage.removeItem(this.cleAgenceChoisie);
    this.utilisateurCourantSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.cleToken);
  }

  estConnecte(): boolean {
    return !!this.getToken();
  }

  // Admin du siège ou admin d'agence : accès aux écrans d'administration
  estAdmin(): boolean {
    const role = this.utilisateurCourantSubject.value?.role;
    return role === 'Admin' || role === 'AdminAgence';
  }

  // Siège uniquement
  estSuperAdmin(): boolean {
    return this.utilisateurCourantSubject.value?.role === 'Admin';
  }

  get utilisateurCourant(): AuthResponse | null {
    return this.utilisateurCourantSubject.value;
  }
}