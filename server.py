#!/usr/bin/env python3
"""Servidor da CHIVEIO COOL TECH — só usa a biblioteca padrão do Python 3.8+.

    - Serve os ficheiros estáticos da pasta public/

Variáveis de ambiente: HOST (127.0.0.1), PORT (8000)
"""
import mimetypes
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

BASE = Path(__file__).resolve().parent
PUBLIC = BASE / "public"
HOST = os.environ.get("HOST", "127.0.0.1")
PORT = int(os.environ.get("PORT", "8000"))

CSP = ("default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; "
       "script-src 'self' https://cdn.jsdelivr.net; connect-src 'self' https://api.emailjs.com; "
       "base-uri 'self'; form-action 'self'; frame-ancestors 'none'")


class Handler(BaseHTTPRequestHandler):
    server_version = "ChiveioServer"
    sys_version = ""

    def log_message(self, fmt, *args):
        print("%s %s" % (self.address_string(), fmt % args))

    def _headers(self, code, ctype, length, extra=None):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(length))
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        self.send_header("Content-Security-Policy", CSP)
        for k, v in (extra or {}).items(): self.send_header(k, v)
        self.end_headers()

    def do_GET(self):
        self.static(unquote(urlparse(self.path).path))

    def static(self, path):
        if path in ("/", ""): path = "/index.html"
        target = (PUBLIC / path.lstrip("/")).resolve()
        if PUBLIC.resolve() not in target.parents or not target.is_file():
            body = "Página não encontrada".encode()
            self._headers(404, "text/plain; charset=utf-8", len(body)); self.wfile.write(body); return
        data = target.read_bytes()
        ctype = mimetypes.guess_type(str(target))[0] or "application/octet-stream"
        if ctype.startswith("text/") or ctype in ("application/javascript", "application/json"): ctype += "; charset=utf-8"
        cache = "no-cache" if target.suffix in (".html", ".js", ".css") else "public, max-age=86400"
        self._headers(200, ctype, len(data), {"Cache-Control": cache})
        self.wfile.write(data)

def main():
    srv = ThreadingHTTPServer((HOST, PORT), Handler)
    print("=" * 60)
    print(" CHIVEIO COOL TECH — servidor ativo")
    print(" Site:   http://%s:%d/" % (HOST, PORT))
    print("=" * 60)
    try: srv.serve_forever()
    except KeyboardInterrupt: print("\nServidor terminado.")


if __name__ == "__main__":
    main()
