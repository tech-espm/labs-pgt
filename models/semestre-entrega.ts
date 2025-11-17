import ItemNomeado = require("../data/itemNomeado");
import ListaNomeada = require("../data/listaNomeada");
import SemestreEntrega = require("../enums/dataent/semestre-entrega");

const semestreEntregas = new ListaNomeada([
	new ItemNomeado(SemestreEntrega.primeiro, "1° Semestre do ano"),
	new ItemNomeado(SemestreEntrega.segundo, "2° Semestre do ano"),
]);

export = semestreEntregas;
