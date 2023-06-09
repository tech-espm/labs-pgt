import app = require("teem");
import FasePGT = require("../enums/pgt/fase");
import TipoPGT = require("../enums/pgt/tipo");
import TipoFormulario = require("../enums/formulario/tipo");

interface Formulario {
    id: number,
    idtipo: number,
    nometipo: string,
    idpgt: number,
    nomepgt: string,
    idautor: number,
    nomeautor: string,
    nota1: number,
    nota2: number,
    nota3: number,
    nota4: number,
    nota5?: number, // Dependendo da fase e tipo do PGT ele não é preenchido
    nota6?: number, // Dependendo da fase e tipo do PGT ele não é preenchido
    notafinal: number
    comentario1: string,
    comentario2: string,
    comentario3: string,
    comentario4: string,
    comentario5?: string,  // Dependendo da fase e tipo do PGT ele não é preenchido
    comentario6?: string,  // Dependendo da fase e tipo do PGT ele não é preenchido
}

class Formulario {
    // APENAS CRIAÇÃO
    private static validar(formulario: Formulario): string | null {
        if (!formulario) {
            return "Formulário inválido!"
        }

        if (isNaN(formulario.idpgt = parseInt(formulario.idpgt as any)))
            return "PGT inválido";

        if (isNaN(formulario.idautor = parseInt(formulario.idautor as any)))
            return "Autor inválido";

        if (isNaN(formulario.nota1 = parseFloat(formulario.nota1 as any)))
            return "Tipo inválido";

        if (isNaN(formulario.nota2 = parseFloat(formulario.nota2 as any)))
            return "Tipo inválido";

        if (isNaN(formulario.nota3 = parseFloat(formulario.nota3 as any)))
            return "Tipo inválido";

        if (isNaN(formulario.nota4 = parseFloat(formulario.nota4 as any)))
            return "Tipo inválido";

        if (formulario.nota5) {
            if (isNaN(formulario.nota5 = parseFloat(formulario.nota5 as any)))
                return "Tipo inválido";
        }

        if (formulario.nota6) {
            if (isNaN(formulario.nota6 = parseFloat(formulario.nota6 as any)))
                return "Tipo inválido";
        }

        if (!formulario.comentario1 || !(formulario.comentario1 = formulario.comentario1.normalize().trim()))
            return "Comentário 1 inválido";

        if (!formulario.comentario2 || !(formulario.comentario2 = formulario.comentario2.normalize().trim()))
            return "Comentário 2 inválido";

        if (!formulario.comentario3 || !(formulario.comentario3 = formulario.comentario3.normalize().trim()))
            return "Comentário 3 inválido";

        if (!formulario.comentario4 || !(formulario.comentario4 = formulario.comentario4.normalize().trim()))
            return "Comentário 4 inválido";


        if (formulario.comentario5) {
            if (!formulario.comentario5 || !(formulario.comentario5 = formulario.comentario5.normalize().trim()))
                return "Comentário 5 inválido";
        }

        if (formulario.comentario6) {
            if (!formulario.comentario6 || !(formulario.comentario6 = formulario.comentario6.normalize().trim()))
                return "Comentário 6 inválido";
        }

        return null;
    }

    public static async criar(formulario: Formulario): Promise<String> {
        let res: string
        if ((res = Formulario.validar(formulario))) {
            return res
        }

        return await app.sql.connect(async (sql) => {
            await sql.beginTransaction();

            try {
                await sql.query("insert into formulario (formulario_tipo_id, nota_1, nota_2, nota_3, nota_4, nota_5, nota_6, comentario_1, comentario_2, comentario_3, comentario_4, comentario_5, comentario_6 , pgt_id, conta_autor_id) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    [formulario.idtipo, formulario.nota1, formulario.nota2, formulario.nota3, formulario.nota4, formulario.nota5,
                    formulario.nota6, formulario.comentario1, formulario.comentario2, formulario.comentario3, formulario.comentario4,
                    formulario.comentario5, formulario.comentario6, formulario.idpgt, formulario.idautor]);

                formulario.id = await sql.scalar("select last_insert_id()") as number;

                await sql.commit();

                return null;
            } catch (e) {
                throw e;
            }
        });
    }

    public static async listar(idpgt: number, tipoFormulario?: TipoFormulario): Promise<Formulario[]> {
        let lista: Formulario[] = null;

        await app.sql.connect(async (sql) => {
            if (tipoFormulario)
                lista = await sql.query(`
				select
                    f.formulario_tipo_id as idtipo, 
                    f.nota_1 as nota1, 
                    f.nota_2 as nota2, 
                    f.nota_3 as nota3, 
                    f.nota_4 as nota4, 
                    f.nota_5 as nota5, 
                    f.nota_6 as nota6, 
                    f.comentario_1 as comentario1, 
                    f.comentario_2 as comentario2, 
                    f.comentario_3 as comentario3, 
                    f.comentario_4 as comentario4, 
                    f.comentario_5 as comentario5, 
                    f.comentario_6 as comentario6, 
                    f.pgt_id as idpgt, 
                    p.nome as nomepgt,
                    f.conta_autor_id as idautor,
                    c.nome as nomeautor,
                    tf.nome as nometipo
                from formulario f 
                inner join conta c on f.conta_autor_id = c.id
                inner join tipo_formulario tf on tf.id = f.formulario_tipo_id
                inner join pgt p on p.id = f.pgt_id
                where f.pgt_id = ? and f.formulario_tipo_id = ?`,
                    [idpgt, tipoFormulario]) as Formulario[];
            else
                lista = await sql.query(
                    `
                    select
                        f.formulario_tipo_id as idtipo, 
                        f.nota_1 as nota1, 
                        f.nota_2 as nota2, 
                        f.nota_3 as nota3, 
                        f.nota_4 as nota4, 
                        f.nota_5 as nota5, 
                        f.nota_6 as nota6, 
                        f.comentario_1 as comentario1, 
                        f.comentario_2 as comentario2, 
                        f.comentario_3 as comentario3, 
                        f.comentario_4 as comentario4, 
                        f.comentario_5 as comentario5, 
                        f.comentario_6 as comentario6, 
                        f.pgt_id as idpgt, 
                        p.nome as nomepgt,
                        f.conta_autor_id as idautor,
                        c.nome as nomeautor,
                        tf.nome as nometipo
                    from formulario f 
                    inner join conta c on f.conta_autor_id = c.id
                    inner join tipo_formulario tf on tf.id = f.formulario_tipo_id
                    inner join pgt p on p.id = f.pgt_id
                    where f.pgt_id = ?`
                    , [idpgt]) as Formulario[];
        });

        return (lista || []);
    }

    public static async autoresPreencheram(idautores: number[], idpgt: number) : Promise<boolean>{
        let formularios: Formulario[] = await this.listar(idpgt)

        if (formularios.length == 0) {
            return false;
        }

        for (let i = 0; i < formularios.length; i++) {
            if (!idautores.find( a => formularios[i].idautor === a)) {
                return false;
            }
        }

        return true;
    }
}

export = Formulario;