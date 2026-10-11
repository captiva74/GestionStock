import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  motDePasse = '';
  erreur = '';
  enregistrement = false;

  constructor(private authService: AuthService, private router: Router) {}

  seConnecter(): void {
    this.erreur = '';

    if (!this.email.trim() || !this.motDePasse) {
      this.erreur = 'Veuillez renseigner votre email et votre mot de passe.';
      return;
    }

    this.enregistrement = true;

    this.authService.login(this.email.trim(), this.motDePasse).subscribe({
      next: () => this.router.navigate(['/articles']),
      error: (err) => {
        console.error('Erreur de connexion :', err);
        this.erreur = err?.error || 'Email ou mot de passe incorrect.';
        this.enregistrement = false;
      }
    });
  }
}