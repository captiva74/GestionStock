import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface JournalActivite {
  id: number;
  nomUtilisateur: string;
  action: string;
  entite: string;
  entiteId: number | null;
  details: string | null;
  dateAction: string;
}

export interface FiltresJournal {
  entite?: string;
  action?: string;
  dateDebut?: string;
  dateFin?: string;
}

@Injectable({ providedIn: 'root' })
export class JournalService {
  private readonly apiUrl = 'http://localhost:5085/api/journal';

  constructor(private http: HttpClient) {}

  getJournal(filtres: FiltresJournal): Observable<JournalActivite[]> {
    let params = new HttpParams();

    if (filtres.entite) params = params.set('entite', filtres.entite);
    if (filtres.action) params = params.set('action', filtres.action);
    if (filtres.dateDebut) params = params.set('dateDebut', filtres.dateDebut);
    if (filtres.dateFin) params = params.set('dateFin', filtres.dateFin);

    return this.http.get<JournalActivite[]>(this.apiUrl, { params });
  }
}