﻿import app = require("teem");
import Funcao = require("../enums/conta/funcao");

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
	idorientador?: number | null;
	nomeorientador?: string;
	idqualificador?: number | null;
	iddefesa1?: number | null;
	nomedefesa1?: string | null;
	iddefesa2?: number | null;
	nomedefesa2?: string | null;
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

		if (isNaN(pgt.idorientador = parseInt(pgt.idorientador as any)))
			return "Orientador inválido";

		let idProfessores = []

		if (pgt.idqualificador) {
			if (isNaN(pgt.idqualificador = parseInt(pgt.idqualificador as any)))
				return "Qualificador inválido";
			idProfessores.push(pgt.idqualificador)
		} else {
			pgt.idqualificador = null;
		}

		if (pgt.iddefesa1) {
			if (isNaN(pgt.iddefesa1 = parseInt(pgt.iddefesa1 as any)))
				return "Defesa 1 inválido";

			idProfessores.push(pgt.iddefesa1)
		} else {
			pgt.iddefesa1 = null;
		}

		if (pgt.iddefesa2) {
			if (isNaN(pgt.iddefesa2 = parseInt(pgt.iddefesa2 as any)))
				return "Defesa 2 inválido";

			idProfessores.push(pgt.iddefesa2)
		} else {
			pgt.iddefesa2 = null;
		}

		if (!numerosDiferentes(idProfessores)) {
			return "Professores repetidos";
		}
		return PGT.validarAlunos(pgt);
	}

	public static async listar(idorientador?: number): Promise<PGT[]> {
		let lista: PGT[] = null;

		await app.sql.connect(async (sql) => {
			if (idorientador)
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
					ori.nome as nomeorientador,
					ori.id as idorientador,
					qual.nome as nomequalificador,
					qual.id as idqualificador,
					def1.nome as nomedefesa1,
					def1.id as iddefesa1,
					def2.nome as nomedefesa2,
					def2.id as iddefesa2,
					${PGT.subqueryAlunos},
					${PGT.subqueryProfessoresDefesa}
				from pgt p
				inner join tipo_pgt t on t.id = p.tipo_id
				inner join fase f on f.id = p.fase_id
				inner join conta_pgt cp on cp.pgt_id = pgt.id
				inner join conta ori on cp.conta_id = ori.id and cp.funcao_id = ?
				left join conta qual on cp.conta_id = qual.id and cp.funcao_id = ?
				left join conta def1 on cp.conta_id = def1.id and cp.funcao_id = ?
				left join conta def2 on cp.conta_id = def2.id and cp.funcao_id = ?
				where ori.id = ? and p.exclusao is null`,
					[Funcao.Orientador, Funcao.Qualificador, Funcao.Defesa1, Funcao.Defesa2, idorientador]) as PGT[];
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
				ori.nome as nomeorientador,
				ori.id as idorientador,
				qual.nome as nomequalificador,
				qual.id as idqualificador,
				def1.nome as nomedefesa1,
				def1.id as iddefesa1,
				def2.nome as nomedefesa2,
				def2.id as iddefesa2,
				${PGT.subqueryAlunos},
				${PGT.subqueryProfessoresDefesa}
			from pgt p
			inner join tipo_pgt t on t.id = p.tipo_id
			inner join fase f on f.id = p.fase_id
			inner join conta_pgt cp on cp.pgt_id = p.id
			inner join conta c on c.id = cp.conta_id
			inner join conta ori on cp.conta_id = ori.id and cp.funcao_id = ?
			left join conta qual on cp.conta_id = qual.id and cp.funcao_id = ?
			left join conta def1 on cp.conta_id = def1.id and cp.funcao_id = ?
			left join conta def2 on cp.conta_id = def2.id and cp.funcao_id = ?
			inner join semestre_pgt s on s.id = p.semestre_id
			where p.exclusao is null`,
					[Funcao.Orientador, Funcao.Qualificador, Funcao.Defesa1, Funcao.Defesa2]) as PGT[];
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
				p.semestre_id as idsemestre,
				ori.nome as nomeorientador,
				ori.id as idorientador,
				qual.nome as nomequalificador,
				qual.id as idqualificador,
				def1.nome as nomedefesa1,
				def1.id as iddefesa1,
				def2.nome as nomedefesa2,
				def2.id as iddefesa2
			from pgt p
			inner join conta_pgt cp on cp.pgt_id = p.id
			inner join conta ori on cp.conta_id = ori.id and cp.funcao_id = ?
			left join conta qual on cp.conta_id = qual.id and cp.funcao_id = ?
			left join conta def1 on cp.conta_id = def1.id and cp.funcao_id = ?
			left join conta def2 on cp.conta_id = def2.id and cp.funcao_id = ?
			where p.id = ?
			`, [Funcao.Orientador, Funcao.Qualificador, Funcao.Defesa1, Funcao.Defesa2, id]) as PGT[];

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
					[pgt.id, pgt.idorientador, Funcao.Orientador])

				if (pgt.idqualificador) {
					await sql.query("insert into conta_pgt (pgt_id, conta_id, funcao_id) values (?, ?, ?)",
						[pgt.id, pgt.idqualificador, Funcao.Qualificador])
				}

				if (pgt.iddefesa1) {
					await sql.query("insert into conta_pgt (pgt_id, conta_id, funcao_id) values (?, ?, ?)",
						[pgt.id, pgt.iddefesa1, Funcao.Defesa1])
				}

				if (pgt.iddefesa2) {
					await sql.query("insert into conta_pgt (pgt_id, conta_id, funcao_id) values (?, ?, ?)",
						[pgt.id, pgt.iddefesa2, Funcao.Defesa2])
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

	public static async editar(pgt: PGT): Promise<string> {
		// Validar se o PGT editador está OK
		let res: string;
		if ((res = PGT.validar(pgt, false)))
			return res;

		return await app.sql.connect(async (sql) => {
			await sql.beginTransaction();

			// Atualizar os dados do PGT
			await sql.query("update pgt set nome = ?, tipo_id = ?, fase_id = ?, semestre_id = ? where id = ?",
				[pgt.nome, pgt.idtipo, pgt.idfase, pgt.idsemestre, pgt.id]);

			if (!sql.affectedRows)
				return "PGT não encontrado";

			// Atualizar a conexão dos alunos
			let updateAlunosResult = await PGT.editarAlunos(sql, pgt);

			if (updateAlunosResult) {
				return updateAlunosResult;
			}

			// Atualizar a conexão dos professores
			return await PGT.editarProfessores(sql, pgt);
		});
	}

	private static async editarProfessores(sql: app.Sql, pgt: PGT): Promise<string> {
		//TODO: fazer update dos professores -> query pra atualizar o conta_pgt com a função de defesa/qualificador com o novo conta_id
		try {

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

	private static async editarAlunos(sql: app.Sql, pgt: PGT): Promise<string> {
		try {
			const antigos: PGTAluno[] = (await sql.query(`
			select 
				conta_pgt_id as id, 
				conta_id as idaluno, 
				pgt_id as idpgt 
			from conta_pgt 
			where pgt_id = ? and funcao_id = ?`,
				[pgt.id, Funcao.Aluno])) || [];

			const novosAlunosId: number[] = [];

			if (pgt.idsaluno) {
				for (let i = 0; i < pgt.idsaluno.length; i++) {
					let indAntigo = antigos.findIndex(a => a.idaluno == pgt.idsaluno[i])
					if (indAntigo == -1) {
						novosAlunosId.push(pgt.idsaluno[i])
					} else {
						antigos.splice(indAntigo, 1)
					}
				}
			}

			const deletar: PGTAluno[] = []

			for (let i = 0; i < antigos.length; i++) {
				const antigo = antigos[i];
				// Se o id de um aluno antigo não estiver na lista de id de alunos novos, colocar na lista de remoção
				// Mas se estiver, remova da lista de criação
				let indNovoAlunoId = novosAlunosId.findIndex(novoId => novoId === antigo.idaluno)
				if (indNovoAlunoId == -1) {
					deletar.push(antigo)
				} else {
					novosAlunosId.splice(indNovoAlunoId, 1)
				}
			}

			// Dessasociar os antigos que não estão entre os novos
			for (let i = deletar.length - 1; i >= 0; i--)
				await sql.query("delete from conta_pgt where conta_pgt_id = ?", [deletar[i].id]);

			// Associar os novos
			for (let i = novosAlunosId.length - 1; i >= 0; i--)
				await sql.query("insert into conta_pgt (pgt_id, conta_id, funcao_id) values (?, ?, ?)",
					[pgt.id, novosAlunosId[i], Funcao.Aluno]);

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
		if (numerosOrganizados[i] == numerosOrganizados[i - 1]) {
			return false;
		}
	}

	return true;
}

export = PGT;
