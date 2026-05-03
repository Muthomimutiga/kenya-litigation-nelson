# /setup — First-Use Configuration

Run this command once when you first install the plugin. It captures your firm's preferences and saves them so you never have to re-enter them.

If you need to update your preferences later, run `/setup` again — it will overwrite the saved config.

---

## Step 0 — Check Node.js is installed

The document generator requires Node.js. Run the following bash command:

```bash
node --version
```

**If Node.js is found** (output is a version number like `v20.x.x`): proceed to Step 1.

**If Node.js is not found** (command not found error): install it automatically.

Detect the operating system and run the appropriate install command:

**macOS — check for Homebrew first:**
```bash
if command -v brew &> /dev/null; then
  brew install node
else
  echo "Homebrew not found. Downloading Node.js installer..."
  curl -fsSL https://nodejs.org/dist/v20.11.0/node-v20.11.0.pkg -o /tmp/node-installer.pkg
  echo "Installer downloaded to /tmp/node-installer.pkg — opening now..."
  open /tmp/node-installer.pkg
fi
```

**Windows (PowerShell):**
```powershell
winget install OpenJS.NodeJS.LTS
```

After the install completes, run `node --version` again to confirm. If it still fails, tell the user:

> Node.js could not be installed automatically. Please download and install it manually from **nodejs.org** (choose the LTS version), then run `/setup` again.

Once Node.js is confirmed, run:

```bash
cd "${CLAUDE_PLUGIN_ROOT}/scripts" && npm install
```

This installs the document generator's dependencies. Confirm it completes without errors before proceeding.

---

## Step 1 — Check for existing config

Read the file at `${CLAUDE_PLUGIN_ROOT}/scripts/user-config.json`.

- If it exists: tell the user "Your current configuration:" and display the values. Ask: "Would you like to update any of these? (yes/no)"
  - If no: stop here.
  - If yes: continue to Step 2.
- If it does not exist: say "Welcome. Let's set up your Litigation Manager. I have two quick questions." Then continue to Step 2.

---

## Step 2 — Ask the two setup questions

Ask both questions in a single message:

> **1. Matter reference prefix**
> This is the short code that appears at the start of your file references — e.g. `MMM` in `MMM/CIV/001/2026`.
> What prefix does your firm use?
>
> **2. Default court**
> What court do you file most of your matters in?
> E.g. `IN THE HIGH COURT OF KENYA AT NAIROBI` or `IN THE MAGISTRATES COURT OF KENYA AT NAIROBI`

Wait for the user's answers before continuing.

---

## Step 3 — Write user-config.json

Once the user has answered, write the following JSON to `${CLAUDE_PLUGIN_ROOT}/scripts/user-config.json`:

```json
{
  "matter_prefix": "[their answer]",
  "default_court": "[their answer]",
  "setup_complete": true,
  "setup_date": "[today's date YYYY-MM-DD]"
}
```

Use the Write tool to create or overwrite the file at that path.

---

## Step 4 — Confirm

Tell the user:

> ✓ Configuration saved. Your Litigation Manager is ready.
>
> Your matter references will use the prefix **[prefix]**.
> Default court: **[court]**.
>
> You can update these at any time by running `/setup` again.
>
> **Next step:** Run `/process-hearing` after your next court appearance to see the full workflow in action.
