import json
import os
from http.server import SimpleHTTPRequestHandler, HTTPServer

DATA_FILE = "datos.json"
PORT = 8000

if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump([], f)

class RequestHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/api/requerimientos":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                self.wfile.write(f.read().encode("utf-8"))
        else:
            super().do_GET()

    def do_POST(self):
        if self.path == "/api/requerimientos":
            content_length = int(self.headers["Content-Length"])
            post_data = self.rfile.read(content_length)
            
            # Sobrescribe el archivo local automáticamente
            with open(DATA_FILE, "w", encoding="utf-8") as f:
                f.write(post_data.decode("utf-8"))

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"status":"ok"}')

print(f"Servidor iniciado en http://localhost:{PORT}")
HTTPServer(("localhost", PORT), RequestHandler).serve_forever()