using System.Security.Claims;
using GestionStock.Api.Data;
using GestionStock.Api.Dtos;
using GestionStock.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GestionStock.Api.Controllers;

[ApiController]
[Route("api/utilisateurs")]
[Authorize(Roles = "Admin,AdminAgence")]
public class UtilisateursController : ControllerBase
{
    private readonly CentralDbContext _context;

    public UtilisateursController(CentralDbContext context)
    {
        _context = context;
    }

    // Admin = super admin du siège (toutes les agences)
    private bool EstSuperAdmin => User.IsInRole("Admin");

    private int MonId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // Code agence lu dans le jeton (jamais envoyé par le client)
    private int? MonCode =>
        int.TryParse(User.FindFirstValue("code_structure"), out var c) ? c : null;

    private bool DansMonPerimetre(Utilisateur u) =>
        EstSuperAdmin || (MonCode is not null && u.CodeStructure == MonCode.Value);

    // GET api/utilisateurs
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UtilisateurDto>>> GetUtilisateurs([FromQuery] int? agence)
    {
        var requete = _context.Utilisateurs.AsNoTracking().AsQueryable();

        if (EstSuperAdmin)
        {
            if (agence.HasValue)
                requete = requete.Where(u => u.CodeStructure == agence.Value);
        }
        else
        {
            if (MonCode is null)
                return Forbid();

            var code = MonCode.Value;
            requete = requete.Where(u => u.CodeStructure == code);
        }

        var utilisateurs = await requete
            .OrderBy(u => u.NomComplet)
            .Select(u => new UtilisateurDto
            {
                Id = u.Id,
                NomComplet = u.NomComplet,
                Email = u.Email,
                Role = u.Role.ToString(),
                EstActif = u.EstActif,
                DateCreation = u.DateCreation
            })
            .ToListAsync();

        return Ok(utilisateurs);
    }

    // PUT api/utilisateurs/5
    [HttpPut("{id:int}")]
    public async Task<IActionResult> ModifierUtilisateur(int id, AdminModifierUtilisateurDto dto)
    {
        var utilisateur = await _context.Utilisateurs.FindAsync(id);

        // 404 volontaire pour un compte d'une autre agence : on ne révèle pas son existence
        if (utilisateur is null || !DansMonPerimetre(utilisateur))
            return NotFound();

        if (!Enum.IsDefined(dto.Role))
            return BadRequest("Rôle invalide.");

        if (!EstSuperAdmin)
        {
            // Un admin d'agence ne gère que les comptes simples, et ne peut pas donner un rôle élevé
            if (utilisateur.Role != RoleUtilisateur.Utilisateur || dto.Role != RoleUtilisateur.Utilisateur)
                return Forbid();
        }

        // Personne ne peut retirer son propre rôle ni désactiver son propre compte ici
        if (id == MonId && (dto.Role != utilisateur.Role || !dto.EstActif))
            return BadRequest("Vous ne pouvez pas modifier votre propre rôle ni désactiver votre compte.");

        var emailPrisParAutre = await _context.Utilisateurs
            .AnyAsync(u => u.Email == dto.Email.Trim().ToLower() && u.Id != id);

        if (emailPrisParAutre)
            return BadRequest("Cette adresse email est déjà utilisée par un autre compte.");

        utilisateur.NomComplet = dto.NomComplet.Trim();
        utilisateur.Email = dto.Email.Trim().ToLower();
        utilisateur.Role = dto.Role;
        utilisateur.EstActif = dto.EstActif;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE api/utilisateurs/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> SupprimerUtilisateur(int id)
    {
        var utilisateur = await _context.Utilisateurs.FindAsync(id);

        if (utilisateur is null || !DansMonPerimetre(utilisateur))
            return NotFound();

        if (id == MonId)
            return BadRequest("Vous ne pouvez pas supprimer votre propre compte.");

        if (!EstSuperAdmin && utilisateur.Role != RoleUtilisateur.Utilisateur)
            return Forbid();

        _context.Utilisateurs.Remove(utilisateur);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}