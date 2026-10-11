import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Utilisateur } from './auth.service';

export interface ModifierUtilisateurAdmin {
  nomComplet: string;
  email: string;
  role: number; // 0 = Admin, 1 = Utilisateur
  estActif: boolean;
}

@Injectable({ providedIn: 'root' })
export class UtilisateurService {
  private readonly apiUrl = 'http://localhost:5085/api/utilisateurs';

  constructor(private http: HttpClient) {}

  getUtilisateurs(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(this.apiUrl);
  }

  modifierUtilisateur(id: number, data: ModifierUtilisateurAdmin): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, data);
  }

  supprimerUtilisateur(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}