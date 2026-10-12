
using System.ComponentModel.DataAnnotations;

namespace GestionStock.Api.Models;

public class Fournisseur
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Nom { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Prenom { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Activite { get; set; } = string.Empty;

    [MaxLength(300)]
    public string? Adresse { get; set; }

    [EmailAddress]
    [MaxLength(254)]
    public string? Email { get; set; }

    [MaxLength(30)]
    public string? NumTelephone { get; set; }

    public ICollection<MouvementStock> MouvementsStock { get; set; }
        = new List<MouvementStock>();
}
