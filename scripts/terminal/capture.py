#!/usr/bin/env python3
"""Capture real CLI PTYs and compare frozen machine bytes against a baseline build.

Build first. Python's standard library only; local HTTP is an explicit Ollama fixture,
not an inference claim. Optional --baseline points at an older built cli.js.
"""
import argparse
import errno
import fcntl
import hashlib
import http.server
import json
import os
from pathlib import Path
import pty
import re
import shutil
import struct
import subprocess
import termios
import threading

ROOT = Path(__file__).resolve().parents[2]
parser = argparse.ArgumentParser()
parser.add_argument('--baseline', type=Path)
parser.add_argument('--baseline-revision')
args = parser.parse_args()
OUT = ROOT / 'docs/terminal-identity'
OUT.mkdir(parents=True, exist_ok=True)
NODE = shutil.which('node')
CLI = ROOT / 'dist/src/cli.js'
ENV = {'PATH': os.environ['PATH'], 'LANG': 'en_US.UTF-8', 'TERM': 'xterm-256color', 'COLORTERM': 'truecolor'}
# Freeze only the measurement clock for repeatable byte comparisons/captures.
CLOCK = ['--import', 'data:text/javascript,Object.defineProperty(performance,"now",{value:()=>100});']

class Fixture(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        self.rfile.read(int(self.headers['Content-Length']))
        payload = json.dumps({'model': 'specimen-fixture', 'response': 'Local fixture response. Your tools, on your machine.', 'done': True, 'prompt_eval_count': 8, 'eval_count': 11}).encode()
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(payload)
    def log_message(self, *args):
        pass

server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), Fixture)
threading.Thread(target=server.serve_forever, daemon=True).start()
RUNTIME = {'OLLAMA_HOST': f'http://127.0.0.1:{server.server_port}', 'FORGE_MODEL': 'specimen-fixture'}

def capture(arguments, width, extra):
    master, slave = pty.openpty()
    fcntl.ioctl(slave, termios.TIOCSWINSZ, struct.pack('HHHH', 40, width, 0, 0))
    child = subprocess.Popen([NODE, *CLOCK, str(CLI), *arguments], stdin=subprocess.DEVNULL, stdout=slave, stderr=subprocess.PIPE, env={**ENV, **extra})
    os.close(slave)
    data = b''
    while True:
        try:
            chunk = os.read(master, 65536)
            if not chunk:
                break
            data += chunk
        except OSError as error:
            if error.errno != errno.EIO:
                raise
            break
    os.close(master)
    stderr = child.communicate()[1]
    assert child.returncode == 0, (arguments, stderr)
    assert stderr == b''
    return data

specimens = [
    ('wide-truecolor', ['--help'], 100, {}),
    ('narrow', ['--help'], 32, {}),
    ('no-color', ['--help'], 100, {'NO_COLOR': ''}),
    ('ascii', ['--help'], 100, {'WW_ASCII': '1'}),
    ('ansi256', ['--help'], 100, {'COLORTERM': ''}),
    ('ansi16', ['--help'], 100, {'COLORTERM': '', 'TERM': 'xterm'}),
    ('dumb', ['--help'], 100, {'TERM': 'dumb'}),
    ('no-arg', [], 100, {}),
    ('successful-flow', ['ask', 'Show the local tool flow'], 100, RUNTIME),
]
manifest = {'product': 'Forge', 'serial': 'FG-047', 'version': '0.1.2', 'capture': 'Real PTY stdout; actual CLI subprocess; stderr separately asserted empty.', 'success': 'A local HTTP Ollama fixture, not real inference. Clock fixed to zero elapsed time.', 'specimens': []}
for name, arguments, width, extra in specimens:
    raw = capture(arguments, width, extra)
    (OUT / f'{name}.ansi').write_bytes(raw)
    clean = re.sub(r'\x1b\[[0-9;]*m', '', raw.decode()).replace('\r\n', '\n')
    (OUT / f'{name}.txt').write_text(clean)
    manifest['specimens'].append({'name': name, 'command': ['forge', *arguments], 'columns': width, 'env': {key: value for key, value in extra.items() if key != 'OLLAMA_HOST'}, 'sha256': hashlib.sha256(raw).hexdigest()})

if args.baseline:
    cases = [[], ['--help'], ['--version'], ['invalid'], ['--json'], ['ask', 'fixture'], ['ask', 'fixture', '--json']]
    envs = [{}, {'FORCE_COLOR': '3'}, {'NO_COLOR': ''}, {'WW_ASCII': '1'}, {'TERM': 'dumb'}]
    proof = []
    for command in cases:
        for environment in envs:
            fixture = RUNTIME if command[:1] == ['ask'] else {}
            environment = {**ENV, **fixture, **environment}
            before = subprocess.run([NODE, *CLOCK, str(args.baseline), *command], env=environment, capture_output=True)
            after = subprocess.run([NODE, *CLOCK, str(CLI), *command], env=environment, capture_output=True)
            assert (before.returncode, before.stdout, before.stderr) == (after.returncode, after.stdout, after.stderr), command
            proof.append({'command': command, 'exit': after.returncode, 'stdoutSha256': hashlib.sha256(after.stdout).hexdigest(), 'stderrSha256': hashlib.sha256(after.stderr).hexdigest()})
    manifest['byteEquivalence'] = {'baselineRevision': args.baseline_revision, 'cases': len(proof), 'scope': 'stdout, stderr, exit status; successful results use identical local fixture and frozen measurement clock', 'results': proof}
server.shutdown()
(OUT / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(f'{len(specimens)} real PTY specimens; {len(manifest.get("byteEquivalence", {}).get("results", []))} byte-equivalence cases')
