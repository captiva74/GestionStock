
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  Fournisseur,
  FournisseurService,
  NouveauFournisseur
} from '../../services/fournisseur.service';

@Component({
  selector: 'app-fournisseur-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './fournisseur-form.component.html',
  styleUrl: './fournisseur-form.component.css'
})
export class FournisseurFormComponent implements OnInit {
  fournisseurId: number | null = null;
  chargement = false;
  enregistrement = false;
  erreur = '';
  message = '';

  formulaire: NouveauFournisseur = this.nouveauFormulaire();

  constructor(
    private fournisseurService: FournisseurService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.fournisseurId = Number(id);
      this.chargerFournisseur(this.fournisseurId);
    }
  }

  get modeModification(): boolean {
    return this.fournisseurId !== null;
  }

  private nouveauFormulaire(): NouveauFournisseur {
    return {
      nom: '',
      prenom: '',
      activite: '',
      adresse: '',
      email: '',
      numTelephone: ''
    };
  }

  chargerFournisseur(id: number): void {
    this.chargement = true;
    this.erreur = '';

    this.fournisseurService.getFournisseur(id).subscribe({
      next: (fournisseur: Fournisseur) => {
        this.formulaire = {
          nom: fournisseur.nom,
          prenom: fournisseur.prenom,
          activite: fournisseur.activite,
          adresse: fournisseur.adresse ?? '',
          email: fournisseur.email ?? '',
          numTelephone: fournisseur.numTelephone ?? ''
        };

        this.chargement = false;
      },
      error: (error) => {
        console.error('Erreur de chargement du fournisseur :', error);
        this.erreur = 'Impossible de charger ce fournisseur.';
        this.chargement = false;
      }
    });
  }

  enregistrer(): void {
    this.erreur = '';
    this.message = '';

    const nom = this.formulaire.nom.trim();
    const prenom = this.formulaire.prenom.trim();
    const activite = this.formulaire.activite.trim();

    if (!nom || !prenom || !activite) {
      this.erreur = 'Le nom, le prénom et l’activité sont obligatoires.';
      return;
    }

    const donnees: NouveauFournisseur = {
      nom,
      prenom,
      activite,
      adresse: this.formulaire.adresse?.trim() || null,
      email: this.formulaire.email?.trim() || null,
      numTelephone: this.formulaire.numTelephone?.trim() || null
    };

    this.enregistrement = true;

    if (this.fournisseurId !== null) {
      const fournisseurModifie: Fournisseur = {
        id: this.fournisseurId,
        ...donnees
      };

      this.fournisseurService
        .modifierFournisseur(this.fournisseurId, fournisseurModifie)
        .subscribe({
          next: () => {
            this.enregistrement = false;
            this.router.navigate(['/fournisseurs/liste']);
          },
          error: (error) => {
            console.error('Erreur de modification :', error);
            this.erreur =
              error?.error?.message ??
              'Impossible de modifier le fournisseur. Vérifiez vos droits et réessayez.';
            this.enregistrement = false;
          }
        });
    } else {
      this.fournisseurService.ajouterFournisseur(donnees).subscribe({
        next: () => {
          this.enregistrement = false;
          this.router.navigate(['/fournisseurs/liste']);
        },
        error: (error) => {
          console.error('Erreur d’ajout :', error);
          this.erreur =
            error?.error?.message ??
            'Impossible d’ajouter le fournisseur. Vérifiez vos droits et réessayez.';
          this.enregistrement = false;
        }
      });
    }
  }
}
