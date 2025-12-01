import app = require("teem");
import Aluno = require("../models/aluno");
import tipos = require("../models/tipoPGT");
import fases = require("../models/fase");
import semestres = require("../models/semestre");
import PGT = require("../models/pgt");
import Usuario = require("../models/conta");
import Perguntas = require("../enums/formulario/perguntas");
import Formulario = require("../models/formulario");
import TipoFormulario = require("../enums/formulario/tipo");
import FasePGT = require("../enums/pgt/fase");
import Perfil = require("../enums/conta/perfil");
import DataUtil = require("../utils/dataUtil");

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

	public static async editar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin) {
			res.redirect(app.root + "/acesso");
		} else {
			let id = parseInt(req.query["id"] as string);
			let item: PGT = null;
			if (isNaN(id) || !(item = await PGT.obter(id)))
				res.render("index/erro", {
					layout: "layout-externo",
					titulo: "Não encontrado",
					mensagem: "Não foi possível encontrar o PGT " + id,
					usuario: u
				});
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

	public static async visualizar(req: app.Request, res: app.Response) {
    let u = await Usuario.cookie(req);
    if (!u || (u.perfil_id !== Perfil.Administrador && u.perfil_id !== Perfil.Professor))
        return res.redirect(app.root + "/acesso");

    const id = parseInt(req.query["id"] as string);
    if (isNaN(id))
        return res.render("index/erro", {
            layout: "layout-externo",
            titulo: "Não encontrado",
            mensagem: "ID inválido",
            usuario: u
        });

    const item = await PGT.obter(id);
    if (!item)
        return res.render("index/erro", {
            layout: "layout-externo",
            titulo: "Não encontrado",
            mensagem: "Não foi possível encontrar o PGT " + id,
            usuario: u
        });

    const formularios = await Formulario.listar(id);

    // Busca os critérios corretos conforme fase e tipo do PGT
    const criteriosPerguntas = Perguntas[item.idfase]?.perguntas?.[item.idtipo] || [];

    const grid: {
        professor: string,
        tipo: string,
        criterio: string,
        nota: number | undefined,
        comentario: string | undefined
    }[] = [];

    for (const formulario of formularios) {
        const professor = formulario.nomeautor;
        const tipo = formulario.nometipo;
        for (let i = 0; i < criteriosPerguntas.length; i++) {
            const crit = criteriosPerguntas[i];
            const campoNota = "nota" + (i + 1);
            const campoComentario = "comentario" + (i + 1);
            const nota = (formulario as any)[campoNota];
            const comentario = (formulario as any)[campoComentario];
            grid.push({
                professor,
                tipo,
                criterio: crit.titulo,
                nota,
                comentario
            });
        }
    }

    res.render("pgt/visualizar", {
        layout: "layout-tabela",
        titulo: "Visualizar Atas",
        datatables: true,
        usuario: u,
        grid
    });
}

	public static async detalhar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u) {
			res.redirect(app.root + "/acesso");
		} else {
			let id = parseInt(req.query["id"] as string);
			let item: PGT = null;
			if (isNaN(id) || !(item = await PGT.obter(id)))
				res.render("index/erro", {
					layout: "layout-externo",
					titulo: "Não encontrado",
					mensagem: "Não foi possível encontrar o PGT " + id,
					usuario: u
				});
			else {
				
				if (!(await PGT.usuarioPodeAcessar(item, u.id, u.perfil_id))) {
					return res.redirect(app.root + "/acesso");
        		}

				item.data1 = DataUtil.converterDataISO(item.data1, true);
				item.data2 = DataUtil.converterDataISO(item.data2, true);

				let usuarioPreencherQualificaco: boolean = (await Formulario.autores(
					item.id, TipoFormulario.Qualificacao)).findIndex(autorId => autorId === u.id) === -1

				let usuarioPreencherDefesa: boolean = (await Formulario.autores(
					item.id, TipoFormulario.Defesa)).findIndex(autorId => autorId === u.id) === -1

				res.render("pgt/detalhar", {
					layout: "layout-sem-form",
					titulo: "PGT - " + item.nome,
					usuario: u,
					item: item,
					tipos: tipos.lista,
					fases: fases.lista,
					semestres: semestres.lista,
					usuarios: await Usuario.listarCombo(),
					alunos: await Aluno.listarCombo(),
					qualificacao: {
						formularios: await Formulario.listar(item.id, TipoFormulario.Qualificacao),
						preencher: usuarioPreencherQualificaco,
						preencheu: await Formulario.autoresPreencheram([u.id], item.id, TipoFormulario.Qualificacao),
						nota: await Formulario.calcularNotaFinalQualificacao(item.id, item.idorientador1, item.idqualificador)
					},
					defesa: {
						formularios: await Formulario.listar(item.id, TipoFormulario.Defesa),
						preencher: usuarioPreencherDefesa,
						preencheu: await Formulario.autoresPreencheram([u.id], item.id, TipoFormulario.Defesa),
						nota: await Formulario.calcularNotaFinalDefesa(item.id, item.idorientador2)
					}
				});
			}
		}
	}

	public static async avaliar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u) {
			res.redirect(app.root + "/acesso");
		} else {
			let id = parseInt(req.query["pgt"] as string);
			let item: PGT = null;

			if (isNaN(id) || !(item = await PGT.obter(id))) {
				res.render("index/erro", {
					layout: "layout-externo",
					titulo: "Não encontrado",
					mensagem: "Não foi possível encontrar o PGT " + id,
					usuario: u
				});
			} else if (!(await PGT.usuarioPodeAcessar(item, u.id, u.perfil_id, true))) {
				res.redirect(app.root + "/acesso");
			} else {
				let podeAvaliar = false;

				if (item.idfase === FasePGT.PGT1) {
					if (u.id === item.idqualificador || u.id === item.idorientador1) {
						podeAvaliar = ((await Formulario.autores(item.id, TipoFormulario.Qualificacao)).findIndex(autorId => autorId === u.id) === -1);
					}
				} else if (item.idfase === FasePGT.PGT2) {
					if (u.id === item.idqualificador || u.id === item.idorientador2 || u.id === item.iddefesa2) {
						podeAvaliar = ((await Formulario.autores(item.id, TipoFormulario.Defesa)).findIndex(autorId => autorId === u.id) === -1);
					}
				}

				if (!podeAvaliar) {
					res.render("index/erro", {
						layout: "layout-externo",
						titulo: "Não encontrado",
						mensagem: "PGT não pode ser avaliado",
						usuario: u
					});
					return;
				}

				let perguntas = Perguntas[`${item.idfase}`].perguntas[`${item.idtipo}`];

				res.render("pgt/avaliar", {
					titulo: "PGT - " + item.nome,
					usuario: u,
					item: item,
					perguntas: perguntas,
					tipos: tipos.lista,
					fases: fases.lista,
					semestres: semestres.lista,
					usuarios: await Usuario.listarCombo(),
					alunos: await Aluno.listarCombo()
				});
			}
		}
	}
}

export = PGTRoute;
