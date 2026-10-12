
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

    public DbSet<Fournisseur> Fournisseurs => Set<Fournisseur>();

    public DbSet<Utilisateur> Utilisateurs => Set<Utilisateur>();

    public DbSet<JournalActivite> JournalsActivite => Set<JournalActivite>();

    public DbSet<ParametresApplication> ParametresApplication
        => Set<ParametresApplication>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<MouvementStock>()
            .HasOne(m => m.Fournisseur)
            .WithMany(f => f.MouvementsStock)
            .HasForeignKey(m => m.FournisseurId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
