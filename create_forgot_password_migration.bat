@echo off
echo Creating migration for Password Reset OTP...
cd src\MahaFight.WebApi
dotnet ef migrations add AddPasswordResetOtp --project ..\MahaFight.Infrastructure --startup-project .
echo Migration created. Run 'dotnet ef database update' to apply changes.
pause