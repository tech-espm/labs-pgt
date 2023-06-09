import ItemNomeado = require("../data/itemNomeado");
import ListaNomeada = require("../data/listaNomeada");
import Fase = require("../enums/pgt/fase");

// Manter sincronizado com enums/fase.ts e sql/script.sql
const fases = new ListaNomeada([
	new ItemNomeado(Fase.PGT1, "PGT 1"),
	new ItemNomeado(Fase.PGT2, "PGT 2"),
	new ItemNomeado(Fase.Concluido, "Concluído")
]);

export = fases;
