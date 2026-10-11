import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export enum TypeGestionArticle {
  MaterielIndividuel = 0,
  Fourniture = 1
}

export interface Article {
  id: number;
  typeGestion: TypeGestionArticle;
  reference: string | null;
  nom: string;
  categorieId: number;
  categorie?: {
    id: number;
    nom: string;
  } | null;
  marque?: string | null;
  modele?: string | null;
  numeroSerie?: string | null;
  dateAcquisition?: string | null;
  valeurAcquisition: number;
  serviceAffectation?: string | null;
  bureauAffectation?: string | null;
  etat: string;
  observations?: string | null;
  estActif: boolean;
  quantiteStock: number;
  seuilMinimum: number;
}

export interface NouvelArticle {
  typeGestion: TypeGestionArticle;
  reference: string | null;
  nom: string;
  categorieId: number;
  marque?: string | null;
  modele?: string | null;
  numeroSerie?: string | null;
  dateAcquisition?: string | null;
  valeurAcquisition: number;
  serviceAffectation?: string | null;
  bureauAffectation?: string | null;
  etat: string;
  observations?: string | null;
  quantiteStock: number;
  seuilMinimum: number;
}

@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  private readonly apiUrl = 'http://localhost:5085/api/articles';

  constructor(private http: HttpClient) {}

  getArticle(id: number): Observable<Article> {
    return this.http.get<Article>(`${this.apiUrl}/${id}`);
  }

  getArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(this.apiUrl);
  }

  ajouterArticle(article: NouvelArticle): Observable<Article> {
    return this.http.post<Article>(this.apiUrl, article);
  }

  modifierArticle(id: number, article: NouvelArticle): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, {
      id,
      ...article
    });
  }

  supprimerArticle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

