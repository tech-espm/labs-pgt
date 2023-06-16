import app = require("teem");
import Funcao = require("../enums/conta/funcao");

interface Etapa {
	id: number;
	descricao: string;
	feedback?: number;
	criacao: string;
	idpgt: number;
}

class Etapa {
	private static validar(etapa: Etapa, criacao: boolean): string | null {
		if (!etapa)
			return "Etapa inválida";

		etapa.id = parseInt(etapa.id as any);

		if (!criacao) {
			if (isNaN(etapa.id))
				return "Id inválido";
		}

		if (!etapa.descricao)
			return "Descricao inválida";

		return null;
	}

	public static async listar(idpgt?: number): Promise<Etapa[]> {
		let lista: Etapa[] = null;

		await app.sql.connect(async (sql) => {
			if (idpgt)
				lista = await sql.query(`
				select
                    e.id,
                    e.data_criacao as criacao,
                    e.feedback
				from etapa e
				where e.pgt_id = ? and e.exclusao is null`, 
				[idpgt]) as Etapa[];
			else
                lista = await sql.query(`
                select
                    e.id,
                    e.data_criacao as criacao,
                    e.feedback
                from etapa e`) as Etapa[];
		});

		return (lista || []);
	}

	public static async obter(id: number): Promise<Etapa> {
		return await app.sql.connect(async (sql) => {
			const lista: Etapa[] = await sql.query(`
			select
                e.id,
                e.data_criacao as criacao,
                e.feedback
            where e.exclusao is null
            from etapa e where e.id = ?`, [id]) as Etapa[];

			return lista[0];
		});
	}

	public static async criar(etapa: Etapa): Promise<string> {
		let res: string;
		if ((res = Etapa.validar(etapa, true)))
			return res;

		return await app.sql.connect(async (sql) => {
			await sql.beginTransaction();

			try {
				await sql.query("insert into etapa (descricao, data_criacao, pgt_id) values (?, now(), ?)", 
				[etapa.descricao, etapa.idpgt]);

				return null;
			} catch (e) {
				if (e.code) {
					switch (e.code) {
						case "ER_DUP_ENTRY":
							return "Etapa repetida";
						case "ER_NO_REFERENCED_ROW":
						case "ER_NO_REFERENCED_ROW_2":
							return "Etapa não encontrada";
						default:
							throw e;
					}
				} else {
					throw e;
				}
			}
		});
	}

	public static async editar(etapa: Etapa): Promise<string> {
		return await app.sql.connect(async (sql) => {
			await sql.beginTransaction();

			try {
				await sql.query("update etapa set descricao = ?, feedback = ? where id = ?", 
				[etapa.descricao, etapa.feedback, etapa.id]);

				return null;
			} catch (e) {
				if (e.code) {
					switch (e.code) {
						case "ER_DUP_ENTRY":
							return "Etapa repetida";
						case "ER_NO_REFERENCED_ROW":
						case "ER_NO_REFERENCED_ROW_2":
							return "Etapa não encontrada";
						default:
							throw e;
					}
				} else {
					throw e;
				}
			}
		});
	}

	public static async excluir(id: number): Promise<string> {
		return app.sql.connect(async (sql) => {
			await sql.query("update etapa set exclusao = now() where id = ? and exclusao is null", [id]);

			return (sql.affectedRows ? null : "Etapa não encontrada");
		});
	}
}

export = Etapa;
