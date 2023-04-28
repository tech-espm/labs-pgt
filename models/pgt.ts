import app = require("teem");
import appsettings = require("../appsettings");
import Fase = require("../enums/fase");
import Validacao = require("../utils/validacao");
import Funcao = require("../enums/funcao");

interface PGTAluno {
	id: number;
	idpgt: number;
	idaluno: number;
}

interface PGT {
	id: number;
	nome: string;
	idfase: number;
	idtipo: number;
	//exclusao: string; // Esse campo não precisa ser listado na classe... É apenas para controle de exclusão
	criacao: string;
	alunos?: any[];
	idOrientador?: any;
	idQualificador?: any;
	idDefesa1?: any;
	idDefesa2?: any;
	idsaluno?: number[];
}

class PGT {
	private static readonly subqueryAlunos = `
	(
		select 
			group_concat(c.nome order by c.nome asc separator ', ') 
		from pgt 
		inner join conta_pgt cp on cp.pgt_id = pgt.id
		inner join conta c on c.id = cp.conta_id
		where pgt.id = p.id and cp.pgt_id = pgt.id and cp.funcao_id = ${Funcao.Aluno}
	) alunos
	`;

	private static validarAlunos(pgt: PGT): string | null {
		
		if (!pgt.idsaluno)
			pgt.idsaluno = [];

		if (!Array.isArray(pgt.idsaluno))
			pgt.idsaluno = [pgt.idsaluno as any];

		for (let i = pgt.idsaluno.length - 1; i >= 0; i--) {
			if (isNaN(pgt.idsaluno[i] = parseInt(pgt.idsaluno[i] as any)))
				return "Id de aluno inválido";
		}

		return null;
	}

	private static validar1(pgt: PGT, criacao: boolean): string | null {
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
		
		if (isNaN(pgt.idfase = parseInt(pgt.idfase as any)))
			return "Fase inválida";

		if (isNaN(pgt.idOrientador = parseInt(pgt.idOrientador as any)))
			return "Orientador inválido";

		// @@@ Validar o restante dos campos para a fase 1 do PGT

		return PGT.validarAlunos(pgt);
	}

	private static validar2(pgt: PGT, criacao: boolean): string | null {
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

		if (isNaN(pgt.idfase = parseInt(pgt.idfase as any)))
			return "Fase inválida";

		if (isNaN(pgt.idOrientador = parseInt(pgt.idOrientador as any)))
			return "Orientador inválido";

		// @@@ Validar o restante dos campos para a fase 2 do PGT

		return PGT.validarAlunos(pgt);
	}

	public static async listar1(idOrientador?: number): Promise<PGT[]> {
		let lista: PGT[] = null;

		await app.sql.connect(async (sql) => {
			// @@@ Listar apenas PGT's da fase 1
			if (idOrientador)
				lista = await sql.query(`
				select
					p.id,
					p.nome,
					p.fase_id,
					f.nome as fase,
					p.tipo_id,
					t.nome as tipo,
					date_format(p.criacao, '%d/%m/%Y') criacao,
					(?) as idOrientador,
					${PGT.subqueryAlunos}
				from pgt p
				inner join tipo_pgt t on t.id = p.tipo_id
				inner join fase f on f.id = p.fase_id
				where p.fase_id = ?`, 
				[idOrientador, Fase.PGT1]) as PGT[];
			else
				lista = await sql.query(`
			select
				p.id,
				p.nome,
				p.fase_id,
				f.nome as fase,
				p.tipo_id,
				t.nome as tipo,
				date_format(p.criacao, '%d/%m/%Y') criacao,
				cp.conta_id as idOrientador,
				${PGT.subqueryAlunos}
			from pgt p
			inner join tipo_pgt t on t.id = p.tipo_id
			inner join fase f on f.id = p.fase_id
			inner join conta_pgt cp on cp.pgt_id = p.id
			where p.fase_id = ? and cp.funcao_id = ?`, 
			[Fase.PGT1, Funcao.Orientador]) as PGT[];
		});

		return (lista || []);
	}

