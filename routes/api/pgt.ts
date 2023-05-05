import app = require("teem");
import PGT = require("../../models/pgt");
import Usuario = require("../../models/Conta");

class PGTApiRoute {
  public static async listar(req: app.Request, res: app.Response) {
    const u = await Usuario.cookie(req, res);
    if (!u) return;

    res.json(await PGT.listar());
  }

  @app.http.post()
  public static async criar(req: app.Request, res: app.Response) {
    const u = await Usuario.cookie(req, res, true);
    if (!u) return;

    const erro = await PGT.criar(req.body);

    if (erro) {
      res.status(400).json(erro);
      return;
    }

    res.sendStatus(204);
  }

  @app.http.post()
  public static async editar(req: app.Request, res: app.Response) {
    const u = await Usuario.cookie(req, res, true);
    if (!u) return;

    const pgt: PGT = req.body;

    const erro = await PGT.editar(pgt);

    if (erro) {
      res.status(400).json(erro);
      return;
    }

    res.sendStatus(204);
  }

  @app.http.delete()
  public static async excluir(req: app.Request, res: app.Response) {
    const u = await Usuario.cookie(req, res, true);
    if (!u) return;

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
