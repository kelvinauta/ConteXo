# Contexo

CLI utilities that generate concise project context for Large-Language-Models.

Currently available:

* **contexo read-project** – scans a directory and prints a self-contained textual snapshot with file contents, sizes and skip notes. Perfect for feeding straight into an LLM.

More utilities will be added in upcoming releases.

## Build (optional)

Static binary for musl Linux (x64):

```bash
bun build --compile --minify --target=bun-linux-x64-musl ./src/index.ts --outfile contexo
```

## Requirements

| Scenario            | Needs                               |
|---------------------|--------------------------------------|
| Running with Bun    | **Bun ≥ 1.0**                        |
| Compiled binary     | `libgcc`, `libatomic`, `libucontext` |

## Usage

With Bun:

```bash
bun run ./src/index.ts [options]
```

With the compiled binary (if it is added to your binary PATH):

```bash
contexo [options]
```

Key flags:

| Flag                       | Type          | Description                          |
|----------------------------|---------------|--------------------------------------|
| `--path <dir>`             | string        | Directory to scan (defaults CWD)     |
| `--ignore "<arr>"`         | JSON string[] | Extra paths to skip                  |
| `--ignore-regex "<arr>"`   | JSON string[] | Extra regex patterns to skip         |
| `--disable-default-ignore` | boolean       | Disable the built-in ignore list     |

Examples:

```bash
# Basic
bun run ./src/index.ts --path ./my-project

# Skip node_modules and *.log files
bun run ./src/index.ts --ignore "['node_modules']" --ignore-regex "['\\.log$']"
```

Output is printed to `stdout`; redirect or pipe as you wish.

# TODO:

## read-project:
    - flag "--find": use only specific files matching a given regex
    - flag "--limit-token": set a token limit per file
    - flag "--token-count": output the total token count for the entire stdout
    - flag "--tree-sitter": generate output using only TreeSitter to reduce token usage



## License

MIT