	public static async listar2(idusuario?: number): Promise<PGT[]> {
		let lista: PGT[] = null;

		await app.sql.connect(async (sql) => {
			// @@@ Listar apenas PGT's da fase Fase.PGT2 ou Fase.Concluido (concluídos também entram aqui)
			if (idusuario)
				lista = await sql.query(`select p.id, p.nome, p.idtipo, t.nome tipo, u.nome usuario, date_format(p.criacao, '%d/%m/%Y') criacao, ${PGT.subqueryAlunos} from pgt p inner join tipo t on t.id = p.idtipo inner join usuario u on u.id = p.idusuario where p.idfase > ? and p.idusuario = ? and p.exclusao is null`, [Fase.PGT1, idusuario]) as PGT[];
			else
				lista = await sql.query(`select p.id, p.nome, p.idtipo, t.nome tipo, u.nome usuario, date_format(p.criacao, '%d/%m/%Y') criacao, ${PGT.subqueryAlunos} from pgt p inner join tipo t on t.id = p.idtipo inner join usuario u on u.id = p.idusuario where p.idfase > ? and p.exclusao is null`, [Fase.PGT1]) as PGT[];
		});

		return (lista || []);
	}

	private static async obterAlunos(sql: app.Sql, pgt: PGT): Promise<PGT> {
		if (pgt)
			pgt.alunos = (await sql.query("select a.id, concat(a.ra, ' - ', a.nome) nome from conta_pgt pa inner join aluno a on a.id = pa.idaluno where pa.idpgt = ? order by a.nome asc", [pgt.id])) || [];

		return pgt;
	}

	public static async obter1(id: number): Promise<PGT> {
		return await app.sql.connect(async (sql) => {
			// @@@ Obter o PGT apenas se ele estiver na fase Fase.PGT1
			const lista: PGT[] = await sql.query("select id, nome, idfase, idtipo, idusuario from pgt where id = ? and idfase = ? and exclusao is null", [id, Fase.PGT1]) as PGT[];

			return PGT.obterAlunos(sql, (lista && lista[0]) || null);
		});
	}

	public static async obter2(id: number): Promise<PGT> {
		return await app.sql.connect(async (sql) => {
			// @@@ Obter o PGT apenas se ele estiver na fase Fase.PGT2 ou Fase.Concluido
			const lista: PGT[] = await sql.query("select id, nome, idfase, idtipo, idusuario from pgt where id = ? and idfase > ? and exclusao is null", [id, Fase.PGT1]) as PGT[];

			return PGT.obterAlunos(sql, (lista && lista[0]) || null);
		});
	}

	public static async criar(pgt: PGT): Promise<string> {
		let res: string;
		if ((res = PGT.validar1(pgt, true)))
			return res;

		return await app.sql.connect(async (sql) => {
			await sql.beginTransaction();

			// @@@ Ao criar, o PGT sempre é criado na fase Fase.PGT1
			try {

				await sql.query("insert into pgt (nome, fase_id, tipo_id, criacao) values (?, ?, ?, now())", 
				[pgt.nome, Fase.PGT1, pgt.idtipo]);

				pgt.id = await sql.scalar("select last_insert_id()") as number;

				await sql.query("insert into conta_pgt (pgt_id, conta_id, funcao_id) values (?, ?, ?)", 
					[pgt.id, pgt.idOrientador, Funcao.Orientador])

				if (pgt.idsaluno) {
					for (let i = pgt.idsaluno.length - 1; i >= 0; i--)
						await sql.query("insert into conta_pgt (pgt_id, conta_id, funcao_id) values (?, ?, ?)", 
						[pgt.id, pgt.idsaluno[i], Funcao.Aluno]);
				}
				await sql.commit();

				return null;
			} catch (e) {
				if (e.code) {
					switch (e.code) {
						case "ER_DUP_ENTRY":
							return "Alunos repetidos no PGT";
						case "ER_NO_REFERENCED_ROW":
						case "ER_NO_REFERENCED_ROW_2":
							return "Aluno não encontrado";
						default:
							throw e;
					}
				} else {
					throw e;
				}
			}
		});
	}

