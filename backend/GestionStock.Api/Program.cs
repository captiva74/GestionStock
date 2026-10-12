using System.Text;
using GestionStock.Api.Data;
using GestionStock.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularLocal", policy =>
    {
        policy
            .WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Accès au contexte HTTP pour identifier l'agence sélectionnée
builder.Services.AddHttpContextAccessor();

// Connexion centrale : utilisateurs, agences et alertes
var connexionCentrale =
    builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException(
        "La connexion DefaultConnection est absente.");

builder.Services.AddDbContext<CentralDbContext>(options =>
    options.UseSqlServer(connexionCentrale));

// Modèle de connexion des bases agences
var modeleConnexionAgences =
    builder.Configuration.GetConnectionString("Agences")
    ?? throw new InvalidOperationException(
        "La connexion Agences est absente de appsettings.json.");

// Service qui détermine l'agence à utiliser
builder.Services.AddScoped<IAgenceService, AgenceService>();

// Connexion dynamique : GestionStockDb01 à GestionStockDb69
builder.Services.AddDbContext<ApplicationDbContext>((serviceProvider, options) =>
{
    var agenceService =
        serviceProvider.GetRequiredService<IAgenceService>();

    var connexionAgence = modeleConnexionAgences.Replace(
        "{0}",
        agenceService.NomBase,
        StringComparison.Ordinal);

    options.UseSqlServer(connexionAgence);
});

// Services existants
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IJournalService, JournalService>();

// Authentification JWT
var cleJwt = builder.Configuration["Jwt:Cle"]
    ?? throw new InvalidOperationException("Jwt:Cle est absent.");

var emetteurJwt = builder.Configuration["Jwt:Emetteur"]
    ?? throw new InvalidOperationException("Jwt:Emetteur est absent.");

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme =
            JwtBearerDefaults.AuthenticationScheme;

        options.DefaultChallengeScheme =
            JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = emetteurJwt,
                ValidateAudience = true,
                ValidAudience = emetteurJwt,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(cleJwt)),
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AngularLocal");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
