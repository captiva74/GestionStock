using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace GestionStock.Api.Models;

[Index(nameof(Email), IsUnique = true)]
public class Utilisateur
{
    public int Id { get; set; }

    [Required]
    [MaxLength(150)]
    public string NomComplet { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string MotDePasseHash { get; set; } = string.Empty;

    public RoleUtilisateur Role { get; set; } = RoleUtilisateur.Utilisateur;

    public bool EstActif { get; set; } = true;

    public DateTime DateCreation { get; set; } = DateTime.Now;

    // Réinitialisation de mot de passe
    public string? TokenReinitialisation { get; set; }

    public DateTime? TokenReinitialisationExpiration { get; set; }
}