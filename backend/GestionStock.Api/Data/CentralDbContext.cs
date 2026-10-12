using GestionStock.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GestionStock.Api.Data;

public class CentralDbContext : DbContext
{
    public CentralDbContext(DbContextOptions<CentralDbContext> options)
        : base(options)
    {
    }

    public DbSet<Utilisateur> Utilisateurs => Set<Utilisateur>();

    public DbSet<Agence> Agences => Set<Agence>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Utilisateur>(e =>
        {
            e.Property(u => u.CodeStructure).HasColumnName("code_structure");
            e.Property(u => u.NomBase)
             .HasColumnName("nom_base")
             .HasComputedColumnSql("('GestionStockDb' + RIGHT('0' + CAST(code_structure - 200 AS VARCHAR(2)), 2))")
             .ValueGeneratedOnAddOrUpdate();
        });

        modelBuilder.Entity<Agence>(e =>
        {
            e.ToTable("Agences");
            e.HasKey(a => a.CodeStructure);
            e.Property(a => a.CodeStructure)
             .HasColumnName("code_structure")
             .ValueGeneratedNever();
        });
    }
}