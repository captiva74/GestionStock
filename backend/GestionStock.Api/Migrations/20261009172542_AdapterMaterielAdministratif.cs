using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestionStock.Api.Migrations
{
    public partial class AdapterMaterielAdministratif : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Conserver PrixAchat et transférer sa valeur vers ValeurAcquisition.
            migrationBuilder.AddColumn<decimal>(
                name: "ValeurAcquisition",
                table: "Articles",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.Sql(
                "UPDATE [Articles] SET [ValeurAcquisition] = [PrixAchat];");

            // Ajouter les informations du matériel administratif.
            migrationBuilder.AddColumn<string>(
                name: "BureauAffectation",
                table: "Articles",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DateAcquisition",
                table: "Articles",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Etat",
                table: "Articles",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "Bon état");

            migrationBuilder.AddColumn<string>(
                name: "Marque",
                table: "Articles",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Modele",
                table: "Articles",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NumeroSerie",
                table: "Articles",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Observations",
                table: "Articles",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ServiceAffectation",
                table: "Articles",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: true);

            // Ne pas supprimer PrixAchat, PrixVente,
            // QuantiteStock ou SeuilMinimum à cette étape.
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ValeurAcquisition",
                table: "Articles");

            migrationBuilder.DropColumn(
                name: "BureauAffectation",
                table: "Articles");

            migrationBuilder.DropColumn(
                name: "DateAcquisition",
                table: "Articles");

            migrationBuilder.DropColumn(
                name: "Etat",
                table: "Articles");

            migrationBuilder.DropColumn(
                name: "Marque",
                table: "Articles");

            migrationBuilder.DropColumn(
                name: "Modele",
                table: "Articles");

            migrationBuilder.DropColumn(
                name: "NumeroSerie",
                table: "Articles");

            migrationBuilder.DropColumn(
                name: "Observations",
                table: "Articles");

            migrationBuilder.DropColumn(
                name: "ServiceAffectation",
                table: "Articles");
        }
    }
}

