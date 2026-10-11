import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, Utilisateur } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  profil: Utilisateur | null = null;
  chargement = true;

  nomComplet = '';
  email = '';
  erreurProfil = '';
  messageProfil = '';
  enregistrementProfil = false;

  ancienMotDePasse = '';
  nouveauMotDePasse = '';
  confirmation = '';
  erreurMotDePasse = '';
  messageMotDePasse = '';
  enregistrementMotDePasse = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getProfil().subscribe({
      next: (profil) => {
        this.profil = profil;
        this.nomComplet = profil.nomComplet;
        this.email = profil.email;
        this.chargement = false;
      },
      error: (err) => {
        console.error('Erreur de chargement du profil :', err);
        this.chargement = false;
      }
    });
  }

  enregistrerProfil(): void {
    this.erreurProfil = '';
    this.messageProfil = '';

    if (!this.nomComplet.trim() || !this.email.trim()) {
      this.erreurProfil = 'Veuillez renseigner votre nom et votre email.';
      return;
    }

    this.enregistrementProfil = true;

    this.authService.modifierProfil(this.nomComplet.trim(), this.email.trim()).subscribe({
      next: () => {
        this.messageProfil = 'Profil mis à jour avec succès.';
        this.enregistrementProfil = false;
      },
      error: (err) => {
        console.error('Erreur :', err);
        this.erreurProfil = err?.error || 'Impossible de mettre à jour le profil.';
        this.enregistrementProfil = false;
      }
    });
  }

  changerMotDePasse(): void {
    this.erreurMotDePasse = '';
    this.messageMotDePasse = '';

    if (!this.ancienMotDePasse || !this.nouveauMotDePasse) {
      this.erreurMotDePasse = 'Veuillez remplir tous les champs.';
      return;
    }

    if (this.nouveauMotDePasse.length < 6) {
      this.erreurMotDePasse = 'Le nouveau mot de passe doit contenir au moins 6 caractères.';
      return;
    }

    if (this.nouveauMotDePasse !== this.confirmation) {
      this.erreurMotDePasse = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.enregistrementMotDePasse = true;

    this.authService.changerMotDePasse(this.ancienMotDePasse, this.nouveauMotDePasse).subscribe({
      next: () => {
        this.messageMotDePasse = 'Mot de passe modifié avec succès.';
        this.ancienMotDePasse = '';
        this.nouveauMotDePasse = '';
        this.confirmation = '';
        this.enregistrementMotDePasse = false;
      },
      error: (err) => {
        console.error('Erreur :', err);
        this.erreurMotDePasse = err?.error || 'Impossible de changer le mot de passe.';
        this.enregistrementMotDePasse = false;
      }
    });
  }
}