using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using FluentValidation;
using MahaFight.Application.Interfaces;
using MahaFight.Application.Services;
using MahaFight.Application.DTOs;
using MahaFight.Domain.Interfaces;
using MahaFight.Infrastructure.Data;
using MahaFight.Infrastructure.Repositories;
using MahaFight.Infrastructure.Services;
using MahaFight.WebApi.Middleware;
using MahaFight.WebApi.Configuration;

var builder = WebApplication.CreateBuilder(args);

// Structured Logging
builder.AddStructuredLogging();

// Database Configuration
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// JWT Configuration
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"]!;
var issuer = jwtSettings["Issuer"]!;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
            ValidateIssuer = true,
            ValidIssuer = issuer,
            ValidateAudience = true,
            ValidAudience = issuer,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// CORS Configuration
builder.Services.AddCorsPolicy(builder.Configuration);

// Rate Limiting
builder.Services.AddForgotPasswordRateLimit();
builder.Services.AddRateLimiting();

// Dependency Injection
builder.Services.AddHttpClient();
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IJwtService>(sp => new JwtService(secretKey, issuer));
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IFileUploadService, FileUploadService>();
builder.Services.AddScoped<ICloudinaryService, CloudinaryService>();
builder.Services.AddScoped<IQrCodeService, QrCodeService>();
builder.Services.AddScoped<IBarcodeService, BarcodeService>();
builder.Services.AddScoped<IPdfService, PdfService>();
builder.Services.AddScoped<ICsvExportService, CsvExportService>();
builder.Services.AddScoped<DealerService>();
builder.Services.AddScoped<ProductService>();
builder.Services.AddScoped<InvoiceService>();
builder.Services.AddScoped<CommissionService>();
builder.Services.AddScoped<MahaFight.Application.Services.CustomerOrderService>();
builder.Services.AddScoped<ProductScanService>();
builder.Services.AddScoped<ISmsService, SmsService>();
// OTP Services - Use SendGrid for production
builder.Services.AddScoped<IEmailService, SendGridEmailService>();
builder.Services.AddScoped<IOtpService, OtpService>();
builder.Services.AddValidatorsFromAssemblyContaining<CreateDealerValidator>();

// Controllers
builder.Services.AddControllers();

// Swagger Configuration
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "MAHA FIGHT - Dealer & Franchise Management API", Version = "v1" });
    
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Configure for Render deployment
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
app.Urls.Add($"http://0.0.0.0:{port}");

// Security Headers Middleware
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-XSS-Protection"] = "1; mode=block";
    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    await next();
});

// Middleware Pipeline
app.UseMiddleware<GlobalExceptionMiddleware>();
app.UseMiddleware<ValidationMiddleware>();
app.UseMiddleware<KycEnforcementMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    // Enable Swagger in production for Render
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "MahaFight API v1");
        c.RoutePrefix = "swagger";
    });
}

// Production mein HTTPS redirect disable for Render
if (!app.Environment.IsProduction())
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowedOrigins");
app.UseStaticFiles();

// Add default route for health check
app.MapGet("/", () => "MahaFight API is running! Visit /swagger for documentation.");
app.MapGet("/health", () => "Healthy");

// Create uploads directory if it doesn't exist
var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}

// Create barcode and QR code directories
var barcodesPath = Path.Combine(uploadsPath, "barcodes");
var qrcodesPath = Path.Combine(uploadsPath, "qrcodes");
if (!Directory.Exists(barcodesPath))
{
    Directory.CreateDirectory(barcodesPath);
}
if (!Directory.Exists(qrcodesPath))
{
    Directory.CreateDirectory(qrcodesPath);
}

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Production diagnostics and database connectivity test
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    var env = scope.ServiceProvider.GetRequiredService<IHostEnvironment>();
    
    logger.LogInformation("Environment: {Environment}", env.EnvironmentName);
    logger.LogInformation("Connection String: {ConnectionString}", 
        builder.Configuration.GetConnectionString("DefaultConnection")?.Substring(0, 50) + "...");
    
    // Test database connectivity
    try
    {
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var canConnect = await context.Database.CanConnectAsync();
        logger.LogInformation("Database connectivity: {CanConnect}", canConnect);
        
        if (canConnect)
        {
            var otpCount = await context.EmailOtps.CountAsync();
            logger.LogInformation("EmailOtps table accessible, count: {Count}", otpCount);
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Database connectivity test failed");
    }
}

// Skip automatic migrations for production - use manual SQL script instead
// Production database schema is managed via fix-production-db.sql
app.Logger.LogInformation("Application started - database schema managed externally");

app.Run();
