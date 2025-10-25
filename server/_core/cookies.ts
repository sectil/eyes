import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  const isSecure = isSecureRequest(req);
  const hostname = req.hostname;
  
  // Determine if we should set domain
  // For localhost and IP addresses, don't set domain
  // For real domains, set domain to allow subdomains
  let domain: string | undefined = undefined;
  if (
    hostname &&
    !LOCAL_HOSTS.has(hostname) &&
    !isIpAddress(hostname)
  ) {
    // Set domain to parent domain (e.g., example.com for app.example.com)
    // This allows the cookie to be shared across subdomains
    domain = hostname.startsWith(".") ? hostname : hostname;
  }

  return {
    httpOnly: true,
    path: "/",
    domain,
    sameSite: "strict",
    secure: true,
  };
}

