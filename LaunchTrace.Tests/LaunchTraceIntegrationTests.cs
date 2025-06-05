using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using System.Net.Http.Json;
using LaunchTrace.Models;
using LaunchTrace.Data;
using Xunit;

namespace LaunchTrace.Tests;

public class LaunchTraceIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public LaunchTraceIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // Remove the existing DbContext registration
                var dbContextDescriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<LaunchTraceDbContext>));
                if (dbContextDescriptor != null)
                    services.Remove(dbContextDescriptor);

                // Add in-memory database for testing
                services.AddDbContext<LaunchTraceDbContext>(options =>
                    options.UseInMemoryDatabase("TestDb"));
            });
        });
        
        _client = _factory.CreateClient();
        
        // Seed test data
        SeedTestData();
    }

    private void SeedTestData()
    {
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<LaunchTraceDbContext>();
        
        context.Database.EnsureCreated();

        // Create test supplier
        var supplier = new Supplier
        {
            SupplierId = 1,
            Name = "Test Supplier"
        };
        context.Suppliers.Add(supplier);

        // Create test parts
        var part1 = new Part
        {
            PartId = 1,
            Name = "Test Part 1",
            Status = PartStatus.OK,
            SupplierId = 1
        };
        var part2 = new Part
        {
            PartId = 2,
            Name = "Test Part 2",
            Status = PartStatus.FAULTY,
            SupplierId = 1
        };
        context.Parts.AddRange(part1, part2);

        // Create test build
        var build = new Build
        {
            BuildId = 1,
            SerialNumber = "B001",
            BuildDate = DateTime.UtcNow
        };
        context.Builds.Add(build);

        // Create test build parts
        var buildPart = new BuildPart
        {
            BuildId = 1,
            PartId = 1,
            Quantity = 5
        };
        context.BuildParts.Add(buildPart);

        context.SaveChanges();
    }

    [Fact]
    public async Task GetParts_ReturnsPartsWithTotalGreaterThanZero()
    {
        // Act
        var response = await _client.GetAsync("/api/parts");

        // Assert
        response.EnsureSuccessStatusCode();
        var partsResponse = await response.Content.ReadFromJsonAsync<PartsResponse>();
        
        Assert.NotNull(partsResponse);
        Assert.True(partsResponse.Total > 0);
        Assert.NotEmpty(partsResponse.Items);
    }

    [Fact]
    public async Task FlagPartFaulty_TogglesPartStatus()
    {
        // Arrange - Get the first part
        var partsResponse = await _client.GetFromJsonAsync<PartsResponse>("/api/parts");
        Assert.NotNull(partsResponse);
        Assert.NotEmpty(partsResponse.Items);
        
        var firstPart = partsResponse.Items.First();
        var originalStatus = firstPart.Status;

        // Act - Flag the part as faulty
        var response = await _client.PostAsync($"/api/parts/{firstPart.PartId}/flagFaulty", null);

        // Assert
        response.EnsureSuccessStatusCode();

        // Verify the status changed
        var updatedPartsResponse = await _client.GetFromJsonAsync<PartsResponse>("/api/parts");
        Assert.NotNull(updatedPartsResponse);
        
        var updatedPart = updatedPartsResponse.Items.First(p => p.PartId == firstPart.PartId);
        Assert.Equal("FAULTY", updatedPart.Status);
    }
}
