using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AlManan.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class NullableUserId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_AspNetUsers_UserId",
                table: "Orders");

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "Orders",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 8, 5, 19, 27, 36, 919, DateTimeKind.Utc).AddTicks(9540), new DateTime(2026, 8, 5, 19, 27, 36, 919, DateTimeKind.Utc).AddTicks(9540) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 8, 5, 19, 27, 36, 919, DateTimeKind.Utc).AddTicks(9543), new DateTime(2026, 8, 5, 19, 27, 36, 919, DateTimeKind.Utc).AddTicks(9544) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 8, 5, 19, 27, 36, 919, DateTimeKind.Utc).AddTicks(9546), new DateTime(2026, 8, 5, 19, 27, 36, 919, DateTimeKind.Utc).AddTicks(9547) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 8, 5, 19, 27, 36, 919, DateTimeKind.Utc).AddTicks(9549), new DateTime(2026, 8, 5, 19, 27, 36, 919, DateTimeKind.Utc).AddTicks(9550) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 8, 5, 19, 27, 36, 919, DateTimeKind.Utc).AddTicks(9553), new DateTime(2026, 8, 5, 19, 27, 36, 919, DateTimeKind.Utc).AddTicks(9553) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 8, 5, 19, 27, 36, 919, DateTimeKind.Utc).AddTicks(9556), new DateTime(2026, 8, 5, 19, 27, 36, 919, DateTimeKind.Utc).AddTicks(9556) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 8, 5, 19, 27, 36, 919, DateTimeKind.Utc).AddTicks(9559), new DateTime(2026, 8, 5, 19, 27, 36, 919, DateTimeKind.Utc).AddTicks(9559) });

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_AspNetUsers_UserId",
                table: "Orders",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_AspNetUsers_UserId",
                table: "Orders");

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "Orders",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

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

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_AspNetUsers_UserId",
                table: "Orders",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
