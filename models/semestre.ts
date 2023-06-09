import ItemNomeado = require("../data/itemNomeado");
import ListaNomeada = require("../data/listaNomeada");
import Semestre = require("../enums/pgt/semestre");

// Manter sincronizado com enums/tipo.ts e sql/script.sql
const semestre = new ListaNomeada([
	new ItemNomeado(Semestre.setimo, "7º Semestre"),
	new ItemNomeado(Semestre.oitavo, "8º Semestre")
]);

export = semestre;
