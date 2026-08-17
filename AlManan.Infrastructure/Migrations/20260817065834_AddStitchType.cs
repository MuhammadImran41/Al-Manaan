using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AlManan.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddStitchType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "StitchType",
                table: "Products",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StitchType",
                table: "Products");
        }
    }
}
