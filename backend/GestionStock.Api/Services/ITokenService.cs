using GestionStock.Api.Models;

namespace GestionStock.Api.Services;

public interface ITokenService
{
    string GenererToken(Utilisateur utilisateur);
}