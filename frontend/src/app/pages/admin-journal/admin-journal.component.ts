
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JournalActivite, JournalService } from '../../services/journal.service';

@Component({
  selector: 'app-admin-journal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-journal.component.html',
  styleUrl: './admin-journal.component.css'
})
export class AdminJournalComponent implements OnInit {
  entrees: JournalActivite[] = [];
  chargement = true;
  erreur = '';

  entiteFiltre = '';
  actionFiltre = '';
  dateDebut = '';
  dateFin = '';

  // Pagination, identique à la page Catégories
  pageActuelle = 1;
  taillePage = 10;
  taillesPageDisponibles = [10, 25, 50, 100];

  constructor(private journalService: JournalService) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.chargement = true;
    this.erreur = '';
    this.pageActuelle = 1;

    this.journalService
      .getJournal({
        entite: this.entiteFiltre || undefined,
        action: this.actionFiltre || undefined,
        dateDebut: this.dateDebut || undefined,
        dateFin: this.dateFin || undefined
      })
      .subscribe({
        next: (donnees) => {
          this.entrees = donnees;
          this.pageActuelle = 1;
          this.chargement = false;
        },
        error: (err) => {
          console.error('Erreur de chargement du journal :', err);
          this.erreur = 'Impossible de charger le journal d’activité.';
          this.chargement = false;
        }
      });
  }

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(this.entrees.length / this.taillePage)
    );
  }

  get entreesAffichees(): JournalActivite[] {
    const debut = (this.pageActuelle - 1) * this.taillePage;

    return this.entrees.slice(debut, debut + this.taillePage);
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

  reinitialiser(): void {
    this.entiteFiltre = '';
    this.actionFiltre = '';
    this.dateDebut = '';
    this.dateFin = '';
    this.pageActuelle = 1;
    this.charger();
  }
}
