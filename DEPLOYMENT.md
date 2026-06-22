# SmartClinic Deployment Checklist

## Local verification

```powershell
dotnet restore SmartClinic.API\SmartClinic.API.csproj
dotnet build SmartClinic.API\SmartClinic.API.csproj --no-restore -m:1 -p:OutputPath=bin\DeployVerify\

cd smartclinic-frontend
npm.cmd install
npm.cmd run build
```

Optional full check:

```powershell
.\scripts\test-all.ps1
```

## Backend

Deploy `SmartClinic.API` to an ASP.NET Core host.

Set production configuration:

```text
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=<your-production-sql-server-connection-string>
Jwt__Key=<a-secure-32-plus-byte-secret>
Jwt__Issuer=SmartClinic
Jwt__Audience=SmartClinicUsers
Cors__AllowedOrigins__0=https://your-frontend-domain.com
```

Health check:

```text
https://your-api-domain.com/api/health
```

Expected result:

```json
{
  "success": true,
  "message": "SmartClinic API is online"
}
```

## Frontend

Create `smartclinic-frontend/.env.production`:

```env
VITE_API_BASE_URL=https://your-api-domain.com/api
```

Build:

```powershell
cd smartclinic-frontend
npm.cmd run build
```

Deploy `smartclinic-frontend/dist/` as a static website.

## Smoke test after deployment

1. Open the frontend domain.
2. Confirm the top health chip shows the API online.
3. Register or login.
4. Open Dashboard, Patients, Appointments, and Billing.
5. Create a patient.
6. Confirm the patient appears in the Patients table.

If the frontend opens but API calls fail, check:

- `VITE_API_BASE_URL` points to the hosted `/api`.
- `Cors:AllowedOrigins` contains the frontend domain exactly.
- The backend has a production SQL connection string.
- `Jwt:Key` is not the local development placeholder.
