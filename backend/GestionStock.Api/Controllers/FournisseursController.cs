using System.Security.Claims;
using GestionStock.Api.Data;
using GestionStock.Api.Models;
using GestionStock.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GestionStock.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FournisseursController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IJournalService _journalService;

    public FournisseursController(
        ApplicationDbContext context,
        IJournalService journalService)
    {
        _context = context;
        _journalService = journalService;
    }

    // GET : api/fournisseurs
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Fournisseur>>> GetFournisseurs()
    {
        var fournisseurs = await _context.Fournisseurs
            .AsNoTracking()
            .OrderBy(f => f.Nom)
            .ThenBy(f => f.Prenom)
            .ToListAsync();

        return Ok(fournisseurs);
    }

    // GET : api/fournisseurs/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Fournisseur>> GetFournisseur(int id)
    {
        var fournisseur = await _context.Fournisseurs
            .AsNoTracking()
            .FirstOrDefaultAsync(f => f.Id == id);

        if (fournisseur is null)
            return NotFound();

        return Ok(fournisseur);
    }

    // POST : api/fournisseurs
    [Authorize(Roles = "Admin,AdminAgence")]
    [HttpPost]
    public async Task<ActionResult<Fournisseur>> CreateFournisseur(
        Fournisseur fournisseur)
    {
        fournisseur.Id = 0;
        fournisseur.MouvementsStock = new List<MouvementStock>();

        if (string.IsNullOrWhiteSpace(fournisseur.Nom))
            return BadRequest("Le nom du fournisseur est obligatoire.");

        if (string.IsNullOrWhiteSpace(fournisseur.Prenom))
            return BadRequest("Le prénom du fournisseur est obligatoire.");

        if (string.IsNullOrWhiteSpace(fournisseur.Activite))
            return BadRequest("L'activité du fournisseur est obligatoire.");

        _context.Fournisseurs.Add(fournisseur);
        await _context.SaveChangesAsync();

        var (userId, userNom) = GetUtilisateurCourant();

        await _journalService.EnregistrerAsync(
            userId,
            userNom,
            "Création",
            "Fournisseur",
            fournisseur.Id,
            $"{fournisseur.Nom} {fournisseur.Prenom}");

        return CreatedAtAction(
            nameof(GetFournisseur),
            new { id = fournisseur.Id },
            fournisseur);
    }

    // PUT : api/fournisseurs/5
    [Authorize(Roles = "Admin,AdminAgence")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateFournisseur(
        int id,
        Fournisseur fournisseur)
    {
        if (id != fournisseur.Id)
            return BadRequest(
                "L'identifiant de l'URL ne correspond pas à celui du fournisseur.");

        var fournisseurExistant = await _context.Fournisseurs.FindAsync(id);

        if (fournisseurExistant is null)
            return NotFound();

        if (string.IsNullOrWhiteSpace(fournisseur.Nom))
            return BadRequest("Le nom du fournisseur est obligatoire.");

        if (string.IsNullOrWhiteSpace(fournisseur.Prenom))
            return BadRequest("Le prénom du fournisseur est obligatoire.");

        if (string.IsNullOrWhiteSpace(fournisseur.Activite))
            return BadRequest("L'activité du fournisseur est obligatoire.");

        fournisseurExistant.Nom = fournisseur.Nom;
        fournisseurExistant.Prenom = fournisseur.Prenom;
        fournisseurExistant.Activite = fournisseur.Activite;
        fournisseurExistant.Adresse = fournisseur.Adresse;
        fournisseurExistant.Email = fournisseur.Email;
        fournisseurExistant.NumTelephone = fournisseur.NumTelephone;

        await _context.SaveChangesAsync();

        var (userId, userNom) = GetUtilisateurCourant();

        await _journalService.EnregistrerAsync(
            userId,
            userNom,
            "Modification",
            "Fournisseur",
            id,
            $"{fournisseurExistant.Nom} {fournisseurExistant.Prenom}");

        return NoContent();
    }

    // DELETE : api/fournisseurs/5
    [Authorize(Roles = "Admin,AdminAgence")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteFournisseur(int id)
    {
        var fournisseur = await _context.Fournisseurs
            .FirstOrDefaultAsync(f => f.Id == id);

        if (fournisseur is null)
            return NotFound();

        var mouvementsLies = await _context.MouvementsStock
            .AnyAsync(m => m.FournisseurId == id);

        if (mouvementsLies)
        {
            return BadRequest(
                "Ce fournisseur est associé à des mouvements de stock. " +
                "Il ne peut pas être supprimé.");
        }

        var (userId, userNom) = GetUtilisateurCourant();

        await _journalService.EnregistrerAsync(
            userId,
            userNom,
            "Suppression",
            "Fournisseur",
            id,
            $"{fournisseur.Nom} {fournisseur.Prenom}");

        _context.Fournisseurs.Remove(fournisseur);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private (int id, string nom) GetUtilisateurCourant()
    {
        var id = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var nom = User.FindFirstValue("nomComplet") ?? "Inconnu";

        return (id, nom);
    }
}