# Deployment Guide for GoDaddy (cPanel)

Since you are hosting on GoDaddy with cPanel, follow these steps to deploy your changes.

## Option 1: Using "Setup Node.js App" in cPanel (Recommended)

1.  **Log in to cPanel** on GoDaddy.
2.  Scroll down to **Software** section and click **Setup Node.js App**.
3.  If you haven't created an app yet:
    *   Click **Create Application**.
    *   **Node.js Version**: Select the latest available (e.g., 18.x or 20.x).
    *   **Application Mode**: `Production`.
    *   **Application Root**: `irozq8-interactive-games` (or folder where you upload files).
    *   **Application URL**: Select your domain (`irozq8.com`).
    *   **Application Startup File**: `server.ts` (Note: You might need to compile TS to JS using `tsc` or use `ts-node`/`tsx`).
        *   *Alternative*: Change startup file to `dist/index.html` if you only want static site, but socket games won't work.
        *   *Better*: Run `npm run build` locally, upload `dist`, and set startup file to a compiled `server.js` if possible. Since we use `tsx` in `start` script, point it to `server.ts` is fine if `tsx` is installed.
4.  **Upload Files**:
    *   If using **Git Version Control** in cPanel:
        1.  Go to **Git Version Control**.
        2.  Find your repository.
        3.  Click **Pull** or **Update from Remote** to get latest changes from GitHub.
    *   If using **File Manager**:
        1.  Upload the contents of this project (excluding `node_modules`).
        2.  Don't forget the `.env` file if you have secrets!
5.  **Install Dependencies**:
    *   In the Node.js App screen, click **Run NPM Install**.
6.  **Build the Project**:
    *   You may need to run `npm run build` on the server if you didn't upload `dist`.
    *   In cPanel terminal (or SSH): `cd irozq8-interactive-games && npm run build`.
7.  **Restart Application**:
    *   Click **Restart Application** button in Node.js App page.

## Option 2: FTP Upload (Manual)

1.  Run `npm run build` on your local machine.
2.  Use FileZilla (or similar) to connect to your server.
3.  Upload the contents of `dist/` folder to the `public_html` folder (or wherever your domain points).
4.  *Note*: This only updates the frontend. For backend logic changes (new games), you must restart the Node.js server in cPanel.

## Option 3: GitHub Actions (Automated)

1.  Create an FTP account in cPanel.
2.  Go to your GitHub Repository -> Settings -> Secrets and variables -> Actions.
3.  Add:
    *   `FTP_SERVER`: `ftp.irozq8.com` (or your server IP)
    *   `FTP_USERNAME`: your FTP username
    *   `FTP_PASSWORD`: your FTP password
4.  The action (if set up) will automatically deploy when keys are present.
