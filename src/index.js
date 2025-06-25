import Cli from "./Cli";
import Contexos from "./Contexos";
import default_config from "./Config/default";
class Contexo {
    static default_config = default_config;
    constructor() {
        this.config = this._config();
    }
    async ContexoProject() {
        const read_project = new Contexos.ReadProject(this.config);
        return await read_project.run();
    }
    _config() {
        const { path, ignore, ignore_regex, disable_default_ignore, find, token_count } =
            Cli.values;
        const config = Contexo.default_config;
        if (disable_default_ignore) {
            config.ignore = [];
            config.ignore_regex = [];
        }
        if (ignore?.length) config.ignore = [...config.ignore, ...ignore];
        if (ignore_regex?.length) config.ignore_regex = [...config.ignore_regex, ...ignore_regex];
        if (path) config.path = path;
        if (find) config.find = find;
        if (token_count) config.token_count = token_count;
        return config;
    }
}

const contexo = new Contexo();
const output = await contexo.ContexoProject();

process.stdout.write(output + "\n"); // output
process.exit();
