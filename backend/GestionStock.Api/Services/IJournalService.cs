namespace GestionStock.Api.Services;

public interface IJournalService
{
    Task EnregistrerAsync(int utilisateurId, string nomUtilisateur, string action, string entite, int? entiteId, string? details = null);
}