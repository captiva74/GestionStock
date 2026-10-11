using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace GestionStock.Api.Models;

public enum TypeGestionArticle
{
    MaterielIndividuel = 0,
    Fourniture = 1
}

[Index(nameof(Reference), IsUnique = true)]
public class Article
{
    public int Id { get; set; }

    // Mode de gestion : matériel individuel ou fourniture en quantité
    public TypeGestionArticle TypeGestion { get; set; }
        = TypeGestionArticle.MaterielIndividuel;

    // Numéro d'inventaire unique
    [MaxLength(50)]
    public string? Reference { get; set; }

    // Désignation du matériel
    [Required]
    [MaxLength(150)]
    public string Nom { get; set; } = string.Empty;

    public int CategorieId { get; set; }

    public Categorie? Categorie { get; set; }

    // Informations sur l'équipement
    [MaxLength(100)]
    public string? Marque { get; set; }

    [MaxLength(100)]
    public string? Modele { get; set; }

    [MaxLength(100)]
    public string? NumeroSerie { get; set; }

    public DateTime? DateAcquisition { get; set; }

    [Precision(18, 2)]
    public decimal ValeurAcquisition { get; set; }

    // Affectation administrative
    [MaxLength(150)]
    public string? ServiceAffectation { get; set; }

    [MaxLength(100)]
    public string? BureauAffectation { get; set; }

    // État : Neuf, Bon état, En panne, Réformé...
    [Required]
    [MaxLength(30)]
    public string Etat { get; set; } = "Bon état";

    [MaxLength(500)]
    public string? Observations { get; set; }

    // Conservé pour la compatibilité avec le fonctionnement existant
    public bool EstActif { get; set; } = true;

    // Compatibilité avec les anciennes colonnes SQL Server
    [Precision(18, 2)]
    public decimal PrixAchat { get; set; }

    [Precision(18, 2)]
    public decimal PrixVente { get; set; }
    public int QuantiteStock { get; set; } = 1;
    public int SeuilMinimum { get; set; }
}
