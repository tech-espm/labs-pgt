import app = require("teem");
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
    let anexo2: app.UploadedFile | null = null;
    if (req.uploadedFiles) {
      anexo = req.uploadedFiles.anexo;
      anexo2 = req.uploadedFiles.anexo2;
    }

    const erro = await PGT.criar(req.body, anexo, anexo2);

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
    let anexo2: app.UploadedFile | null = null;
    if (req.uploadedFiles) {
      anexo = req.uploadedFiles.anexo;
      anexo2 = req.uploadedFiles.anexo2;
    }

    const erro = await PGT.editar(pgt, anexo, anexo2);

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
    const u = await Usuario.cookie(req, res);
    if (!u) return;

	const formulario = req.body as Formulario;

	let pgt: PGT | null = null;

	if (formulario)
		pgt = await PGT.obter(formulario.idpgt);

	if (!pgt) {
		res.status(404).json("PGT não encontrado");
		return;
	}

	if (!(await PGT.usuarioPodeAcessar(pgt, u.id, u.perfil_id, true))) {
		res.status(403).json("Sem permissão");
		return;
	}

	const erro = await Formulario.criar(formulario);

    if (erro) {
      res.status(400).json(erro);
      return;
    }

    res.sendStatus(204);
  }

  public static async downloadAnexo(req: app.Request, res: app.Response) {
    const u = await Usuario.cookie(req, res);
    if (!u) return;

	let pgt = await PGT.obter(parseInt(req.query["id"] as string));

	if (!pgt) {
		res.status(404).json("PGT não encontrado");
		return;
	}

	if (!(await PGT.usuarioPodeAcessar(pgt, u.id, u.perfil_id))) {
		res.status(403).json("Sem permissão");
		return;
	}

    await PGT.downloadAnexo(res, pgt.id, parseInt(req.query["idfase"] as string));
  }

  public static async downloadAta(req: app.Request, res: app.Response) {
    const u = await Usuario.cookie(req, res);
    if (!u) return;

	let pgt = await PGT.obter(parseInt(req.query["id"] as string));

	if (!pgt) {
		res.status(404).json("PGT não encontrado");
		return;
	}

	if (!(await PGT.usuarioPodeAcessar(pgt, u.id, u.perfil_id))) {
		res.status(403).json("Sem permissão");
		return;
	}

    await PGT.downloadAta(res, pgt.id, parseInt(req.query["idfase"] as string));
  }

  @app.http.post()
  @app.route.formData()
  public static async uploadAnexosEAtas(req: app.Request, res: app.Response) {
    const u = await Usuario.cookie(req, res);
    if (!u) return;

    const id = parseInt(req.body["id"] as string);
    if (isNaN(id)) {
      res.status(400).json("Id inválido");
      return;
    }

    const item = await PGT.obter(id);
    if (!item) {
      res.status(404).json("PGT não encontrado");
      return;
    }

    if (!(await PGT.usuarioPodeAcessar(item, u.id, u.perfil_id))) {
      res.status(403).json("Sem permissão");
      return;
    }

    let anexo: app.UploadedFile | null = null;
    let anexo2: app.UploadedFile | null = null;
    let ata1: app.UploadedFile | null = null;
    let ata2: app.UploadedFile | null = null;
    if (req.uploadedFiles) {
      anexo = req.uploadedFiles.anexo;
      anexo2 = req.uploadedFiles.anexo2;
      ata1 = req.uploadedFiles.ata1;
      ata2 = req.uploadedFiles.ata2;
    }

    try {
      if (anexo) await app.fileSystem.saveUploadedFile(`dados/anexos/${id}-1.pdf`, anexo);
      if (anexo2) await app.fileSystem.saveUploadedFile(`dados/anexos/${id}-2.pdf`, anexo2);
      if (ata1) await app.fileSystem.saveUploadedFile(`dados/atas/${id}-1.pdf`, ata1);
      if (ata2) await app.fileSystem.saveUploadedFile(`dados/atas/${id}-2.pdf`, ata2);
      res.sendStatus(204);
    } catch (e) {
      res.status(500).json("Erro ao salvar anexos");
    }
  }

}

export = PGTApiRoute;
