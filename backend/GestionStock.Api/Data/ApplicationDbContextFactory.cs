using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace GestionStock.Api.Data;

public class ApplicationDbContextFactory
    : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var dossier = Directory.GetCurrentDirectory();

        var configuration = new ConfigurationBuilder()
            .SetBasePath(dossier)
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile(
                $"appsettings.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"}.json",
                optional: true)
            .AddEnvironmentVariables()
            .Build();

        var modeleConnexion =
            configuration.GetConnectionString("Agences")
            ?? throw new InvalidOperationException(
                "La chaîne de connexion 'Agences' est absente.");

        // Base de conception uniquement :
        // les migrations seront générées avec le schéma d'une base agence.
        var connexion = modeleConnexion.Replace(
            "{0}",
            "GestionStockDb44",
            StringComparison.Ordinal);

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlServer(connexion)
            .Options;

        return new ApplicationDbContext(options);
    }
}
