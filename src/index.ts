import * as net from 'net';

class ErrorWithCode extends Error {
    constructor(message: string, public code?: string) {
        super(message);
    }
}

export class MotionBuilderSocket {
    readonly port = 4242;

    /** System information about the connected MotionBuilder instance */
    public systemInfo?: string;

    private socket?: net.Socket;
    private isReady = false;

    private writeQueue: { command: string, resolve: (value: string) => void, reject: (error: Error) => void }[] = [];
    private isExecuting = false;

    constructor(
        public readonly ip = '127.0.0.1'
    ) { }

    private onError(e: Error) {
        this.socket?.destroy();
    }


    private onClose() {
        this.socket = undefined;
        this.isReady = false;
    }


    /**
     * Write to the socket and wait for a response.
     * @param buffer The data to write to the socket
     * @returns A promise that resolves with the output from the socket
     */
    private write(buffer: string | Uint8Array): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!this.isOpen()) {
                reject(new Error('Socket is not ready, you must wait for the open promise to resolve.'));
                return;
            }

            this.writeQueue.push({ command: buffer.toString(), resolve, reject });

            if (!this.isExecuting) {
                this.executeNextCommand();
            }
        });
    }

    private executeNextCommand() {
        const command = this.writeQueue.shift();
        if (!command || !this.isOpen()) {
            this.isExecuting = false;
            return;
        }
        this.isExecuting = true;

        this.socket?.write(command.command, (error) => {
            if (error) {
                command.reject(error);
                this.executeNextCommand();
                return;
            }
        });

        let receivedData = '';
        this.socket?.on('data', (chunk: Buffer) => {
            receivedData += chunk.toString('utf8');

            if (receivedData.trimEnd().endsWith('>>>')) {
                this.socket?.removeAllListeners('data');
                let outputData = receivedData.trimEnd().slice(0, -3).trimEnd(); // Remove the `>>>` and trailing whitespace
                outputData = outputData.replace(/\n\r/g, '\n');
                command.resolve(outputData);
                this.executeNextCommand();
            }
        });
    }

    on(event: 'close', listener: (...args: any[]) => void) {
        this.socket?.on(event, listener);
    }

    isOpen(): boolean {
        return this.socket !== undefined && this.socket.writable && this.isReady;
    }

    /**
     * Opens a connection to MotionBuilder, this must be called before any other methods.
     * @param timeoutDuration Time to wait in milliseconds before timing out. Default is 0 which means no timeout.
     * @returns A promise that resolves when the connection is ready.
     */
    open(timeoutDuration = 0): Promise<void> {
        if (this.isOpen()) {
            return Promise.resolve();
        }
        this.socket = net.createConnection(this.port, this.ip);

        this.socket.on('error', this.onError);
        this.socket.on("close", this.onClose);

        return new Promise((resolve, reject: (error: Error) => void) => {
            let timer: NodeJS.Timeout | undefined = undefined;
            if (timeoutDuration > 0) {
                timer = setTimeout(() => {
                    reject(new ErrorWithCode('Connection timed out', "ETIMEDOUT"));
                    this.socket?.destroy();
                }, timeoutDuration);
            }

            this.socket?.on('data', (data) => {
                const dataStr = data.toString().trim();

                if (dataStr.startsWith('Python'))
                    this.systemInfo = dataStr.split('\n')[0];

                if (dataStr.endsWith('>>>')) {
                    this.socket?.removeAllListeners('data');
                    this.isReady = true;
                    clearTimeout(timer);
                    resolve();
                }
            });

            this.socket?.once('error', (error: any) => {
                clearTimeout(timer);
                reject(error);
            });
        });
    }

    /**
     * Close this socket connection
     */
    close() {
        this.socket?.destroy();
    }

    /**
     * Execute a python statement in MotionBuilder.
     * The command can only be 1025 bytes at most (including the last newline character).
     * @param command Python code to run. To run multiple statements, seperate them with a semicolon.
     * @returns Python output such as print statements or errors
     */
    exec(command: string): Promise<string> {
        // If command doesn't end with a new line it won't execute
        if (!command.endsWith('\n')) {
            command += '\n';
        }

        // MotionBuilder can only handle commands up to 1025 bytes
        if (Buffer.byteLength(command) > 1025) {
            return Promise.reject(new Error('Command is too large, must be less than 1025 bytes'));
        }

        return this.write(command);
    }

    /**
     * Execute a python file in MotionBuilder.
     * @param filepath The absolute path to the file to execute
     * @param globals Global variables to set before executing the file
     * @returns Python output such as print statements or errors
     */
    execFile(filepath: string, globals: Record<string, any> = {}): Promise<string> {
        if (!globals.hasOwnProperty('__file__')) {
            globals["__file__"] = filepath;
        }

        let globals_str = JSON.stringify(globals);

        // Escape special characters
        globals_str = globals_str.replace(/\\/g, "\\\\");
        globals_str = globals_str.replace(/'/g, "\\'");

        return this.exec(`import json;globals().update(json.loads('${globals_str}'));f=open(r'${filepath}','r');exec(f.read());f.close()`);
    }
}