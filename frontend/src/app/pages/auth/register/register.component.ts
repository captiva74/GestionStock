import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  nomComplet = '';
  email = '';
  motDePasse = '';
  numeroAgence: number | null = null;
  codeInscription = '';
  erreur = '';
  succes = '';
  enregistrement = false;

  constructor(private authService: AuthService) {}

  sInscrire(): void {
    this.erreur = '';

    if (
      !this.nomComplet.trim() ||
      !this.email.trim() ||
      !this.motDePasse ||
      this.numeroAgence === null ||
      !this.codeInscription.trim()
    ) {
      this.erreur = 'Veuillez remplir tous les champs.';
      return;
    }

    if (!Number.isInteger(this.numeroAgence) || this.numeroAgence < 1 || this.numeroAgence > 69) {
      this.erreur = 'Le numéro d\'agence doit être compris entre 1 et 69.';
      return;
    }

    if (this.motDePasse.length < 6) {
      this.erreur = 'Le mot de passe doit contenir au moins 6 caractères.';
      return;
    }

    this.enregistrement = true;

    // Agence 44 -> code structure 244
    const codeStructure = 200 + this.numeroAgence;

    this.authService
      .register(
        this.nomComplet.trim(),
        this.email.trim(),
        this.motDePasse,
        codeStructure,
        this.codeInscription.trim()
      )
      .subscribe({
        next: (reponse) => {
          this.succes = reponse.message;
          this.enregistrement = false;
        },
        error: (err) => {
          const detail = err?.error;
          this.erreur =
            typeof detail === 'string' && detail
              ? detail
              : 'Impossible de créer le compte. Vérifiez les champs saisis.';
          this.enregistrement = false;
        }
      });
  }
}