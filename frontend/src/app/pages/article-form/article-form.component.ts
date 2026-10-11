import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleService, NouvelArticle, TypeGestionArticle } from '../../services/article.service';
import { CategorieService } from '../../services/categorie.service';

interface Categorie {
  id: number;
  nom: string;
  description?: string;
  estActif?: boolean;
}

@Component({
  selector: 'app-article-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './article-form.component.html',
  styleUrl: './article-form.component.css'
})
export class ArticleFormComponent implements OnInit {
  categories: Categorie[] = [];

  TypeGestionArticle = TypeGestionArticle;

  chargement = false;
  enregistrement = false;
  erreur = '';
  message = '';

  articleId: number | null = null;

  nouvelArticle: NouvelArticle = this.nouvelArticleVide();

  constructor(
    private articleService: ArticleService,
    private categorieService: CategorieService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.chargerCategories();

    this.route.queryParamMap.subscribe((params) => {
      const idParam = params.get('id');

      if (idParam) {
        this.articleId = Number(idParam);
        this.chargerArticle(this.articleId);
      } else {
        this.articleId = null;
        this.nouvelArticle = this.nouvelArticleVide();
      }
    });
  }

  private nouvelArticleVide(): NouvelArticle {
    return {
      typeGestion: TypeGestionArticle.MaterielIndividuel,
      reference: null,
      nom: '',
      categorieId: 0,
      marque: '',
      modele: '',
      numeroSerie: '',
      dateAcquisition: null,
      valeurAcquisition: 0,
      serviceAffectation: '',
      bureauAffectation: '',
      etat: 'Bon état',
      observations: '',
      quantiteStock: 1,
      seuilMinimum: 0
    };
  }

  chargerCategories(): void {
    this.categorieService.getCategories().subscribe({
      next: (donnees) => {
        this.categories = donnees;
      },
      error: (err) => {
        console.error('Erreur de chargement des catégories :', err);
        this.erreur = 'Impossible de charger les catégories.';
      }
    });
  }

  chargerArticle(id: number): void {
    this.chargement = true;
    this.erreur = '';

    this.articleService.getArticle(id).subscribe({
      next: (article) => {
        this.nouvelArticle = {
          typeGestion: article.typeGestion,
          reference: article.reference,
          nom: article.nom,
          categorieId: article.categorieId,
          marque: article.marque ?? '',
          modele: article.modele ?? '',
          numeroSerie: article.numeroSerie ?? '',
          dateAcquisition: article.dateAcquisition
            ? article.dateAcquisition.substring(0, 10)
            : null,
          valeurAcquisition: article.valeurAcquisition,
          serviceAffectation: article.serviceAffectation ?? '',
          bureauAffectation: article.bureauAffectation ?? '',
          etat: article.etat,
          observations: article.observations ?? '',
          quantiteStock: article.quantiteStock,
          seuilMinimum: article.seuilMinimum
        };
        this.chargement = false;
      },
      error: (err) => {
        console.error('Erreur de chargement du matériel :', err);
        this.erreur = 'Impossible de charger ce matériel.';
        this.chargement = false;
      }
    });
  }

  enregistrer(): void {
    this.erreur = '';
    this.message = '';

    if (
      (this.nouvelArticle.typeGestion === TypeGestionArticle.MaterielIndividuel &&
        !this.nouvelArticle.reference?.trim()) ||
      !this.nouvelArticle.nom.trim() ||
      this.nouvelArticle.categorieId <= 0
    ) {
      this.erreur = 'Veuillez renseigner le numéro d\'inventaire (matériel individuel), la désignation et la catégorie.';
      return;
    }

    if (this.nouvelArticle.valeurAcquisition < 0) {
      this.erreur = 'La valeur d’acquisition ne doit pas être négative.';
      return;
    }

    if (this.nouvelArticle.typeGestion === TypeGestionArticle.Fourniture) {
      if (this.nouvelArticle.quantiteStock < 0) {
        this.erreur = 'La quantité en stock ne doit pas être négative.';
        return;
      }
      if (this.nouvelArticle.seuilMinimum < 0) {
        this.erreur = 'Le seuil minimum ne doit pas être négatif.';
        return;
      }
    }

    this.enregistrement = true;

    const article: NouvelArticle = {
      ...this.nouvelArticle,
      reference:
        this.nouvelArticle.typeGestion === TypeGestionArticle.MaterielIndividuel
          ? this.nouvelArticle.reference?.trim() || null
          : null,
      nom: this.nouvelArticle.nom.trim(),
      marque: this.nouvelArticle.marque?.trim() || null,
      modele: this.nouvelArticle.modele?.trim() || null,
      numeroSerie: this.nouvelArticle.numeroSerie?.trim() || null,
      serviceAffectation: this.nouvelArticle.serviceAffectation?.trim() || null,
      bureauAffectation: this.nouvelArticle.bureauAffectation?.trim() || null,
      observations: this.nouvelArticle.observations?.trim() || null
    };

    if (this.articleId !== null) {
      this.articleService.modifierArticle(this.articleId, article).subscribe({
        next: () => this.retourInventaire(),
        error: (err) => {
          console.error('Erreur lors de la modification :', err);
          this.erreur = this.extraireErreur(err, 'Impossible de modifier le matériel.');
          this.enregistrement = false;
        }
      });

      return;
    }

    this.articleService.ajouterArticle(article).subscribe({
      next: () => this.retourInventaire(),
      error: (err) => {
        console.error('Erreur lors de l’ajout du matériel :', err);
        this.erreur = this.extraireErreur(err, 'Impossible d’ajouter le matériel.');
        this.enregistrement = false;
      }
    });
  }

  annuler(): void {
    this.retourInventaire();
  }

  private retourInventaire(): void {
    this.router.navigate(['/articles/inventaire']);
  }

  private extraireErreur(err: any, messageParDefaut: string): string {
    const detail = err?.error?.message || err?.error;

    return typeof detail === 'string' ? detail : messageParDefaut;
  }
}