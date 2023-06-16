import ItemNomeado = require("../data/itemNomeado");
import ListaNomeada = require("../data/listaNomeada");
import FasePGT = require("../enums/pgt/fase");

// Manter sincronizado com enums/pgt/fase.ts e sql/script.sql
const fasesPGT = new ListaNomeada([
	new ItemNomeado(FasePGT.PGT1, "PGT 1"),
	new ItemNomeado(FasePGT.PGT2, "PGT 2"),
	new ItemNomeado(FasePGT.Concluido, "Concluído")
]);

export = fasesPGT;
