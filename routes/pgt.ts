﻿import app = require("teem");
import Aluno = require("../models/aluno");
import tipos = require("../models/tipo"); 
import fases = require("../models/fase");
import semestres = require("../models/semestre");
import PGT = require("../models/pgt");
import Usuario = require("../models/conta");

class PGTRoute {
	public static async criar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin)
			res.redirect(app.root + "/acesso");
		else
			res.render("pgt/editar", {
				titulo: "Criar PGT",
				usuario: u,
				item: null,
				tipos: tipos.lista, 
				fases: fases.lista,
				semestres: semestres.lista,
				usuarios: await Usuario.listarCombo(),
				alunos: await Aluno.listarCombo()
			});
	} 

	public static async criarprototipo(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin)
			res.redirect(app.root + "/acesso");
		else
			res.render("pgt/editarPrototipo", {
				titulo: "Criar PGT",
				usuario: u,
				item: null,
				tipos: tipos.lista, 
				fases: fases.lista,
				usuarios: await Usuario.listarCombo(),
				alunos: await Aluno.listarCombo()
			});
	}

	public static async editar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin) {
			res.redirect(app.root + "/acesso");
		} else {
			let id = parseInt(req.query["id"] as string);
			let item: PGT = null;
			if (isNaN(id) || !(item = await PGT.obter(id)))
				res.render("index/nao-encontrado", { usuario: u });
			else
				res.render("pgt/editar", {
					titulo: "Editar PGT",
					usuario: u,
					item: item,
					tipos: tipos.lista,
					fases: fases.lista,
					semestres: semestres.lista,
					usuarios: await Usuario.listarCombo(),
					alunos: await Aluno.listarCombo()
				});
		}
	} 

	public static async editarPrototipo(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin) {
			res.redirect(app.root + "/acesso");
		} else {
			let id = parseInt(req.query["id"] as string);
			let item: PGT = null;
			if (isNaN(id) || !(item = await PGT.obter(id)))
				res.render("index/nao-encontrado", { usuario: u });
			else
				res.render("pgt/editarPrototipo", {
					titulo: "Editar PGT",
					usuario: u,
					item: item,
					tipos: tipos.lista,
					fases: fases.lista,
					usuarios: await Usuario.listarCombo(),
					alunos: await Aluno.listarCombo()
				});
		}
	}

	public static async listar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u)
			res.redirect(app.root + "/acesso");
		else
			res.render("pgt/listar", {
				layout: "layout-tabela",
				titulo: "Gerenciar PGTs",
				datatables: true,
				usuario: u,
				lista: await PGT.listar(u.admin ? 0 : u.id)
			});
	}

	public static async detalhar(req: app.Request, res: app.Response){
		let u = await Usuario.cookie(req);
		if (!u || !u.admin) {
			res.redirect(app.root + "/acesso");
		} else {
			let id = parseInt(req.query["id"] as string);
			let item: PGT = null;
			if (isNaN(id) || !(item = await PGT.obter(id)))
				res.render("index/nao-encontrado", { usuario: u });
			else
				res.render("pgt/detalhar", {
					layout: "layout-sem-form",
					titulo: "PGT - " + item.nome,
					usuario: u,
					item: item,
					tipos: tipos.lista,
					fases: fases.lista,
					semestres: semestres.lista,
					usuarios: await Usuario.listarCombo(),
					alunos: await Aluno.listarCombo()
				});
		}
	}

	public static async avaliar(req: app.Request, res: app.Response){
		let u = await Usuario.cookie(req);
		if (!u || !u.admin) {
			res.redirect(app.root + "/acesso");
		} else {
			let id = parseInt(req.query["pgt"] as string);
			let item: PGT = null;
			if (isNaN(id) || !(item = await PGT.obter(id)))
				res.render("index/nao-encontrado", { usuario: u });
			else
				res.render("pgt/avaliar1", {
					layout: "layout",
					titulo: "PGT - " + item.nome,
					usuario: u,
					item: item,
					tipos: tipos.lista,
					fases: fases.lista,
					semestres: semestres.lista,
					usuarios: await Usuario.listarCombo(),
					alunos: await Aluno.listarCombo()
				});
		}
	}
}

export = PGTRoute;
