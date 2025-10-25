import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    console.log("[OAuth] Callback received", {
      hasCode: !!code,
      hasState: !!state,
      protocol: req.protocol,
      host: req.hostname,
      userAgent: req.get("user-agent"),
    });

    if (!code || !state) {
      console.error("[OAuth] Missing code or state", { code, state });
      // Return HTML page that shows error
      res.send(`
        <html>
          <body>
            <h1>Login Error</h1>
            <p>Missing code or state parameter</p>
            <script>
              window.location.href = '/';
            </script>
          </body>
        </html>
      `);
      return;
    }

    try {
      console.log("[OAuth] Exchanging code for token...");
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      console.log("[OAuth] Token received, getting user info...");
      
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      console.log("[OAuth] User info received", { openId: userInfo.openId, email: userInfo.email });

      if (!userInfo.openId) {
        console.error("[OAuth] Missing openId in user info");
        res.send(`
          <html>
            <body>
              <h1>Login Error</h1>
              <p>Missing user information</p>
              <script>
                window.location.href = '/';
              </script>
            </body>
          </html>
        `);
        return;
      }

      console.log("[OAuth] Upserting user...");
      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      console.log("[OAuth] Creating session token...");
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      console.log("[OAuth] Setting cookie with options:", cookieOptions);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Return HTML page that stores token and redirects
      // This works better on mobile browsers than server-side redirect
      console.log("[OAuth] Returning success page with redirect");
      res.send(`
        <html>
          <head>
            <title>Logging in...</title>
          </head>
          <body>
            <p>Logging in...</p>
            <script>
              // Store token in localStorage as backup (in case cookie fails)
              localStorage.setItem('${COOKIE_NAME}', '${sessionToken}');
              // Redirect to home page
              window.location.href = '/';
            </script>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.send(`
        <html>
          <body>
            <h1>Login Failed</h1>
            <p>${errorMessage}</p>
            <script>
              setTimeout(() => {
                window.location.href = '/';
              }, 3000);
            </script>
          </body>
        </html>
      `);
    }
  });
}

