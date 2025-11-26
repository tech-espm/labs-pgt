import app = require("teem");
import DataUtil = require("../utils/dataUtil");

interface IDataEnt {
    ano: number;
    semestre: number;
    idfase: number;
    idtipo: number;
    data: string;
    ano_old?: number;
    semestre_old?: number;
    idfase_old?: number;
    idtipo_old?: number;
}

class DataEnt {
    private static validar(datae: IDataEnt): string | null {
        if (!datae) {
            return "Data de entrega inválida";
        }

        if (!datae.ano || datae.ano < 2000 || datae.ano > 2200) {
            return "Ano inválido";
        }

        if (isNaN(datae.semestre = parseInt(datae.semestre as any))) {
            return "Semestre inválido";
        }

        if (isNaN(datae.idfase = parseInt(datae.idfase as any))) {
            return "Fase inválida";
        }

        if (isNaN(datae.idtipo = parseInt(datae.idtipo as any))) {
            return "Tipo de entrega inválido";
        }

        datae.data = DataUtil.converterDataISO(datae.data);
		if (!datae.data) {
			return "Data inválida";
		}

        return null;

    }

    public static async listar(): Promise<IDataEnt[]> {
        let lista: IDataEnt[] = null;

        await app.sql.connect(async (sql) => {
            lista = await sql.query(`
                select d.ano, d.semestre, f.id as idfase, t.id as idtipo, date_format(d.data, '%d/%m/%Y') as data
                    from data_limite d
                    inner join fase f on f.id = d.fase_id
                    inner join tipo_entrega t on t.id = d.tipo_entrega_id;
                `)
        });

        return (lista || []);
    }

    public static async obter(ano: number, semestre: number, fase: number, tipo: number): Promise<IDataEnt> {
        return await app.sql.connect(async (sql) => {
            const lista: IDataEnt[] = await sql.query(`
                select d.ano, d.semestre, f.id as idfase, t.id as idtipo, date_format(d.data, '%d/%m/%Y') as data
                    from data_limite d
                    inner join fase f on f.id = d.fase_id
                    inner join tipo_entrega t on t.id = d.tipo_entrega_id
                    where d.ano = ? and d.semestre = ? and f.id = ? and t.id = ?
            `, [ano, semestre, fase, tipo]);

            return (lista && lista[0]) || null;
        });
    }

    public static async criar(datae: IDataEnt): Promise<string> {
        let res: string;
        if ((res = DataEnt.validar(datae)))
            return res;

        return await app.sql.connect(async (sql) => {
            await sql.beginTransaction();

            try {

                await sql.query("insert into data_limite (ano, semestre, fase_id, tipo_entrega_id, data) values (?, ?, ?, ?, ?)",
                    [datae.ano, datae.semestre, datae.idfase, datae.idtipo, datae.data]);
                
                await sql.commit();

			    return null;

            } catch (e) {
                throw e;
            }
        });
    }

    public static async editar(datae: IDataEnt): Promise<string> {
        let res: string;
        if ((res = DataEnt.validar(datae)))
            return res;

        if (datae.ano_old == null || datae.semestre_old == null || datae.idfase_old == null || datae.idtipo_old == null) {
            return "Dados antigos não estabelecidos.";
        }

        return await app.sql.connect(async (sql) => {
            await sql.beginTransaction();

            await sql.query("update data_limite set ano = ?, semestre = ?, fase_id = ?, tipo_entrega_id = ?, data = ? where ano = ? and semestre = ? and fase_id = ? and tipo_entrega_id = ?",
                [datae.ano, datae.semestre, datae.idfase, datae.idtipo, datae.data, datae.ano_old, datae.semestre_old, datae.idfase_old, datae.idtipo_old]);
            
            if (!sql.affectedRows)
				return "PGT não encontrado";

            return null;
        });
    }

    public static async excluir(datae: IDataEnt): Promise<string> {
        return app.sql.connect(async (sql) => {
            await sql.query("delete from data_limite where ano = ? and semestre = ? and fase_id = ? and tipo_entrega_id = ?", [datae.ano, datae.semestre, datae.idfase, datae.idtipo])

            return (sql.affectedRows ? null : "Data limite não encontrada");
        });
    }

}