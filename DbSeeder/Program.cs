using Npgsql;

var connStr = "Host=altaria.proxy.rlwy.net;Port=30536;Database=railway;Username=postgres;Password=iMLlkDwuTaVsTLAvsmZXkjnMVlENnfJr;SSL Mode=Require;Trust Server Certificate=true";

await using var conn = new NpgsqlConnection(connStr);
await conn.OpenAsync();
Console.WriteLine("Connected!");

await using var cmd = new NpgsqlCommand(
    "ALTER TABLE \"Products\" ADD COLUMN IF NOT EXISTS \"IsSoldOut\" boolean NOT NULL DEFAULT false;", conn);
await cmd.ExecuteNonQueryAsync();
Console.WriteLine("IsSoldOut column added!");
Console.WriteLine("Done!");
