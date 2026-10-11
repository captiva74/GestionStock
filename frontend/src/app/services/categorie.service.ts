
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Categorie {
  id: number;
  nom: string;
  description: string;
  estActif: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CategorieService {
  private readonly apiUrl = 'http://localhost:5085/api/categories';

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(this.apiUrl);
  }
  
  ajouterCategorie(categorie: {
    nom: string;
    description: string;
  }): Observable<Categorie> {
    return this.http.post<Categorie>(this.apiUrl, categorie);
  }

  supprimerCategorie(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}