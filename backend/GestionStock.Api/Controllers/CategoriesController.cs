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
public class CategoriesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IJournalService _journalService;

    public CategoriesController(ApplicationDbContext context, IJournalService journalService)
    {
        _context = context;
        _journalService = journalService;
    }

    // GET: api/categories
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Categorie>>> GetCategories()
    {
        return await _context.Categories
            .AsNoTracking()
            .OrderBy(c => c.Nom)
            .ToListAsync();
    }

    // GET: api/categories/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Categorie>> GetCategorie(int id)
    {
        var categorie = await _context.Categories.FindAsync(id);

        if (categorie is null)
            return NotFound();

        return Ok(categorie);
    }

    // POST: api/categories
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<Categorie>> CreateCategorie(
        Categorie categorie)
    {
        categorie.Id = 0;

        _context.Categories.Add(categorie);
        await _context.SaveChangesAsync();

        var (userId, userNom) = GetUtilisateurCourant();
        await _journalService.EnregistrerAsync(
            userId, userNom, "Création", "Catégorie", categorie.Id, categorie.Nom);

        return CreatedAtAction(
            nameof(GetCategorie),
            new { id = categorie.Id },
            categorie);
    }

    // PUT: api/categories/5
    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateCategorie(
        int id,
        Categorie categorie)
    {
        if (id != categorie.Id)
            return BadRequest("L'identifiant de l'URL ne correspond pas à celui de la catégorie.");

        var categorieExistante = await _context.Categories.FindAsync(id);

        if (categorieExistante is null)
            return NotFound();

        categorieExistante.Nom = categorie.Nom;
        categorieExistante.Description = categorie.Description;
        categorieExistante.EstActive = categorie.EstActive;

        await _context.SaveChangesAsync();

        var (userId, userNom) = GetUtilisateurCourant();
        await _journalService.EnregistrerAsync(
            userId, userNom, "Modification", "Catégorie", id, categorieExistante.Nom);

        return NoContent();
    }

    // PATCH: api/categories/5/desactiver
    [Authorize(Roles = "Admin")]
    [HttpPatch("{id:int}/desactiver")]
    public async Task<IActionResult> DesactiverCategorie(int id)
    {
        var categorie = await _context.Categories.FindAsync(id);

        if (categorie is null)
            return NotFound();

        categorie.EstActive = false;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/categories/5
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteCategorie(int id)
    {
        var categorie = await _context.Categories.FindAsync(id);

        if (categorie is null)
            return NotFound();

        var articlesLies = await _context.Articles
            .AnyAsync(a => a.CategorieId == id);

        if (articlesLies)
            return BadRequest(
                "Impossible de supprimer cette catégorie : des articles y sont encore rattachés.");

        var nomCategorie = categorie.Nom;

        _context.Categories.Remove(categorie);
        await _context.SaveChangesAsync();

        var (userId, userNom) = GetUtilisateurCourant();
        await _journalService.EnregistrerAsync(
            userId, userNom, "Suppression", "Catégorie", id, nomCategorie);

        return NoContent();
    }

    private (int id, string nom) GetUtilisateurCourant()
    {
        var id = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var nom = User.FindFirstValue("nomComplet") ?? "Inconnu";
        return (id, nom);
    }
}