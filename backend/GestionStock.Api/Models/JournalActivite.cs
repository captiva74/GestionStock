using System.ComponentModel.DataAnnotations;

namespace GestionStock.Api.Models;

public class JournalActivite
{
    public int Id { get; set; }

    public int UtilisateurId { get; set; }

    [MaxLength(150)]
    public string NomUtilisateur { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Action { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Entite { get; set; } = string.Empty;

    public int? EntiteId { get; set; }

    [MaxLength(500)]
    public string? Details { get; set; }

    public DateTime DateAction { get; set; } = DateTime.Now;
}