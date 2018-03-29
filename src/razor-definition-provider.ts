import { Uri, DefinitionProvider, TextDocument, Position, CancellationToken, Location, workspace, OutputChannel } from "vscode";
import * as path from 'path';
import * as fs from 'fs';
import PathProvider from './path-provider';

export default class RazorDefinitionProvider implements DefinitionProvider {

    pathFinder: PathProvider;

    readonly log: OutputChannel;

    constructor(logger: OutputChannel){
        this.pathFinder = null;
        this.log = logger;
    }

    provideDefinition(document: TextDocument, position: Position, token: CancellationToken): Location | Location[] | Thenable<Location | Location[]> {
        this.log.clear();
        let regExtract = /@?Html\.RenderPartial\(\"([A-Za-z\.-_\/]+)\"/;

        // Get context range for selected text for lookup        
        let pathRange = document.getWordRangeAtPosition(position, regExtract);

        if (!pathRange) {
            return null;
        }
        
        // Eventual target
        let target = document.getText(pathRange);
        
        let test = regExtract.exec(target)[1].replace('~','').replace('..','');
        
        this.pathFinder = new PathProvider(document.fileName, test);
        
        let result = this.pathFinder.getTestPath();
        let workRoot = workspace.getWorkspaceFolder(document.uri);
        let basePath = workRoot.uri.fsPath;
        if (result) {
            let parts = result.replace(basePath, '').split(path.sep);
            let uri = `${workRoot.uri}${parts.join('/')}`;
            let fs = Uri.parse(uri);
            return new Location(fs, new Position(0, 0));
        }
    }
}