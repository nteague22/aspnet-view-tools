import {DefinitionProvider, TextDocument, Position, CancellationToken, Location, workspace, Uri, window, StatusBarAlignment, OutputChannel, StatusBarItem} from "vscode";
import * as path from 'path';

export const renderPartialPattern = /Html\.RenderPartial\(\"([A-Za-z0-9-_]+[A-Za-z0-9-_\/]*)\".*\)/i;

export default class AspxDefinitionProvider implements DefinitionProvider {
    SharedPaths: string[];

    readonly log: OutputChannel;

    status: StatusBarItem;

    constructor(log: OutputChannel) {
        this.SharedPaths = ['Views/Shared'];
        this.log = log;
        this.status = window.createStatusBarItem(StatusBarAlignment.Right, -1);
    }

    provideDefinition(document: TextDocument, position: Position, token: CancellationToken): Location | Location[] | Thenable<Location | Location[]> {
        this.log.clear();
        this.status.text = "$(zap) Parsing Request";
        let selectedRange = document.getWordRangeAtPosition(position, renderPartialPattern/*/\"[A-Za-z0-9-_\/]+\"/*/);
        this.log.appendLine(`matched ${selectedRange.start.character} to ${selectedRange.end.character} in ${document.uri.path}`);
        if (selectedRange && !selectedRange.isEmpty) {
            let selection = renderPartialPattern.exec(document.getText(selectedRange));
            this.log.appendLine(`Yielded path of ${selection[1]}`);
            if (!selection) {
                return null;
            }
            
            let baseFolder = workspace.getWorkspaceFolder(document.uri);
            this.log.appendLine(`found workspace folder as ${baseFolder.uri}`);

            let basePath: string = baseFolder.uri.fsPath.indexOf(baseFolder.name) > -1 ? baseFolder.name : baseFolder.uri.path.split('/').reverse().pop();
            this.log.appendLine(`found base path to be ${basePath}`);

            //let config = workspace.getConfiguration('aspnetViews');
            // console.log(config);
            /* if(config && config.has('sharedPaths')) this.SharedPaths = config.get<string[]>('sharedPaths'); */
            let localPath = workspace.asRelativePath(document.uri);
            this.log.appendLine(`The requesting document relative path: ${localPath}`);
            let localPathChunks = localPath.split(path.sep);
            localPathChunks.pop();
            
            let searchPaths: string[] = [];
            searchPaths.push(`${localPathChunks.join('/')}/${selection[1]}.ascx`);
            this.log.appendLine(`Searching ${localPathChunks.join('/')}/${selection[1]}.ascx`);
            
            for (let p of this.SharedPaths) {
                this.log.appendLine(`Searching ${p}/${selection[1]}.ascx`);
                searchPaths.push(`${p}/${selection[1]}.ascx`);
            }
            let resultChain: Thenable<Location> = null;

            for (let res of searchPaths) {
                if (!resultChain) {
                    resultChain = this.searchPath(res)
                } else {
                    resultChain = resultChain.then((r) => {
                        if (r && r.uri.path) {
                            return r;
                        }
                        return this.searchPath(res)
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