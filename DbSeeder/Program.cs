using Npgsql;

var connStr = "Host=altaria.proxy.rlwy.net;Port=30536;Database=railway;Username=postgres;Password=iMLlkDwuTaVsTLAvsmZXkjnMVlENnfJr;SSL Mode=Require;Trust Server Certificate=true";

await using var conn = new NpgsqlConnection(connStr);
await conn.OpenAsync();
Console.WriteLine("Connected!");

// Add missing columns if not exist
var cols = new[]
{
    ("IsSoldOut",  "ALTER TABLE \"Products\" ADD COLUMN IF NOT EXISTS \"IsSoldOut\" boolean NOT NULL DEFAULT false;"),
    ("StitchType", "ALTER TABLE \"Products\" ADD COLUMN IF NOT EXISTS \"StitchType\" varchar(50) NOT NULL DEFAULT 'Unstitched';"),
};

foreach (var (name, sql) in cols)
{
    await using var cmd = new NpgsqlCommand(sql, conn);
    await cmd.ExecuteNonQueryAsync();
    Console.WriteLine($"Column {name} — OK");
}

// Check all columns in Products table
await using var check = new NpgsqlCommand(
    "SELECT column_name FROM information_schema.columns WHERE table_name='Products' ORDER BY ordinal_position;", conn);
await using var reader = await check.ExecuteReaderAsync();
Console.WriteLine("\nProducts columns:");
while (await reader.ReadAsync())
    Console.Write(reader.GetString(0) + "  ");

Console.WriteLine("\nDone!");
