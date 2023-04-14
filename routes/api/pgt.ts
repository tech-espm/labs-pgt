import app = require("teem");
import Perfil = require("../../enums/perfil");
import PGT = require("../../models/pgt"); 
import Usuario = require("../../models/Conta");

class PGTApiRoute {

	public static async listar1(req: app.Request, res: app.Response) {
		const u = await Usuario.cookie(req, res);
		if (!u)
			return;

		res.json(await PGT.listar1()); 
	} 

	public static async listar2(req: app.Request, res: app.Response) {
		const u = await Usuario.cookie(req, res);
		if (!u)
			return;

		res.json(await PGT.listar2());
	}

	@app.http.post()
	public static async criar(req: app.Request, res: app.Response) {
		const u = await Usuario.cookie(req, res, true);
		if (!u)
			return;

		const erro = await PGT.criar(req.body);

		if (erro) {
			res.status(400).json(erro);
			return;
		}

		res.sendStatus(204);
	}

	@app.http.post()
	public static async editar1(req: app.Request, res: app.Response) {
		const u = await Usuario.cookie(req, res, true);
		if (!u)
			return;

		const pgt: PGT= req.body;

		const erro = await PGT.editar1(pgt);

		if (erro) {
			res.status(400).json(erro);
			return;
		}

		res.sendStatus(204);
	} 
 
	@app.http.post()
	public static async editar2(req: app.Request, res: app.Response) {
		const u = await Usuario.cookie(req, res, true);
		if (!u)
			return;

		const pgt: PGT= req.body;

		const erro = await PGT.editar2(pgt);

		if (erro) {
			res.status(400).json(erro);
			return;
		}

		res.sendStatus(204);
	} 
	


	@app.http.delete()
	public static async excluir(req: app.Request, res: app.Response) {
		const u = await Usuario.cookie(req, res, true);
		if (!u)
			return;

		const id = parseInt(req.query["id"] as string);

		if (isNaN(id)) {
			res.status(400).json("Id inválido");
			return;
		}

		const erro = await PGT.excluir(id);

		if (erro) {
			res.status(400).json(erro);
			return;
		}

		res.sendStatus(204);
	}
}

export = PGTApiRoute;
