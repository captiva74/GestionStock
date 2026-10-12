import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { Article, ArticleService, TypeGestionArticle } from './services/article.service';
import { AuthService } from './services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  articles: Article[] = [];
  chargement = true;
  erreur = '';

  menuArticlesOuvert = false;
  menuCategoriesOuvert = false;
  menuMouvementsOuvert = false;
  menuFournisseursOuvert = false;
  // Liste des agences pour l'admin du siège : codes 201 à 269 (agences 1 à 69)
  agences: number[] = Array.from({ length: 69 }, (_, i) => 201 + i);
  agenceChoisie: number | null = null;

  constructor(
    private articleService: ArticleService,
    public authService: AuthService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.agenceChoisie = this.authService.getAgenceChoisie();
    this.menuArticlesOuvert = this.router.url.startsWith('/articles');
    this.menuCategoriesOuvert = this.router.url.startsWith('/categories');
    this.menuMouvementsOuvert = this.router.url.startsWith('/mouvements-stock');
    this.menuFournisseursOuvert = this.router.url.startsWith('/fournisseurs');

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.router.url.startsWith('/articles')) {
          this.menuArticlesOuvert = true;
        }
        if (this.router.url.startsWith('/categories')) {
          this.menuCategoriesOuvert = true;
        }
        if (this.router.url.startsWith('/mouvements-stock')) {
          this.menuMouvementsOuvert = true;
        }
        if (this.router.url.startsWith('/fournisseurs')) {
          this.menuFournisseursOuvert = true;
        }
    });

    this.authService.utilisateurCourant$.subscribe(() => {
      if (this.authService.estConnecte()) {
        this.chargerArticles();
      }
    });

    if (this.authService.estConnecte()) {
      this.chargerArticles();
    }
  }

  basculerMenuArticles(): void {
    this.menuArticlesOuvert = !this.menuArticlesOuvert;
  }

  basculerMenuCategories(): void {
    this.menuCategoriesOuvert = !this.menuCategoriesOuvert;
  }

  basculerMenuMouvements(): void {
    this.menuMouvementsOuvert = !this.menuMouvementsOuvert;
  }

  basculerMenuFournisseurs(): void {
    this.menuFournisseursOuvert = !this.menuFournisseursOuvert;
  }

  get menuArticlesActif(): boolean {
    return this.router.url.startsWith('/articles');
  }

  get menuCategoriesActif(): boolean {
    return this.router.url.startsWith('/categories');
  }

  get menuMouvementsActif(): boolean {
    return this.router.url.startsWith('/mouvements-stock');
  }

  get menuFournisseursActif(): boolean {
    return this.router.url.startsWith('/fournisseurs');
  }

  get nombreAlertesStock(): number {
    return this.articles.filter(
      (a) => a.typeGestion === TypeGestionArticle.Fourniture && a.quantiteStock <= a.seuilMinimum
    ).length;
  }

  chargerArticles(): void {
    this.chargement = true;
    this.erreur = '';

    this.articleService.getArticles().subscribe({
      next: (resultat) => {
        this.articles = resultat;
        this.chargement = false;
      },
      error: (error) => {
        console.error('Erreur de chargement des articles :', error);
        this.chargement = false;
      }
    });
  }

  changerAgence(code: number | null): void {
    this.authService.choisirAgence(code);
    // On recharge la page pour que toutes les données viennent de l'agence choisie
    window.location.reload();
  }

  seDeconnecter(): void {
    this.authService.deconnexion();
    this.router.navigate(['/connexion']);
  }
}