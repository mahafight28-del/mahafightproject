using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MahaFight.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddQrCodeExpiresAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "QrCodeExpiresAt",
                table: "products",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "QrCodeExpiresAt",
                table: "products");
        }
    }
}
