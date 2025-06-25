import fs from "fs-extra";
import path from "path";
import { isBinaryFile } from "isbinaryfile";
class ReadProject {
    constructor(config) {
        this.config = config;
        this.input_path = this.config.path;
        this.path = path.isAbsolute(this.input_path)
            ? this.input_path
            : path.resolve(process.cwd(), this.input_path);
        this.ignore = this.config.ignore;
        this.ignore_regex = this.config.ignore_regex.map((reg) => new RegExp(reg));
        this.limit_size = this.config.limit;
        this.ignore_files = [];
        this.only_token_count = this.config.token_count;
    }
    async run() {
        let { files, ignore_files } = await this._recursive_scan(this.path);
        files = await this._read_files(files);
        files = this._builder_content(files);
        const contexo = this._create_contexo(files, ignore_files);
        if (this.only_token_count) return await this.token_count(contexo);
        return contexo;
    }

    async token_count(text) {
        const { encoding_for_model } = await import("tiktoken"); // dynamic import keeps bundle smaller
        // Price in USD per 1M input tokens
        const PRICING_TABLE = [
            { model: "o3", price: 2 },
            { model: "gpt-4.1", price: 2 },
            { model: "o4-mini", price: 1.1 },
            { model: "gpt-4.1-mini", price: 0.4 },
            { model: "gpt-4.1-nano", price: 0.1 },
        ];
        const results = [];

        for (const { model, price } of PRICING_TABLE) {
            let enc;
            let message = "";
            let default_model = "cl100k_base";
            try {
                enc = encoding_for_model(model);
            } catch (e) {
                // Fallback to a generic tokenizer if the specific model is not supported
                enc = encoding_for_model(default_model);
                message += `Error usign model ${model}, encoding fail or not found, fallback to a generic tokenizer ${default_model}\n`;
            }
            const tokens = enc.encode(text).length;
            enc.free();

            const cost = (tokens / 1_000_000) * price;
            results.push({
                model,
                tokens,
                pricing: cost,
                message: `${model}: ${tokens} ≈ ${cost.toFixed(6)} $USD (input token)`,
            });
        }

        return results.map(({ message }) => message).join("\n");
    }
    _create_contexo(files, ignore_files) {
        let header = "";
        header += `PROJECT: ${this.input_path}\n`;
        header += `CWD: ${process.cwd()}`;
        const body = files.map(({ content }) => content).join("\n\n");
        const footer = `these paths exist but their reading has been skipped:\n${ignore_files.join("\n")}`;
        const br = "\n\n";
        const contexo = header + br + body + br + footer;
        return contexo;
    }
    _builder_content(files) {
        return files.map((file) => {
            let file_content = Boolean(file.content)
                ? "```" + file.ext + "\n" + file.content + "\n" + "```"
                : "(empty file)";
            let contents = [
                `filename: ${file.filename}`,
                `absolute path: ${file.file_path}`,
                `${file.is_binary ? "this file is binary" : ""}`,
                `${!file.correct_size ? `not load content cause file exceded limit: size ${file.size} bytes limit: ${this.limit} bytes` : ""}`,
                file_content,
            ];

            return {
                ...file,
                content: contents.filter((text) => Boolean(text)).join("\n"),
            };
        });
    }

    async _read_files(files = [{}]) {
        if (!files.every(({ file_path }) => path.isAbsolute(file_path)))
            throw new Error("CRITICAL: _builder_files need absolute paths");
        let result_files = [];
        for (let index = 0; index < files.length; index++) {
            const file = files[index];
            let content = await fs.readFile(file.file_path);
            const is_binary = await isBinaryFile(content, file.size);
            if (!is_binary)
                // TODO: read again?
                content = await fs.readFile(file.file_path, {
                    encoding: "utf8",
                });
            const correct_size = file.size <= this.limit_size;
            result_files.push({
                ...file,
                is_binary,
                correct_size,
                content: !is_binary && correct_size ? content : "",
            });
        }
        return result_files;
    }
    async _recursive_scan(father_path, files = [], ignore_files = []) {
        let content;
        try {
            content = await fs.readdir(father_path);
            if (content.length === 0) return { files, ignore_files };
            for (let i = 0; i < content.length; i++) {
                const item_path = path.resolve(father_path, content[i]);
                let match_ignore = false;
                this.ignore_regex.forEach((reg) => reg.test(item_path) && (match_ignore = true));
                this.ignore.forEach((text) => item_path.includes(text) && (match_ignore = true));
                const stat = await fs.stat(item_path);
                const is_file = stat.isFile();
                const is_directory = stat.isDirectory();
                if (match_ignore) {
                    ignore_files.push(
                        (
                            item_path + ` ${is_file ? "(file)" : ""}${is_directory ? "(dir)" : ""}`
                        ).trim()
                    );
                    continue;
                }
                if (is_file) {
                    files.push({
                        file_path: item_path,
                        stat: stat,
                        size: stat.size,
                        ext: path.extname(item_path).slice(1),
                        filename: path.basename(item_path),
                    });
                    continue;
                }
                if (is_directory) {
                    const _scan = await this._recursive_scan(item_path);
                    files = [...files, ..._scan.files];
                    ignore_files = [...ignore_files, ..._scan.ignore_files];
                    continue;
                }
            }
        } catch (error) {
            console.error(error);
        }
        return { files, ignore_files };
    }
}

export default ReadProject;
