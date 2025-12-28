using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MahaFight.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMissingEmailOtpColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Barcode",
                table: "products",
                newName: "barcode");

            migrationBuilder.RenameColumn(
                name: "QrCodeExpiresAt",
                table: "products",
                newName: "qr_code_expires_at");

            migrationBuilder.RenameColumn(
                name: "QrCode",
                table: "products",
                newName: "qr_code");

            migrationBuilder.RenameIndex(
                name: "IX_mobile_otps_phone_purpose_is_used_expires_at",
                table: "mobile_otps",
                newName: "idx_mobile_otps_lookup");

            migrationBuilder.RenameIndex(
                name: "IX_email_otps_email_purpose_is_used_expires_at",
                table: "email_otps",
                newName: "idx_email_otps_lookup");

            migrationBuilder.AlterColumn<string>(
                name: "barcode",
                table: "products",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "qr_code",
                table: "products",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "barcode",
                table: "products",
                newName: "Barcode");

            migrationBuilder.RenameColumn(
                name: "qr_code_expires_at",
                table: "products",
                newName: "QrCodeExpiresAt");

            migrationBuilder.RenameColumn(
                name: "qr_code",
                table: "products",
                newName: "QrCode");

            migrationBuilder.RenameIndex(
                name: "idx_mobile_otps_lookup",
                table: "mobile_otps",
                newName: "IX_mobile_otps_phone_purpose_is_used_expires_at");

            migrationBuilder.RenameIndex(
                name: "idx_email_otps_lookup",
                table: "email_otps",
                newName: "IX_email_otps_email_purpose_is_used_expires_at");

            migrationBuilder.AlterColumn<string>(
                name: "Barcode",
                table: "products",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "QrCode",
                table: "products",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true);
        }
    }
}
