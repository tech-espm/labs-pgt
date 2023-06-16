import ItemNomeado = require("../data/itemNomeado");
import ListaNomeada = require("../data/listaNomeada");
import TipoPGT = require("../enums/pgt/tipo");

// Manter sincronizado com enums/pgt/tipo.ts e sql/script.sql
const tiposPGT = new ListaNomeada([
	new ItemNomeado(TipoPGT.Empreeendimento, "Projeto Empreendor"),
	new ItemNomeado(TipoPGT.Pesquisa, "Projeto Acadêmico"),
	new ItemNomeado(TipoPGT.Caso, "Estudo de Caso")
]);

export = tiposPGT;
