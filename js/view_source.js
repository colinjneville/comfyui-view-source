import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";

const SETTINGS_GROUP = "View Source";
const SETTINGS_EXECUTABLE = `${SETTINGS_GROUP}.executable`;

const SETTINGS_ARGUMENT_LEN = 4;

function settings_argument(i) {
    return `${SETTINGS_GROUP}.argument${i}`;
}

async function send_view_source_message(node) {
    const body = new FormData();
    body.append('class_name', node.comfyClass);

    const executable = app.extensionManager.setting.get(SETTINGS_EXECUTABLE);
    if (executable) {
        body.append('executable', executable);

        for (let i = 0; i < SETTINGS_ARGUMENT_LEN; ++i) {
            const argument = app.extensionManager.setting.get(settings_argument(i));
            console.log(argument)
            if (argument) {
                body.append('arguments', argument);
            }
        }
    }

    const response = await api.fetchApi("/view_source", { method: "POST", body, });
    
    if (!response.ok) {
        app.extensionManager.toast.add({
            severity: "warn",
            summary: "View Source Failed",
            detail: await response.text(),
            life: 3000,
        });
    }
}

const SETTINGS = [
    {
        id: SETTINGS_EXECUTABLE,
        name: "Executable",
        type: "text",
        tooltip: "If not specified, the OS-associated application will be used.",
        defaultValue: "",
        category: [SETTINGS_GROUP, "Command Line", `Executable`],
    },
];
for (var i = 0; i < SETTINGS_ARGUMENT_LEN; ++i) {
    SETTINGS.push({
        id: settings_argument(i),
        name: `Argument ${i}`,
        type: "text",
        tooltip: "Additional command line parameters. Use '%f' for file name, '%l' for line number, and '%n' for node class name. Ignored if Executable is not set.",
        defaultValue: i == 0 ? "%f" : "",
        category: [SETTINGS_GROUP, "Command Line", `Argument ${i}`],
    },)
}
// ComfyUI displays these in reverse order for some reason?
SETTINGS.reverse();

app.registerExtension({
    name: "ViewSource",
    settings: SETTINGS,
    getNodeMenuItems(node) {
        const items = [];

        if (node.comfyClass !== null) {
            items.push(
                {
                    content: "View Node Source",
                    callback: async () => {
                        await send_view_source_message(node);
                    }
                }
            );
        }

        if (items.length > 0) {
            items.unshift(null);
        }

        return items;
    }
});