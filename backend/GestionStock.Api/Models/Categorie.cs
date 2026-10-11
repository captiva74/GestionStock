using System.ComponentModel.DataAnnotations;

namespace GestionStock.Api.Models;

public class Categorie
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Nom { get; set; } = string.Empty;

    [MaxLength(250)]
    public string? Description { get; set; }

    public bool EstActive { get; set; } = true;
}
