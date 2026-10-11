using GestionStock.Api.Data;
using GestionStock.Api.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GestionStock.Api.Controllers;

[ApiController]
[Route("api/utilisateurs")]
[Authorize(Roles = "Admin")]
public class UtilisateursController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UtilisateursController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET api/utilisateurs
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UtilisateurDto>>> GetUtilisateurs()
    {
        var utilisateurs = await _context.Utilisateurs
            .AsNoTracking()
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

        if (utilisateur is null)
            return NotFound();

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

        if (utilisateur is null)
            return NotFound();

        _context.Utilisateurs.Remove(utilisateur);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}