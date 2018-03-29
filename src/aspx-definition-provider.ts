import {DefinitionProvider, TextDocument, Position, CancellationToken, Location, workspace, Uri, window, StatusBarAlignment, OutputChannel, StatusBarItem} from "vscode";
import * as path from 'path';

export const renderPartialPattern = /Html\.RenderPartial\(\"([A-Za-z0-9-_]+[A-Za-z0-9-_\/]*)\".*\)/i;

export default class AspxDefinitionProvider implements DefinitionProvider {
    SharedPaths: string[];

    readonly log: OutputChannel;

    readonly status: StatusBarItem;

    constructor(log: OutputChannel) {
        this.SharedPaths = ['Views/Shared'];
        this.log = log;
        this.status = window.createStatusBarItem(StatusBarAlignment.Right, -1);
    }

    provideDefinition(document: TextDocument, position: Position, token: CancellationToken): Location | Location[] | Thenable<Location | Location[]> {
        this.status.text = "$(zap) Parsing Request";
        this.log.appendLine('Parsing Request');
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
            this.log.appendLine(`The local path chunks to start from: ${JSON.stringify(localPathChunks)}`);
            
            this.log.appendLine(`Searching for ${basePath}/${localPathChunks.join('/')}/${selection[1]}.ascx`);
            return workspace.findFiles(`${basePath}/${localPathChunks.join('/')}/${selection[1]}.ascx`, null, 1).then(
                (result) => {
                    if (result && result[0]) {
                        this.log.appendLine(result[0].path);
                        return new Location(result[0], new Position(0, 0));
                    }
                    this.log.appendLine('Not found');
                    return null;
                }).then((local) => {
                    if (local) {
                        return local;
                    }
                    this.log.appendLine('Now attempting the shared paths');
                    let results: Location[] = [];
                    return workspace.findFiles(`**/${selection[1]}.ascx`, null, 1).then(
                        (allResults) => {
                            if (!allResults) {
                                this.log.appendLine('Found no related shared path items');
                                return null;
                            }
                            this.log.appendLine(`Total project find produced: ${JSON.stringify(allResults)}`);
                            return allResults.filter((res) => {
                                let relative = workspace.asRelativePath(res);
                                let pathExists = this.SharedPaths.filter((p) => res && res.path.indexOf(`${basePath}/${p}`));
                                this.log.appendLine(`Matched paths to given shared paths: ${JSON.stringify(pathExists)}`);
                                return pathExists.length;
                            }).map((match) => {
                                    return new Location(match, new Position(0, 0));
                                })[0];
                    });
            });
        }
        return null;
    }
}