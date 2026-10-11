using GestionStock.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GestionStock.Api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Categorie> Categories => Set<Categorie>();

    public DbSet<Article> Articles => Set<Article>();

    public DbSet<MouvementStock> MouvementsStock => Set<MouvementStock>();

    public DbSet<Utilisateur> Utilisateurs => Set<Utilisateur>();

    public DbSet<JournalActivite> JournalsActivite => Set<JournalActivite>();
}