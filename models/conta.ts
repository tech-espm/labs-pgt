import app = require("teem");
import { randomBytes } from "crypto";
import appsettings = require("../appsettings");
import GeradorHash = require("../utils/geradorHash");
import intToHex = require("../utils/intToHex");
import Perfil = require("../enums/conta/perfil");
import Validacao = require("../utils/validacao");

interface Conta {
	id: number;
	email: string;
	nome: string;
	perfil_id: Perfil;
	//exclusao: string; // Esse campo não precisa ser listado na classe... É apenas para controle de exclusão
	// Utilizados apenas através do cookie
	admin: boolean;
}

class Conta {
	private static readonly IdAdmin = 1;

	public static async cookie(req: app.Request, res: app.Response = null, admin: boolean = false): Promise<Conta> {
		let cookieStr = req.cookies[appsettings.cookie] as string;
		if (!cookieStr || cookieStr.length !== 48) {
			if (res) {
				res.statusCode = 403;
				res.json("Não permitido");
			}
			return null;
		} else {
			let id = parseInt(cookieStr.substr(0, 8), 16) ^ appsettings.usuarioHashId;
			let conta: Conta = null;

			await app.sql.connect(async (sql) => {
				let rows = await sql.query("select id, email, nome, perfil_id, token from conta where id = ?", [id]);
				let row: any;

				if (!rows || !rows.length || !(row = rows[0]))
					return;

				let token = cookieStr.substring(16);

				if (!row.token || token !== (row.token as string))
					return;

				conta = new Conta();
				conta.id = id;
				conta.email = row.email as string;
				conta.nome = row.nome as string;
				conta.perfil_id = row.perfil_id as number;
				conta.admin = (conta.perfil_id === Perfil.Administrador);
			});

			if (admin && conta && conta.perfil_id !== Perfil.Administrador)
				conta = null;
			if (!conta && res) {
				res.statusCode = 403;
				res.json("Não permitido");
			}
			return conta;
		}
	}

	private static gerarTokenCookie(id: number): [string, string] {
		let idStr = intToHex(id ^ appsettings.usuarioHashId);
		let idExtra = intToHex(0);
		let token = randomBytes(16).toString("hex");
		let cookieStr = idStr + idExtra + token;
		return [token, cookieStr];
	}

	public static async efetuarLogin(token: string, res: app.Response): Promise<[string, Conta]> {
		const resposta = await app.request.json.get(appsettings.ssoToken + encodeURIComponent(token));
		if (!resposta.success || !resposta.result)
			return [(resposta.result && resposta.result.toString()) || ("Erro de comunicação de rede: " + resposta.statusCode), null];

		return await app.sql.connect(async (sql) => {
			const json = resposta.result;
			if (json.erro)
				return [json.erro, null];

			const usuarios: Conta[] = await sql.query("select id, email, nome, perfil_id from conta where email = ? and exclusao is null", [json.dados.email]);
			let usuario: Conta;

			if (!usuarios || !usuarios.length || !(usuario = usuarios[0]))
				return ["Usuário não está cadastrado. Por favor, entre em contato com o administrador do sistema.", null];

			let [token, cookieStr] = Conta.gerarTokenCookie(usuario.id);

			await sql.query("update conta set token = ? where id = ?", [token, usuario.id]);

			usuario.admin = (usuario.perfil_id === Perfil.Administrador);

			res.cookie(appsettings.cookie, cookieStr, { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true, path: "/", secure: appsettings.cookieSecure });

			return [null, usuario];
		});
	}

	public static async efetuarLogout(usuario: Conta, res: app.Response): Promise<void> {
		await app.sql.connect(async (sql) => {
			await sql.query("update conta set token = null where id = ?", [usuario.id]);

			res.cookie(appsettings.cookie, "", { expires: new Date(0), httpOnly: true, path: "/", secure: appsettings.cookieSecure });
		});
	}

	public static async alterarPerfil(usuario: Conta, res: app.Response, nome: string): Promise<string> {
		nome = (nome || "").normalize().trim();
		if (nome.length < 3 || nome.length > 100)
			return "Nome inválido";

		await app.sql.connect(async (sql) => {
			await sql.query("update conta set nome = ? where id = ?", [nome, usuario.id]);
		});

		return null;
	}

