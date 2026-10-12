using System.ComponentModel.DataAnnotations;
using GestionStock.Api.Models;

namespace GestionStock.Api.Dtos;

public class RegisterDto
{
    [Required, MaxLength(150)]
    public string NomComplet { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(200)]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(6)]
    public string MotDePasse { get; set; } = string.Empty;

    [Range(201, 269)]
    public int CodeStructure { get; set; }

    [Required, MaxLength(50)]
    public string CodeInscription { get; set; } = string.Empty;
}

public class LoginDto
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string MotDePasse { get; set; } = string.Empty;
}

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public int Id { get; set; }
    public string NomComplet { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}

public class MotDePasseOublieDto
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;
}

public class ReinitialiserMotDePasseDto
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Token { get; set; } = string.Empty;

    [Required, MinLength(6)]
    public string NouveauMotDePasse { get; set; } = string.Empty;
}

public class ChangerMotDePasseDto
{
    [Required]
    public string AncienMotDePasse { get; set; } = string.Empty;

    [Required, MinLength(6)]
    public string NouveauMotDePasse { get; set; } = string.Empty;
}

public class ModifierProfilDto
{
    [Required, MaxLength(150)]
    public string NomComplet { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(200)]
    public string Email { get; set; } = string.Empty;
}

public class UtilisateurDto
{
    public int Id { get; set; }
    public string NomComplet { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool EstActif { get; set; }
    public DateTime DateCreation { get; set; }
}

public class AdminModifierUtilisateurDto
{
    [Required, MaxLength(150)]
    public string NomComplet { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(200)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public RoleUtilisateur Role { get; set; }

    public bool EstActif { get; set; } = true;
}