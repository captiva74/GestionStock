import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export enum TypeMouvementStock {
  Entree = 0,
  Sortie = 1
}

export interface MouvementStock {
  id: number;
  articleId: number;
  article?: {
    id: number;
    nom: string;
    reference: string | null;
  } | null;

  fournisseurId?: number | null;
  fournisseur?: {
    id: number;
    nom: string;
    prenom: string;
    activite?: string;
  } | null;

  typeMouvement: TypeMouvementStock;
  quantite: number;
  dateMouvement: string;
  motif?: string | null;
}

export interface NouveauMouvement {
  articleId: number;
  typeMouvement: TypeMouvementStock;
  quantite: number;
  motif?: string | null;
  fournisseurId?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class MouvementStockService {
  private readonly apiUrl = 'http://localhost:5085/api/mouvementsstock';

  constructor(private http: HttpClient) {}

  getMouvements(): Observable<MouvementStock[]> {
    return this.http.get<MouvementStock[]>(this.apiUrl);
  }

  getMouvementsParArticle(
    articleId: number
  ): Observable<MouvementStock[]> {
    return this.http.get<MouvementStock[]>(
      `${this.apiUrl}/article/${articleId}`
    );
  }

  ajouterMouvement(
    mouvement: NouveauMouvement
  ): Observable<MouvementStock> {
    return this.http.post<MouvementStock>(this.apiUrl, mouvement);
  }

  supprimerMouvement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
