/**
 * This tests require a running instance of MotionBuilder running with the Python Server enabled.
 */

import { MotionBuilderSocket } from '../index';


describe('RemoteExecution', () => {
	let motionBuilderSocket: MotionBuilderSocket;

	beforeAll(async () => {
		motionBuilderSocket = new MotionBuilderSocket();
		await motionBuilderSocket.open();

	});

	afterAll(() => {
		motionBuilderSocket.close();
	});

	test('Baic Settigs', async () => {
		expect(motionBuilderSocket.ip).toBe("127.0.0.1");
		expect(motionBuilderSocket.port).toBe(4242);
		
		expect(motionBuilderSocket.isOpen()).toBe(true);
	});

	test('Hello World', async () => {
		const response = await motionBuilderSocket.exec('print("Hello World")');
		expect(response).toBe('Hello World');
	});

	test('Exec File', async () => {
		const filepath = `${__dirname}/fixtures/test_exec.py`;
		
		const response = await motionBuilderSocket.execFile(filepath);

		expect(response).toBe('success');
	});

	test('Exec Globals', async () => {
		const filepath = `${__dirname}/fixtures/test_globals.py`;

		const string = "Hello! :') \"";

		const globals = {
			"test_number": 42,
			"test_string": string,
			"test_array": [1, 2, 3],
			"test_dict": {
				"a": 1,
				"b": 2,
			}
		};

		const response = await motionBuilderSocket.execFile(filepath, globals);

		expect(response).toBe(string);
	});

	test('Globals', async () => {
		const response = await motionBuilderSocket.exec('print("Hello World")');

		expect(response).toBe('Hello World');
	});
});