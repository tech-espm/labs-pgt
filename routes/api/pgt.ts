﻿import app = require("teem");
import PGT = require("../../models/pgt");
import Usuario = require("../../models/conta");
import Formulario = require("../../models/formulario");

class PGTApiRoute {
  public static async listar(req: app.Request, res: app.Response) {
    const u = await Usuario.cookie(req, res);
    if (!u) return;

    res.json(await PGT.listar());
  }

  @app.http.post()
  @app.route.formData()
  public static async criar(req: app.Request, res: app.Response) {
    const u = await Usuario.cookie(req, res, true);
    if (!u) return;

    let anexo: app.UploadedFile | null = null;
    if (req.uploadedFiles)
      anexo = req.uploadedFiles.anexo;

    const erro = await PGT.criar(req.body, anexo);

    if (erro) {
      res.status(400).json(erro);
      return;
    }

    res.sendStatus(204);
  }

  @app.http.post()
  @app.route.formData()
  public static async editar(req: app.Request, res: app.Response) {
    const u = await Usuario.cookie(req, res, true);
    if (!u) return;

    const pgt: PGT = req.body;

    let anexo: app.UploadedFile | null = null;
    if (req.uploadedFiles)
      anexo = req.uploadedFiles.anexo;

    const erro = await PGT.editar(pgt, anexo);

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

  @app.http.post()
  public static async avaliar(req: app.Request, res: app.Response) {
    const u = await Usuario.cookie(req, res, true);
    if (!u) return;

    const erro = await Formulario.criar(req.body);

    if (erro) {
      res.status(400).json(erro);
      return;
    }

    res.sendStatus(204);
  }

  public static async downloadAnexo(req: app.Request, res: app.Response) {
    const u = await Usuario.cookie(req, res, true);
    if (!u) return;

    await PGT.downloadAnexo(res, parseInt(req.query["id"] as string), parseInt(req.query["idfase"] as string));
  }
}

export = PGTApiRoute;
