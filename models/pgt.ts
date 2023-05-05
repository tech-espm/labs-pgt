import app = require("teem");
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
	nomeOrientador?: string;
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

	private static validar(pgt: PGT, criacao: boolean): string | null {
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

		return PGT.validarAlunos(pgt);
	}

	public static async listar(idOrientador?: number): Promise<PGT[]> {
		let lista: PGT[] = null;

		await app.sql.connect(async (sql) => {
			if (idOrientador)
				lista = await sql.query(`
				select
					p.id,
					p.nome,
					p.fase_id,
					f.nome as fase,
					p.tipo_id,
					t.nome as tipo,
					date_format(p.criacao, '%d/%m/%Y') as criacao,
					c.nome as nomeOrientador,
					c.id as idOrientador,
					${PGT.subqueryAlunos}
				from pgt p
				inner join tipo_pgt t on t.id = p.tipo_id
				inner join fase f on f.id = p.fase_id
				inner join conta_pgt cp on cp.pgt_id = pgt.id
				inner join conta c on cp.conta_id = c.id
				where c.id = ?`, 
				[idOrientador]) as PGT[];
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
				c.nome as nomeOrientador,
				c.id as idOrientador,
				${PGT.subqueryAlunos}
			from pgt p
			inner join tipo_pgt t on t.id = p.tipo_id
			inner join fase f on f.id = p.fase_id
			inner join conta_pgt cp on cp.pgt_id = p.id
			inner join conta c on c.id = cp.conta_id
			where cp.funcao_id = ?`, 
			[Funcao.Orientador]) as PGT[];
		});

		return (lista || []);
	}

	private static async obterAlunos(sql: app.Sql, pgt: PGT): Promise<PGT> {
		if (pgt)
			pgt.alunos = (await sql.query(`
			select c.id, concat(c.registro, ' - ', c.nome) nome 
			from conta_pgt cp
			inner join conta c on c.id = cp.conta_id
			where cp.pgt_id = ? and cp.funcao_id = ?
			order by c.nome asc
			`, [pgt.id, Funcao.Aluno])) || [];

		return pgt;
	}

	public static async obter(id: number): Promise<PGT> {
		return await app.sql.connect(async (sql) => {
			const lista: PGT[] = await sql.query(`
			select 
				p.id, 
				p.nome, 
				p.fase_id as idfase, 
				p.tipo_id as idtipo, 
				cp.conta_id as idorientador,
				date_format(p.criacao, '%d/%m/%Y') as criacao
			from pgt p
			inner join conta_pgt cp on cp.pgt_id = p.id
			where p.id = ? and cp.funcao_id = ?
			`, [id, Funcao.Orientador]) as PGT[];

			return PGT.obterAlunos(sql, (lista && lista[0]) || null);
		});
	}

	public static async criar(pgt: PGT): Promise<string> {
		let res: string;
		if ((res = PGT.validar(pgt, true)))
			return res;

		return await app.sql.connect(async (sql) => {
			await sql.beginTransaction();

			try {

				await sql.query("insert into pgt (nome, fase_id, tipo_id, criacao) values (?, ?, ?, now())", 
				[pgt.nome, pgt.idfase, pgt.idtipo]);

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
			const antigos: PGTAluno[] = (await sql.query("select conta_pgt_id, conta_id, pgt_id from conta_pgt where pgt_id = ? and funcao_id = ?", [pgt.id, Funcao.Aluno])) || [];
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
				await sql.query("delete from conta_pgt where conta_pgt_id = ?", [antigos[i].id]);

			for (let i = atualizar.length - 1; i >= 0; i--)
				await sql.query("update conta_pgt set conta_id = ? where conta_pgt_id = ?", [atualizar[i].idaluno, atualizar[i].id]);

			for (let i = novos.length - 1; i >= 0; i--)
				await sql.query("insert into conta_pgt (pgt_id, conta_id, funcao_id) values (?, ?, ?)", [novos[i].idpgt, novos[i].idaluno, Funcao.Aluno]);

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

	public static async editar(pgt: PGT): Promise<string> {
		let res: string;
		if ((res = PGT.validar(pgt, false)))
			return res;

		return await app.sql.connect(async (sql) => {
			await sql.beginTransaction();

			await sql.query("update pgt set nome = ?, tipo_id = ?, fase_id = ? where id = ?", 
				[pgt.nome, pgt.idtipo, pgt.idfase, pgt.id]); 

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
