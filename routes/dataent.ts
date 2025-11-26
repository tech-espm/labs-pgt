import app = require("teem");
import fases = require("../models/fase");
import entregas = require("../models/tipo-entrega")
import semestres = require("../models/semestre-entrega")
import Usuario = require("../models/conta");

class DataEntRoute {
    public static async criar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin)
			res.redirect(app.root + "/acesso");
		else
			res.render("dataent/criar", {
				titulo: "Criar Data de Entrega",
				fases: fases.lista,
				usuario: u,
				entregas: entregas.lista,
				semestres: semestres.lista
			});
	}
}

export = DataEntRoute;
