import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Fournisseur {
  id: number;
  nom: string;
  prenom: string;
  activite: string;
  adresse?: string | null;
  email?: string | null;
  numTelephone?: string | null;
}

export interface NouveauFournisseur {
  nom: string;
  prenom: string;
  activite: string;
  adresse?: string | null;
  email?: string | null;
  numTelephone?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class FournisseurService {
  private readonly apiUrl = 'http://localhost:5085/api/fournisseurs';

  constructor(private http: HttpClient) {}

  getFournisseurs(): Observable<Fournisseur[]> {
    return this.http.get<Fournisseur[]>(this.apiUrl);
  }

  getFournisseur(id: number): Observable<Fournisseur> {
    return this.http.get<Fournisseur>(`${this.apiUrl}/${id}`);
  }

  ajouterFournisseur(
    fournisseur: NouveauFournisseur
  ): Observable<Fournisseur> {
    return this.http.post<Fournisseur>(this.apiUrl, fournisseur);
  }

  modifierFournisseur(
    id: number,
    fournisseur: Fournisseur
  ): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, fournisseur);
  }

  supprimerFournisseur(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
