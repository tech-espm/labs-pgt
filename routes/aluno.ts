import app = require("teem");
import Aluno = require("../models/aluno");
import Usuario = require("../models/Conta");

class AlunoRoute {
	public static async criar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin)
			res.redirect(app.root + "/acesso");
		else
			res.render("aluno/editar", {
				titulo: "Criar Aluno",
				usuario: u,
				item: null
			});
	}

	public static async editar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin) {
			res.redirect(app.root + "/acesso");
		} else {
			let id = parseInt(req.query["id"] as string);
			let item: Aluno = null;
			if (isNaN(id) || !(item = await Aluno.obter(id)))
				res.render("index/nao-encontrado", { usuario: u });
			else
				res.render("aluno/editar", {
					titulo: "Editar Aluno",
					usuario: u,
					item: item
				});
		}
	}

	public static async listar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u)
			res.redirect(app.root + "/acesso");
		else
			res.render("aluno/listar", {
				layout: "layout-tabela",
				titulo: "Gerenciar Alunos",
				datatables: true,
				usuario: u,
				lista: await Aluno.listar()
			});
	}
}

export = AlunoRoute;
