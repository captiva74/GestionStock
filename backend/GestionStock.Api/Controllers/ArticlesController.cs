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
public class ArticlesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IJournalService _journalService;

    public ArticlesController(ApplicationDbContext context, IJournalService journalService)
    {
        _context = context;
        _journalService = journalService;
    }

    // GET : api/articles
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Article>>> GetArticles()
    {
        return await _context.Articles
            .AsNoTracking()
            .Include(a => a.Categorie)
            .OrderBy(a => a.Nom)
            .ToListAsync();
    }

    // GET : api/articles/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Article>> GetArticle(int id)
    {
        var article = await _context.Articles
            .AsNoTracking()
            .Include(a => a.Categorie)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (article is null)
            return NotFound();

        return Ok(article);
    }

    // POST : api/articles
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<Article>> CreateArticle(Article article)
    {
        article.Id = 0;

        var categorieExiste = await _context.Categories
            .AnyAsync(c => c.Id == article.CategorieId);

        if (!categorieExiste)
            return BadRequest("La catégorie indiquée n'existe pas.");

        if (article.ValeurAcquisition < 0)
            return BadRequest("La valeur d'acquisition ne peut pas être négative.");

        if (article.TypeGestion == TypeGestionArticle.MaterielIndividuel)
        {
            if (string.IsNullOrWhiteSpace(article.Reference))
                return BadRequest("Le numéro d'inventaire est obligatoire pour un matériel individuel.");

            var referenceExiste = await _context.Articles
                .AnyAsync(a => a.Reference == article.Reference);

            if (referenceExiste)
                return BadRequest("Ce numéro d'inventaire existe déjà.");
        }
        else
        {
            // Pas de numéro d'inventaire pour les fournitures consommables
            article.Reference = null;
        }

        article.PrixAchat = article.ValeurAcquisition;
        article.PrixVente = 0;

        if (article.TypeGestion == TypeGestionArticle.Fourniture)
        {
            if (article.QuantiteStock < 0)
                return BadRequest("La quantité en stock ne peut pas être négative.");

            if (article.SeuilMinimum < 0)
                return BadRequest("Le seuil minimum ne peut pas être négatif.");
        }
        else
        {
            article.QuantiteStock = 1;
            article.SeuilMinimum = 0;
        }

        _context.Articles.Add(article);
        await _context.SaveChangesAsync();

        var (userId, userNom) = GetUtilisateurCourant();
        await _journalService.EnregistrerAsync(
            userId, userNom, "Création", "Article", article.Id,
            $"{article.Reference} - {article.Nom}");

        return CreatedAtAction(
            nameof(GetArticle),
            new { id = article.Id },
            article);
    }

    // PUT : api/articles/5
    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateArticle(int id, Article article)
    {
        if (id != article.Id)
            return BadRequest("L'identifiant de l'URL ne correspond pas à celui du matériel.");

        var articleExistant = await _context.Articles.FindAsync(id);

        if (articleExistant is null)
            return NotFound();

        var categorieExiste = await _context.Categories
            .AnyAsync(c => c.Id == article.CategorieId);

        if (!categorieExiste)
            return BadRequest("La catégorie indiquée n'existe pas.");

        if (article.ValeurAcquisition < 0)
            return BadRequest("La valeur d'acquisition ne peut pas être négative.");

        if (article.TypeGestion == TypeGestionArticle.MaterielIndividuel)
        {
            if (string.IsNullOrWhiteSpace(article.Reference))
                return BadRequest("Le numéro d'inventaire est obligatoire pour un matériel individuel.");

            var referenceExiste = await _context.Articles
                .AnyAsync(a => a.Reference == article.Reference && a.Id != id);

            if (referenceExiste)
                return BadRequest("Ce numéro d'inventaire est déjà utilisé par un autre matériel.");

            articleExistant.Reference = article.Reference;
        }
        else
        {
            articleExistant.Reference = null;
        }
        articleExistant.Nom = article.Nom;
        articleExistant.TypeGestion = article.TypeGestion;
        articleExistant.CategorieId = article.CategorieId;
        articleExistant.Marque = article.Marque;
        articleExistant.Modele = article.Modele;
        articleExistant.NumeroSerie = article.NumeroSerie;
        articleExistant.DateAcquisition = article.DateAcquisition;
        articleExistant.ValeurAcquisition = article.ValeurAcquisition;
        articleExistant.PrixAchat = article.ValeurAcquisition;
        articleExistant.ServiceAffectation = article.ServiceAffectation;
        articleExistant.BureauAffectation = article.BureauAffectation;
        articleExistant.Etat = article.Etat;
        articleExistant.Observations = article.Observations;
        articleExistant.EstActif = article.EstActif;
        articleExistant.SeuilMinimum = article.SeuilMinimum;

        await _context.SaveChangesAsync();

        var (userId, userNom) = GetUtilisateurCourant();
        await _journalService.EnregistrerAsync(
            userId, userNom, "Modification", "Article", id,
            $"{articleExistant.Reference} - {articleExistant.Nom}");

        return NoContent();
    }

    // PATCH : api/articles/5/desactiver
    [Authorize(Roles = "Admin")]
    [HttpPatch("{id:int}/desactiver")]
    public async Task<IActionResult> DesactiverArticle(int id)
    {
        var article = await _context.Articles.FindAsync(id);

        if (article is null)
            return NotFound();

        article.EstActif = false;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // PATCH : api/articles/5/reformer
    [Authorize(Roles = "Admin")]
    [HttpPatch("{id:int}/reformer")]
    public async Task<IActionResult> ReformerArticle(int id)
    {
        var article = await _context.Articles.FindAsync(id);

        if (article is null)
            return NotFound();

        article.Etat = "Réformé";
        article.EstActif = false;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE : api/articles/5
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteArticle(int id)
    {
        var article = await _context.Articles.FindAsync(id);

        if (article is null)
            return NotFound();

        var mouvementsLies = await _context.MouvementsStock
            .AnyAsync(m => m.ArticleId == id);

        if (mouvementsLies)
            return BadRequest(
                "Impossible de supprimer ce matériel : des mouvements de stock lui sont associés.");

        var (userId, userNom) = GetUtilisateurCourant();
        await _journalService.EnregistrerAsync(
            userId, userNom, "Suppression", "Article", id,
            $"{article.Reference} - {article.Nom}");

        _context.Articles.Remove(article);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private (int id, string nom) GetUtilisateurCourant()
    {
        var id = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var nom = User.FindFirstValue("nomComplet") ?? "Inconnu";
        return (id, nom);
    }
}