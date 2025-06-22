# ConteXo

CLI utilities that generate concise project context for Large-Language-Models.

Currently available:
* **ConteXo read-project** – scans a directory and prints a self-contained textual snapshot with file contents, sizes and skip notes. Perfect for feeding straight into an LLM.

## Quick usage

Run ConteXo in any directory to generate a ready-to-paste project snapshot. Example:

```bash
contexo --ignore '[".ignore"]'
```

Typical output (scoped backticks):

```text
PROJECT: /tmp/example
CWD: /tmp/example

filename: example.js
absolute path: /tmp/example/example.js
\`\`\`js
console.log("Hello, I love wasting my time. F*ck")
\`\`\`


filename: example2.js
absolute path: /tmp/example/recursive_included/example2.js
\`\`\`js
console.log("This way the LLM has a full context of your project")
console.log("Even of the ignored files, although the content is not shown, it's good for the LLM to know they exist")
\`\`\`

these paths exist but their reading has been skipped:
/tmp/example/file.ignore (file)
/tmp/example/file2.ignore (file)
```

### Real-world workflow

Redirect the output to a markdown file or pipe it to the clipboard to share it with your favourite LLM:

```bash
# Save to markdown file
contexo > /tmp/contex.md

# Copy to clipboard (Linux/X11)
contexo | xclip -selection clipboard
```

Paste the result directly into ChatGPT, Claude, AnyNewLLM, etc. to give the model full context of your codebase.

## Key flags:

| Flag                       | Type          | Description                          |
|----------------------------|---------------|--------------------------------------|
| `--path <dir>`             | string        | Directory to scan (defaults CWD)     |
| `--ignore "<arr>"`         | JSON string[] | Extra paths to skip                  |
| `--ignore-regex "<arr>"`   | JSON string[] | Extra regex patterns to skip         |
| `--disable-default-ignore` | boolean       | Disable the built-in ignore list     |

Examples:
```bash
# Skip node_modules and *.log files
```markdown
contexo  --ignore '["node_modules"]' --ignore-regex '["\\.log$"]'
```
```
Output is printed to `stdout`; redirect or pipe as you wish.


## Installation (pre-built binaries)

Download the binary for your platform from the latest GitHub release and make it executable:

### Linux x86-64 (glibc)

```bash
sudo curl -L "https://github.com/kleber/contexo/releases/latest/download/contexo-bun-linux-x64" -o /usr/local/bin/contexo
sudo chmod +x /usr/local/bin/contexo
```

### Linux x86-64 (musl/Alpine)

```bash
sudo curl -L "https://github.com/kleber/contexo/releases/latest/download/contexo-bun-linux-x64-musl" -o /usr/local/bin/contexo
sudo chmod +x /usr/local/bin/contexo
```

### macOS (Apple Silicon)

```bash
sudo curl -L "https://github.com/kleber/contexo/releases/latest/download/contexo-bun-darwin-arm64" -o /usr/local/bin/contexo
sudo chmod +x /usr/local/bin/contexo
```

### Windows x86-64 (PowerShell)

```powershell
Invoke-WebRequest -Uri "https://github.com/kleber/contexo/releases/latest/download/contexo-bun-windows-x64.exe" -OutFile "contexo.exe"
# Move contexo.exe to a directory in your %PATH%
```



## Installation from source

If you already have **Bun ≥ 1.0** installed you can build and run ConteXo directly from the repository:

```bash
git clone https://github.com/kelvinauta/contexo.git
cd contexo
bun install      # install dependencies

# run directly with Bun
bun run ./src/index.js --path ./my-project

# OR build a standalone binary for your platform (example: Linux x86-64 glibc)
bun build --compile --minify --sourcemap --target=bun-linux-x64 ./src/index.js --outfile contexo
```

The generated `ConteXo` binary can then be moved to a directory in your `PATH` (e.g. `/usr/local/bin`).


For other targets (ARM, Intel macOS, etc.), pick the corresponding file name from the release assets.


## Requirements

| Scenario                  | Needs                                                         |
|---------------------------|--------------------------------------------------------------|
| from binary (Alpine example) | `libgcc`, `libatomic`, `libucontext` <br>*(usually preinstalled on most systems)* |
| Running from source       | **Bun ≥ 1.0**                                                |


# TODO:

## read-project:
    - flag "--find": use only specific files matching a given regex
    - flag "--limit-token": set a token limit per file
    - flag "--token-count": output the total token count for the entire stdout
    - flag "--tree-sitter": generate output using only TreeSitter to reduce token usage

## License

MIT

