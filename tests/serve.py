from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os
os.chdir(Path(__file__).resolve().parents[1])
class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/publish/post/'):
            self.path = '/tests/comments.html'
        if self.path == '/popup-test':
            self.path = '/tests/popup.html'
        super().do_GET()
ThreadingHTTPServer(('127.0.0.1', 8765), Handler).serve_forever()
