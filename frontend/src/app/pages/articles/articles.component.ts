import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Article, ArticleService, TypeGestionArticle } from '../../services/article.service';
import { ExportService } from '../../services/export.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './articles.component.html',
  styleUrl: './articles.component.css'
})
export class ArticlesComponent implements OnInit {
  articles: Article[] = [];
  categoriesDisponibles: string[] = [];

  chargement = true;
  erreur = '';
  message = '';

  // Recherche et filtres
  recherche = '';
  categorieFiltre = '';
  etatFiltre = '';

  // Pagination
  pageActuelle = 1;
  taillePage = 10;
  taillesPageDisponibles = [10, 25, 50, 100];

  constructor(
    private articleService: ArticleService,
    private exportService: ExportService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.chargerArticles();
  }

  chargerArticles(): void {
    this.chargement = true;
    this.erreur = '';

    this.articleService.getArticles().subscribe({
      next: (donnees) => {
        this.articles = donnees;
        this.categoriesDisponibles = [
          ...new Set(donnees.map((a) => a.categorie?.nom).filter((n): n is string => !!n))
        ].sort();
        this.chargement = false;
      },
      error: (err) => {
        console.error('Erreur de chargement des articles :', err);
        this.erreur = 'Impossible de charger les articles. Vérifiez que l’API est démarrée.';
        this.chargement = false;
      }
    });
  }

  get articlesFiltres(): Article[] {
    const texte = this.recherche.trim().toLowerCase();

    return this.articles.filter((a) => {
      const correspondTexte =
        !texte ||
        (a.reference || '').toLowerCase().includes(texte) ||
        a.nom.toLowerCase().includes(texte) ||
        (a.marque || '').toLowerCase().includes(texte) ||
        (a.modele || '').toLowerCase().includes(texte) ||
        (a.numeroSerie || '').toLowerCase().includes(texte);

      const correspondCategorie =
        !this.categorieFiltre || a.categorie?.nom === this.categorieFiltre;

      const correspondEtat = !this.etatFiltre || a.etat === this.etatFiltre;

      return correspondTexte && correspondCategorie && correspondEtat;
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.articlesFiltres.length / this.taillePage));
  }

  get articlesAffiches(): Article[] {
    const debut = (this.pageActuelle - 1) * this.taillePage;
    return this.articlesFiltres.slice(debut, debut + this.taillePage);
  }

  get pagesAffichables(): number[] {
    const total = this.totalPages;
    const pages: number[] = [];
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
    return pages;
  }

  reinitialiserFiltres(): void {
    this.recherche = '';
    this.categorieFiltre = '';
    this.etatFiltre = '';
    this.pageActuelle = 1;
  }

  surChangementFiltre(): void {
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

  supprimerArticle(article: Article): void {
    const confirmation = confirm(
      `Supprimer définitivement "${article.nom}" (${article.reference}) ?`
    );

    if (!confirmation) {
      return;
    }

    this.erreur = '';
    this.message = '';

    this.articleService.supprimerArticle(article.id).subscribe({
      next: () => {
        this.message = 'Matériel supprimé avec succès.';
        this.chargerArticles();
      },
      error: (err) => {
        console.error('Erreur lors de la suppression :', err);
        const detail = err?.error?.message || err?.error;
        this.erreur = typeof detail === 'string' ? detail : 'Impossible de supprimer ce matériel.';
      }
    });
  }

  imprimer(): void {
    window.print();
  }

  exporterPdf(): void {
    const colonnes = [
      'ID', "N° d'inventaire", 'Désignation', 'Catégorie', 'Marque', 'Modèle',
      'N° de série', "Valeur d'acquisition", 'Service', 'Bureau', 'État'
    ];

    const lignes = this.articlesFiltres.map((a) => [
      a.id, a.reference, a.nom, a.categorie?.nom || a.categorieId,
      a.marque || '—', a.modele || '—', a.numeroSerie || '—',
      a.valeurAcquisition.toFixed(2), a.serviceAffectation || '—',
      a.bureauAffectation || '—', a.etat
    ]);

    this.exportService.exporterPdf('Inventaire du matériel', colonnes, lignes, 'inventaire-materiel');
  }

  exporterExcel(): void {
    const colonnes = [
      'ID', "N° d'inventaire", 'Désignation', 'Catégorie', 'Marque', 'Modèle',
      'N° de série', "Valeur d'acquisition", 'Service', 'Bureau', 'État'
    ];

    const lignes = this.articlesFiltres.map((a) => [
      a.id, a.reference, a.nom, a.categorie?.nom || a.categorieId,
      a.marque || '—', a.modele || '—', a.numeroSerie || '—',
      a.valeurAcquisition, a.serviceAffectation || '—',
      a.bureauAffectation || '—', a.etat
    ]);

    this.exportService.exporterExcel('Inventaire du matériel', colonnes, lignes, 'inventaire-materiel');
  }
}