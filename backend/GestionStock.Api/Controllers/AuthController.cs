using System.Security.Claims;
using GestionStock.Api.Data;
using GestionStock.Api.Dtos;
using GestionStock.Api.Models;
using GestionStock.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GestionStock.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly CentralDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;

    public AuthController(
        CentralDbContext context,
        ITokenService tokenService,
        IEmailService emailService,
        IConfiguration configuration)
    {
        _context = context;
        _tokenService = tokenService;
        _emailService = emailService;
        _configuration = configuration;
    }

    // POST api/auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var agence = await _context.Agences
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.CodeStructure == dto.CodeStructure && a.EstActive);

        // Même message dans les deux cas : on ne révèle pas si l'agence existe
        if (agence is null ||
            !string.Equals(agence.CodeInscription, dto.CodeInscription.Trim(), StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest("Agence ou code d'inscription incorrect.");
        }

        var email = dto.Email.Trim().ToLower();

        var emailExiste = await _context.Utilisateurs.AnyAsync(u => u.Email == email);

        if (emailExiste)
            return BadRequest("Cette adresse email est déjà utilisée.");

        var utilisateur = new Utilisateur
        {
            NomComplet = dto.NomComplet.Trim(),
            Email = email,
            MotDePasseHash = BCrypt.Net.BCrypt.HashPassword(dto.MotDePasse),
            Role = RoleUtilisateur.Utilisateur,   // jamais Admin à l'inscription
            EstActif = false,                     // l'admin de l'agence doit l'activer
            CodeStructure = agence.CodeStructure
        };

        _context.Utilisateurs.Add(utilisateur);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Compte créé. Il sera utilisable après activation par l'administrateur de votre agence." });
    }

    // POST api/auth/login
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
    {
        var utilisateur = await _context.Utilisateurs
            .FirstOrDefaultAsync(u => u.Email == dto.Email.Trim().ToLower());

        if (utilisateur is null || !BCrypt.Net.BCrypt.Verify(dto.MotDePasse, utilisateur.MotDePasseHash))
            return Unauthorized("Email ou mot de passe incorrect.");

        if (!utilisateur.EstActif)
            return Unauthorized("Ce compte a été désactivé.");

        var token = _tokenService.GenererToken(utilisateur);

        return Ok(new AuthResponseDto
        {
            Token = token,
            Id = utilisateur.Id,
            NomComplet = utilisateur.NomComplet,
            Email = utilisateur.Email,
            Role = utilisateur.Role.ToString()
        });
    }

    // POST api/auth/mot-de-passe-oublie
    [HttpPost("mot-de-passe-oublie")]
    public async Task<IActionResult> MotDePasseOublie(MotDePasseOublieDto dto)
    {
        var utilisateur = await _context.Utilisateurs
            .FirstOrDefaultAsync(u => u.Email == dto.Email.Trim().ToLower());

        // Réponse volontairement générique : on ne révèle pas si l'email existe (sécurité)
        if (utilisateur is null)
            return Ok("Si cette adresse existe, un email de réinitialisation a été envoyé.");

        var token = Guid.NewGuid().ToString("N");
        utilisateur.TokenReinitialisation = token;
        utilisateur.TokenReinitialisationExpiration = DateTime.UtcNow.AddHours(1);

        await _context.SaveChangesAsync();

        var lien = $"http://localhost:4200/reinitialiser-mot-de-passe?email={Uri.EscapeDataString(utilisateur.Email)}&token={token}";

        var corps = $@"
            <p>Bonjour {utilisateur.NomComplet},</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe sur GestionStock.</p>
            <p><a href=""{lien}"">Cliquez ici pour réinitialiser votre mot de passe</a></p>
            <p>Ce lien expire dans 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>";

        await _emailService.EnvoyerEmailAsync(utilisateur.Email, "Réinitialisation de votre mot de passe", corps);

        return Ok("Si cette adresse existe, un email de réinitialisation a été envoyé.");
    }

    // POST api/auth/reinitialiser-mot-de-passe
    [HttpPost("reinitialiser-mot-de-passe")]
    public async Task<IActionResult> ReinitialiserMotDePasse(ReinitialiserMotDePasseDto dto)
    {
        var utilisateur = await _context.Utilisateurs
            .FirstOrDefaultAsync(u => u.Email == dto.Email.Trim().ToLower());

        if (utilisateur is null ||
            utilisateur.TokenReinitialisation != dto.Token ||
            utilisateur.TokenReinitialisationExpiration is null ||
            utilisateur.TokenReinitialisationExpiration < DateTime.UtcNow)
        {
            return BadRequest("Lien de réinitialisation invalide ou expiré.");
        }

        utilisateur.MotDePasseHash = BCrypt.Net.BCrypt.HashPassword(dto.NouveauMotDePasse);
        utilisateur.TokenReinitialisation = null;
        utilisateur.TokenReinitialisationExpiration = null;

        await _context.SaveChangesAsync();

        return Ok("Mot de passe réinitialisé avec succès.");
    }

    // GET api/auth/profil
    [Authorize]
    [HttpGet("profil")]
    public async Task<ActionResult<UtilisateurDto>> GetProfil()
    {
        var id = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var utilisateur = await _context.Utilisateurs.FindAsync(id);

        if (utilisateur is null)
            return NotFound();

        return Ok(new UtilisateurDto
        {
            Id = utilisateur.Id,
            NomComplet = utilisateur.NomComplet,
            Email = utilisateur.Email,
            Role = utilisateur.Role.ToString(),
            EstActif = utilisateur.EstActif,
            DateCreation = utilisateur.DateCreation
        });
    }

    // PUT api/auth/profil
    [Authorize]
    [HttpPut("profil")]
    public async Task<IActionResult> ModifierProfil(ModifierProfilDto dto)
    {
        var id = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var utilisateur = await _context.Utilisateurs.FindAsync(id);

        if (utilisateur is null)
            return NotFound();

        var emailPrisParAutre = await _context.Utilisateurs
            .AnyAsync(u => u.Email == dto.Email.Trim().ToLower() && u.Id != id);

        if (emailPrisParAutre)
            return BadRequest("Cette adresse email est déjà utilisée par un autre compte.");

        utilisateur.NomComplet = dto.NomComplet.Trim();
        utilisateur.Email = dto.Email.Trim().ToLower();

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // PUT api/auth/changer-mot-de-passe
    [Authorize]
    [HttpPut("changer-mot-de-passe")]
    public async Task<IActionResult> ChangerMotDePasse(ChangerMotDePasseDto dto)
    {
        var id = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var utilisateur = await _context.Utilisateurs.FindAsync(id);

        if (utilisateur is null)
            return NotFound();

        if (!BCrypt.Net.BCrypt.Verify(dto.AncienMotDePasse, utilisateur.MotDePasseHash))
            return BadRequest("L'ancien mot de passe est incorrect.");

        utilisateur.MotDePasseHash = BCrypt.Net.BCrypt.HashPassword(dto.NouveauMotDePasse);

        await _context.SaveChangesAsync();

        return NoContent();
    }
}