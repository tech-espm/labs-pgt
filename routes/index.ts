import app = require("teem");
import appsettings = require("../appsettings");
import PGT = require("../models/pgt");
import DataEnt = require("../models/dataent");
import Usuario = require("../models/conta");
import DataUtil = require("../utils/dataUtil");

class IndexRoute {
	public static async index(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u) {
			res.redirect(app.root + "/login");
		} else {
			const hoje = DataUtil.horarioDeBrasiliaComoDateUTC();

			res.render("index/index", {
				layout: "layout-sem-form",
				titulo: "Olá, "+ Usuario.name,
				ano: hoje.getUTCFullYear(),
				mes: hoje.getUTCMonth() + 1,
				usuario: u,
				lista: await PGT.listar(),
				listad: await DataEnt.listar()
			});
		}
	}

	@app.http.all()
	public static async login(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u) {
			const token = req.query["token"] as string;

			if (token) {
				const [mensagem, u] = await Usuario.efetuarLogin(token, res);
				if (mensagem)
					res.render("index/login", {
						layout: "layout-externo",
						mensagem: mensagem,
						ssoRedir: appsettings.ssoRedir
					});
				else
					res.redirect(app.root + "/");
			} else {
				res.render("index/login", {
					layout: "layout-externo",
					mensagem: null,
					ssoRedir: appsettings.ssoRedir
				});
			}
		} else {
			res.redirect(app.root + "/");
		}
	}

	public static async acesso(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u)
			res.redirect(app.root + "/login");
		else
			res.render("index/acesso", {
				layout: "layout-sem-form",
				titulo: "Sem Permissão",
				usuario: u
			});
	}

	public static async perfil(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u)
			res.redirect(app.root + "/");
		else
			res.render("index/perfil", {
				titulo: "Meu Perfil",
				usuario: u
			});
	}

	public static async logout(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (u)
			await Usuario.efetuarLogout(u, res);
		res.redirect(app.root + "/");
	}
}

export = IndexRoute;
