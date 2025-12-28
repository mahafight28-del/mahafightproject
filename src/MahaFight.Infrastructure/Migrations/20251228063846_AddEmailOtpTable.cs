using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MahaFight.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEmailOtpTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "email_otps",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    otp_hash = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    purpose = table.Column<int>(type: "integer", nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    is_used = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    attempt_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    user_agent = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ip_address = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_email_otps", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "mobile_otps",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    otp_hash = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    purpose = table.Column<int>(type: "integer", nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    is_used = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    attempt_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    user_agent = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ip_address = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_mobile_otps", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_email_otps_email_purpose_is_used_expires_at",
                table: "email_otps",
                columns: new[] { "email", "purpose", "is_used", "expires_at" });

            migrationBuilder.CreateIndex(
                name: "IX_mobile_otps_phone_purpose_is_used_expires_at",
                table: "mobile_otps",
                columns: new[] { "phone", "purpose", "is_used", "expires_at" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "email_otps");

            migrationBuilder.DropTable(
                name: "mobile_otps");
        }
    }
}
