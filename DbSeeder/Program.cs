using Npgsql;

var connStr = "Host=altaria.proxy.rlwy.net;Port=30536;Database=railway;Username=postgres;Password=iMLlkDwuTaVsTLAvsmZXkjnMVlENnfJr;SSL Mode=Require;Trust Server Certificate=true";

await using var conn = new NpgsqlConnection(connStr);
await conn.OpenAsync();
Console.WriteLine("Connected!");

// Add StitchType column if not exists
var addColumn = """
    ALTER TABLE "Products" 
    ADD COLUMN IF NOT EXISTS "StitchType" varchar(50) NOT NULL DEFAULT 'Unstitched';
    """;

await using var cmd = new NpgsqlCommand(addColumn, conn);
await cmd.ExecuteNonQueryAsync();
Console.WriteLine("StitchType column added!");

// Verify
await using var v = new NpgsqlCommand(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name='Products' AND column_name='StitchType';", conn);
await using var r = await v.ExecuteReaderAsync();
while (await r.ReadAsync())
    Console.WriteLine($"Column: {r["column_name"]} ({r["data_type"]})");

Console.WriteLine("Done!");
