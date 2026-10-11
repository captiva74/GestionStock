import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  exporterPdf(titre: string, colonnes: string[], lignes: any[][], nomFichier: string): void {
    const doc = new jsPDF({ orientation: 'landscape' });

    doc.setFontSize(14);
    doc.text(titre, 14, 15);

    autoTable(doc, {
      head: [colonnes],
      body: lignes,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 58, 95] }
    });

    doc.save(`${nomFichier}.pdf`);
  }

  async exporterExcel(titre: string, colonnes: string[], lignes: any[][], nomFichier: string): Promise<void> {
    const classeur = new ExcelJS.Workbook();
    const feuille = classeur.addWorksheet('Données');

    const bordure: Partial<ExcelJS.Borders> = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };

    // Ligne de titre, fusionnée sur toute la largeur du tableau
    feuille.mergeCells(1, 1, 1, colonnes.length);
    const celluleTitre = feuille.getCell(1, 1);
    celluleTitre.value = titre;
    celluleTitre.font = { bold: true, size: 14, color: { argb: 'FF1E3A5F' } };
    celluleTitre.alignment = { vertical: 'middle', horizontal: 'left' };
    feuille.getRow(1).height = 26;

    // Ligne vide d'espacement
    feuille.addRow([]);

    // En-tête des colonnes
    const ligneEntete = feuille.addRow(colonnes);
    ligneEntete.eachCell((cellule) => {
      cellule.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cellule.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E3A5F' }
      };
      cellule.border = bordure;
      cellule.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Données
    lignes.forEach((ligne) => {
      const rangee = feuille.addRow(ligne);
      rangee.eachCell((cellule) => {
        cellule.border = bordure;
      });
    });

    // Largeur automatique des colonnes
    feuille.columns.forEach((colonne, index) => {
      const longueurMax = Math.max(
        colonnes[index]?.length || 10,
        ...lignes.map((l) => String(l[index] ?? '').length)
      );
      colonne.width = Math.min(Math.max(longueurMax + 2, 10), 40);
    });

    const tampon = await classeur.xlsx.writeBuffer();
    const lien = document.createElement('a');
    const url = window.URL.createObjectURL(
      new Blob([tampon], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    );
    lien.href = url;
    lien.download = `${nomFichier}.xlsx`;
    lien.click();
    window.URL.revokeObjectURL(url);
  }
}