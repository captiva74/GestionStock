import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MouvementStock,
  MouvementStockService,
  NouveauMouvement,
  TypeMouvementStock
} from '../../services/mouvement-stock.service';
import { Article, ArticleService, TypeGestionArticle } from '../../services/article.service';
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

  TypeMouvementStock = TypeMouvementStock;

  chargement = true;
  enregistrement = false;
  erreur = '';
  message = '';

  nouveauMouvement: NouveauMouvement = this.nouveauMouvementVide();

  constructor(
    private mouvementService: MouvementStockService,
    private articleService: ArticleService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.chargerMouvements();
    this.chargerArticles();
  }

  // Seuls les articles gérés en "Fourniture" sont éligibles aux mouvements de stock
  get articlesFournitures(): Article[] {
    return this.articles.filter(
      (a) => a.typeGestion === TypeGestionArticle.Fourniture
    );
  }

  private nouveauMouvementVide(): NouveauMouvement {
    return {
      articleId: 0,
      typeMouvement: TypeMouvementStock.Entree,
      quantite: 1,
      motif: ''
    };
  }

  chargerMouvements(): void {
    this.chargement = true;
    this.erreur = '';

    this.mouvementService.getMouvements().subscribe({
      next: (donnees) => {
        this.mouvements = donnees;
        this.chargement = false;
      },
      error: (err) => {
        console.error('Erreur de chargement des mouvements :', err);
        this.erreur = 'Impossible de charger les mouvements. Vérifiez que l’API est démarrée.';
        this.chargement = false;
      }
    });
  }

  chargerArticles(): void {
    this.articleService.getArticles().subscribe({
      next: (donnees) => {
        this.articles = donnees;
      },
      error: (err) => {
        console.error('Erreur de chargement des articles :', err);
        this.erreur = 'Impossible de charger les articles.';
      }
    });
  }

  ajouterMouvement(): void {
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

    this.enregistrement = true;

    const mouvement: NouveauMouvement = {
      ...this.nouveauMouvement,
      motif: this.nouveauMouvement.motif?.trim() || null
    };

    this.mouvementService.ajouterMouvement(mouvement).subscribe({
      next: () => {
        this.message = 'Mouvement enregistré avec succès !';
        this.nouveauMouvement = this.nouveauMouvementVide();
        this.enregistrement = false;
        this.chargerMouvements();
      },
      error: (err) => {
        console.error('Erreur lors de l’enregistrement du mouvement :', err);
        this.erreur = this.extraireErreur(err, 'Impossible d’enregistrer le mouvement.');
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
      error: (err) => {
        console.error('Erreur lors de la suppression :', err);
        this.erreur = this.extraireErreur(err, 'Impossible de supprimer le mouvement.');
      }
    });
  }
}