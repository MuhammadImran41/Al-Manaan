# =====================================================
# Al-Manan API — Multi-stage Dockerfile for Railway
# =====================================================

# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution & project files first (layer cache optimization)
COPY AlManan.Core/AlManan.Core.csproj         AlManan.Core/
COPY AlManan.Infrastructure/AlManan.Infrastructure.csproj  AlManan.Infrastructure/
COPY AlManan.API/AlManan.API.csproj           AlManan.API/

# Restore dependencies
RUN dotnet restore AlManan.API/AlManan.API.csproj

# Copy all source code
COPY AlManan.Core/         AlManan.Core/
COPY AlManan.Infrastructure/ AlManan.Infrastructure/
COPY AlManan.API/          AlManan.API/

# Build & publish
WORKDIR /src/AlManan.API
RUN dotnet publish AlManan.API.csproj -c Release -o /app/publish --no-restore

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Copy published output
COPY --from=build /app/publish .

# Railway injects PORT env var — ASP.NET Core reads ASPNETCORE_URLS
ENV ASPNETCORE_URLS=http://+:$PORT
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 8080

ENTRYPOINT ["dotnet", "AlManan.API.dll"]
