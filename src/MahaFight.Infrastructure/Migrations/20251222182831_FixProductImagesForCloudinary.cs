using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MahaFight.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixProductImagesForCloudinary : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "file_path",
                table: "product_images",
                newName: "image_url");

            migrationBuilder.AddColumn<string>(
                name: "public_id",
                table: "product_images",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "public_id",
                table: "product_images");

            migrationBuilder.RenameColumn(
                name: "image_url",
                table: "product_images",
                newName: "file_path");
        }
    }
}
