using AlManan.Core.Interfaces;
using AlManan.Infrastructure.Data;
using AlManan.Infrastructure.Repositories;
using AlManan.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;

namespace AlManan.API.Extensions;

public static class ApplicationServicesExtension
{
    public static IServiceCollection AddApplicationServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // PostgreSQL Database
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        // Repositories
        services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<IOrderRepository, OrderRepository>();
        services.AddScoped<ICartRepository, CartRepository>();

        // Services
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IPhotoService, PhotoService>();
        services.AddScoped<IPaymentService, PaymentService>();
        services.AddScoped<IEmailService, EmailService>();

        // AutoMapper
        services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

        // CORS — allow Angular frontend (local + deployed)
        services.AddCors(options =>
        {
            options.AddPolicy("AllowAngular", policy =>
            {
                var originsRaw = configuration["AllowedOrigins"] ?? "";
                var allowedOrigins = originsRaw
                    .Split(",", StringSplitOptions.RemoveEmptyEntries)
                    .Select(o => o.Trim())
                    .ToArray();

                if (allowedOrigins.Length == 0)
                    allowedOrigins = new[] { "http://localhost:4200" };

                policy.WithOrigins(allowedOrigins)
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials();
            });
        });

        return services;
    }
}
