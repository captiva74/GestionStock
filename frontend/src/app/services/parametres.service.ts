import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ParametresAlerte {
  emailAlerteStock: string | null;
}

export interface ResultatParametresAlerte {
  message: string;
  emailAlerteStock: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ParametresService {
  private readonly apiUrl = 'http://localhost:5085/api/parametres';

  constructor(private http: HttpClient) {}

  getEmailAlerte(): Observable<ParametresAlerte> {
    return this.http.get<ParametresAlerte>(
      `${this.apiUrl}/email-alerte`
    );
  }

  modifierEmailAlerte(
    emailAlerteStock: string | null
  ): Observable<ResultatParametresAlerte> {
    return this.http.put<ResultatParametresAlerte>(
      `${this.apiUrl}/email-alerte`,
      { emailAlerteStock }
    );
  }
}