using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AlManan.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIsSoldOut : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsSoldOut",
                table: "Products",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsSoldOut",
                table: "Products");
        }
    }
}
