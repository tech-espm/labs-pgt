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
	idsemestre: number;
	//exclusao: string; // Esse campo não precisa ser listado na classe... É apenas para controle de exclusão
	criacao: string;
	alunos?: any[];
	idOrientador?: number | null;
	nomeOrientador?: string;
	idQualificador?: number | null;
	idDefesa1?: number | null;
	idDefesa2?: number | null;
	idsaluno?: number[];
}

class PGT {
	private static readonly subqueryAlunos = `
	(
		select 
			group_concat(c.nome separator ', ') 
		from pgt 
		inner join conta_pgt cp on cp.pgt_id = pgt.id
		inner join conta c on c.id = cp.conta_id
		where pgt.id = p.id and cp.pgt_id = pgt.id and cp.funcao_id = ${Funcao.Aluno}
	) alunos
	`;

	private static readonly subqueryProfessoresDefesa = `
	(
		select 
			group_concat(c.nome separator ', ') 
		from pgt 
		inner join conta_pgt cp on cp.pgt_id = pgt.id
		inner join conta c on c.id = cp.conta_id
		where pgt.id = p.id and cp.pgt_id = pgt.id and cp.funcao_id in (${Funcao.Defesa1}, ${Funcao.Defesa2})
	) defesa
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
		
		if (isNaN(pgt.idsemestre = parseInt(pgt.idsemestre as any)))
			return "Semestre inválido";

		if (isNaN(pgt.idOrientador = parseInt(pgt.idOrientador as any)))
			return "Orientador inválido";
		
		let idProfessores = []

		if (pgt.idQualificador) {
			if (isNaN(pgt.idQualificador = parseInt(pgt.idQualificador as any)))
				return "Qualificador inválido";
			idProfessores.push(pgt.idQualificador)
		} else {
			pgt.idQualificador = null;
		}

		if (pgt.idDefesa1) {
			if (isNaN(pgt.idDefesa1 = parseInt(pgt.idDefesa1 as any)))
				return "Defesa 1 inválido";
			
			idProfessores.push(pgt.idDefesa1)
		} else {
			pgt.idDefesa1 = null;
		}
		
		if (pgt.idDefesa2) {
			if (isNaN(pgt.idDefesa2 = parseInt(pgt.idDefesa2 as any)))
				return "Defesa 2 inválido";

			idProfessores.push(pgt.idDefesa2)
		} else {
			pgt.idDefesa2 = null;
		}

		if (!numerosDiferentes(idProfessores)) {
			return "Professores repetidos";
		}
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
					p.semestre_id,
					date_format(p.criacao, '%d/%m/%Y') as criacao,
					ori.nome as nomeOrientador,
					ori.id as idOrientador,
					qual.nome as nomeAvaliador,
					qual.id as idAvaliador,
					${PGT.subqueryAlunos},
					${PGT.subqueryProfessoresDefesa}
				from pgt p
				inner join tipo_pgt t on t.id = p.tipo_id
				inner join fase f on f.id = p.fase_id
				inner join conta_pgt cp on cp.pgt_id = pgt.id
				inner join conta ori on cp.conta_id = ori.id and cp.funcao_id = ?
				left join conta qual on cp.conta_id = qual.id and cp.funcao_id = ?
				where ori.id = ? and p.exclusao is null`, 
				[Funcao.Orientador, Funcao.Qualificador, idOrientador]) as PGT[];
			else
				lista = await sql.query(`
			select
				p.id,
				p.nome,
				p.fase_id,
				f.nome as fase,
				p.tipo_id,
				t.nome as tipo,
				p.semestre_id,
				s.nome as semestre,
				date_format(p.criacao, '%d/%m/%Y') as criacao,
				ori.nome as nomeOrientador,
				ori.id as idOrientador,
				qual.nome as nomeAvaliador,
				qual.id as idAvaliador,
				${PGT.subqueryAlunos},
				${PGT.subqueryProfessoresDefesa}
			from pgt p
			inner join tipo_pgt t on t.id = p.tipo_id
			inner join fase f on f.id = p.fase_id
			inner join conta_pgt cp on cp.pgt_id = p.id
			inner join conta c on c.id = cp.conta_id
			inner join conta ori on cp.conta_id = ori.id and cp.funcao_id = ?
			left join conta qual on cp.conta_id = qual.id and cp.funcao_id = ?
			inner join semestre_pgt s on s.id = p.semestre_id
			where p.exclusao is null`, 
			[Funcao.Orientador, Funcao.Qualificador]) as PGT[];
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
				date_format(p.criacao, '%d/%m/%Y') as criacao,
				p.semestre_id as idsemestre
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

				await sql.query("insert into pgt (nome, fase_id, tipo_id, semestre_id, criacao) values (?, ?, ?, ?, now())", 
				[pgt.nome, pgt.idfase, pgt.idtipo, pgt.idsemestre]);

				pgt.id = await sql.scalar("select last_insert_id()") as number;

				await sql.query("insert into conta_pgt (pgt_id, conta_id, funcao_id) values (?, ?, ?)", 
					[pgt.id, pgt.idOrientador, Funcao.Orientador])
				
				if (pgt.idQualificador) {
					await sql.query("insert into conta_pgt (pgt_id, conta_id, funcao_id) values (?, ?, ?)", 
					[pgt.id, pgt.idQualificador, Funcao.Qualificador])
				}

				if (pgt.idDefesa1) {
					await sql.query("insert into conta_pgt (pgt_id, conta_id, funcao_id) values (?, ?, ?)", 
					[pgt.id, pgt.idDefesa1, Funcao.Defesa1])
				}

				if (pgt.idDefesa2) {
					await sql.query("insert into conta_pgt (pgt_id, conta_id, funcao_id) values (?, ?, ?)", 
					[pgt.id, pgt.idDefesa2, Funcao.Defesa2])
				}

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

			await sql.query("update pgt set nome = ?, tipo_id = ?, fase_id = ?, semestre_id = ? where id = ?", 
				[pgt.nome, pgt.idtipo, pgt.idfase, pgt.idsemestre, pgt.id]); 

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

function numerosDiferentes(numeros: Number[]) {
	let numerosOrganizados = numeros.sort()

	for (let i = 1; i < numerosOrganizados.length; i++) {
		if (numerosOrganizados[i] == numerosOrganizados[i -1]) {
			return false;
		}
	}

	return true;
}

export = PGT;
