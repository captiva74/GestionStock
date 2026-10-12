namespace GestionStock.Api.Models;

public enum RoleUtilisateur
{
    Admin = 0,         // super admin du siège : toutes les agences
    Utilisateur = 1,   // utilisateur simple
    AdminAgence = 2    // nouveau : gère les comptes de son agence uniquement
}