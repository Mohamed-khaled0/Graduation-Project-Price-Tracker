using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ElectronicsPriceTracker.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Update_listing__platform__product : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Brand",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "ContactEmail",
                table: "Platforms");

            migrationBuilder.DropColumn(
                name: "Endpoint",
                table: "Platforms");

            migrationBuilder.AddColumn<string>(
                name: "Url",
                table: "Listings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Url",
                table: "Listings");

            migrationBuilder.AddColumn<string>(
                name: "Brand",
                table: "Products",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ContactEmail",
                table: "Platforms",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Endpoint",
                table: "Platforms",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
