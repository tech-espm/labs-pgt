import app = require("teem");
import tipos = require("../models/tipo"); 
import fases = require("../models/fase");
import PGT = require("../models/pgt");
import Usuario = require("../models/usuario");

class PGTRoute {
	public static async criar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin)
			res.redirect(app.root + "/acesso");
		else
			res.render("pgt/editar1", {
				titulo: "Criar PGT 1",
				usuario: u,
				item: null,
				tipos: tipos.lista, 
				fases: fases.lista,
				usuarios: await Usuario.listarCombo()
			});
	} 

	public static async criarprototipo(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin)
			res.redirect(app.root + "/acesso");
		else
			res.render("pgt/editar1prototipo", {
				titulo: "Criar PGT 1",
				usuario: u,
				item: null,
				tipos: tipos.lista, 
				fases: fases.lista,
				usuarios: await Usuario.listarCombo()
			});
	}

	public static async editar1(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin) {
			res.redirect(app.root + "/acesso");
		} else {
			let id = parseInt(req.query["id"] as string);
			let item: PGT = null;
			if (isNaN(id) || !(item = await PGT.obter1(id)))
				res.render("index/nao-encontrado", { usuario: u });
			else
				res.render("pgt/editar1", {
					titulo: "Editar PGT 1",
					usuario: u,
					item: item,
					tipos: tipos.lista,
					fases: fases.lista,
					usuarios: await Usuario.listarCombo()
				});
		}
	} 

	public static async editar1prototipo(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin) {
			res.redirect(app.root + "/acesso");
		} else {
			let id = parseInt(req.query["id"] as string);
			let item: PGT = null;
			if (isNaN(id) || !(item = await PGT.obter1(id)))
				res.render("index/nao-encontrado", { usuario: u });
			else
				res.render("pgt/editar1prototipo", {
					titulo: "Editar PGT 1",
					usuario: u,
					item: item,
					tipos: tipos.lista,
					fases: fases.lista,
					usuarios: await Usuario.listarCombo()
				});
		}
	}

	public static async editar2(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin) {
			res.redirect(app.root + "/acesso");
		} else {
			let id = parseInt(req.query["id"] as string);
			let item: PGT = null;
			if (isNaN(id) || !(item = await PGT.obter2(id)))
				res.render("index/nao-encontrado", { usuario: u });
			else
				res.render("pgt/editar2", {
					titulo: "Editar PGT 2",
					usuario: u,
					item: item,
					tipos: tipos.lista, 
					fases: fases.lista,
					usuarios: await Usuario.listarCombo()
				});
		}
	} 

	public static async editar2prototipo(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin) {
			res.redirect(app.root + "/acesso");
		} else {
			let id = parseInt(req.query["id"] as string);
			let item: PGT = null;
			if (isNaN(id) || !(item = await PGT.obter2(id)))
				res.render("index/nao-encontrado", { usuario: u });
			else
				res.render("pgt/editar2prototipo", {
					titulo: "Editar PGT 2",
					usuario: u,
					item: item,
					tipos: tipos.lista, 
					fases: fases.lista,
					usuarios: await Usuario.listarCombo()
				});
		}
	}

	public static async listar1(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin)
			res.redirect(app.root + "/acesso");
		else
			res.render("pgt/listar1", {
				layout: "layout-tabela",
				titulo: "Gerenciar PGT's 1",
				datatables: true,
				usuario: u,
				lista: await PGT.listar1()
			});
	}

	public static async listar2(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin)
			res.redirect(app.root + "/acesso");
		else
			res.render("pgt/listar2", {
				layout: "layout-tabela",
				titulo: "Gerenciar PGT's 2",
				datatables: true,
				usuario: u,
				lista: await PGT.listar2()
			});
	}
}

export = PGTRoute;
