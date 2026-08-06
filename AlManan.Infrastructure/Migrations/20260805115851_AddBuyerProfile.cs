using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace AlManan.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBuyerProfile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BuyerProfiles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FullName = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Phone = table.Column<string>(type: "text", nullable: false),
                    City = table.Column<string>(type: "text", nullable: false),
                    Province = table.Column<string>(type: "text", nullable: false),
                    Street = table.Column<string>(type: "text", nullable: false),
                    PostalCode = table.Column<string>(type: "text", nullable: false),
                    Country = table.Column<string>(type: "text", nullable: false),
                    TotalOrders = table.Column<int>(type: "integer", nullable: false),
                    TotalSpent = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    LastOrderAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BuyerProfiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BuyerProfiles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 8, 5, 11, 58, 51, 274, DateTimeKind.Utc).AddTicks(6695), new DateTime(2026, 8, 5, 11, 58, 51, 274, DateTimeKind.Utc).AddTicks(6695) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 8, 5, 11, 58, 51, 274, DateTimeKind.Utc).AddTicks(6698), new DateTime(2026, 8, 5, 11, 58, 51, 274, DateTimeKind.Utc).AddTicks(6698) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 8, 5, 11, 58, 51, 274, DateTimeKind.Utc).AddTicks(6701), new DateTime(2026, 8, 5, 11, 58, 51, 274, DateTimeKind.Utc).AddTicks(6701) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 8, 5, 11, 58, 51, 274, DateTimeKind.Utc).AddTicks(6703), new DateTime(2026, 8, 5, 11, 58, 51, 274, DateTimeKind.Utc).AddTicks(6704) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 8, 5, 11, 58, 51, 274, DateTimeKind.Utc).AddTicks(6706), new DateTime(2026, 8, 5, 11, 58, 51, 274, DateTimeKind.Utc).AddTicks(6706) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 8, 5, 11, 58, 51, 274, DateTimeKind.Utc).AddTicks(6709), new DateTime(2026, 8, 5, 11, 58, 51, 274, DateTimeKind.Utc).AddTicks(6709) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 8, 5, 11, 58, 51, 274, DateTimeKind.Utc).AddTicks(6711), new DateTime(2026, 8, 5, 11, 58, 51, 274, DateTimeKind.Utc).AddTicks(6712) });

            migrationBuilder.CreateIndex(
                name: "IX_BuyerProfiles_Email",
                table: "BuyerProfiles",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_BuyerProfiles_UserId",
                table: "BuyerProfiles",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BuyerProfiles");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 8, 5, 8, 59, 43, 133, DateTimeKind.Utc).AddTicks(1049), new DateTime(2026, 8, 5, 8, 59, 43, 133, DateTimeKind.Utc).AddTicks(1050) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 8, 5, 8, 59, 43, 133, DateTimeKind.Utc).AddTicks(1052), new DateTime(2026, 8, 5, 8, 59, 43, 133, DateTimeKind.Utc).AddTicks(1053) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 8, 5, 8, 59, 43, 133, DateTimeKind.Utc).AddTicks(1055), new DateTime(2026, 8, 5, 8, 59, 43, 133, DateTimeKind.Utc).AddTicks(1056) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 8, 5, 8, 59, 43, 133, DateTimeKind.Utc).AddTicks(1058), new DateTime(2026, 8, 5, 8, 59, 43, 133, DateTimeKind.Utc).AddTicks(1059) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 8, 5, 8, 59, 43, 133, DateTimeKind.Utc).AddTicks(1061), new DateTime(2026, 8, 5, 8, 59, 43, 133, DateTimeKind.Utc).AddTicks(1061) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 8, 5, 8, 59, 43, 133, DateTimeKind.Utc).AddTicks(1063), new DateTime(2026, 8, 5, 8, 59, 43, 133, DateTimeKind.Utc).AddTicks(1064) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 8, 5, 8, 59, 43, 133, DateTimeKind.Utc).AddTicks(1066), new DateTime(2026, 8, 5, 8, 59, 43, 133, DateTimeKind.Utc).AddTicks(1066) });
        }
    }
}
