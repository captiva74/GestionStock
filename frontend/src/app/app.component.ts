import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { Article, ArticleService, TypeGestionArticle } from './services/article.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  articles: Article[] = [];
  chargement = true;
  erreur = '';

  menuArticlesOuvert = false;
  menuCategoriesOuvert = false;

  constructor(
    private articleService: ArticleService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.menuArticlesOuvert = this.router.url.startsWith('/articles');
    this.menuCategoriesOuvert = this.router.url.startsWith('/categories');

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.router.url.startsWith('/articles')) {
          this.menuArticlesOuvert = true;
        }
        if (this.router.url.startsWith('/categories')) {
          this.menuCategoriesOuvert = true;
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

  get menuArticlesActif(): boolean {
    return this.router.url.startsWith('/articles');
  }

  get menuCategoriesActif(): boolean {
    return this.router.url.startsWith('/categories');
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

  seDeconnecter(): void {
    this.authService.deconnexion();
    this.router.navigate(['/connexion']);
  }
}