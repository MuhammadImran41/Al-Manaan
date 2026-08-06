# Al-Manan E-Commerce — Startup Guide

## Project Structure

```
f:\Al-Manan\
├── AlManan.API/              .NET 8 Web API (controllers, middleware, extensions)
├── AlManan.Core/             Domain layer (entities, interfaces, DTOs, helpers)
├── AlManan.Infrastructure/   Data layer (EF Core, repositories, services)
├── al-manan-frontend/        Angular 18 frontend
├── Image/                    Reference images (1.jpeg – 4.jpeg)
└── AlManan.slnx              .NET solution file
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| .NET SDK | 8.0+ |
| Node.js | 20+ |
| Angular CLI | 18+ (`npm install -g @angular/cli`) |
| SQL Server | 2019+ (or LocalDB) |
| Git | Any |

---

## 1 — Backend Setup (.NET API)

### 1.1 Configure the database connection

Edit `AlManan.API/appsettings.Development.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=AlMananDb;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

For SQL Server Express use:
```
Server=.\SQLEXPRESS;Database=AlMananDb;Trusted_Connection=True;TrustServerCertificate=True;
```

### 1.2 Configure JWT (required)

In `appsettings.Development.json`, the dev key is already set:
```json
"JWT": {
  "Key": "AlManan_Dev_SuperSecret_JWT_Key_MinLength32Chars!"
}
```
For production, use a strong 64-character random key.

### 1.3 Run database migrations

```powershell
cd f:\Al-Manan\AlManan.API
dotnet ef database update --project ..\AlManan.Infrastructure\AlManan.Infrastructure.csproj --startup-project .
```

This creates the database, all tables, seeds roles (Admin/Customer), and creates the default admin user:
- **Email:** admin@almanan.com
- **Password:** Admin@123

### 1.4 Start the API

```powershell
cd f:\Al-Manan\AlManan.API
dotnet run
```

API runs at: `https://localhost:5001`
Swagger UI: `https://localhost:5001/swagger`

---

## 2 — Frontend Setup (Angular)

### 2.1 Install dependencies (already done)

```powershell
cd f:\Al-Manan\al-manan-frontend
npm install
```

### 2.2 Start the dev server

```powershell
cd f:\Al-Manan\al-manan-frontend
ng serve
```

Opens at: `http://localhost:4200`

### 2.3 Build for production

```powershell
ng build --configuration=production
```

Output: `dist/al-manan-frontend/`

---

## 3 — Cloudinary (Image Uploads)

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Copy your **Cloud Name**, **API Key**, and **API Secret**
3. Add to `appsettings.Development.json`:

```json
"Cloudinary": {
  "CloudName": "your_cloud_name",
  "ApiKey": "your_api_key",
  "ApiSecret": "your_api_secret"
}
```

---

## 4 — Payment Gateway Setup

### JazzCash (Pakistan)

