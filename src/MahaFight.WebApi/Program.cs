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
// OTP Services
builder.Services.AddScoped<IEmailService, EmailService>();
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

// Database initialization with safe migrations
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    
    try
    {
        // Check if database exists and has tables
        var canConnect = await context.Database.CanConnectAsync();
        
        if (canConnect)
        {
            // Execute manual schema update for existing database
            try
            {
                var updateScript = @"
                    DO $$
                    BEGIN
                        -- Add Barcode column
                        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                                       WHERE table_name = 'products' AND column_name = 'barcode') THEN
                            ALTER TABLE products ADD COLUMN barcode character varying(100);
                        END IF;
                        
                        -- Add QrCode column
                        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                                       WHERE table_name = 'products' AND column_name = 'qr_code') THEN
                            ALTER TABLE products ADD COLUMN qr_code character varying(500);
                        END IF;
                        
                        -- Add QrCodeExpiresAt column
                        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                                       WHERE table_name = 'products' AND column_name = 'qr_code_expires_at') THEN
                            ALTER TABLE products ADD COLUMN qr_code_expires_at timestamp with time zone;
                        END IF;
                    END
                    $$;
                    
                    -- Create EmailOtp table if it doesn't exist
                    CREATE TABLE IF NOT EXISTS email_otps (
                        id uuid NOT NULL DEFAULT gen_random_uuid(),
                        email character varying(255) NOT NULL,
                        otp_code character varying(10) NOT NULL,
                        expires_at timestamp with time zone NOT NULL,
                        is_used boolean NOT NULL DEFAULT FALSE,
                        created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at timestamp with time zone,
                        CONSTRAINT \"PK_email_otps\" PRIMARY KEY (id)
                    );
                    
                    -- Create MobileOtp table if it doesn't exist
                    CREATE TABLE IF NOT EXISTS mobile_otps (
                        id uuid NOT NULL DEFAULT gen_random_uuid(),
                        mobile_number character varying(20) NOT NULL,
                        otp_code character varying(10) NOT NULL,
                        expires_at timestamp with time zone NOT NULL,
                        is_used boolean NOT NULL DEFAULT FALSE,
                        created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at timestamp with time zone,
                        CONSTRAINT \"PK_mobile_otps\" PRIMARY KEY (id)
                    );
                ";
                
                await context.Database.ExecuteSqlRawAsync(updateScript);
                Console.WriteLine("Database schema updated successfully");
            }
            catch (Exception schemaEx)
            {
                Console.WriteLine($"Schema update failed: {schemaEx.Message}");
            }
            
            // Try to get pending migrations
            var pendingMigrations = await context.Database.GetPendingMigrationsAsync();
            
            if (pendingMigrations.Any())
            {
                Console.WriteLine($"Applying {pendingMigrations.Count()} pending migrations...");
                // Apply only pending migrations
                await context.Database.MigrateAsync();
            }
        }
        else
        {
            // Database doesn't exist, create it
            await context.Database.EnsureCreatedAsync();
        }
    }
    catch (Exception ex)
    {
        // If migration fails, try to ensure database is created
        try
        {
            await context.Database.EnsureCreatedAsync();
        }
        catch
        {
            // Log error but don't crash the application
            Console.WriteLine($"Database initialization failed: {ex.Message}");
        }
    }
    
    // Seed data
    try
    {
        await DbInitializer.SeedAsync(context);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Data seeding failed: {ex.Message}");
    }
}

app.Run();
