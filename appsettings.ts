﻿import app = require("teem");

require("dotenv").config({ encoding: "utf8", path: app.currentDirectoryName() + "/../.env" });

export = {
	localIp: process.env.app_localIp as string,
	port: parseInt(process.env.app_port as string),
	root: process.env.app_root as string,
	urlSite: process.env.app_urlSite as string,
	cookie: process.env.app_cookie as string,
	cookieSecure: !!parseInt(process.env.app_cookieSecure as string),
	staticFilesDir: process.env.app_staticFilesDir as string,
	disableStaticFiles: !!parseInt(process.env.app_disableStaticFiles as string),

	sqlConfig: {
		connectionLimit: parseInt(process.env.app_sqlConfig_connectionLimit as string),
		waitForConnections: !!parseInt(process.env.app_sqlConfig_waitForConnections as string),
		charset: process.env.app_sqlConfig_charset as string,
		host: process.env.app_sqlConfig_host as string,
		port: parseInt(process.env.app_sqlConfig_port as string),
		user: process.env.app_sqlConfig_user as string,
		password: process.env.app_sqlConfig_password as string,
		database: process.env.app_sqlConfig_database as string
	},

	usuarioSenhaPadrao: process.env.app_usuarioSenhaPadrao,
	usuarioHashSenhaPadrao: process.env.app_usuarioHashSenhaPadrao,
	usuarioHashId: parseInt(process.env.app_usuarioHashId as string, 16),

	ssoRedir: process.env.app_ssoRedir,
	ssoToken: process.env.app_ssoToken
};
