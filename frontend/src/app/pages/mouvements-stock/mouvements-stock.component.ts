import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  MouvementStock,
  MouvementStockService,
  NouveauMouvement,
  TypeMouvementStock
} from '../../services/mouvement-stock.service';

import {
  Article,
  ArticleService,
  TypeGestionArticle
} from '../../services/article.service';

import {
  Fournisseur,
  FournisseurService
} from '../../services/fournisseur.service';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-mouvements-stock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mouvements-stock.component.html',
  styleUrl: './mouvements-stock.component.css'
})
export class MouvementsStockComponent implements OnInit {
  mouvements: MouvementStock[] = [];
  articles: Article[] = [];
  fournisseurs: Fournisseur[] = [];

  TypeMouvementStock = TypeMouvementStock;

  mode: 'nouveau' | 'historique' = 'historique';

  chargement = true;
  enregistrement = false;
  erreur = '';
  message = '';

  recherche = '';

  pageActuelle = 1;
  taillePage = 10;
  taillesPageDisponibles = [10, 25, 50, 100];

  nouveauMouvement: NouveauMouvement = this.nouveauMouvementVide();

  constructor(
    private mouvementService: MouvementStockService,
    private articleService: ArticleService,
    private fournisseurService: FournisseurService,
    public authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.url.subscribe(() => {
      this.mode =
        this.route.snapshot.routeConfig?.path === 'nouveau'
          ? 'nouveau'
          : 'historique';

      if (this.mode === 'nouveau') {
        this.chargerArticles();
        this.chargerFournisseurs();
      } else {
        this.chargerMouvements();
      }
    });
  }

  get articlesFournitures(): Article[] {
    return this.articles.filter(
      a => a.typeGestion === TypeGestionArticle.Fourniture
    );
  }

  private nouveauMouvementVide(): NouveauMouvement {
    return {
      articleId: 0,
      typeMouvement: TypeMouvementStock.Entree,
      quantite: 1,
      motif: '',
      fournisseurId: null
    };
  }

  chargerMouvements(): void {
    this.chargement = true;
    this.erreur = '';

    this.mouvementService.getMouvements().subscribe({
      next: donnees => {
        this.mouvements = donnees;
        this.pageActuelle = 1;
        this.chargement = false;
      },
      error: err => {
        console.error('Erreur de chargement des mouvements :', err);
        this.erreur =
          'Impossible de charger les mouvements. Vérifiez que l’API est démarrée.';
        this.chargement = false;
      }
    });
  }

  chargerArticles(): void {
    this.articleService.getArticles().subscribe({
      next: donnees => {
        this.articles = donnees;
      },
      error: err => {
        console.error('Erreur de chargement des articles :', err);
        this.erreur = 'Impossible de charger les articles.';
      }
    });
  }

  chargerFournisseurs(): void {
    this.fournisseurService.getFournisseurs().subscribe({
      next: donnees => {
        this.fournisseurs = donnees;
      },
      error: err => {
        console.error('Erreur de chargement des fournisseurs :', err);
        this.erreur = 'Impossible de charger les fournisseurs.';
      }
    });
  }

  changerTypeMouvement(): void {
    if (this.nouveauMouvement.typeMouvement === TypeMouvementStock.Sortie) {
      this.nouveauMouvement.fournisseurId = null;
    }
  }

  ajouterMouvement(): void {
    if (this.enregistrement) {
      return;
    }

    this.erreur = '';
    this.message = '';

    if (this.nouveauMouvement.articleId <= 0) {
      this.erreur = 'Veuillez sélectionner un article.';
      return;
    }

    if (this.nouveauMouvement.quantite <= 0) {
      this.erreur = 'La quantité doit être supérieure à zéro.';
      return;
    }

    if (
      this.nouveauMouvement.typeMouvement === TypeMouvementStock.Entree &&
      (!this.nouveauMouvement.fournisseurId ||
        this.nouveauMouvement.fournisseurId <= 0)
    ) {
      this.erreur = 'Veuillez sélectionner un fournisseur pour cette entrée.';
      return;
    }

    this.enregistrement = true;

    const mouvement: NouveauMouvement = {
      ...this.nouveauMouvement,
      fournisseurId:
        this.nouveauMouvement.typeMouvement === TypeMouvementStock.Entree
          ? this.nouveauMouvement.fournisseurId
          : null,
      motif: this.nouveauMouvement.motif?.trim() || null
    };

    this.mouvementService.ajouterMouvement(mouvement).subscribe({
      next: () => {
        this.message = 'Mouvement enregistré avec succès !';
        this.nouveauMouvement = this.nouveauMouvementVide();
        this.enregistrement = false;
        this.chargerMouvements();
      },
      error: err => {
        console.error('Erreur lors de l’enregistrement du mouvement :', err);
        this.erreur = this.extraireErreur(
          err,
          'Impossible d’enregistrer le mouvement.'
        );
        this.enregistrement = false;
      }
    });
  }

  libelleType(type: TypeMouvementStock): string {
    return type === TypeMouvementStock.Entree ? 'Entrée' : 'Sortie';
  }

  private extraireErreur(err: any, messageParDefaut: string): string {
    const detail = err?.error?.message || err?.error;
    return typeof detail === 'string' ? detail : messageParDefaut;
  }

  get mouvementsFiltres(): MouvementStock[] {
    const texte = this.recherche.trim().toLowerCase();

    if (!texte) {
      return this.mouvements;
    }

    return this.mouvements.filter(m =>
      (m.article?.nom || '').toLowerCase().includes(texte) ||
      (m.article?.reference || '').toLowerCase().includes(texte) ||
      this.libelleType(m.typeMouvement).toLowerCase().includes(texte) ||
      (m.motif || '').toLowerCase().includes(texte) ||
      `${m.fournisseur?.nom || ''} ${m.fournisseur?.prenom || ''}`
        .toLowerCase()
        .includes(texte)
    );
  }

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(this.mouvementsFiltres.length / this.taillePage)
    );
  }

  get mouvementsAffiches(): MouvementStock[] {
    const debut = (this.pageActuelle - 1) * this.taillePage;
    return this.mouvementsFiltres.slice(debut, debut + this.taillePage);
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

  supprimerMouvement(mouvement: MouvementStock): void {
    const confirmation = confirm(
      `Supprimer ce mouvement (${this.libelleType(mouvement.typeMouvement)} de ${mouvement.quantite}) ? Le stock sera ajusté en conséquence.`
    );

    if (!confirmation) {
      return;
    }

    this.erreur = '';
    this.message = '';

    this.mouvementService.supprimerMouvement(mouvement.id).subscribe({
      next: () => {
        this.message = 'Mouvement supprimé avec succès.';
        this.chargerMouvements();
      },
      error: err => {
        console.error('Erreur lors de la suppression :', err);
        this.erreur = this.extraireErreur(
          err,
          'Impossible de supprimer le mouvement.'
        );
      }
    });
  }
}
