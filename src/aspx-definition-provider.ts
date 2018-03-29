import {DefinitionProvider, TextDocument, Position, CancellationToken, Location, workspace, Uri} from "vscode";
import * as path from 'path';

export const renderPartialPattern = /Html\.RenderPartial\(\"([A-Za-z0-9-_\/]+)\"[,\s\S]*\)/;
export default class AspxDefinitionProvider implements DefinitionProvider {
    SharedPaths: string[];
    resultChain: Thenable<Location>;

    provideDefinition(document: TextDocument, position: Position, token: CancellationToken): Location | Location[] | Thenable<Location | Location[]> {
        let selectedRange = document.getWordRangeAtPosition(position, renderPartialPattern/*/\"[A-Za-z0-9-_\/]+\"/*/);
        if (selectedRange && !selectedRange.isEmpty) {
            let selection = renderPartialPattern.exec(document.getText(selectedRange));
            if (!selection) {
                return null;
            }
            
            let baseFolder = workspace.getWorkspaceFolder(document.uri);
            let config = workspace.getConfiguration('aspnetViews');
            this.SharedPaths = config.has('sharedPaths') ? config.get<string[]>('sharedPaths') : ['Views/Shared'];
            let localPath = workspace.asRelativePath(document.uri).split(path.sep);
            localPath.pop();
            let resultLocation = null;
            let fileQuery = `${baseFolder.name}/${localPath.join('/')}/${selection[1]}.ascx`;
            this.resultChain = workspace.findFiles(fileQuery, null, 1).then(
                (result) => {
                    if (result && result) return new Location(result[0], new Position(0, 0));
                
                    for (let x of this.SharedPaths) {
                        this.resultChain = this.tryNextPath(`${x}/${selection[1]}.ascx`, this.resultChain);
                    }                    
                });
            return this.resultChain;
        }
        return null;
    }

    tryNextPath(path: string, currentResult: Thenable<Location>): Thenable<Location> {
        return currentResult.then((res)=> {
            // As soon as a valid path is cleared, will bubble up solution without executing recursive checks
            if (res && res.uri) {
                return res;
            }

            let query = `${workspace.name}/${path}`;
            return workspace.findFiles(query, null, 1).then((results) => {
                return new Location(results[0], new Position(0, 0));
            });
        });
    }
}