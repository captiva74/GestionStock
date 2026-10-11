using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace GestionStock.Api.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task EnvoyerEmailAsync(string destinataire, string sujet, string corpsHtml)
    {
        var hote = _configuration["Smtp:Hote"]!;
        var port = int.Parse(_configuration["Smtp:Port"] ?? "587");
        var utilisateur = _configuration["Smtp:Utilisateur"]!;
        var motDePasse = _configuration["Smtp:MotDePasse"]!;
        var nomExpediteur = _configuration["Smtp:NomExpediteur"] ?? "GestionStock";

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(nomExpediteur, utilisateur));
        message.To.Add(MailboxAddress.Parse(destinataire));
        message.Subject = sujet;

        message.Body = new TextPart("html") { Text = corpsHtml };

        using var client = new SmtpClient();
        await client.ConnectAsync(hote, port, SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(utilisateur, motDePasse);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}