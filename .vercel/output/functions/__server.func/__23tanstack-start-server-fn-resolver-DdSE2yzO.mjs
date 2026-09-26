//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-DdSE2yzO.js
var manifest = {
	"0c834f3e659690272834a8a1f124376a939f1884fda5f2b3ee1954d50430d613": {
		functionName: "setUserPassword_createServerFn_handler",
		importer: () => import("./_ssr/admin.functions-DE--9OgI.mjs")
	},
	"6a8705b03d5bbcdbe45a920f94ebdf63baf7c76553e694f851a1347e1fe5b94c": {
		functionName: "deleteAppUser_createServerFn_handler",
		importer: () => import("./_ssr/admin.functions-DE--9OgI.mjs")
	},
	"8b5e87060261a59e92bcd5e92ce4cf6afa0ee8e3737aa66e7c16f0be951897c6": {
		functionName: "bootstrapAdmin_createServerFn_handler",
		importer: () => import("./_ssr/admin.functions-DE--9OgI.mjs")
	},
	"8dfe3e34a14d2f6645640e66033a1e6f17155f003e2d45dac1066a7e2aa10431": {
		functionName: "hasAdmin_createServerFn_handler",
		importer: () => import("./_ssr/admin.functions-DE--9OgI.mjs")
	},
	"ae1d531e1714d053869d1e069815a71e199346ef621d80ab0f46be85080718ab": {
		functionName: "listUsers_createServerFn_handler",
		importer: () => import("./_ssr/admin.functions-DE--9OgI.mjs")
	},
	"f76fbb6b31afe57825c85b4bc2387067a0af6982673e37cffa2a6460b4687623": {
		functionName: "createAppUser_createServerFn_handler",
		importer: () => import("./_ssr/admin.functions-DE--9OgI.mjs")
	}
};
async function getServerFnById(id, access) {
	const serverFnInfo = manifest[id];
	if (!serverFnInfo) throw new Error("Server function info not found for " + id);
	const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
	if (!fnModule) throw new Error("Server function module not resolved for " + id);
	const action = fnModule[serverFnInfo.functionName];
	if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
	return action;
}
//#endregion
export { getServerFnById as t };
