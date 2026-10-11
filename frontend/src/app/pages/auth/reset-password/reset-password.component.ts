import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  email = '';
  token = '';
  nouveauMotDePasse = '';
  confirmation = '';
  erreur = '';
  message = '';
  enregistrement = false;
  lienInvalide = false;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.email = params.get('email') || '';
      this.token = params.get('token') || '';

      if (!this.email || !this.token) {
        this.lienInvalide = true;
      }
    });
  }

  reinitialiser(): void {
    this.erreur = '';
    this.message = '';

    if (!this.nouveauMotDePasse || this.nouveauMotDePasse.length < 6) {
      this.erreur = 'Le mot de passe doit contenir au moins 6 caractères.';
      return;
    }

    if (this.nouveauMotDePasse !== this.confirmation) {
      this.erreur = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.enregistrement = true;

    this.authService
      .reinitialiserMotDePasse(this.email, this.token, this.nouveauMotDePasse)
      .subscribe({
        next: () => {
          this.message = 'Mot de passe réinitialisé. Redirection vers la connexion...';
          setTimeout(() => this.router.navigate(['/connexion']), 2000);
        },
        error: (err) => {
          console.error('Erreur :', err);
          this.erreur = err?.error || 'Lien invalide ou expiré.';
          this.enregistrement = false;
        }
      });
  }
}