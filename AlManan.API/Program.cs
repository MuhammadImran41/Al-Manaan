using AlManan.API.Extensions;
using AlManan.API.Middleware;
using AlManan.Core.Entities;
using AlManan.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

// Railway injects PORT env var — bind to it
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    WebRootPath = "wwwroot"
});
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// Register application services
builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddIdentityServices(builder.Configuration);

builder.Services.AddControllers()
    .AddJsonOptions(opts =>
        opts.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase);

// Increase request body size limit for base64 image uploads (50MB)
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(o =>
{
    o.ValueLengthLimit = 52428800;
    o.MultipartBodyLengthLimit = 52428800;
});
builder.WebHost.ConfigureKestrel(o =>
{
    o.Limits.MaxRequestBodySize = 52428800; // 50MB
});
builder.Services.AddEndpointsApiExplorer();

// Swagger with JWT support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Al-Manan API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header. Example: 'Bearer {token}'",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Run DB migrations + seed if connection string is configured
var connString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "";
var hasDb = !string.IsNullOrWhiteSpace(connString);

if (hasDb)
{
    using var scope = app.Services.CreateScope();
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        var userManager = services.GetRequiredService<UserManager<AppUser>>();
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

        await context.Database.MigrateAsync();

        // Seed roles
        string[] roles = { "Admin", "Customer" };
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole(role));
        }

        // Seed default admin user
        const string adminEmail = "almananshop@gmail.com";
        if (await userManager.FindByEmailAsync(adminEmail) == null)
        {
            var admin = new AppUser
            {
                FirstName   = "Al-Manan",
                LastName    = "Admin",
                DisplayName = "Admin",
                Email       = adminEmail,
                UserName    = adminEmail
            };
            await userManager.CreateAsync(admin, "Admin@123");
            await userManager.AddToRoleAsync(admin, "Admin");
        }

        // Also keep old admin@almanan.com for backward compat
        const string oldAdmin = "admin@almanan.com";
        if (await userManager.FindByEmailAsync(oldAdmin) == null)
        {
            var admin2 = new AppUser
            {
                FirstName   = "Al-Manan",
                LastName    = "Admin",
                DisplayName = "Admin",
                Email       = oldAdmin,
                UserName    = oldAdmin
            };
            await userManager.CreateAsync(admin2, "Admin@123");
            await userManager.AddToRoleAsync(admin2, "Admin");
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "DB migration/seeding failed — app will still start");
    }
}

app.UseStaticFiles();
app.UseMiddleware<ExceptionMiddleware>();

// Always show Swagger
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Al-Manan API v1");
    c.RoutePrefix = "swagger";
});

// Railway handles HTTPS termination — no redirect needed
app.UseCors("AllowAngular");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Health check endpoint for Railway
app.MapGet("/health", () => Results.Ok(new { status = "healthy", time = DateTime.UtcNow }));

// Email test endpoint — remove after testing
app.MapGet("/test-email", async (AlManan.Core.Interfaces.IEmailService emailService) =>
{
    try
    {
        await emailService.SendOrderReceiptAsync(new AlManan.Core.Interfaces.OrderEmailData
        {
            OrderNumber   = "TEST-001",
            CustomerName  = "Muhammad Imran",
            CustomerEmail = "mimranofficial236@gmail.com",
            CustomerPhone = "03171656231",
            OrderDate     = DateTime.UtcNow,
            PaymentMethod = "Cash on Delivery",
            ShippingAddress = "123 Test Street, Lahore",
            SubTotal      = 4500,
            ShippingCost  = 200,
            Total         = 4700,
            Items = new List<AlManan.Core.Interfaces.OrderEmailItem>
            {
                new() { Name = "Embroidered Lawn Suit", Size = "M", Quantity = 1, SubTotal = 4500 }
            }
        });

        await emailService.SendAdminOrderNotificationAsync(new AlManan.Core.Interfaces.OrderEmailData
        {
            OrderNumber   = "TEST-001",
            CustomerName  = "Muhammad Imran",
            CustomerEmail = "mimranofficial236@gmail.com",
            CustomerPhone = "03171656231",
            OrderDate     = DateTime.UtcNow,
            PaymentMethod = "Cash on Delivery",
            ShippingAddress = "123 Test Street, Lahore",
            SubTotal      = 4500,
            ShippingCost  = 200,
            Total         = 4700,
            Items = new List<AlManan.Core.Interfaces.OrderEmailItem>
            {
                new() { Name = "Embroidered Lawn Suit", Size = "M", Quantity = 1, SubTotal = 4500 }
            }
        });

        return Results.Ok(new { success = true, message = "Both emails sent — check mimranofficial236@gmail.com AND almananshop@gmail.com" });
    }
    catch (Exception ex)
    {
        return Results.Ok(new { success = false, error = ex.Message, inner = ex.InnerException?.Message });
    }
});

// Debug config endpoint
app.MapGet("/debug-config", (IConfiguration config) => Results.Ok(new {
    resendKey    = string.IsNullOrEmpty(Environment.GetEnvironmentVariable("Resend__ApiKey") ?? config["Resend:ApiKey"]) ? "NOT SET" : "SET (" + (Environment.GetEnvironmentVariable("Resend__ApiKey") ?? config["Resend:ApiKey"])!.Length + " chars)",
    emailFrom    = config["Email:From"] ?? "NOT SET",
    emailAdmin   = config["Email:AdminEmail"] ?? "NOT SET",
    allEnvKeys   = Environment.GetEnvironmentVariables().Keys.Cast<string>().Where(k => k.StartsWith("Resend") || k.StartsWith("Email")).ToList()
}));

app.Run();
