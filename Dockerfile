FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["src/MahaFight.WebApi/MahaFight.WebApi.csproj", "src/MahaFight.WebApi/"]
COPY ["src/MahaFight.Infrastructure/MahaFight.Infrastructure.csproj", "src/MahaFight.Infrastructure/"]
COPY ["src/MahaFight.Application/MahaFight.Application.csproj", "src/MahaFight.Application/"]
COPY ["src/MahaFight.Domain/MahaFight.Domain.csproj", "src/MahaFight.Domain/"]
RUN dotnet restore "src/MahaFight.WebApi/MahaFight.WebApi.csproj"
COPY . .
WORKDIR "/src/src/MahaFight.WebApi"
RUN dotnet build "MahaFight.WebApi.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "MahaFight.WebApi.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "MahaFight.WebApi.dll"]