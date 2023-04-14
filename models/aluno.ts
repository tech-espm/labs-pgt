import app = require("teem");
import Validacao = require("../utils/validacao");

interface Aluno {
	id: number;
	ra: number;
	email: string;
	nome: string;
	telefone: string;
}

class Aluno {
	private static validar(aluno: Aluno, criacao: boolean): string {
		if (!aluno)
			return "Aluno inválido";

		aluno.id = parseInt(aluno.id as any);

		if (!criacao) {
			if (isNaN(aluno.id))
				return "Id inválido";
		}

		if (isNaN(aluno.ra = parseInt(aluno.ra as any)))
			return "RA inválido"; 

		if (!aluno.email || !(aluno.email = aluno.email.normalize().trim()) || aluno.email.length > 100 || !Validacao.isEmail(aluno.email))
			return "E-mail inválido";

		if (!aluno.nome || !(aluno.nome = aluno.nome.normalize().trim()) || aluno.nome.length > 100)
			return "Nome inválido";

		if (!aluno.telefone || !(aluno.telefone = aluno.telefone.normalize().trim()) || aluno.telefone.length > 32)
			return "Telefone inválido";

		return null;
	}

	public static async listar(): Promise<Aluno[]> {
		return await app.sql.connect(async (sql) => {
			return await sql.query("select id, email, nome, telefone from conta") || [];
		});
	}

	public static async listarCombo(): Promise<Aluno[]> {
		return await app.sql.connect(async (sql) => {
			return await sql.query("select a.id, concat(a.ra, ' - ', a.nome) nome from aluno a order by a.nome asc") || [];
		});
	}

	public static async obter(id: number): Promise<Aluno> {
		let lista: Aluno[] = null;

		await app.sql.connect(async (sql) => {
			lista = await sql.query("select id, ra, email, nome, telefone from aluno where id = ?", [id]) as Aluno[];
		});

		return ((lista && lista[0]) || null);
	}

	public static async criar(aluno: Aluno): Promise<string> {
		let res: string;
		if ((res = Aluno.validar(aluno, true)))
			return res;

		await app.sql.connect(async (sql) => {
			try {
				await sql.query("insert into conta (email, nome, perfil_id, telefone) values (?, ?, ?, ?)", [aluno.email, aluno.nome, 3, aluno.telefone]);
				return null;
			} catch (e) {
				if (e.code && e.code === "ER_DUP_ENTRY")
					return `O ${aluno.email} já existe`;
				throw e;
			}
		});

		return res;
	}

	public static async editar(aluno: Aluno): Promise<string> {
		let res: string;
		if ((res = Aluno.validar(aluno, false)))
			return res;

		return await app.sql.connect(async (sql) => {
			try {
				await sql.query("update aluno set ra = ?, email = ?, nome = ?, telefone = ? where id = ?", [aluno.ra, aluno.email, aluno.nome, aluno.telefone, aluno.id]);
				return (sql.affectedRows ? null : "Aluno não encontrado");
			} catch (e) {
				if (e.code && e.code === "ER_DUP_ENTRY")
					return `O RA ${aluno.ra} já existe`;
				throw e;
			}
		});
	}

	public static async excluir(id: number): Promise<string> {
		return app.sql.connect(async (sql) => {
			await sql.query("delete from aluno where id = ?", [id]);

			return (sql.affectedRows ? null : "Aluno não encontrado");
		});
	}
}

export = Aluno;
