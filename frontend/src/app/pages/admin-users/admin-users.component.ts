
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, Utilisateur } from '../../services/auth.service';
import {
  ModifierUtilisateurAdmin,
  UtilisateurService
} from '../../services/utilisateur.service';

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

  // Recherche et pagination
  recherche = '';
  pageActuelle = 1;
  taillePage = 10;
  taillesPageDisponibles = [10, 25, 50, 100];

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

  // Admin = 0, Utilisateur = 1, AdminAgence = 2
  private roleVersNombre(role: string): number {
    switch (role) {
      case 'Admin':
        return 0;
      case 'AdminAgence':
        return 2;
      default:
        return 1;
    }
  }

  // Un admin d'agence ne gère que les comptes simples
  peutGerer(utilisateur: Utilisateur): boolean {
    return this.estSuperAdmin || utilisateur.role === 'Utilisateur';
  }

  private messageErreur(err: any, defaut: string): string {
    return typeof err?.error === 'string' && err.error
      ? err.error
      : defaut;
  }

  chargerUtilisateurs(): void {
    this.chargement = true;
    this.erreur = '';

    this.utilisateurService.getUtilisateurs().subscribe({
      next: (donnees) => {
        this.utilisateurs = donnees;
        this.pageActuelle = 1;
        this.chargement = false;
      },
      error: (err) => {
        console.error('Erreur de chargement des utilisateurs :', err);
        this.erreur = 'Impossible de charger les utilisateurs.';
        this.chargement = false;
      }
    });
  }

  // Recherche par nom, email, rôle ou statut
  get utilisateursFiltres(): Utilisateur[] {
    const texte = this.recherche.trim().toLowerCase();

    if (!texte) {
      return this.utilisateurs;
    }

    return this.utilisateurs.filter((u) =>
      (u.nomComplet || '').toLowerCase().includes(texte) ||
      (u.email || '').toLowerCase().includes(texte) ||
      (u.role || '').toLowerCase().includes(texte) ||
      (u.estActif ? 'actif' : 'inactif').includes(texte)
    );
  }

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(this.utilisateursFiltres.length / this.taillePage)
    );
  }

  get utilisateursAffiches(): Utilisateur[] {
    const debut = (this.pageActuelle - 1) * this.taillePage;

    return this.utilisateursFiltres.slice(
      debut,
      debut + this.taillePage
    );
  }

  get pagesAffichables(): number[] {
    const pages: number[] = [];

    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }

    return pages;
  }

  surChangementFiltre(): void {
    this.pageActuelle = 1;
  }

  reinitialiserFiltres(): void {
    this.recherche = '';
    this.pageActuelle = 1;
  }

  allerPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageActuelle = page;
    }
  }

  pagePrecedente(): void {
    this.allerPage(this.pageActuelle - 1);
  }

  pageSuivante(): void {
    this.allerPage(this.pageActuelle + 1);
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

    this.utilisateurService
      .modifierUtilisateur(utilisateur.id, donnees)
      .subscribe({
        next: () => {
          this.message = `Le compte de "${utilisateur.nomComplet}" est activé.`;
          this.chargerUtilisateurs();
        },
        error: (err) => {
          console.error('Erreur :', err);
          this.erreur = this.messageErreur(
            err,
            'Impossible d’activer ce compte.'
          );
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

    this.utilisateurService
      .modifierUtilisateur(this.utilisateurEnEditionId, this.edition)
      .subscribe({
        next: () => {
          this.message = 'Utilisateur modifié avec succès.';
          this.utilisateurEnEditionId = null;
          this.chargerUtilisateurs();
        },
        error: (err) => {
          console.error('Erreur :', err);
          this.erreur = this.messageErreur(
            err,
            'Impossible de modifier cet utilisateur.'
          );
        }
      });
  }

  supprimer(utilisateur: Utilisateur): void {
    const confirmation = confirm(
      `Supprimer définitivement le compte de "${utilisateur.nomComplet}" ?`
    );

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
        this.erreur = this.messageErreur(
          err,
          'Impossible de supprimer cet utilisateur.'
        );
      }
    });
  }
}
