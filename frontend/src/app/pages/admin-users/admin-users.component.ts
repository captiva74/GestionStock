import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, Utilisateur } from '../../services/auth.service';
import { ModifierUtilisateurAdmin, UtilisateurService } from '../../services/utilisateur.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css'
})
export class AdminUsersComponent implements OnInit {
  utilisateurs: Utilisateur[] = [];
  chargement = true;
  erreur = '';
  message = '';

  utilisateurEnEditionId: number | null = null;
  edition: ModifierUtilisateurAdmin = {
    nomComplet: '',
    email: '',
    role: 1,
    estActif: true
  };

  constructor(
    private utilisateurService: UtilisateurService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.chargerUtilisateurs();
  }

  get estSuperAdmin(): boolean {
    return this.authService.estSuperAdmin();
  }

  // Admin = 0, Utilisateur = 1, AdminAgence = 2 (comme l'enum du serveur)
  private roleVersNombre(role: string): number {
    switch (role) {
      case 'Admin': return 0;
      case 'AdminAgence': return 2;
      default: return 1;
    }
  }

  // Un admin d'agence ne gère que les comptes simples
  peutGerer(utilisateur: Utilisateur): boolean {
    return this.estSuperAdmin || utilisateur.role === 'Utilisateur';
  }

  private messageErreur(err: any, defaut: string): string {
    return typeof err?.error === 'string' && err.error ? err.error : defaut;
  }

  chargerUtilisateurs(): void {
    this.chargement = true;

    this.utilisateurService.getUtilisateurs().subscribe({
      next: (donnees) => {
        this.utilisateurs = donnees;
        this.chargement = false;
      },
      error: (err) => {
        console.error('Erreur de chargement des utilisateurs :', err);
        this.erreur = 'Impossible de charger les utilisateurs.';
        this.chargement = false;
      }
    });
  }

  activer(utilisateur: Utilisateur): void {
    this.erreur = '';
    this.message = '';

    const donnees: ModifierUtilisateurAdmin = {
      nomComplet: utilisateur.nomComplet,
      email: utilisateur.email,
      role: this.roleVersNombre(utilisateur.role),
      estActif: true
    };

    this.utilisateurService.modifierUtilisateur(utilisateur.id, donnees).subscribe({
      next: () => {
        this.message = `Le compte de "${utilisateur.nomComplet}" est activé.`;
        this.chargerUtilisateurs();
      },
      error: (err) => {
        console.error('Erreur :', err);
        this.erreur = this.messageErreur(err, 'Impossible d\'activer ce compte.');
      }
    });
  }

  modifier(utilisateur: Utilisateur): void {
    this.utilisateurEnEditionId = utilisateur.id;
    this.edition = {
      nomComplet: utilisateur.nomComplet,
      email: utilisateur.email,
      role: this.roleVersNombre(utilisateur.role),
      estActif: utilisateur.estActif
    };
    this.erreur = '';
    this.message = '';
  }

  annuler(): void {
    this.utilisateurEnEditionId = null;
  }

  enregistrer(): void {
    if (this.utilisateurEnEditionId === null) {
      return;
    }

    this.erreur = '';
    this.message = '';

    this.utilisateurService.modifierUtilisateur(this.utilisateurEnEditionId, this.edition).subscribe({
      next: () => {
        this.message = 'Utilisateur modifié avec succès.';
        this.utilisateurEnEditionId = null;
        this.chargerUtilisateurs();
      },
      error: (err) => {
        console.error('Erreur :', err);
        this.erreur = this.messageErreur(err, 'Impossible de modifier cet utilisateur.');
      }
    });
  }

  supprimer(utilisateur: Utilisateur): void {
    const confirmation = confirm(`Supprimer définitivement le compte de "${utilisateur.nomComplet}" ?`);

    if (!confirmation) {
      return;
    }

    this.erreur = '';
    this.message = '';

    this.utilisateurService.supprimerUtilisateur(utilisateur.id).subscribe({
      next: () => {
        this.message = 'Utilisateur supprimé avec succès.';
        this.chargerUtilisateurs();
      },
      error: (err) => {
        console.error('Erreur :', err);
        this.erreur = this.messageErreur(err, 'Impossible de supprimer cet utilisateur.');
      }
    });
  }
}