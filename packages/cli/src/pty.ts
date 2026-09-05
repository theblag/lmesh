import pty from 'node-pty';
import os from 'os';

// Determine default shell (PowerShell on Windows, environment default on POSIX)
const shell = os.platform() === 'win32' ? 'powershell.exe' : (process.env.SHELL || 'bash');

export interface PtySession {
  write: (data: string) => void;
  resize: (cols: number, rows: number) => void;
  kill: () => void;
}

export function spawnPty(
  onData: (data: string) => void,
  onExit: (exitCode: number) => void
): PtySession {
  const initialCols = process.stdout.columns || 80;
  const initialRows = process.stdout.rows || 24;

  // Spawn the terminal shell 
  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: initialCols,
    rows: initialRows,
    cwd: process.cwd(),
    env: process.env as Record<string, string>,
  });

  // Listen for terminal output and send it back via callback
  ptyProcess.onData((data) => {
    onData(data);
  });

  // Handle terminal exit
  ptyProcess.onExit(({ exitCode }) => {
    onExit(exitCode);
  });

  return {
    write: (data: string) => ptyProcess.write(data),
    resize: (cols: number, rows: number) => ptyProcess.resize(cols, rows),
    kill: () => ptyProcess.kill(),
  };
}
