using GestionStock.Api.Data;
using GestionStock.Api.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GestionStock.Api.Controllers;

[ApiController]
[Route("api/journal")]
[Authorize(Roles = "Admin,AdminAgence")]
public class JournalController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public JournalController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET api/journal
    [HttpGet]
    public async Task<ActionResult<IEnumerable<JournalActiviteDto>>> GetJournal(
        [FromQuery] string? entite,
        [FromQuery] string? action,
        [FromQuery] DateTime? dateDebut,
        [FromQuery] DateTime? dateFin)
    {
        var requete = _context.JournalsActivite.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(entite))
            requete = requete.Where(j => j.Entite == entite);

        if (!string.IsNullOrWhiteSpace(action))
            requete = requete.Where(j => j.Action == action);

        if (dateDebut.HasValue)
            requete = requete.Where(j => j.DateAction >= dateDebut.Value);

        if (dateFin.HasValue)
            requete = requete.Where(j => j.DateAction <= dateFin.Value.AddDays(1));

        var resultats = await requete
            .OrderByDescending(j => j.DateAction)
            .Take(500) // Limite de sécurité, évite de charger un historique énorme
            .Select(j => new JournalActiviteDto
            {
                Id = j.Id,
                NomUtilisateur = j.NomUtilisateur,
                Action = j.Action,
                Entite = j.Entite,
                EntiteId = j.EntiteId,
                Details = j.Details,
                DateAction = j.DateAction
            })
            .ToListAsync();

        return Ok(resultats);
    }
}