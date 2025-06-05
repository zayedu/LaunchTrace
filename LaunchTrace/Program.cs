using Microsoft.EntityFrameworkCore;
using LaunchTrace.Data;
using LaunchTrace.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddDbContext<LaunchTraceDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS policy for development
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseHttpsRedirection();

// Initialize database
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<LaunchTraceDbContext>();
    context.Database.EnsureCreated();
}

// API Endpoints

// GET /api/parts?skip&take
app.MapGet("/api/parts", async (LaunchTraceDbContext db, int skip = 0, int take = 50) =>
{
    var query = db.Parts.Include(p => p.Supplier);
    
    var total = await query.CountAsync();
    var items = await query
        .Skip(skip)
        .Take(take)
        .Select(p => new PartDto
        {
            PartId = p.PartId,
            Name = p.Name,
            Status = p.Status.ToString(),
            SupplierId = p.SupplierId,
            Supplier = new SupplierDto
            {
                SupplierId = p.Supplier!.SupplierId,
                Name = p.Supplier.Name
            }
        })
        .ToListAsync();

    return new PartsResponse
    {
        Total = total,
        Items = items
    };
})
.WithName("GetParts")
.WithOpenApi();

// POST /api/parts/{id}/flagFaulty
app.MapPost("/api/parts/{id}/flagFaulty", async (LaunchTraceDbContext db, int id) =>
{
    var part = await db.Parts.FindAsync(id);
    if (part == null)
    {
        return Results.NotFound();
    }

    part.Status = PartStatus.FAULTY;
    await db.SaveChangesAsync();

    return Results.Ok();
})
.WithName("FlagPartFaulty")
.WithOpenApi();

// GET /api/impacted-builds/{partId}
app.MapGet("/api/impacted-builds/{partId}", async (LaunchTraceDbContext db, int partId) =>
{
    var builds = await db.BuildParts
        .Where(bp => bp.PartId == partId)
        .Include(bp => bp.Build)
        .Select(bp => new BuildDto
        {
            BuildId = bp.Build!.BuildId,
            SerialNumber = bp.Build.SerialNumber,
            BuildDate = bp.Build.BuildDate
        })
        .Distinct()
        .ToListAsync();

    return builds;
})
.WithName("GetImpactedBuilds")
.WithOpenApi();

// GET /api/builds - Get all builds with pagination
app.MapGet("/api/builds", async (LaunchTraceDbContext db, int skip = 0, int take = 50) =>
{
    var query = db.Builds.Include(b => b.BuildParts).ThenInclude(bp => bp.Part);
    
    var total = await query.CountAsync();
    var items = await query
        .Skip(skip)
        .Take(take)
        .Select(b => new BuildDetailDto
        {
            BuildId = b.BuildId,
            SerialNumber = b.SerialNumber,
            BuildDate = b.BuildDate,
            PartCount = b.BuildParts.Count,
            FaultyPartCount = b.BuildParts.Count(bp => bp.Part!.Status == PartStatus.FAULTY)
        })
        .ToListAsync();

    return new { total, items };
})
.WithName("GetBuilds")
.WithOpenApi();

// GET /api/builds/{id} - Get build details with all parts
app.MapGet("/api/builds/{id:int}", async (LaunchTraceDbContext db, int id) =>
{
    var build = await db.Builds
        .Include(b => b.BuildParts)
        .ThenInclude(bp => bp.Part)
        .ThenInclude(p => p!.Supplier)
        .Where(b => b.BuildId == id)
        .Select(b => new BuildDetailDto
        {
            BuildId = b.BuildId,
            SerialNumber = b.SerialNumber,
            BuildDate = b.BuildDate,
            PartCount = b.BuildParts.Count,
            FaultyPartCount = b.BuildParts.Count(bp => bp.Part!.Status == PartStatus.FAULTY),
            Parts = b.BuildParts.Select(bp => new PartDto
            {
                PartId = bp.Part!.PartId,
                Name = bp.Part.Name,
                Status = bp.Part.Status.ToString(),
                SupplierId = bp.Part.SupplierId,
                Supplier = new SupplierDto
                {
                    SupplierId = bp.Part.Supplier!.SupplierId,
                    Name = bp.Part.Supplier.Name
                }
            }).ToList()
        })
        .FirstOrDefaultAsync();

    if (build == null)
        return Results.NotFound($"Build with ID {id} not found");

    return Results.Ok(build);
})
.WithName("GetBuildById")
.WithOpenApi();

// POST /api/builds - Create a new build
app.MapPost("/api/builds", async (LaunchTraceDbContext db, CreateBuildRequest request) =>
{
    var build = new Build
    {
        SerialNumber = request.SerialNumber,
        BuildDate = DateTime.SpecifyKind(request.BuildDate, DateTimeKind.Utc)
    };

    db.Builds.Add(build);
    await db.SaveChangesAsync();

    // Add parts to the build
    if (request.PartIds != null && request.PartIds.Any())
    {
        var buildParts = request.PartIds.Select(partId => new BuildPart
        {
            BuildId = build.BuildId,
            PartId = partId
        }).ToList();

        db.BuildParts.AddRange(buildParts);
        await db.SaveChangesAsync();
    }

    return Results.Created($"/api/builds/{build.BuildId}", new BuildDto
    {
        BuildId = build.BuildId,
        SerialNumber = build.SerialNumber,
        BuildDate = build.BuildDate
    });
})
.WithName("CreateBuild")
.WithOpenApi();

app.Run();

// Make the Program class public for testing
public partial class Program { }