using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace GestionStock.Api.Models;

public enum TypeMouvementStock
{
    Entree = 0,
    Sortie = 1
}

public class MouvementStock
{
    public int Id { get; set; }

    public int ArticleId { get; set; }

    public Article? Article { get; set; }

    public TypeMouvementStock TypeMouvement { get; set; }

    [Range(1, int.MaxValue)]
    public int Quantite { get; set; }

    public DateTime DateMouvement { get; set; } = DateTime.Now;

    [MaxLength(250)]
    public string? Motif { get; set; }
}