	private static async editarAlunos(sql: app.Sql, pgt: PGT): Promise<string> {
		try {
			const antigos: PGTAluno[] = (await sql.query("select conta_id, pgt_id from conta_pgt where pgt_id = ? and funcao_id = ?", [pgt.id, Funcao.Aluno])) || [];
			const atualizar: PGTAluno[] = [];
			const novos: PGTAluno[] = [];

			if (pgt.idsaluno) {
				for (let i = pgt.idsaluno.length - 1; i >= 0; i--)
					novos.push({
						id: 0,
						idpgt: pgt.id,
						idaluno: pgt.idsaluno[i]
					});
			}

			for (let i = antigos.length - 1; i >= 0; i--) {
				const antigo = antigos[i];

				for (let j = novos.length - 1; j >= 0; j--) {
					const novo = novos[j];
					if (antigo.idaluno === novo.idaluno) {
						antigos.splice(i, 1);
						novos.splice(j, 1);
						break;
					}
				}
			}

			// Tenta reaproveitar os id's antigos se precisar adicionar algo novo
			for (let i = novos.length - 1; i >= 0; i--) {
				if (!antigos.length)
					break;

				const antigo = antigos.pop();
				antigo.idaluno = novos[i].idaluno;

				atualizar.push(antigo);

				novos.splice(i, 1);
			}

			for (let i = antigos.length - 1; i >= 0; i--)
				await sql.query("delete from conta_pgt where id = ?", [antigos[i].id]);

			for (let i = atualizar.length - 1; i >= 0; i--)
				await sql.query("update conta_pgt set idaluno = ? where id = ?", [atualizar[i].idaluno, atualizar[i].id]);

			for (let i = novos.length - 1; i >= 0; i--)
				await sql.query("insert into conta_pgt (idpgt, idaluno) values (?, ?)", [novos[i].idpgt, novos[i].idaluno]);

			await sql.commit();

			return null;
		} catch (e) {
			if (e.code) {
				switch (e.code) {
					case "ER_DUP_ENTRY":
						return "Alunos repetidos no PGT";
					case "ER_NO_REFERENCED_ROW":
					case "ER_NO_REFERENCED_ROW_2":
						return "Aluno não encontrado";
					default:
						throw e;
				}
			} else {
				throw e;
			}
		}
	}

	public static async editar1(pgt: PGT): Promise<string> {
		let res: string;
		if ((res = PGT.validar1(pgt, false)))
			return res;

		return await app.sql.connect(async (sql) => {
			await sql.beginTransaction();

			// @@@ Validar se esse PGT ainda está na fase Fase.PGT1 antes de atualizar!
			// Em algum momento da edição da fase Fase.PGT1, o usuário alteraria a fase do PGT para Fase.PGT2!
			await sql.query("update pgt set nome = ?, idtipo = ?, idfase = ? where id = ? and idfase = ?", [pgt.nome, pgt.idtipo, pgt.idfase, pgt.id, Fase.PGT1]); 

			if (!sql.affectedRows)
				return "PGT não encontrado";

			return await PGT.editarAlunos(sql, pgt);
		});
	}

	public static async editar2(pgt: PGT): Promise<string> {
		let res: string;
		if ((res = PGT.validar2(pgt, false)))
			return res;

		return await app.sql.connect(async (sql) => {
			await sql.beginTransaction();

			// @@@ Validar se esse PGT ainda está na fase Fase.PGT2 antes de atualizar!
			// Em algum momento da edição da fase Fase.PGT2, o usuário alteraria a fase do PGT para Fase.Concluido!
			await sql.query("update pgt set nome = ?, idtipo = ?, idfase = ? where id = ? and idfase = ?", [pgt.nome, pgt.idtipo, pgt.idfase, pgt.id, Fase.PGT2]);

			if (!sql.affectedRows)
				return "PGT não encontrado";

			return await PGT.editarAlunos(sql, pgt);
		});
	}

	public static async excluir(id: number): Promise<string> {
		return app.sql.connect(async (sql) => {
			await sql.query("update pgt set exclusao = now() where id = ? and exclusao is null", [id]);

			return (sql.affectedRows ? null : "PGT não encontrado");
		});
	}
}

export = PGT;
