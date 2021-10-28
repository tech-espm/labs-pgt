import app = require("teem");
import appsettings = require("../appsettings");
import Fase = require("../enums/fase");
import Validacao = require("../utils/validacao");

interface PGT {
	id: number;
	nome: string;
	idfase: number;
	idtipo: number;
	//exclusao: string; // Esse campo não precisa ser listado na classe... É apenas para controle de exclusão
	criacao: string;
}

class PGT {
	private static validar1(pgt: PGT, criacao: boolean): string {
		if (!pgt)
			return "PGT inválido";

			pgt.id = parseInt(pgt.id as any);

		if (!criacao) {
			if (isNaN(pgt.id))
				return "Id inválido";
		}

		if (!pgt.nome || !(pgt.nome = pgt.nome.normalize().trim()) || pgt.nome.length > 100)
			return "Nome inválido";

		if (isNaN(pgt.idtipo = parseInt(pgt.idtipo as any)))
			return "Tipo inválido";

		// @@@ Validar o restante dos campos para a fase 1 do PGT

		return null;
	}

	private static validar2(pgt: PGT, criacao: boolean): string {
		if (!pgt)
			return "PGT inválido";

			pgt.id = parseInt(pgt.id as any);

		if (!criacao) {
			if (isNaN(pgt.id))
				return "Id inválido";
		}

		if (!pgt.nome || !(pgt.nome = pgt.nome.normalize().trim()) || pgt.nome.length > 100)
			return "Nome inválido"; 

		if (isNaN(pgt.idtipo = parseInt(pgt.idtipo as any)))
			return "Tipo inválido";

		// @@@ Validar o restante dos campos para a fase 2 do PGT

		return null;
	}

	public static async listar1(): Promise<PGT[]> {
		let lista: PGT[] = null;

		await app.sql.connect(async (sql) => {
			// @@@ Listar apenas PGT's da fase 1
			lista = await sql.query("select id, nome, idtipo from pgt where idfase = ? and exclusao is null", [Fase.PGT1]) as PGT[];
		});

		return (lista || []);
	}

	public static async listar2(): Promise<PGT[]> {
		let lista: PGT[] = null;

		await app.sql.connect(async (sql) => {
			// @@@ Listar apenas PGT's da fase Fase.PGT2 ou Fase.Concluido (concluídos também entram aqui)
			lista = await sql.query("select id, nome, idtipo from pgt where idfase > ? and exclusao is null", [Fase.PGT1]) as PGT[];
		});

		return (lista || []);
	}

	public static async obter1(id: number): Promise<PGT> {
		let lista: PGT[] = null;

		await app.sql.connect(async (sql) => {
			// @@@ Obter o PGT apenas se ele estiver na fase Fase.PGT1
			lista = await sql.query("select id, nome, idtipo from pgt where id = ? and idfase = ? and exclusao is null", [id, Fase.PGT1]) as PGT[];
		});

		return ((lista && lista[0]) || null);
	}

	public static async obter2(id: number): Promise<PGT> {
		let lista: PGT[] = null;

		await app.sql.connect(async (sql) => {
			// @@@ Obter o PGT apenas se ele estiver na fase Fase.PGT2 ou Fase.Concluido
			lista = await sql.query("select id, nome, idtipo from pgt where id = ? and idfase > ? and exclusao is null", [id, Fase.PGT1]) as PGT[];
		});

		return ((lista && lista[0]) || null);
	}

	public static async criar(pgt: PGT): Promise<string> {
		let res: string;
		if ((res = PGT.validar1(pgt, true)))
			return res;

		await app.sql.connect(async (sql) => {
			// @@@ Ao criar, o PGT sempre é criado na fase Fase.PGT1
			await sql.query("insert into pgt (nome, idfase, idtipo, criacao) values (?, ?, ?, now())", [pgt.nome, Fase.PGT1, pgt.idtipo]);
		});

		return res;
	}

	public static async editar1(pgt: PGT): Promise<string> {
		let res: string;
		if ((res = PGT.validar1(pgt, false)))
			return res;

		return await app.sql.connect(async (sql) => {
			// @@@ Validar se esse PGT ainda está na fase Fase.PGT1 antes de atualizar!
			// Em algum momento da edição da fase Fase.PGT1, o usuário alteraria a fase do PGT para Fase.PGT2!
			await sql.query("update pgt set nome = ?, idtipo = ? where id = ? and idfase = ?", [pgt.nome, pgt.idtipo, pgt.id, Fase.PGT1]); 

			return (sql.affectedRows ? null : "PGT não encontrado");
		});
	}

	public static async editar2(pgt: PGT): Promise<string> {
		let res: string;
		if ((res = PGT.validar2(pgt, false)))
			return res;

		return await app.sql.connect(async (sql) => {
			// @@@ Validar se esse PGT ainda está na fase Fase.PGT2 antes de atualizar!
			// Em algum momento da edição da fase Fase.PGT2, o usuário alteraria a fase do PGT para Fase.Concluido!
			await sql.query("update pgt set nome = ?, idtipo = ? where id = ? and idfase = ?", [pgt.nome, pgt.idtipo, pgt.id, Fase.PGT2]);

			return (sql.affectedRows ? null : "PGT não encontrado");
		});
	}

	public static async excluir(id: number): Promise<string> {
		return app.sql.connect(async (sql) => {
			await sql.query("update pgt set exclusao = now() where id = ?", [id]);

			return (sql.affectedRows ? null : "PGT não encontrado");
		});
	}
}

export = PGT;
