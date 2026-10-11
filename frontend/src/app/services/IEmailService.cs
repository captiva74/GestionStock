namespace GestionStock.Api.Services;

public interface IEmailService
{
    Task EnvoyerEmailAsync(string destinataire, string sujet, string corpsHtml);
}

