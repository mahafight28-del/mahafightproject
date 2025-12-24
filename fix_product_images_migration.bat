@echo off
echo Creating migration to fix ProductImage schema for Cloudinary...
cd src\MahaFight.WebApi
dotnet ef migrations add FixProductImagesForCloudinary --project ..\MahaFight.Infrastructure --startup-project .
echo Migration created. Run 'dotnet ef database update' to apply changes.
pause