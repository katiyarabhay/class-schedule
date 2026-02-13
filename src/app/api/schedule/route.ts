import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        // Path to python script
        // Depending on deployment, this might need adjustment. 
        // For local dev, we assume process.cwd() is the project root.
        const scriptPath = path.join(process.cwd(), 'scripts', 'scheduler.py');

        // Spawn python process
        // Explicitly using the WindowsApps python as D:\python.exe lacks dependencies
        const pythonPath = process.env.PYTHON_PATH || 'python';
        const pythonProcess = spawn(pythonPath, [scriptPath]);

        let outputData = '';
        let errorData = '';

        const result = await new Promise<string>((resolve, reject) => {
            // Send data to stdin
            pythonProcess.stdin.write(JSON.stringify(data));
            pythonProcess.stdin.end();

            pythonProcess.stdout.on('data', (chunk) => {
                outputData += chunk.toString();
            });

            pythonProcess.stderr.on('data', (chunk) => {
                errorData += chunk.toString();
            });

            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`Scheduler process exited with code ${code}: ${errorData}`));
                } else {
                    resolve(outputData);
                }
            });

            pythonProcess.on('error', (err) => {
                reject(new Error(`Failed to start scheduler process: ${err.message}`));
            });
        });

        try {
            const schedule = JSON.parse(result);
            return NextResponse.json(schedule);
        } catch (parseError) {
            console.error("Failed to parse scheduler output:", result);
            return NextResponse.json({ error: "Invalid output from scheduler", details: result }, { status: 500 });
        }

    } catch (error: any) {
        console.error('Scheduler API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
