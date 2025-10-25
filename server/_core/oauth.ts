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
      res.send(`
        <html>
          <head><title>Login Error</title></head>
          <body style="font-family: Arial; padding: 20px;">
            <h1>❌ Login Error</h1>
            <p><strong>Error:</strong> Missing code or state parameter</p>
            <p>This usually means the OAuth provider didn't return the required parameters.</p>
            <button onclick="window.location.href='/'">Go Back Home</button>
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
            <head><title>Login Error</title></head>
            <body style="font-family: Arial; padding: 20px;">
              <h1>❌ Login Error</h1>
              <p><strong>Error:</strong> Missing user information (openId)</p>
              <p>The OAuth provider didn't return your user ID.</p>
              <button onclick="window.location.href='/'">Go Back Home</button>
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
      console.log("[OAuth] Setting cookie with options:", {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Return HTML page that stores token and redirects
      console.log("[OAuth] Returning success page with redirect");
      res.send(`
        <html>
          <head>
            <title>Logging in...</title>
            <meta charset="UTF-8">
          </head>
          <body style="font-family: Arial; padding: 20px; text-align: center;">
            <h1>✅ Logging in...</h1>
            <p>Please wait, you are being redirected...</p>
            <script>
              // Store token in localStorage as backup
              localStorage.setItem('${COOKIE_NAME}', '${sessionToken}');
              console.log('Token stored in localStorage');
              // Redirect to home page
              setTimeout(() => {
                window.location.href = '/';
              }, 500);
            </script>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : '';
      
      res.send(`
        <html>
          <head><title>Login Failed</title></head>
          <body style="font-family: Arial; padding: 20px;">
            <h1>❌ Login Failed</h1>
            <p><strong>Error:</strong> ${errorMessage}</p>
            <details style="margin-top: 20px; padding: 10px; background: #f0f0f0; border-radius: 5px;">
              <summary>Technical Details</summary>
              <pre style="overflow: auto; max-height: 200px; font-size: 12px;">${errorStack}</pre>
            </details>
            <p style="margin-top: 20px;">
              <button onclick="window.location.href='/'">Go Back Home</button>
            </p>
            <script>
              setTimeout(() => {
                window.location.href = '/';
              }, 5000);
            </script>
          </body>
        </html>
      `);
    }
  });
}

