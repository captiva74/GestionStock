import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParametresService } from '../../services/parametres.service';

@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parametres.component.html',
  styleUrl: './parametres.component.css'
})
export class ParametresComponent implements OnInit {
  emailAlerteStock = '';
  chargement = true;
  enregistrement = false;
  message = '';
  erreur = '';

  constructor(private parametresService: ParametresService) {}

  ngOnInit(): void {
    this.chargerParametres();
  }

  chargerParametres(): void {
    this.chargement = true;
    this.erreur = '';

    this.parametresService.getEmailAlerte().subscribe({
      next: (resultat) => {
        this.emailAlerteStock = resultat.emailAlerteStock ?? '';
        this.chargement = false;
      },
      error: (err) => {
        console.error('Erreur de chargement des paramètres :', err);
        this.erreur =
          err.status === 401 || err.status === 403
            ? 'Vous n’êtes pas autorisé à consulter ces paramètres.'
            : 'Impossible de charger les paramètres. Vérifiez que le serveur API fonctionne.';
        this.chargement = false;
      }
    });
  }

  enregistrer(): void {
    this.message = '';
    this.erreur = '';

    const email = this.emailAlerteStock.trim();

    if (email !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.erreur = 'Veuillez saisir une adresse e-mail valide.';
      return;
    }

    this.enregistrement = true;

    this.parametresService.modifierEmailAlerte(email || null).subscribe({
      next: (resultat) => {
        this.emailAlerteStock = resultat.emailAlerteStock ?? '';
        this.message = resultat.message;
        this.enregistrement = false;
      },
      error: (err) => {
        console.error('Erreur d’enregistrement des paramètres :', err);
        this.erreur =
          err.error?.message ??
          'Impossible d’enregistrer les paramètres. Vérifiez votre connexion et vos droits.';
        this.enregistrement = false;
      }
    });
  }
}