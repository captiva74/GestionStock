using GestionStock.Api.Data;
using GestionStock.Api.Models;

namespace GestionStock.Api.Services;

public class JournalService : IJournalService
{
    private readonly ApplicationDbContext _context;

    public JournalService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task EnregistrerAsync(int utilisateurId, string nomUtilisateur, string action, string entite, int? entiteId, string? details = null)
    {
        var entree = new JournalActivite
        {
            UtilisateurId = utilisateurId,
            NomUtilisateur = nomUtilisateur,
            Action = action,
            Entite = entite,
            EntiteId = entiteId,
            Details = details
        };

        _context.JournalsActivite.Add(entree);
        await _context.SaveChangesAsync();
    }
}