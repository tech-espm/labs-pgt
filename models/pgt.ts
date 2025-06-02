import app = require("teem");
import Funcao = require("../enums/conta/funcao");

interface PGTConta {
	id: number;
	idpgt: number;
	idconta: number;
}

interface PGT {
	id: number;
	nome: string;
	idfase: number;
	idtipo: number;
	idsemestre: number;
	//exclusao: string; // Esse campo não precisa ser listado na classe... É apenas para controle de exclusão
	criacao: string;
	idorientador1: number | null;
	idorientador2?: number | null;
	alunos?: any[];
	nomeorientador1?: string;
	nomeorientador2?: string;
	idqualificador?: number | null;
	iddefesa1?: number | null;
	nomedefesa1?: string | null;
	iddefesa2?: number | null;
	nomedefesa2?: string | null;
	idsaluno?: number[];
	defesa: string;
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

		if (isNaN(pgt.idorientador1 = parseInt(pgt.idorientador1 as any)))
			return "Orientador 1 inválido";

		if (pgt.idorientador2) {
			if (isNaN(pgt.idorientador2 = parseInt(pgt.idorientador2 as any)))
				return "Orientador 2 inválido";
		} else {
			pgt.idorientador2 = null;
		}

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
				select distinct
					p.id,
					p.nome,
					p.fase_id,
					f.nome as fase,
					p.tipo_id,
					t.nome as tipo,
					p.semestre_id,
					date_format(p.criacao, '%d/%m/%Y') as criacao,
					ori1.nome as nomeorientador1,
					ori1.id as idorientador1,
					ori2.nome as nomeorientador2,
					ori2.id as idorientador2,
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
				left join conta_pgt cpori1 on cpori1.pgt_id = p.id and cpori1.funcao_id = ?
				left join conta ori1 on ori1.id = cpori1.conta_id
				left join conta_pgt cpori2 on cpori2.pgt_id = p.id and cpori2.funcao_id = ?
				left join conta ori on ori2.id = cpori2.conta_id
				left join conta_pgt cpqual on cpqual.pgt_id = p.id and cpqual.funcao_id = ?
				left join conta qual on qual.id = cpqual.conta_id
				left join conta_pgt cpdef1 on cpdef1.pgt_id = p.id and cpdef1.funcao_id = ?
				left join conta def1 on def1.id = cpdef1.conta_id
				left join conta_pgt cpdef2 on cpdef2.pgt_id = p.id and cpdef2.funcao_id = ?
				left join conta def2 on def2.id = cpdef2.conta_id
				where ori1.id = ? and p.exclusao is null`,
					[Funcao.Orientador1, Funcao.Orientador2, Funcao.Qualificador, Funcao.Defesa1, Funcao.Defesa2, idorientador]) as PGT[];
			else
				lista = await sql.query(`
			select distinct
				p.id,
				p.nome,
				p.fase_id,
				f.nome as fase,
				p.tipo_id,
				t.nome as tipo,
				p.semestre_id,
				s.nome as semestre,
				date_format(p.criacao, '%d/%m/%Y') as criacao,
				ori1.nome as nomeorientador1,
				ori1.id as idorientador1,
				ori2.nome as nomeorientador2,
				ori2.id as idorientador2,
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
			inner join semestre_pgt s on s.id = p.semestre_id
			inner join conta_pgt cp on cp.pgt_id = p.id
			left join conta_pgt cpori1 on cpori1.pgt_id = p.id and cpori1.funcao_id = ?
			left join conta ori1 on ori1.id = cpori1.conta_id
			left join conta_pgt cpori2 on cpori2.pgt_id = p.id and cpori2.funcao_id = ?
			left join conta ori2 on ori2.id = cpori2.conta_id
			left join conta_pgt cpqual on cpqual.pgt_id = p.id and cpqual.funcao_id = ?
			left join conta qual on qual.id = cpqual.conta_id
			left join conta_pgt cpdef1 on cpdef1.pgt_id = p.id and cpdef1.funcao_id = ?
			left join conta def1 on def1.id = cpdef1.conta_id
			left join conta_pgt cpdef2 on cpdef2.pgt_id = p.id and cpdef2.funcao_id = ?
			left join conta def2 on def2.id = cpdef2.conta_id
			where p.exclusao is null`,
			[Funcao.Orientador1, Funcao.Orientador2, Funcao.Qualificador, Funcao.Defesa1, Funcao.Defesa2]) as PGT[];
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
				date_format(p.criacao, '%d/%m/%Y') as criacao,
				p.semestre_id as idsemestre,
				ori1.nome as nomeorientador1,
				ori1.id as idorientador1,
				ori2.nome as nomeorientador2,
				ori2.id as idorientador2,
				qual.nome as nomequalificador,
				qual.id as idqualificador,
				def1.nome as nomedefesa1,
				def1.id as iddefesa1,
				def2.nome as nomedefesa2,
				def2.id as iddefesa2,
				concat(def1.nome, ' ', def2.nome) as defesa
			from pgt p
			left join conta_pgt cpori1 on cpori1.pgt_id = p.id and cpori1.funcao_id = ?
			left join conta ori1 on ori1.id = cpori1.conta_id
			left join conta_pgt cpori2 on cpori2.pgt_id = p.id and cpori2.funcao_id = ?
			left join conta ori2 on ori2.id = cpori2.conta_id
			left join conta_pgt cpqual on cpqual.pgt_id = p.id and cpqual.funcao_id = ?
			left join conta qual on qual.id = cpqual.conta_id
			left join conta_pgt cpdef1 on cpdef1.pgt_id = p.id and cpdef1.funcao_id = ?
			left join conta def1 on def1.id = cpdef1.conta_id
			left join conta_pgt cpdef2 on cpdef2.pgt_id = p.id and cpdef2.funcao_id = ?
			left join conta def2 on def2.id = cpdef2.conta_id
			where p.id = ? and p.exclusao is null
			`, [Funcao.Orientador1, Funcao.Orientador2, Funcao.Qualificador, Funcao.Defesa1, Funcao.Defesa2, id]) as PGT[];

			return PGT.obterAlunos(sql, (lista && lista[0]) || null);
		});
	}

	public static async downloadAnexo(res: app.Response, id: number, idfase: number): Promise<void> {
		const caminho = `dados/anexos/${id}-${idfase}.pdf`;
		if (!await app.fileSystem.exists(caminho)) {
			res.status(404).json("Anexo não encontrado");
			return;
		}

		res.sendFile(app.fileSystem.absolutePath(caminho));
	}

	public static async criar(pgt: PGT, anexo?: app.UploadedFile | null): Promise<string> {
	let res: string;
	if ((res = PGT.validar(pgt, true)))
		return res;

	return await app.sql.connect(async (sql) => {
		await sql.beginTransaction();

		try {

			await sql.query("insert into pgt (nome, fase_id, tipo_id, semestre_id, criacao) values (?, ?, ?, ?, now())",
				[pgt.nome, pgt.idfase, pgt.idtipo, pgt.idsemestre]);

			pgt.id = await sql.scalar("select last_insert_id()") as number;

			try {
				await sql.query("insert into conta_pgt (pgt_id, conta_id, funcao_id) values (?, ?, ?)",
					[pgt.id, pgt.idorientador1, Funcao.Orientador1]);
			} catch (e) {
				if (e.code === "ER_NO_REFERENCED_ROW" || e.code === "ER_NO_REFERENCED_ROW_2") {
					return "Orientador 1 não encontrado";
				}
				throw e;
			}

			if (pgt.idorientador2) {

				if (pgt.idsemestre !== 2) {
					throw new Error("O campo de Professor Orientador 2 só pode ser preenchido se o PGT for do 8° semestre.");
				}

				try {
					await sql.query("insert into conta_pgt (pgt_id, conta_id, funcao_id) values (?, ?, ?)",
						[pgt.id, pgt.idorientador2, Funcao.Orientador2]);
				} catch (e) {
					if (e.code === "ER_NO_REFERENCED_ROW" || e.code === "ER_NO_REFERENCED_ROW_2") {
						return "Orientador 2 não encontrado";
					}
					throw e;
				}
			}

			if (pgt.idqualificador) {
				try {
					await sql.query("insert into conta_pgt (pgt_id, conta_id, funcao_id) values (?, ?, ?)",
						[pgt.id, pgt.idqualificador, Funcao.Qualificador]);
				} catch (e) {
					if (e.code === "ER_NO_REFERENCED_ROW" || e.code === "ER_NO_REFERENCED_ROW_2") {
						return "Qualificador não encontrado";
					}
					throw e;
				}
			}

			if (pgt.iddefesa1) {
				try {
					await sql.query("insert into conta_pgt (pgt_id, conta_id, funcao_id) values (?, ?, ?)",
						[pgt.id, pgt.iddefesa1, Funcao.Defesa1]);
				} catch (e) {
					if (e.code === "ER_NO_REFERENCED_ROW" || e.code === "ER_NO_REFERENCED_ROW_2") {
						return "Defesa 1 não encontrada";
					}
					throw e;
				}
			}

			if (pgt.iddefesa2) {

				if (pgt.idsemestre !== 2) {
					throw new Error("O campo de Professor Defesa 2 (ou avaliador) só pode ser preenchido se o PGT for do 8° semestre.");
				}

				try {
					await sql.query("insert into conta_pgt (pgt_id, conta_id, funcao_id) values (?, ?, ?)",
						[pgt.id, pgt.iddefesa2, Funcao.Defesa2]);
				} catch (e) {
					if (e.code === "ER_NO_REFERENCED_ROW" || e.code === "ER_NO_REFERENCED_ROW_2") {
						return "Defesa 2/Avaliador não encontrado";
					}
					throw e;
				}
			}

			if (pgt.idsaluno) {
				for (let i = pgt.idsaluno.length - 1; i >= 0; i--) {
					try {
						await sql.query("insert into conta_pgt (pgt_id, conta_id, funcao_id) values (?, ?, ?)",
							[pgt.id, pgt.idsaluno[i], Funcao.Aluno]);
					} catch (e) {
						if (e.code === "ER_NO_REFERENCED_ROW" || e.code === "ER_NO_REFERENCED_ROW_2") {
							return `Aluno não encontrado (ID: ${pgt.idsaluno[i]})`;
						}
						throw e;
					}
				}
			}

			await sql.commit();

			return null;

		} catch (e) {
			throw e;
		}
	});
}

	public static async editar(pgt: PGT, anexo?: app.UploadedFile | null): Promise<string> {
		// Validar se o PGT editado está OK
		let res: string;
		if ((res = PGT.validar(pgt, false)))
			return res;

		return await app.sql.connect(async (sql) => {
			await sql.beginTransaction();

			// Atualizar os dados do PGT
			await sql.query("update pgt set nome = ?, tipo_id = ?, fase_id = ?, semestre_id = ? where id = ? and exclusao is null",
				[pgt.nome, pgt.idtipo, pgt.idfase, pgt.idsemestre, pgt.id]);

			if (!sql.affectedRows)
				return "PGT não encontrado";

			// Atualizar a conexão dos alunos
			let updateAlunosResult = await PGT.editarAlunos(sql, pgt);

			if (updateAlunosResult) {
				return updateAlunosResult;
			}

			if (anexo)
			await app.fileSystem.saveUploadedFile(`dados/anexos/${pgt.id}-${pgt.idfase}.pdf`, anexo);


			// Atualizar a conexão dos professores
			return await PGT.editarProfessores(sql, pgt);
		});
	}

	// interface PGTConta {
	// 	id: number;
	// 	idpgt: number;
	// 	idconta: number;
	// }

	private static async editarProfessores(sql: app.Sql, pgt: PGT): Promise<string> {
		try {
			PGT.atualizarContaPGT(sql, pgt, Funcao.Orientador1, pgt.idorientador1)

			if (pgt.idorientador2) {
				PGT.atualizarContaPGT(sql, pgt, Funcao.Orientador2, pgt.idorientador2)
			}

			if (pgt.idqualificador) {
				PGT.atualizarContaPGT(sql, pgt, Funcao.Qualificador, pgt.idqualificador)
			}

			if (pgt.iddefesa1) {
				PGT.atualizarContaPGT(sql, pgt, Funcao.Defesa1, pgt.iddefesa1)
			}

			if (pgt.iddefesa2) {
				PGT.atualizarContaPGT(sql, pgt, Funcao.Defesa2, pgt.iddefesa2)
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
	}

	private static async atualizarContaPGT(sql: app.Sql, pgt: PGT, funcaoId: number, novoIdConta: number) {
		// Listar a conexão atual da função escolhida no PGT escolhido
		let conexoesAntigas: PGTConta[] = await sql.query(`
		select
			conta_pgt_id as id,
			pgt_id as idpgt,
			conta_id as idconta
		from conta_pgt
		where funcao_id = ? and pgt_id = ?
		`, [funcaoId, pgt.id]);

		let conexaoAntiga: PGTConta = conexoesAntigas[0]

		// Se essa conexão exsitir e for de uma conta diferente, colocar a nova conta como essa função
		// Se essa conexão existir e for da mesma conta, fazer nada
		// Se não exstir a conexão, crie a conexão
		if (conexaoAntiga && conexaoAntiga.idconta != novoIdConta) {
			await sql.query(`
			update conta_pgt
			set conta_id = ?
			where conta_id = ? and funcao_id = ? and pgt_id = ?
		`, [novoIdConta, conexaoAntiga.idconta, funcaoId, conexaoAntiga.idpgt]);
		} else if (!conexaoAntiga) {
			await sql.query(`
			insert into conta_pgt (pgt_id, conta_id, funcao_id)
			values (?, ?, ?)
		`, [pgt.id, novoIdConta, funcaoId]);
		}
	}

	private static async editarAlunos(sql: app.Sql, pgt: PGT): Promise<string> {
		try {
			const antigos: PGTConta[] = (await sql.query(`
			select 
				conta_pgt_id as id, 
				conta_id as idconta, 
				pgt_id as idpgt 
			from conta_pgt 
			where pgt_id = ? and funcao_id = ?`,
				[pgt.id, Funcao.Aluno])) || [];

			const novosAlunosId: number[] = [];

			if (pgt.idsaluno) {
				for (let i = 0; i < pgt.idsaluno.length; i++) {
					let indAntigo = antigos.findIndex(a => a.idconta == pgt.idsaluno[i])
					if (indAntigo == -1) {
						novosAlunosId.push(pgt.idsaluno[i])
					} else {
						antigos.splice(indAntigo, 1)
					}
				}
			}

			const deletar: PGTConta[] = []

			for (let i = 0; i < antigos.length; i++) {
				const antigo = antigos[i];
				// Se o id de um aluno antigo não estiver na lista de id de alunos novos, colocar na lista de remoção
				// Mas se estiver, remova da lista de criação
				let indNovoAlunoId = novosAlunosId.findIndex(novoId => novoId === antigo.idconta)
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
