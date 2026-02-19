import { execSync } from 'node:child_process';

const PORT = 3000;

const run = (command) => execSync(command, { stdio: ['ignore', 'pipe', 'pipe'] }).toString();

const getPidsOnWindows = () => {
  try {
    const output = run('netstat -ano -p tcp');
    const lines = output.split(/\r?\n/);
    const pids = new Set();

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('TCP')) continue;
      const cols = trimmed.split(/\s+/);
      if (cols.length < 5) continue;
      const localAddress = cols[1];
      const state = cols[3];
      const pid = cols[4];

      if (localAddress.endsWith(`:${PORT}`) && state === 'LISTENING' && pid !== process.pid.toString()) {
        pids.add(pid);
      }
    }

    return [...pids];
  } catch {
    return [];
  }
};

const getPidsOnUnix = () => {
  try {
    const output = run(`lsof -ti tcp:${PORT}`);
    return output
      .split(/\r?\n/)
      .map((pid) => pid.trim())
      .filter(Boolean)
      .filter((pid) => pid !== process.pid.toString());
  } catch {
    return [];
  }
};

const killPid = (pid) => {
  if (process.platform === 'win32') {
    execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
    return;
  }
  execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
};

const pids = process.platform === 'win32' ? getPidsOnWindows() : getPidsOnUnix();

if (pids.length === 0) {
  console.log(`Port ${PORT} is free.`);
  process.exit(0);
}

console.log(`Port ${PORT} is busy. Stopping process(es): ${pids.join(', ')}`);

for (const pid of pids) {
  try {
    killPid(pid);
    console.log(`Stopped PID ${pid}`);
  } catch {
    console.warn(`Could not stop PID ${pid}`);
  }
}
