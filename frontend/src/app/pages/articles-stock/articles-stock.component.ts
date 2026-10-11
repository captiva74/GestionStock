import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Article, ArticleService, TypeGestionArticle } from '../../services/article.service';

@Component({
  selector: 'app-articles-stock',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './articles-stock.component.html',
  styleUrl: './articles-stock.component.css'
})
export class ArticlesStockComponent implements OnInit {
  articles: Article[] = [];
  chargement = true;
  erreur = '';

  constructor(private articleService: ArticleService) {}

  ngOnInit(): void {
    this.chargerFournitures();
  }

  chargerFournitures(): void {
    this.chargement = true;
    this.erreur = '';

    this.articleService.getArticles().subscribe({
      next: (donnees) => {
        this.articles = donnees.filter(
          (a) => a.typeGestion === TypeGestionArticle.Fourniture
        );
        this.chargement = false;
      },
      error: (err) => {
        console.error('Erreur de chargement du stock :', err);
        this.erreur = 'Impossible de charger le stock. Vérifiez que l’API est démarrée.';
        this.chargement = false;
      }
    });
  }

  get articlesEnAlerte(): Article[] {
    return this.articles.filter((a) => a.quantiteStock <= a.seuilMinimum);
  }
}