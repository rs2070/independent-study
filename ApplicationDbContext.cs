using Microsoft.EntityFrameworkCore;
using PropertyAppApi.Models;  // Ensure this using statement is here if it's missing

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Property> Properties { get; set; }
    public DbSet<UserPreference> UserPreferences { get; set; } // Add this line
}
