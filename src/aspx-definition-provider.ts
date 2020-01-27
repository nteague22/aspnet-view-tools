import { RelativePattern, DefinitionProvider, TextDocument, Position, CancellationToken, Location, Uri, window, StatusBarAlignment, OutputChannel, StatusBarItem, WorkspaceConfiguration, workspace } from "vscode";

import * as path from 'path';

export default class AspxDefinitionProvider implements DefinitionProvider {
    resultChain: Thenable<Location>;

    SharedPaths: string[];

    readonly log: OutputChannel;

    status: StatusBarItem;

    config: WorkspaceConfiguration;

    activePartials: Map<String, Uri>;

    constructor(log: OutputChannel, config: WorkspaceConfiguration, cache: Map<String, Uri>) {
        this.SharedPaths = config.has("sharedPaths") ? config.get<string[]>("sharedPaths") : ['Views/Shared'];
        this.log = log;
        this.config = config;
        this.activePartials = cache;
    }
    tryFetchPath(sp: String) {
        if (this.activePartials.has(sp)) {
            this.log.appendLine(`Navigated to ${this.activePartials.get(sp)}`);
            return new Location(this.activePartials.get(sp), new Position(0, 0));
        }
        return null;
    }

    provideDefinition(document: TextDocument, position: Position, token: CancellationToken): Location | Location[] | Thenable<Location | Location[]> {
        let renderPartialPattern = /(?:RenderPartial\(\")([^"]+)(\")/i;
        let selectedRange = document.getWordRangeAtPosition(position, renderPartialPattern);
        if (selectedRange && !selectedRange.isEmpty) {
            let selection = (renderPartialPattern.exec(document.getText(selectedRange))[1]).toLowerCase();

            if (!selection) {
                this.log.appendLine("document not parsed");
                return null;
            }
            let sourceFolder = workspace.getWorkspaceFolder(document.uri).uri.path;
            let relativePath = document.uri.path.replace(/(.*)(?:\.aspx|\.ascx|\.master)$/, "$1").replace(`${sourceFolder}/`, "").toLowerCase() || '';

            let pathTry: Location = null;

            // If it is a specific RESS view, try specific suffixes in local, shared order ahead of the general ones
            if (path.extname(relativePath) && path.extname(relativePath) !== '.') {
                this.log.appendLine(`Relative path for view is ${relativePath} ||  Will try extension ${path.extname(relativePath)}`);
                pathTry = this.tryFetchPath(`${path.dirname(relativePath)}/${selection}${path.extname(relativePath)}.ascx`);
                if (pathTry) {
                    return pathTry;
                }

                for (let p of this.SharedPaths) {
                    pathTry = this.tryFetchPath(`${p.toLowerCase()}/${selection}${path.extname(relativePath)}.ascx`);
                    if (pathTry) {
                        return pathTry;
                    }
                }
            }

            // try the local path
            pathTry = this.tryFetchPath(`${path.dirname(relativePath)}/${selection}.ascx`);
            if (pathTry) {
                return pathTry;
            }

            for (let p of this.SharedPaths) {
                pathTry = this.tryFetchPath(`${p.toLowerCase()}/${selection}.ascx`);
                if (pathTry) {
                    return pathTry;
                }
            }
        }
        return null;
    }
}