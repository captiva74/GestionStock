using GestionStock.Api.Data;
using GestionStock.Api.Dtos;
using GestionStock.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace GestionStock.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,AdminAgence")]
public class ParametresController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ParametresController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET : api/parametres/email-alerte
    [HttpGet("email-alerte")]
    public async Task<IActionResult> GetEmailAlerte()
    {
        var parametres = await _context.ParametresApplication
            .AsNoTracking()
            .FirstOrDefaultAsync();

        return Ok(new
        {
            EmailAlerteStock = parametres?.EmailAlerteStock
        });
    }

    // PUT : api/parametres/email-alerte
    [HttpPut("email-alerte")]
    public async Task<IActionResult> ModifierEmailAlerte(
        [FromBody] ModifierEmailAlerteDto dto)
    {
        var email = dto.EmailAlerteStock?.Trim();

        // Une adresse vide permet de désactiver les alertes par e-mail.
        if (string.IsNullOrWhiteSpace(email))
        {
            email = null;
        }
        else if (!new EmailAddressAttribute().IsValid(email))
        {
            return BadRequest(new
            {
                message = "Veuillez saisir une adresse e-mail valide."
            });
        }

        var parametres = await _context.ParametresApplication
            .FirstOrDefaultAsync();

        if (parametres == null)
        {
            parametres = new ParametresApplication
            {
                EmailAlerteStock = email
            };

            _context.ParametresApplication.Add(parametres);
        }
        else
        {
            parametres.EmailAlerteStock = email;
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = email == null
                ? "Les alertes par e-mail sont désactivées."
                : "L'adresse e-mail d'alerte a été enregistrée.",
            EmailAlerteStock = email
        });
    }
}