using Serilog;

namespace MahaFight.WebApi.Configuration;

public static class LoggingConfiguration
{
    public static void AddStructuredLogging(this WebApplicationBuilder builder)
    {
        builder.Host.UseSerilog((context, configuration) =>
        {
            configuration
                .ReadFrom.Configuration(context.Configuration)
                .WriteTo.Console()
                .WriteTo.File("logs/mahafight-.txt", rollingInterval: RollingInterval.Day)
                .Enrich.FromLogContext();
        });
    }
}