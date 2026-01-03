const { spawnSync } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

function runShell(command, options = {}) {
	const result = spawnSync(command, {
		cwd: rootDir,
		stdio: 'inherit',
		env: options.env || process.env,
		shell: true,
	});
	if (result.error) throw result.error;
	if (typeof result.status === 'number' && result.status !== 0) process.exit(result.status);
}

try {
	console.log('== Smoke: client build ==');
	runShell('npm --prefix client run build');

	console.log('\n== Smoke: backend boot (no DB) ==');
	const serverEntry = path.join(rootDir, 'server', 'server.js');
	runShell(`"${process.execPath}" "${serverEntry}"`, {
		env: { ...process.env, SMOKE_TEST: '1' },
	});

	console.log('\nSMOKE OK');
} catch (err) {
	console.error('\nSMOKE FAILED:', err && err.message ? err.message : err);
	process.exit(1);
}
