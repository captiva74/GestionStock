import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  email = '';
  erreur = '';
  message = '';
  enregistrement = false;

  constructor(private authService: AuthService) {}

  envoyer(): void {
    this.erreur = '';
    this.message = '';

    if (!this.email.trim()) {
      this.erreur = 'Veuillez renseigner votre email.';
      return;
    }

    this.enregistrement = true;

    this.authService.motDePasseOublie(this.email.trim()).subscribe({
      next: (reponse) => {
        this.message = reponse || 'Si cette adresse existe, un email a été envoyé.';
        this.enregistrement = false;
      },
      error: (err) => {
        console.error('Erreur :', err);
        this.erreur = 'Une erreur est survenue. Réessayez plus tard.';
        this.enregistrement = false;
      }
    });
  }
}