import {DefinitionProvider, TextDocument, Position, CancellationToken, Location, Uri, window, StatusBarAlignment, OutputChannel, StatusBarItem, WorkspaceConfiguration, workspace} from "vscode";
import * as path from 'path';

export default class AspxDefinitionProvider implements DefinitionProvider {
    resultChain: Thenable<Location>;

    SharedPaths: string[];

    readonly log: OutputChannel;

    status: StatusBarItem;

    config: WorkspaceConfiguration;

    constructor(log: OutputChannel, config: WorkspaceConfiguration) {
        this.SharedPaths = config.has("sharedPaths") ? config.get<string[]>("sharedPaths") : ['Views/Shared'];
        this.log = log;
        this.config = config;
    }

    provideDefinition(document: TextDocument, position: Position, token: CancellationToken): Location | Location[] | Thenable<Location | Location[]> {
        let renderPartialPattern = /(?:RenderPartial\(\")([\w\/~]+)(\")/i;
        let selectedRange = document.getWordRangeAtPosition(position, renderPartialPattern);
        if (selectedRange && !selectedRange.isEmpty) {
            let selection = renderPartialPattern.exec(document.getText(selectedRange))[1];
            
            if (!selection) {
                return null;
            }
            let localPath = path.dirname(workspace.asRelativePath(document.uri, true)).split(path.sep);
            
            let searchPaths: string[] = [];
            searchPaths.push(`${localPath.join('/')}/${selection}.ascx`);
            this.log.appendLine(`Searching ${localPath.join('/')}/${selection}.ascx`);
            
            for (let p of this.SharedPaths) {
                this.log.appendLine(`Searching ${p}/${selection}.ascx`);
                searchPaths.push(`${p}/${selection}.ascx`);
            }
            let resultChain: Thenable<Location> = null;

            for (let res of searchPaths) {
                if (!resultChain) {
                    resultChain = this.searchPath(res);
                } else {
                    resultChain = resultChain.then((r) => {
                        if (r && r.uri.path) {
                            return r;
                        }
                        return this.searchPath(res);
                    });
                }
            }

            return resultChain;
        }
        return null;
    }

    searchPath(pathString: string) {
        return workspace.findFiles(pathString, null, 1).then(
            (result) => {
                if (result && result[0]) {
                    this.log.appendLine(`Found match at ${result[0].path}`);
                    return new Location(result[0], new Position(0, 0));
                }
                return null;
            });
    }
}