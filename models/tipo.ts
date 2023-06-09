import ItemNomeado = require("../data/itemNomeado");
import ListaNomeada = require("../data/listaNomeada");
import Tipo = require("../enums/pgt/tipo");

// Manter sincronizado com enums/tipo.ts e sql/script.sql
const tipos = new ListaNomeada([
	new ItemNomeado(Tipo.Empreeendimento, "Projeto Empreendor"),
	new ItemNomeado(Tipo.Pesquisa, "Projeto Acadêmico"),
	new ItemNomeado(Tipo.Caso, "Estudo de Caso")
]);

export = tipos;
