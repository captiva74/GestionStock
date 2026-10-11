import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CategorieService } from '../../services/categorie.service';

@Component({
  selector: 'app-categorie-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categorie-form.component.html',
  styleUrl: './categorie-form.component.css'
})
export class CategorieFormComponent {
  enregistrement = false;
  erreur = '';

  nouvelleCategorie = {
    nom: '',
    description: ''
  };

  constructor(
    private categorieService: CategorieService,
    private router: Router
  ) {}

  ajouterCategorie(): void {
    this.erreur = '';

    const nom = this.nouvelleCategorie.nom.trim();
    const description = this.nouvelleCategorie.description.trim();

    if (!nom) {
      this.erreur = 'Veuillez saisir le nom de la catégorie.';
      return;
    }

    this.enregistrement = true;

    this.categorieService.ajouterCategorie({ nom, description }).subscribe({
      next: () => {
        this.router.navigate(['/categories/liste']);
      },
      error: (err) => {
        console.error('Erreur lors de l’ajout de la catégorie :', err);
        this.erreur =
          'Échec de l’ajout. Vérifiez que l’API accepte la création des catégories.';
        this.enregistrement = false;
      }
    });
  }

  annuler(): void {
    this.router.navigate(['/categories/liste']);
  }
}