	private static validar(usuario: Conta, criacao: boolean): string {
		if (!usuario)
			return "Usuário inválido";

		usuario.id = parseInt(usuario.id as any);

		if (criacao) {
			// Limita o e-mail a 85 caracteres para deixar 15 sobrando, para tentar evitar perda de dados durante a concatenação da exclusão
			if (!usuario.email || !Validacao.isEmail(usuario.email = usuario.email.normalize().trim().toLowerCase()) || usuario.email.length > 85)
				return "E-mail inválido";

			if (!usuario.email.endsWith("@espm.br") && !usuario.email.endsWith("@acad.espm.br"))
				return "O e-mail do usuário deve terminar com @espm.br ou @acad.espm.br";
		} else {
			if (isNaN(usuario.id))
				return "Id inválido";
		}

		if (!usuario.nome || !(usuario.nome = usuario.nome.normalize().trim()) || usuario.nome.length > 100)
			return "Nome inválido";

		if (isNaN(usuario.perfil_id = parseInt(usuario.perfil_id as any) as Perfil))
			return "Perfil inválido";

		return null;
	}

	public static async listar(): Promise<Conta[]> {
		let lista: Conta[] = null;

		await app.sql.connect(async (sql) => {
			lista = await sql.query("select u.id, u.email, u.nome, p.nome perfil, date_format(u.criacao, '%d/%m/%Y') criacao from conta u inner join perfil p on p.id = u.perfil_id where u.exclusao is null order by u.email asc") as Conta[];
		});

		return (lista || []);
	}

	public static async listarCombo(): Promise<Conta[]> {
		let lista: Conta[] = null;

		await app.sql.connect(async (sql) => {
			lista = await sql.query("select id, nome from conta where exclusao is null and perfil_id != 3 order by nome asc") as Conta[];
		});

		return (lista || []);
	}

	public static async obter(id: number): Promise<Conta> {
		let lista: Conta[] = null;

		await app.sql.connect(async (sql) => {
			lista = await sql.query("select id, email, nome, perfil_id, date_format(criacao, '%d/%m/%Y') criacao from conta where id = ?", [id]) as Conta[];
		});

		return ((lista && lista[0]) || null);
	}

	public static async criar(usuario: Conta): Promise<string> {
		let res: string;
		if ((res = Conta.validar(usuario, true)))
			return res;

		await app.sql.connect(async (sql) => {
			try {
				await sql.query("insert into conta (email, nome, perfil_id, criacao) values (?, ?, ?, now())", [usuario.email, usuario.nome, usuario.perfil_id]);
			} catch (e) {
				if (e.code) {
					switch (e.code) {
						case "ER_DUP_ENTRY":
							res = `O e-mail ${usuario.email} já está em uso`;
							break;
						case "ER_NO_REFERENCED_ROW":
						case "ER_NO_REFERENCED_ROW_2":
							res = "Perfil não encontrado";
							break;
						default:
							throw e;
					}
				} else {
					throw e;
				}
			}
		});

		return res;
	}

	public static async editar(usuario: Conta): Promise<string> {
		let res: string;
		if ((res = Conta.validar(usuario, false)))
			return res;

		if (usuario.id === Conta.IdAdmin)
			return "Não é possível editar o usuário administrador principal";

		return await app.sql.connect(async (sql) => {
			await sql.query("update conta set nome = ?, perfil_id = ? where id = ?", [usuario.nome, usuario.perfil_id, usuario.id]);

			return (sql.affectedRows ? null : "Usuário não encontrado");
		});
	}

	public static async excluir(id: number): Promise<string> {
		if (id === Conta.IdAdmin)
			return "Não é possível excluir o usuário administrador principal";

		return app.sql.connect(async (sql) => {
			// Utilizar substr(email, instr(email, ':') + 1) para remover o prefixo, caso precise desfazer a exclusão (caso
			// não exista o prefixo, instr() vai retornar 0, que, com o + 1, faz o substr() retornar a própria string inteira)
			await sql.query("update conta set email = concat('@', id, ':', email), token = null, exclusao = now() where id = ?", [id]);

			return (sql.affectedRows ? null : "Usuário não encontrado");
		});
	}
}

export = Conta;
