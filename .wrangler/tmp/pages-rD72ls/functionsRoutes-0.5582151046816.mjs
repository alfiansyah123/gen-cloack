import { onRequestOptions as __api_add_domain_js_onRequestOptions } from "C:\\project\\Link Generator\\functions\\api\\add-domain.js"
import { onRequestPost as __api_add_domain_js_onRequestPost } from "C:\\project\\Link Generator\\functions\\api\\add-domain.js"
import { onRequestGet as __api_get_clicks_report_js_onRequestGet } from "C:\\project\\Link Generator\\functions\\api\\get-clicks-report.js"
import { onRequestGet as __api_get_domains_js_onRequestGet } from "C:\\project\\Link Generator\\functions\\api\\get-domains.js"
import { onRequestGet as __api_get_recent_clicks_js_onRequestGet } from "C:\\project\\Link Generator\\functions\\api\\get-recent-clicks.js"
import { onRequestOptions as __api_login_js_onRequestOptions } from "C:\\project\\Link Generator\\functions\\api\\login.js"
import { onRequestPost as __api_login_js_onRequestPost } from "C:\\project\\Link Generator\\functions\\api\\login.js"
import { onRequestOptions as __api_save_link_js_onRequestOptions } from "C:\\project\\Link Generator\\functions\\api\\save-link.js"
import { onRequestPost as __api_save_link_js_onRequestPost } from "C:\\project\\Link Generator\\functions\\api\\save-link.js"
import { onRequest as ____path___js_onRequest } from "C:\\project\\Link Generator\\functions\\[[path]].js"

export const routes = [
    {
      routePath: "/api/add-domain",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_add_domain_js_onRequestOptions],
    },
  {
      routePath: "/api/add-domain",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_add_domain_js_onRequestPost],
    },
  {
      routePath: "/api/get-clicks-report",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_get_clicks_report_js_onRequestGet],
    },
  {
      routePath: "/api/get-domains",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_get_domains_js_onRequestGet],
    },
  {
      routePath: "/api/get-recent-clicks",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_get_recent_clicks_js_onRequestGet],
    },
  {
      routePath: "/api/login",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_login_js_onRequestOptions],
    },
  {
      routePath: "/api/login",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_login_js_onRequestPost],
    },
  {
      routePath: "/api/save-link",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_save_link_js_onRequestOptions],
    },
  {
      routePath: "/api/save-link",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_save_link_js_onRequestPost],
    },
  {
      routePath: "/:path*",
      mountPath: "/",
      method: "",
      middlewares: [],
      modules: [____path___js_onRequest],
    },
  ]