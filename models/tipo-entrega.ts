import ItemNomeado = require("../data/itemNomeado");
import ListaNomeada = require("../data/listaNomeada");
import TipoEntrega = require("../enums/datalim/tipo-entrega");

const tipoEntregas = new ListaNomeada([
	new ItemNomeado(TipoEntrega.biblioteca, "Biblioteca"),
	new ItemNomeado(TipoEntrega.banca, "Banca"),
]);

export = tipoEntregas;
