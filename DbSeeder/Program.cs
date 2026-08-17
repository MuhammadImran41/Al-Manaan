using Npgsql;
using System.Security.Cryptography;
using System.Text;

var connStr = "Host=altaria.proxy.rlwy.net;Port=30536;Database=railway;Username=postgres;Password=iMLlkDwuTaVsTLAvsmZXkjnMVlENnfJr;SSL Mode=Require;Trust Server Certificate=true";

await using var conn = new NpgsqlConnection(connStr);
await conn.OpenAsync();
Console.WriteLine("Connected!");

// Check if almananshop@gmail.com already exists
await using var check = new NpgsqlCommand(
    "SELECT COUNT(*) FROM \"AspNetUsers\" WHERE \"Email\" = 'almananshop@gmail.com'", conn);
var exists = (long)(await check.ExecuteScalarAsync() ?? 0L);

if (exists > 0)
{
    Console.WriteLine("almananshop@gmail.com already exists!");
}
else
{
    // Get Admin role ID
    await using var roleCmd = new NpgsqlCommand(
        "SELECT \"Id\" FROM \"AspNetRoles\" WHERE \"Name\" = 'Admin'", conn);
    var roleId = (string)(await roleCmd.ExecuteScalarAsync() ?? "");
    Console.WriteLine($"Admin role ID: {roleId}");

    var userId = Guid.NewGuid().ToString();
    // ASP.NET Identity password hash for "Admin@123"
    // We'll use a known hash approach — insert user then update via API
    // Easier: copy hash from existing admin user
    await using var hashCmd = new NpgsqlCommand(
        "SELECT \"PasswordHash\" FROM \"AspNetUsers\" WHERE \"Email\" = 'admin@almanan.com' LIMIT 1", conn);
    var existingHash = (string)(await hashCmd.ExecuteScalarAsync() ?? "");
    
    if (string.IsNullOrEmpty(existingHash))
    {
        Console.WriteLine("No existing admin found to copy hash from!");
    }
    else
    {
        var insertUser = $@"
            INSERT INTO ""AspNetUsers"" (""Id"",""UserName"",""NormalizedUserName"",""Email"",""NormalizedEmail"",
                ""EmailConfirmed"",""PasswordHash"",""SecurityStamp"",""ConcurrencyStamp"",
                ""PhoneNumberConfirmed"",""TwoFactorEnabled"",""LockoutEnabled"",""AccessFailedCount"",
                ""FirstName"",""LastName"",""DisplayName"")
            VALUES ('{userId}','almananshop@gmail.com','ALMANANSHOP@GMAIL.COM',
                'almananshop@gmail.com','ALMANANSHOP@GMAIL.COM',
                true,'{existingHash}','{Guid.NewGuid()}','{Guid.NewGuid()}',
                false,false,false,0,'Al-Manan','Admin','Admin')
            ON CONFLICT DO NOTHING;";

        await using var insertCmd = new NpgsqlCommand(insertUser, conn);
        await insertCmd.ExecuteNonQueryAsync();

        var insertRole = $@"
            INSERT INTO ""AspNetUserRoles"" (""UserId"",""RoleId"")
            VALUES ('{userId}','{roleId}')
            ON CONFLICT DO NOTHING;";
        await using var roleInsert = new NpgsqlCommand(insertRole, conn);
        await roleInsert.ExecuteNonQueryAsync();

        Console.WriteLine($"Created almananshop@gmail.com with Admin role!");
    }
}

// Verify
await using var verify = new NpgsqlCommand(
    @"SELECT u.""Email"", r.""Name"" as role 
      FROM ""AspNetUsers"" u
      JOIN ""AspNetUserRoles"" ur ON u.""Id"" = ur.""UserId""
      JOIN ""AspNetRoles"" r ON ur.""RoleId"" = r.""Id""
      WHERE r.""Name"" = 'Admin'", conn);
await using var reader = await verify.ExecuteReaderAsync();
Console.WriteLine("\nAdmin users:");
while (await reader.ReadAsync())
    Console.WriteLine($"  - {reader["Email"]} ({reader["role"]})");

Console.WriteLine("Done!");
