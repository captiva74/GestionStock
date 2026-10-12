
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  Fournisseur,
  FournisseurService
} from '../../services/fournisseur.service';

@Component({
  selector: 'app-fournisseurs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './fournisseurs.component.html',
  styleUrl: './fournisseurs.component.css'
})
export class FournisseursComponent implements OnInit {
  fournisseurs: Fournisseur[] = [];
  chargement = false;
  erreur = '';
  recherche = '';

  // Pagination : même principe que les autres modules
  pageActuelle = 1;
  taillePage = 10;
  taillesPageDisponibles = [10, 25, 50, 100];

  constructor(private fournisseurService: FournisseurService) {}

  ngOnInit(): void {
    this.chargerFournisseurs();
  }

  chargerFournisseurs(): void {
    this.chargement = true;
    this.erreur = '';

    this.fournisseurService.getFournisseurs().subscribe({
      next: (resultat) => {
        this.fournisseurs = resultat ?? [];
        this.ajusterPage();
        this.chargement = false;
      },
      error: (error) => {
        console.error('Erreur de chargement des fournisseurs :', error);
        this.erreur =
          'Impossible de charger les fournisseurs. Vérifiez votre connexion et vos droits.';
        this.chargement = false;
      }
    });
  }

  get fournisseursFiltres(): Fournisseur[] {
    const terme = this.recherche.trim().toLocaleLowerCase();

    if (!terme) {
      return this.fournisseurs;
    }

    return this.fournisseurs.filter((f) => {
      const texte = [
        f.nom,
        f.prenom,
        f.activite,
        f.adresse,
        f.email,
        f.numTelephone
      ]
        .filter((valeur) => valeur != null)
        .join(' ')
        .toLocaleLowerCase();

      return texte.includes(terme);
    });
  }

  get fournisseursAffiches(): Fournisseur[] {
    const debut = (this.pageActuelle - 1) * this.taillePage;

    return this.fournisseursFiltres.slice(
      debut,
      debut + this.taillePage
    );
  }

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(this.fournisseursFiltres.length / this.taillePage)
    );
  }

  get pagesAffichables(): number[] {
    return Array.from(
      { length: this.totalPages },
      (_, index) => index + 1
    );
  }

  get premierResultat(): number {
    return this.fournisseursFiltres.length === 0
      ? 0
      : (this.pageActuelle - 1) * this.taillePage + 1;
  }

  get dernierResultat(): number {
    return Math.min(
      this.pageActuelle * this.taillePage,
      this.fournisseursFiltres.length
    );
  }

  surChangementFiltre(): void {
    this.pageActuelle = 1;
  }

  reinitialiserFiltres(): void {
    this.recherche = '';
    this.pageActuelle = 1;
  }

  changerTaillePage(taille: number | string): void {
    const nouvelleTaille = Number(taille);

    if (this.taillesPageDisponibles.includes(nouvelleTaille)) {
      this.taillePage = nouvelleTaille;
      this.pageActuelle = 1;
    }
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

  private ajusterPage(): void {
    if (this.pageActuelle > this.totalPages) {
      this.pageActuelle = this.totalPages;
    }
  }

  supprimerFournisseur(fournisseur: Fournisseur): void {
    const nomComplet = `${fournisseur.nom} ${fournisseur.prenom}`;

    if (
      !confirm(
        `Voulez-vous vraiment supprimer le fournisseur « ${nomComplet} » ?`
      )
    ) {
      return;
    }

    this.erreur = '';

    this.fournisseurService.supprimerFournisseur(fournisseur.id).subscribe({
      next: () => {
        this.fournisseurs = this.fournisseurs.filter(
          (f) => f.id !== fournisseur.id
        );
        this.ajusterPage();
      },
      error: (error) => {
        console.error('Erreur de suppression :', error);
        this.erreur =
          error?.error?.message ??
          'Impossible de supprimer ce fournisseur. Vérifiez vos droits ou réessayez.';
      }
    });
  }
}
