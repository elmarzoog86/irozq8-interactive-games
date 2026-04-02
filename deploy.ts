// Automation script for deployment
import * as ftp from 'basic-ftp';
import * as path from 'path';
import * as fs from 'fs';
import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query: string): Promise<string> => {
    return new Promise((resolve) => rl.question(query, resolve));
};

async function deploy() {
    const client = new ftp.Client();
    // Enable logging
    client.ftp.verbose = true;

    console.log("-----------------------------------------");
    console.log("     GoDaddy FTP Deployment Assistant    ");
    console.log("-----------------------------------------");
    console.log("This script will upload your project files to your server.");
    console.log("Ensure you have your FTP credentials ready from cPanel.");
    console.log("Make sure your project is built (npm run build).");
    console.log("-----------------------------------------\n");

    try {
        const host = await askQuestion("FTP Host (e.g., ftp.irozq8.com or IP): ");
        const user = await askQuestion("FTP Username: ");
        const password = await askQuestion("FTP Password: ");
        const remoteDir = await askQuestion("Remote Directory (e.g., /public_html or /): ") || "/public_html";
        
        console.log(`\nConnecting to ${host}...`);

        await client.access({
            host: host.trim(),
            user: user.trim(),
            password: password.trim(),
            secure: false // Most shared hosting FTP doesn't enforce strict TLS upgrade
        });

        console.log("Connected successfully!");

        // Upload local files
        console.log(`Uploading to ${remoteDir}...`);
        
        // Ensure remote directory exists
        await client.ensureDir(remoteDir);
        
        // Strategy: Upload contents of current directory EXCEPT ignored files
        await client.uploadFromDir(".", remoteDir);

        console.log("Upload complete!");
    } catch (err) {
        console.error("Deployment failed:", err);
    }

    client.close();
    rl.close();
}

deploy();
