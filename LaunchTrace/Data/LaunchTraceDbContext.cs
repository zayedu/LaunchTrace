using Microsoft.EntityFrameworkCore;
using LaunchTrace.Models;

namespace LaunchTrace.Data;

public class LaunchTraceDbContext : DbContext
{
    public LaunchTraceDbContext(DbContextOptions<LaunchTraceDbContext> options) : base(options)
    {
    }

    public DbSet<Supplier> Suppliers { get; set; }
    public DbSet<Part> Parts { get; set; }
    public DbSet<Build> Builds { get; set; }
    public DbSet<BuildPart> BuildParts { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configure composite key for BuildPart
        modelBuilder.Entity<BuildPart>()
            .HasKey(bp => new { bp.BuildId, bp.PartId });

        // Configure relationships
        modelBuilder.Entity<BuildPart>()
            .HasOne(bp => bp.Build)
            .WithMany(b => b.BuildParts)
            .HasForeignKey(bp => bp.BuildId);

        modelBuilder.Entity<BuildPart>()
            .HasOne(bp => bp.Part)
            .WithMany(p => p.BuildParts)
            .HasForeignKey(bp => bp.PartId);

        modelBuilder.Entity<Part>()
            .HasOne(p => p.Supplier)
            .WithMany(s => s.Parts)
            .HasForeignKey(p => p.SupplierId);

        // Configure enum to int conversion
        modelBuilder.Entity<Part>()
            .Property(p => p.Status)
            .HasConversion<int>();
    }
}
