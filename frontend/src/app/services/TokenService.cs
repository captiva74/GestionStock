using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using GestionStock.Api.Models;
using Microsoft.IdentityModel.Tokens;

namespace GestionStock.Api.Services;

public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;

    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenererToken(Utilisateur utilisateur)
    {
        var cle = _configuration["Jwt:Cle"]!;
        var emetteur = _configuration["Jwt:Emetteur"]!;
        var dureeMinutes = int.Parse(_configuration["Jwt:DureeValiditeMinutes"] ?? "60");

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, utilisateur.Id.ToString()),
            new(ClaimTypes.Email, utilisateur.Email),
            new(ClaimTypes.Role, utilisateur.Role.ToString()),
            new("nomComplet", utilisateur.NomComplet)
        };

        var cleSecurite = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(cle));
        var creds = new SigningCredentials(cleSecurite, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: emetteur,
            audience: emetteur,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(dureeMinutes),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}