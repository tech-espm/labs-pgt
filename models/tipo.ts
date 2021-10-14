import ItemNomeado = require("../data/itemNomeado");
import ListaNomeada = require("../data/listaNomeada");
import Tipo = require("../enums/tipo");

// Manter sincronizado com enums/tipo.ts e sql/script.sql
const tipos = new ListaNomeada([
	new ItemNomeado(Tipo.PE, "Projeto Empreendor"),
	new ItemNomeado(Tipo.PA, "Projeto Acadêmico"),
	new ItemNomeado(Tipo.EC, "Estudo de Caso")
]);

export = tipos;
