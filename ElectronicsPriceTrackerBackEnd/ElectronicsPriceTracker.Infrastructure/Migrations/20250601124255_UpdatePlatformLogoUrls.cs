using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 

namespace ElectronicsPriceTracker.Infrastructure.Migrations
{
    public partial class UpdatePlatformLogoUrls : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Platforms",
                keyColumn: "Name",
                keyValue: "Amazon",
                column: "LogoUrl",
                value: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png"
            );

            migrationBuilder.UpdateData(
                table: "Platforms",
                keyColumn: "Name",
                keyValue: "Jumia",
                column: "LogoUrl",
                value: "https://upload.wikimedia.org/wikipedia/commons/9/93/JumiaLogo_%2814%29.png"
            );

            migrationBuilder.UpdateData(
                table: "Platforms",
                keyColumn: "Name",
                keyValue: "2B",
                column: "LogoUrl",
                value: "https://2b.com.eg/media/wysiwyg/about/Ar/2b-tech.png"
            );
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Platforms",
                keyColumn: "Name",
                keyValue: "Amazon",
                column: "LogoUrl",
                value: null
            );

            migrationBuilder.UpdateData(
                table: "Platforms",
                keyColumn: "Name",
                keyValue: "Jumia",
                column: "LogoUrl",
                value: null
            );

            migrationBuilder.UpdateData(
                table: "Platforms",
                keyColumn: "Name",
                keyValue: "2B",
                column: "LogoUrl",
                value: null
            );
        }
    }
}
