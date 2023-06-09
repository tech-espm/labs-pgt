import ItemNomeado = require("../data/itemNomeado");
import ListaNomeada = require("../data/listaNomeada");
import TipoFormulario = require("../enums/formulario/tipo");

// Manter sincronizado com enums/formulario/tipo.ts e sql/script.sql
const tiposPGT = new ListaNomeada([
	new ItemNomeado(TipoFormulario.Qualificacao, "Qualificação"),
	new ItemNomeado(TipoFormulario.Defesa, "Defesa"),
]);

export = tiposPGT;
