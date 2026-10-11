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

  constructor(private journalService: JournalService) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.chargement = true;
    this.erreur = '';

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
          this.chargement = false;
        },
        error: (err) => {
          console.error('Erreur de chargement du journal :', err);
          this.erreur = 'Impossible de charger le journal d’activité.';
          this.chargement = false;
        }
      });
  }

  reinitialiser(): void {
    this.entiteFiltre = '';
    this.actionFiltre = '';
    this.dateDebut = '';
    this.dateFin = '';
    this.charger();
  }
}