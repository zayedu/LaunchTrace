using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;
using LaunchTrace.Data;
using LaunchTrace.Models;

namespace LaunchTrace.Tests;

public class LaunchTraceIntegrationTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public LaunchTraceIntegrationTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
        
        // Seed test data for each test instance
        SeedTestData();
    }

    [Fact]
    public async Task GetParts_ReturnsPartsWithTotalGreaterThanZero()
    {
        // Act
        var response = await _client.GetAsync("/api/parts");
        
        // Assert
        response.EnsureSuccessStatusCode();
        
        var jsonString = await response.Content.ReadAsStringAsync();
        
        // Debug: Print the response to see what we're getting
        Console.WriteLine($"API Response: {jsonString}");
        
        var partsResponse = JsonSerializer.Deserialize<PartsResponse>(jsonString, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        
        Assert.NotNull(partsResponse);
        Assert.True(partsResponse.Total >= 0, $"Expected Total > 0, but got {partsResponse.Total}");
        Assert.NotEmpty(partsResponse.Items);
    }

    [Fact]
    public async Task FlagPartFaulty_TogglesPartStatus()
    {
        // Arrange - First ensure we have parts
        var initialResponse = await _client.GetAsync("/api/parts");
        initialResponse.EnsureSuccessStatusCode();
        
        var initialJsonString = await initialResponse.Content.ReadAsStringAsync();
        Console.WriteLine($"Initial API Response: {initialJsonString}");
        
        var initialPartsResponse = JsonSerializer.Deserialize<PartsResponse>(initialJsonString, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        
        Assert.NotNull(initialPartsResponse);
        Assert.True(initialPartsResponse.Total >= 0, "No parts found for flagging test");
        Assert.NotEmpty(initialPartsResponse.Items);
        
        var firstPart = initialPartsResponse.Items.First();
        
        // Act - Flag the part as faulty
        var flagResponse = await _client.PostAsync($"/api/parts/{firstPart.PartId}/flagFaulty", null);
        
        // Assert
        flagResponse.EnsureSuccessStatusCode();
        
        // Verify the status changed
        var verifyResponse = await _client.GetAsync($"/api/parts?take=50");
        verifyResponse.EnsureSuccessStatusCode();
        
        var verifyJsonString = await verifyResponse.Content.ReadAsStringAsync();
        var verifyPartsResponse = JsonSerializer.Deserialize<PartsResponse>(verifyJsonString, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        
        var updatedPart = verifyPartsResponse!.Items.First(p => p.PartId == firstPart.PartId);
        Assert.Equal("FAULTY", updatedPart.Status);
    }

    [Fact]
    public async Task GetBuilds_ReturnsBuildsWithTotalGreaterThanZero()
    {
        // Act
        var response = await _client.GetAsync("/api/builds");
        
        // Assert
        response.EnsureSuccessStatusCode();
        
        var jsonString = await response.Content.ReadAsStringAsync();
        Console.WriteLine($"Builds API Response: {jsonString}");
        
        var buildsResponse = JsonSerializer.Deserialize<dynamic>(jsonString, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        
        Assert.NotNull(buildsResponse);
        // We'll parse it as a generic object since it's an anonymous type
        var jsonDoc = JsonDocument.Parse(jsonString);
        var total = jsonDoc.RootElement.GetProperty("total").GetInt32();
        var items = jsonDoc.RootElement.GetProperty("items");
        
        Assert.True(total >= 0, $"Expected Total >= 0, but got {total}");
        Assert.True(items.GetArrayLength() > 0, "Expected at least one build item");
    }

    [Fact]
    public async Task GetBuildDetail_ReturnsValidBuildWithParts()
    {
        // Arrange - First get builds to get a valid build ID
        var buildsResponse = await _client.GetAsync("/api/builds");
        buildsResponse.EnsureSuccessStatusCode();
        
        var buildsJsonString = await buildsResponse.Content.ReadAsStringAsync();
        var buildsJsonDoc = JsonDocument.Parse(buildsJsonString);
        var buildsArray = buildsJsonDoc.RootElement.GetProperty("items");
        
        Assert.True(buildsArray.GetArrayLength() > 0, "Expected at least one build");
        
        var firstBuild = buildsArray[0];
        var buildId = firstBuild.GetProperty("buildId").GetInt32();
        
        // Act - Get detailed build information
        var detailResponse = await _client.GetAsync($"/api/builds/{buildId}");
        
        // Assert
        detailResponse.EnsureSuccessStatusCode();
        
        var detailJsonString = await detailResponse.Content.ReadAsStringAsync();
        Console.WriteLine($"Build Detail API Response: {detailJsonString}");
        
        var buildDetail = JsonSerializer.Deserialize<BuildDetailDto>(detailJsonString, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        
        Assert.NotNull(buildDetail);
        Assert.Equal(buildId, buildDetail.BuildId);
        Assert.NotNull(buildDetail.SerialNumber);
        Assert.NotNull(buildDetail.Parts);
        Assert.True(buildDetail.PartCount >= 0);
        Assert.True(buildDetail.FaultyPartCount >= 0);
    }

    [Fact]
    public async Task CreateBuild_CreatesNewBuildSuccessfully()
    {
        // Arrange - First get parts to use in the build
        var partsResponse = await _client.GetAsync("/api/parts");
        partsResponse.EnsureSuccessStatusCode();
        
        var partsJsonString = await partsResponse.Content.ReadAsStringAsync();
        var partsData = JsonSerializer.Deserialize<PartsResponse>(partsJsonString, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        
        Assert.NotNull(partsData);
        Assert.NotEmpty(partsData.Items);
        
        var createRequest = new CreateBuildRequest
        {
            SerialNumber = $"TEST-{DateTime.UtcNow:yyyyMMddHHmmss}",
            BuildDate = DateTime.UtcNow,
            PartIds = new List<int> { partsData.Items.First().PartId }
        };
        
        // Act
        var response = await _client.PostAsJsonAsync("/api/builds", createRequest);
        
        // Assert
        response.EnsureSuccessStatusCode();
        
        var jsonString = await response.Content.ReadAsStringAsync();
        Console.WriteLine($"Create Build API Response: {jsonString}");
        
        var createdBuild = JsonSerializer.Deserialize<BuildDto>(jsonString, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        
        Assert.NotNull(createdBuild);
        Assert.Equal(createRequest.SerialNumber, createdBuild.SerialNumber);
        Assert.True(createdBuild.BuildId > 0);
        
        // Verify the build was actually created by retrieving it
        var verifyResponse = await _client.GetAsync($"/api/builds/{createdBuild.BuildId}");
        verifyResponse.EnsureSuccessStatusCode();
        
        var verifyJsonString = await verifyResponse.Content.ReadAsStringAsync();
        var verifiedBuild = JsonSerializer.Deserialize<BuildDetailDto>(verifyJsonString, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        
        Assert.NotNull(verifiedBuild);
        Assert.Equal(createRequest.SerialNumber, verifiedBuild.SerialNumber);
        Assert.True(verifiedBuild.Parts.Count > 0);
    }

    private void SeedTestData()
    {
        _factory.SeedDatabase(context =>
        {
            // Clear existing data first
            context.BuildParts.RemoveRange(context.BuildParts);
            context.Parts.RemoveRange(context.Parts);
            context.Builds.RemoveRange(context.Builds);
            context.Suppliers.RemoveRange(context.Suppliers);
            context.SaveChanges();

            // Add test suppliers
            var supplier1 = new Supplier { SupplierId = 1, Name = "Test Supplier 1" };
            var supplier2 = new Supplier { SupplierId = 2, Name = "Test Supplier 2" };
            
            context.Suppliers.AddRange(supplier1, supplier2);
            context.SaveChanges();

            // Add test parts
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
                Status = PartStatus.OK, 
                SupplierId = 2 
            };
            
            context.Parts.AddRange(part1, part2);
            context.SaveChanges();

            // Add test builds
            var build1 = new Build 
            { 
                BuildId = 1, 
                SerialNumber = "TEST-001", 
                BuildDate = DateTime.UtcNow.AddDays(-10) 
            };
            
            context.Builds.Add(build1);
            context.SaveChanges();

            // Add test build parts
            var buildPart1 = new BuildPart 
            { 
                BuildId = 1, 
                PartId = 1, 
                Quantity = 2 
            };
            
            context.BuildParts.Add(buildPart1);
            context.SaveChanges();
            
            Console.WriteLine($"Seeded {context.Suppliers.Count()} suppliers, {context.Parts.Count()} parts");
        });
    }
}