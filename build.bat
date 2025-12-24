@echo off
echo Building MAHA FIGHT API...

dotnet restore
if %errorlevel% neq 0 exit /b %errorlevel%

dotnet build --configuration Release
if %errorlevel% neq 0 exit /b %errorlevel%

echo Running tests...
dotnet test tests/MahaFight.Tests/MahaFight.Tests.csproj
if %errorlevel% neq 0 exit /b %errorlevel%

echo Build completed successfully!
echo Run: docker-compose up -d