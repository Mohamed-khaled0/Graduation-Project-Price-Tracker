using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Emit;
using System.Text;
using System.Threading.Tasks;
using ElectronicsPriceTracker.Domain.Entities;
using ElectronicsPriceTracker.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace ElectronicsPriceTracker.Infrastructure.DBContext
{
    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        public DbSet<Product> Products { get; set; }
        public DbSet<Platform> Platforms { get; set; }
        public DbSet<Listing> Listings { get; set; }
        public DbSet<PriceHistory> PriceHistories { get; set; }
        public DbSet<SecondHandListing> SecondHandListings { get; set; }
        public DbSet<Watchlist> Watchlists { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder
                .Entity<Platform>()
                .HasData(
                    new Platform
                    {
                        PlatformId = 1,
                        Name = "Amazon",
                        Url = "https://www.amazon.eg",
                        LogoUrl =
                            "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png",
                    },
                    new Platform
                    {
                        PlatformId = 2,
                        Name = "Jumia",
                        Url = "https://www.jumia.com.eg",
                        LogoUrl =
                            "https://upload.wikimedia.org/wikipedia/commons/9/93/JumiaLogo_%2814%29.png",
                    },
                    new Platform
                    {
                        PlatformId = 3,
                        Name = "2B",
                        Url = "https://2b.com.eg",
                        LogoUrl = "https://2b.com.eg/media/wysiwyg/about/Ar/2b-tech.png",
                    }
                );

            // User - Watchlist: One to Many
            modelBuilder
                .Entity<Watchlist>()
                .HasOne(w => w.User)
                .WithMany(u => u.Watchlists)
                .HasForeignKey(w => w.UserId);

            // Product - Watchlist: One to Many
            modelBuilder
                .Entity<Watchlist>()
                .HasOne(w => w.Product)
                .WithMany(p => p.Watchlists)
                .HasForeignKey(w => w.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            // Product - Listing: One to Many
            modelBuilder
                .Entity<Listing>()
                .HasOne(l => l.Product)
                .WithMany(p => p.Listings)
                .HasForeignKey(l => l.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            // Platform - Listing: One to Many
            modelBuilder
                .Entity<Listing>()
                .HasOne(l => l.Platform)
                .WithMany(p => p.Listings)
                .HasForeignKey(l => l.PlatformId)
                .OnDelete(DeleteBehavior.Cascade);

            // Listing - PriceHistory: One to Many
            modelBuilder
                .Entity<PriceHistory>()
                .HasOne(ph => ph.Listing)
                .WithMany(l => l.PriceHistories)
                .HasForeignKey(ph => ph.ListingId)
                .OnDelete(DeleteBehavior.Cascade);

            // SecondHandListing: Composite relationship
            modelBuilder
                .Entity<SecondHandListing>()
                .HasOne(s => s.Product)
                .WithMany(p => p.SecondHandListings)
                .HasForeignKey(s => s.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder
                .Entity<SecondHandListing>()
                .HasOne(s => s.Platform)
                .WithMany()
                .HasForeignKey(s => s.PlatformId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
