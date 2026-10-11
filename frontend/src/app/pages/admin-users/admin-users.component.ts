import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Utilisateur } from '../../services/auth.service';
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

  constructor(private utilisateurService: UtilisateurService) {}

  ngOnInit(): void {
    this.chargerUtilisateurs();
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

  modifier(utilisateur: Utilisateur): void {
    this.utilisateurEnEditionId = utilisateur.id;
    this.edition = {
      nomComplet: utilisateur.nomComplet,
      email: utilisateur.email,
      role: utilisateur.role === 'Admin' ? 0 : 1,
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
        this.erreur = err?.error || 'Impossible de modifier cet utilisateur.';
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
        this.erreur = 'Impossible de supprimer cet utilisateur.';
      }
    });
  }
}