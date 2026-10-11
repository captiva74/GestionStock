import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Categorie, CategorieService } from '../../services/categorie.service';
import { ExportService } from '../../services/export.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css',
})
export class CategoriesComponent implements OnInit {
  categories: Categorie[] = [];
  chargement = true;
  erreur = '';
  message = '';

  recherche = '';

  pageActuelle = 1;
  taillePage = 10;
  taillesPageDisponibles = [10, 25, 50, 100];

  constructor(
    private categorieService: CategorieService,
    private exportService: ExportService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.chargerCategories();
  }

  chargerCategories(): void {
    this.chargement = true;

    this.categorieService.getCategories().subscribe({
      next: (donnees) => {
        this.categories = donnees;
        this.chargement = false;
      },
      error: (err) => {
        console.error('Erreur de chargement des catégories :', err);
        this.erreur = 'Impossible de charger les catégories depuis le serveur.';
        this.chargement = false;
      },
    });
  }

  get categoriesFiltrees(): Categorie[] {
    const texte = this.recherche.trim().toLowerCase();

    if (!texte) {
      return this.categories;
    }

    return this.categories.filter(
      (c) =>
        c.nom.toLowerCase().includes(texte) ||
        (c.description || '').toLowerCase().includes(texte)
    );
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.categoriesFiltrees.length / this.taillePage));
  }

  get categoriesAffichees(): Categorie[] {
    const debut = (this.pageActuelle - 1) * this.taillePage;
    return this.categoriesFiltrees.slice(debut, debut + this.taillePage);
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

  supprimerCategorie(categorie: Categorie): void {
    const confirmation = confirm(
      `Supprimer définitivement la catégorie "${categorie.nom}" ?`
    );

    if (!confirmation) {
      return;
    }

    this.erreur = '';
    this.message = '';

    this.categorieService.supprimerCategorie(categorie.id).subscribe({
      next: () => {
        this.categories = this.categories.filter((c) => c.id !== categorie.id);
        this.message = 'Catégorie supprimée avec succès.';
      },
      error: (err) => {
        console.error('Erreur lors de la suppression :', err);
        const detail = err?.error?.message || err?.error;
        this.erreur =
          typeof detail === 'string' ? detail : 'Impossible de supprimer cette catégorie.';
      },
    });
  }

  imprimer(): void {
    window.print();
  }

  exporterPdf(): void {
    const colonnes = ['ID', 'Nom', 'Description'];
    const lignes = this.categoriesFiltrees.map((c) => [c.id, c.nom, c.description]);
    this.exportService.exporterPdf('Liste des catégories', colonnes, lignes, 'categories');
  }

  exporterExcel(): void {
    const colonnes = ['ID', 'Nom', 'Description'];
    const lignes = this.categoriesFiltrees.map((c) => [c.id, c.nom, c.description]);
    this.exportService.exporterExcel('Liste des catégories', colonnes, lignes, 'categories');
  }
}