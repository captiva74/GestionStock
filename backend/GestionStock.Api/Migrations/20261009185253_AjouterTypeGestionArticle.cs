
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestionStock.Api.Migrations
{
    public partial class AjouterTypeGestionArticle : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TypeGestion",
                table: "Articles",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TypeGestion",
                table: "Articles");
        }
    }
}
