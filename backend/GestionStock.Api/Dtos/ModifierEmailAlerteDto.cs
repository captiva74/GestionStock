using System.ComponentModel.DataAnnotations;

namespace GestionStock.Api.Dtos;

public class ModifierEmailAlerteDto
{
    [EmailAddress(ErrorMessage = "Veuillez saisir une adresse e-mail valide.")]
    [MaxLength(200, ErrorMessage = "L'adresse e-mail ne doit pas dépasser 200 caractères.")]
    public string? EmailAlerteStock { get; set; }
}