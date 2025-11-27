import app = require("teem");
import DataEnt = require("../../models/dataent");
import Usuario = require("../../models/conta");

class DataEntApiRoute {
  public static async listar(req: app.Request, res: app.Response) {
    const u = await Usuario.cookie(req, res);
    if (!u) return;

    res.json(await DataEnt.listar());
  }

  @app.http.post()
  public static async criar(req: app.Request, res: app.Response) {
    const u = await Usuario.cookie(req, res, true);
    if (!u) return;

    const erro = await DataEnt.criar(req.body);

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

    const erro = await DataEnt.editar(req.body);

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

    const ano = parseInt(req.query["ano"] as string);
    const semestre = parseInt(req.query["semestre"] as string);
    const idfase = parseInt(req.query["idfase"] as string);
    const idtipo = parseInt(req.query["idtipo"] as string);

    if (isNaN(ano) || isNaN(semestre) || isNaN(idfase) || isNaN(idtipo)) {
      res.status(400).json("Parâmetros inválidos");
      return;
    }

    const dataEnt = { ano, semestre, idfase, idtipo };
    const erro = await DataEnt.excluir(dataEnt as any);

    if (erro) {
      res.status(400).json(erro);
      return;
    }

    res.sendStatus(204);
  }
}

export = DataEntApiRoute;