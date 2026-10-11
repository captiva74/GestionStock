import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
  erreur = '';
  enregistrement = false;

  constructor(private authService: AuthService, private router: Router) {}

  sInscrire(): void {
    this.erreur = '';

    if (!this.nomComplet.trim() || !this.email.trim() || !this.motDePasse) {
      this.erreur = 'Veuillez remplir tous les champs.';
      return;
    }

    if (this.motDePasse.length < 6) {
      this.erreur = 'Le mot de passe doit contenir au moins 6 caractères.';
      return;
    }

    this.enregistrement = true;

    this.authService
      .register(this.nomComplet.trim(), this.email.trim(), this.motDePasse)
      .subscribe({
        next: () => this.router.navigate(['/articles']),
        error: (err) => {
          console.error('Erreur d’inscription :', err);
          this.erreur = err?.error || 'Impossible de créer le compte.';
          this.enregistrement = false;
        }
      });
  }
}