1. Register at [jazzcash.com.pk](https://jazzcash.com.pk) → Merchant Account
2. Get Merchant ID, Password, Integrity Salt from the dashboard
3. Add to `appsettings.Development.json`:

```json
"JazzCash": {
  "MerchantId": "your_merchant_id",
  "Password": "your_password",
  "IntegritySalt": "your_salt",
  "BaseUrl": "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/"
}
```
For production, change `BaseUrl` to the live URL from JazzCash docs.

### EasyPaisa (Pakistan)

1. Register at [easypaisa.com.pk](https://easypaisa.com.pk) → Merchant Portal
2. Get Store ID and Hash Key
3. Add to `appsettings.Development.json`:

```json
"EasyPaisa": {
  "StoreId": "your_store_id",
  "HashKey": "your_hash_key",
  "BaseUrl": "https://easypaystg.easypaisa.com.pk/tpg/"
}
```

### Stripe (International Cards)

1. Create account at [stripe.com](https://stripe.com)
2. Add Stripe.net package: `dotnet add package Stripe.net --version 46.0.0`
3. Uncomment the Stripe code in `AlManan.Infrastructure/Services/PaymentService.cs`
4. Add keys to `appsettings.Development.json`:

```json
"Stripe": {
  "SecretKey": "sk_test_...",
  "WebhookSecret": "whsec_...",
  "PublishableKey": "pk_test_..."
}
```

---

## 5 — Adding More Products

### Via Admin Panel (UI)

1. Log in as admin (admin@almanan.com / Admin@123)
2. Navigate to `http://localhost:4200/admin`
3. Click **Products → Add Product**
4. Fill in details, save
5. Upload product images via the API (see below)

### Via Swagger (API)

1. Open `https://localhost:5001/swagger`
2. Authenticate: POST `/api/auth/login` → copy the token
3. Click **Authorize** → paste `Bearer <your_token>`
4. POST `/api/products` with product data
5. POST `/api/products/{id}/images` to upload images

### Via SQL seed (bulk)

Add seed data directly in `AppDbContext.OnModelCreating()` using `builder.Entity<Product>().HasData(...)`.

---

## 6 — Adding Your Reference Images

The 4 reference images (`1.jpeg` – `4.jpeg`) are already copied to:
```
al-manan-frontend/src/assets/images/
```

They are used in:
- **Hero slideshow** — slides 1 & 2
- **Category grid** — Women's (1.jpeg), New Arrivals (2.jpeg), Men's (3.jpeg)
- **Brand Story** — brand image (4.jpeg)
- **Auth pages** — login uses 1.jpeg, register uses 2.jpeg

To add more images:
1. Copy image files to `src/assets/images/`
2. Reference them as `assets/images/filename.jpg` in components

---

## 7 — Animations Reference

All animations use **GSAP + ScrollTrigger** (already installed via npm).

| Animation | Location | What it does |
|-----------|----------|--------------|
| Hero entrance | `home.component.ts` | Title/subtitle fade-slide-up on load |
| Hero slideshow | `home.component.ts` | Auto-advancing image carousel (6s) |
| Blob morph | `home.component.scss` | Hero image frame morphs shape continuously |
| Orb drift | `home.component.scss` | Soft gradient orbs float in background |
| Scroll reveals | `home.component.ts` | `.section-reveal` elements fade up on scroll |
| Category parallax | `home.component.ts` | Category images move at different scroll speed |
| Brand story float | `home.component.ts` | Image gently bobs up/down (sine wave) |
| Product card tilt | `product-card.component.ts` | Mouse-move 3D perspective tilt effect |
| Gallery swap | `product-detail.component.ts` | Opacity/scale transition on thumbnail click |

---

## 8 — Project Architecture

### Backend Layers

```
AlManan.Core        →  Entities, Interfaces, DTOs (no external dependencies)
AlManan.Infrastructure →  EF Core, Repositories, Services (depends on Core)
AlManan.API         →  Controllers, Middleware, DI wiring (depends on both)
```

### Frontend Modules (Lazy-loaded)

```
HomeModule          → / (hero, featured, best sellers, new arrivals)
ShopModule          → /shop (filter, sort, paginate)
ProductModule       → /product/:slug (gallery, variants, add to cart)
CartModule          → /cart
CheckoutModule      → /checkout (3-step: address → payment → review)
AuthModule          → /auth/login, /auth/register
AccountModule       → /account/profile, /account/orders, /account/wishlist
AdminModule         → /admin (dashboard, products, orders)
```

### API Endpoints

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/auth/register` | — |
| POST | `/api/auth/login` | — |
| GET | `/api/auth/me` | ✓ |
| GET | `/api/products` | — |
| GET | `/api/products/featured` | — |
| GET | `/api/products/best-sellers` | — |
| GET | `/api/products/new-arrivals` | — |
| GET | `/api/products/:id` | — |
| GET | `/api/products/:slug` | — |
| GET | `/api/products/search?q=` | — |
| GET | `/api/products/categories` | — |
| POST | `/api/products` | Admin |
| PUT | `/api/products/:id` | Admin |
| DELETE | `/api/products/:id` | Admin |
| POST | `/api/products/:id/images` | Admin |
| GET | `/api/cart` | ✓ |
| POST | `/api/cart/items` | ✓ |
| PUT | `/api/cart/items/:id` | ✓ |
| DELETE | `/api/cart/items/:id` | ✓ |
| DELETE | `/api/cart` | ✓ |
| POST | `/api/orders` | ✓ |
| GET | `/api/orders/my-orders` | ✓ |
| GET | `/api/orders/:id` | ✓ |
| GET | `/api/orders` | Admin |
| PUT | `/api/orders/:id/status` | Admin |
| GET | `/api/wishlist` | ✓ |
| POST | `/api/wishlist/:productId` | ✓ |
| DELETE | `/api/wishlist/:productId` | ✓ |
| POST | `/api/payments/initiate/:orderId` | ✓ |

---

## 9 — Going to Production

1. **Update `environment.prod.ts`** with your live API URL
2. **Set strong JWT key** in production `appsettings.json`
3. **Enable HTTPS** and update CORS origins in `ApplicationServicesExtension.cs`
4. **Run migrations** against production DB: `dotnet ef database update`
5. **Build Angular**: `ng build --configuration=production`
6. **Host API** on Azure App Service / IIS / Docker
7. **Host Angular** on Azure Static Web Apps / Netlify / IIS
8. **Set payment gateways** to live credentials (remove sandbox URLs)

---

## 10 — Running Both Together (Dev)

Open two terminals:

**Terminal 1 — API:**
```powershell
cd f:\Al-Manan\AlManan.API
dotnet run
```

**Terminal 2 — Angular:**
```powershell
cd f:\Al-Manan\al-manan-frontend
ng serve
```

Then open `http://localhost:4200` in your browser.
