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
public class MouvementsStockController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly IJournalService _journalService;

    public MouvementsStockController(
        ApplicationDbContext context,
        IEmailService emailService,
        IJournalService journalService)
    {
        _context = context;
        _emailService = emailService;
        _journalService = journalService;
    }

    // GET : api/mouvementsstock
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MouvementStock>>> GetMouvements()
    {
        var mouvements = await _context.MouvementsStock
            .AsNoTracking()
            .Include(m => m.Article)
            .OrderByDescending(m => m.DateMouvement)
            .ToListAsync();

        return Ok(mouvements);
    }

    // GET : api/mouvementsstock/article/5
    [HttpGet("article/{articleId:int}")]
    public async Task<ActionResult<IEnumerable<MouvementStock>>> GetMouvementsArticle(
        int articleId)
    {
        var mouvements = await _context.MouvementsStock
            .AsNoTracking()
            .Where(m => m.ArticleId == articleId)
            .OrderByDescending(m => m.DateMouvement)
            .ToListAsync();

        return Ok(mouvements);
    }

    // POST : api/mouvementsstock
    [HttpPost]
    public async Task<ActionResult<MouvementStock>> AjouterMouvement(
        MouvementStock mouvement)
    {
        if (mouvement.Quantite <= 0)
            return BadRequest("La quantité doit être supérieure à zéro.");

        var article = await _context.Articles
            .FirstOrDefaultAsync(a => a.Id == mouvement.ArticleId);

        if (article is null)
            return NotFound("Article introuvable.");

        if (article.TypeGestion != TypeGestionArticle.Fourniture)
            return BadRequest(
                "Les mouvements de stock sont réservés aux fournitures.");

        if (mouvement.TypeMouvement != TypeMouvementStock.Entree &&
            mouvement.TypeMouvement != TypeMouvementStock.Sortie)
        {
            return BadRequest("Type de mouvement invalide.");
        }

        if (mouvement.TypeMouvement == TypeMouvementStock.Sortie &&
            mouvement.Quantite > article.QuantiteStock)
        {
            return BadRequest(
                $"Stock insuffisant. Quantité disponible : {article.QuantiteStock}.");
        }

        var franchitLeSeuil = false;

        if (mouvement.TypeMouvement == TypeMouvementStock.Entree)
        {
            if (article.QuantiteStock > int.MaxValue - mouvement.Quantite)
                return BadRequest("La quantité dépasse la limite autorisée.");

            article.QuantiteStock += mouvement.Quantite;
        }
        else
        {
            var etaitAuDessusDuSeuil = article.QuantiteStock > article.SeuilMinimum;

            article.QuantiteStock -= mouvement.Quantite;

            franchitLeSeuil = etaitAuDessusDuSeuil && article.QuantiteStock <= article.SeuilMinimum;
        }

        mouvement.Id = 0;
        mouvement.Article = null;
        mouvement.DateMouvement = DateTime.Now;

        _context.MouvementsStock.Add(mouvement);

        await _context.SaveChangesAsync();

        var (userId, userNom) = GetUtilisateurCourant();
        await _journalService.EnregistrerAsync(
            userId, userNom, "Création", "Mouvement de stock", mouvement.Id,
            $"{mouvement.TypeMouvement} de {mouvement.Quantite} sur {article.Nom}");

        if (franchitLeSeuil)
        {
            await EnvoyerAlerteStockBasAsync(article);
        }

        return CreatedAtAction(
            nameof(GetMouvementsArticle),
            new { articleId = mouvement.ArticleId },
            mouvement);
    }

    // DELETE : api/mouvementsstock/5
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> SupprimerMouvement(int id)
    {
        var mouvement = await _context.MouvementsStock
            .FirstOrDefaultAsync(m => m.Id == id);

        if (mouvement is null)
            return NotFound("Mouvement introuvable.");

        var article = await _context.Articles
            .FirstOrDefaultAsync(a => a.Id == mouvement.ArticleId);

        if (article is not null)
        {
            if (mouvement.TypeMouvement == TypeMouvementStock.Entree)
            {
                if (mouvement.Quantite > article.QuantiteStock)
                    return BadRequest(
                        "Impossible de supprimer : le stock actuel est inférieur à la quantité de ce mouvement.");

                article.QuantiteStock -= mouvement.Quantite;
            }
            else
            {
                if (article.QuantiteStock > int.MaxValue - mouvement.Quantite)
                    return BadRequest("La quantité dépasse la limite autorisée.");

                article.QuantiteStock += mouvement.Quantite;
            }
        }

        var detailsSuppression = article is not null
            ? $"{mouvement.TypeMouvement} de {mouvement.Quantite} sur {article.Nom}"
            : $"{mouvement.TypeMouvement} de {mouvement.Quantite}";

        _context.MouvementsStock.Remove(mouvement);

        await _context.SaveChangesAsync();

        var (userId, userNom) = GetUtilisateurCourant();
        await _journalService.EnregistrerAsync(
            userId, userNom, "Suppression", "Mouvement de stock", id, detailsSuppression);

        return NoContent();
    }

    private async Task EnvoyerAlerteStockBasAsync(Article article)
    {
        var emailsAdmins = await _context.Utilisateurs
            .Where(u => u.Role == RoleUtilisateur.Admin && u.EstActif)
            .Select(u => u.Email)
            .ToListAsync();

        if (emailsAdmins.Count == 0)
            return;

        var corps = $@"
            <p>Alerte stock bas sur GestionStock :</p>
            <ul>
                <li><strong>Article :</strong> {article.Nom} ({article.Reference})</li>
                <li><strong>Stock actuel :</strong> {article.QuantiteStock}</li>
                <li><strong>Seuil minimum :</strong> {article.SeuilMinimum}</li>
            </ul>
            <p>Pensez à réapprovisionner cet article.</p>";

        foreach (var email in emailsAdmins)
        {
            try
            {
                await _emailService.EnvoyerEmailAsync(email, $"⚠️ Stock bas : {article.Nom}", corps);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Échec d'envoi d'alerte stock à {email} : {ex.Message}");
            }
        }
    }

    private (int id, string nom) GetUtilisateurCourant()
    {
        var id = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var nom = User.FindFirstValue("nomComplet") ?? "Inconnu";
        return (id, nom);
    }
}