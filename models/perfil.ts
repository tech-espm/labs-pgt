import ItemNomeado = require("../data/itemNomeado");
import ListaNomeada = require("../data/listaNomeada");
import Perfil = require("../enums/conta/perfil");

// Manter sincronizado com enums/conta/perfil.ts e sql/script.sql
const perfis = new ListaNomeada([
	new ItemNomeado(Perfil.Administrador, "Administrador"),
	new ItemNomeado(Perfil.Professor, "Professor")
]);

export = perfis;
