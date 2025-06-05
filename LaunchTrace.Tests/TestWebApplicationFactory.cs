using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using LaunchTrace.Data;
using LaunchTrace.Models;

namespace LaunchTrace.Tests;

public class TestWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _databaseName = $"TestDb_{Guid.NewGuid()}";
    
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Remove the existing DbContext registration
            services.RemoveAll(typeof(DbContextOptions<LaunchTraceDbContext>));
            services.RemoveAll(typeof(LaunchTraceDbContext));

            // Add in-memory database for testing
            services.AddDbContext<LaunchTraceDbContext>(options =>
                options.UseInMemoryDatabase(_databaseName));
        });

        builder.UseEnvironment("Testing");
    }

    public void SeedDatabase(Action<LaunchTraceDbContext> seedAction)
    {
        using var scope = Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<LaunchTraceDbContext>();
        context.Database.EnsureCreated();
        seedAction(context);
    }
}
