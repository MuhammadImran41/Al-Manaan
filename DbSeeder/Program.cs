using Npgsql;

var connStr = "Host=altaria.proxy.rlwy.net;Port=30536;Database=railway;Username=postgres;Password=iMLlkDwuTaVsTLAvsmZXkjnMVlENnfJr;SSL Mode=Require;Trust Server Certificate=true";

await using var conn = new NpgsqlConnection(connStr);
await conn.OpenAsync();
Console.WriteLine("Connected!");

// Use picsum.photos — reliable, no ORB block, fashion-style portraits
var images = new[]
{
    ("embroidered-lawn-suit",  "https://picsum.photos/seed/lawn1/600/800"),
    ("silk-formal-dress",      "https://picsum.photos/seed/silk2/600/800"),
    ("cotton-shalwar-kameez",  "https://picsum.photos/seed/cotton3/600/800"),
    ("men-kurta-shalwar",      "https://picsum.photos/seed/kurta4/600/800"),
    ("chiffon-party-wear",     "https://picsum.photos/seed/chiffon5/600/800"),
    ("casual-men-kurta",       "https://picsum.photos/seed/casual6/600/800"),
};

await using (var del = new NpgsqlCommand("DELETE FROM \"ProductImages\";", conn))
    await del.ExecuteNonQueryAsync();
Console.WriteLine("Old images cleared");

foreach (var (slug, url) in images)
{
    var sql = $"""
        INSERT INTO "ProductImages" ("CreatedAt","UpdatedAt","ImageUrl","IsMain","SortOrder","ProductId")
        SELECT NOW(), NOW(), '{url}', true, 1, "Id"
        FROM "Products" WHERE "Slug" = '{slug}';
        """;
    await using var cmd = new NpgsqlCommand(sql, conn);
    int r = await cmd.ExecuteNonQueryAsync();
    Console.WriteLine($"  {slug}: {r} row");
}

await using var v = new NpgsqlCommand("SELECT COUNT(*) FROM \"ProductImages\";", conn);
Console.WriteLine($"Total images: {await v.ExecuteScalarAsync()}");
Console.WriteLine("Done!");
