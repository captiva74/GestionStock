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

    // Bon d'entrée ou de sortie en cours de préparation
  bonOuvert = false;
  mouvementBon: MouvementStock | null = null;
  bon = this.bonVide();

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

  private bonVide() {
    return {
      // Bon d'entrée
      bonCommande: '',
      facture: '',
      bonLivraison: '',
      nomLivreur: '',
      nomMagasinier: '',
      // Bon de sortie
      beneficiaire: '',
      demandeNumero: '',
      demandeDate: '',
      preneurNom: '',
      preneurPrenom: '',
      preneurQualite: '',
      magasinierNom: '',
      magasinierPrenom: ''
    };
  }

  ouvrirBon(mouvement: MouvementStock): void {
    this.erreur = '';
    this.message = '';
    this.mouvementBon = mouvement;
    this.bon = this.bonVide();
    this.bonOuvert = true;
  }

  fermerBon(): void {
    this.bonOuvert = false;
    this.mouvementBon = null;
  }

  get estBonEntree(): boolean {
    return this.mouvementBon?.typeMouvement === TypeMouvementStock.Entree;
  }

  get numeroBon(): string {
    return String(this.mouvementBon?.id ?? 0).padStart(7, '0');
  }

  // Protège le texte saisi avant de l'insérer dans le document imprimé
  private esc(valeur: unknown): string {
    return String(valeur ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // "Agence 44" d'après le code agence du jeton (ou l'agence choisie par le siège)
  private libelleAgence(): string {
    let code: number | null = this.authService.getAgenceChoisie();

    if (code === null) {
      try {
        const charge = (this.authService.getToken() ?? '')
          .split('.')[1]
          .replace(/-/g, '+')
          .replace(/_/g, '/');
        code = Number(JSON.parse(atob(charge)).code_structure);
      } catch {
        code = null;
      }
    }

    return code !== null && code >= 201 && code <= 269 ? `Agence ${code - 200}` : '';
  }

  imprimerBon(): void {
    const m = this.mouvementBon;
    if (!m) {
      return;
    }

    const e = (v: unknown) => this.esc(v);
    const entree = this.estBonEntree;
    const date = new Date(m.dateMouvement).toLocaleDateString('fr-FR');
    const pu = Number((m.article as any)?.prixAchat ?? 0);
    const montant = pu * m.quantite;
    const fmt = (n: number) =>
      n > 0
        ? n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : '';
    const fournisseur = m.fournisseur ? `${m.fournisseur.nom} ${m.fournisseur.prenom}` : '';
    const demandeDate = this.bon.demandeDate
      ? new Date(this.bon.demandeDate).toLocaleDateString('fr-FR')
      : '';
    const agence = this.libelleAgence();

    // Tableau : une ligne remplie, puis des lignes vides jusqu'à 16
    let lignes =
      `<tr><td>1</td><td class="g">${e(m.article?.nom)}</td><td>${e(m.article?.reference)}</td>` +
      `<td>${e(m.quantite)}</td><td>${fmt(pu)}</td><td>${fmt(montant)}</td><td>${e(m.motif)}</td></tr>`;
    for (let i = 2; i <= 16; i++) {
      lignes += '<tr>' + '<td>&nbsp;</td>'.repeat(7) + '</tr>';
    }

    const tableau =
      `<table class="lignes"><thead><tr><th style="width:6%">N°</th><th>Désignation</th>` +
      `<th style="width:13%">Référence</th><th style="width:9%">Quantité</th>` +
      `<th style="width:10%">P.U</th><th style="width:12%">Montant</th>` +
      `<th style="width:18%">Observations</th></tr></thead><tbody>${lignes}</tbody></table>`;

    const enteteGauche =
      `<div><div class="inst">Caisse Nationale<br>des Assurances Sociales</div>` +
      `<div class="cadre">Agence de : <b>${e(agence)}</b></div></div>`;

    let corps: string;

    if (entree) {
      corps =
        `<div class="entete">${enteteGauche}<div class="num">N° ${e(this.numeroBon)}</div></div>` +
        `<h1>BON D'ENTREE</h1>` +
        `<div class="infos"><div>` +
        `<p>Bon de commande n° : ${e(this.bon.bonCommande)}</p><p>Date : ${e(date)}</p></div><div>` +
        `<p>Nom de Fournisseur : ${e(fournisseur)}</p><p>Facture n° : ${e(this.bon.facture)}</p>` +
        `<p>Bon de livraison : ${e(this.bon.bonLivraison)}</p></div></div>` +
        tableau +
        `<div class="pied"><div><p>Nom du Livreur : ${e(this.bon.nomLivreur)}</p><p class="sig">Signature,</p></div>` +
        `<div><p>Fait à ................ le ${e(date)}</p>` +
        `<p>Nom du Magasinier : ${e(this.bon.nomMagasinier)}</p><p class="sig">Signature,</p></div></div>`;
    } else {
      corps =
        `<div class="entete">${enteteGauche}<div class="droite"><div class="num">N° ${e(this.numeroBon)}</div>` +
        `<p>Nom du bénéficiaire : ${e(this.bon.beneficiaire)}</p></div></div>` +
        `<h1>BON DE SORTIE</h1>` +
        `<p class="demande">Demande d'approvisionnement n° ${e(this.bon.demandeNumero)} du : ${e(demandeDate)}</p>` +
        tableau +
        `<div class="pied"><div><p><b>Le Preneur :</b></p><p>Nom : ${e(this.bon.preneurNom)}</p>` +
        `<p>Prénom : ${e(this.bon.preneurPrenom)}</p><p>Qualité : ${e(this.bon.preneurQualite)}</p>` +
        `<p class="sig">Signature,</p></div>` +
        `<div><p>Date ................ le ${e(date)}</p><p><b>Le Magasinier</b></p>` +
        `<p>Nom : ${e(this.bon.magasinierNom)}</p><p>Prénom : ${e(this.bon.magasinierPrenom)}</p>` +
        `<p class="sig">Signature,</p></div></div>`;
    }

    const style =
      `@page{size:A4;margin:12mm}` +
      `body{font-family:"Times New Roman",serif;color:#0b5a8a;font-size:13px;margin:0}` +
      `.entete{display:flex;justify-content:space-between;align-items:flex-start}` +
      `.inst{font-weight:bold;font-size:14px;line-height:1.3}` +
      `.cadre{border:1.5px solid #0b5a8a;width:240px;height:90px;padding:6px;margin-top:6px}` +
      `.num{font-weight:bold;font-size:15px}.droite{text-align:right}` +
      `h1{text-align:center;font-size:20px;text-decoration:underline;margin:18px 0}` +
      `.infos{display:flex;border:1.5px solid #0b5a8a;border-bottom:none;padding:6px 10px}` +
      `.infos>div{flex:1}.infos p,.demande{margin:6px 0}` +
      `table.lignes{width:100%;border-collapse:collapse;border:1.5px solid #0b5a8a}` +
      `.lignes th{border:1px solid #0b5a8a;padding:5px;font-weight:normal}` +
      `.lignes td{border-left:1px solid #0b5a8a;border-right:1px solid #0b5a8a;` +
      `border-bottom:1px dotted #0b5a8a;height:24px;padding:2px 5px;text-align:center}` +
      `.lignes td.g{text-align:left}` +
      `.pied{display:flex;justify-content:space-between;margin-top:18px}` +
      `.pied p{margin:6px 0}.sig{font-style:italic;font-size:11px;margin-left:40px}`;

    const html =
      `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">` +
      `<title>${entree ? "Bon d'entrée" : 'Bon de sortie'} ${e(this.numeroBon)}</title>` +
      `<style>${style}</style></head><body>${corps}</body></html>`;

       // Impression via un cadre invisible : aucune nouvelle page ne reste ouverte
    const cadre = document.createElement('iframe');
    cadre.style.position = 'fixed';
    cadre.style.right = '0';
    cadre.style.bottom = '0';
    cadre.style.width = '0';
    cadre.style.height = '0';
    cadre.style.border = '0';
    document.body.appendChild(cadre);

    const fenetreCadre = cadre.contentWindow;
    const docCadre = fenetreCadre?.document;

    if (!fenetreCadre || !docCadre) {
      document.body.removeChild(cadre);
      this.erreur = "Impossible de préparer l'impression.";
      return;
    }

    docCadre.open();
    docCadre.write(html);
    docCadre.close();

    // Le cadre est retiré une fois l'impression terminée ou annulée
    fenetreCadre.onafterprint = () => {
      if (cadre.parentNode) {
        cadre.parentNode.removeChild(cadre);
      }
    };

    setTimeout(() => {
      fenetreCadre.focus();
      fenetreCadre.print();
    }, 300);

    this.fermerBon();
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
