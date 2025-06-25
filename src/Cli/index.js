import { parseArgs } from "util";
const { values } = parseArgs({
    args: Bun.argv,
    strict: true,
    allowPositionals: true,
    options: {
        path: {
            type: "string",
        },
        ignore: {
            type: "string",
        },
        "ignore-regex": {
            type: "string",
        },
        "disable-default-ignore": {
            type: "boolean",

        },
        "token-count": {
            type: "boolean",
            short: "t",
        },
        find: {
            type: "string",
        },
        help: {
            type: "boolean",
            short: "h",
        },
    },
});

values.ignore_regex = values["ignore-regex"];
delete values["ignore-regex"];
values.disable_default_ignore = values["disable-default-ignore"];
delete values["disable-default-ignore"];
values.token_count = values["token-count"];
delete values["token-count"];
try {
    values.ignore = values.ignore?.length ? JSON.parse(values.ignore) : [];
    values.ignore_regex = values.ignore_regex ? JSON.parse(values.ignore_regex) : [];
} catch (error) {
    console.error("Could not parse correctly");
    console.error(`Example of expected format  --ignore '["node_modules", "package.json"]'`);
    console.error(`Example of expected format  --ignore-regex '["\\.ignore$"]'`);
    process.exit(1);
}
export default { values };
