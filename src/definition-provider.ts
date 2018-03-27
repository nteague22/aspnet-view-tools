import { Uri, DefinitionProvider, TextDocument, Position, CancellationToken, Location } from "vscode";
import * as path from 'path';
import * as fs from 'fs';
import PathProvider from './path-provider';

export class RenderDefinitionProvider implements DefinitionProvider {

    pathFinder: PathProvider;

    constructor(){
        this.pathFinder = null;
    }

    provideDefinition(document: TextDocument, position: Position, token: CancellationToken): Location | Location[] | Thenable<Location | Location[]> {
        
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

        if (this.pathFinder.getTestPath()) {
            return new Location(
                Uri.parse(this.pathFinder.getTestPath()),
                    new Position(0, 0));
        }        
    }

    recursePath(containerPath: string[], pathItems: string[]) {
        let current = pathItems.pop();
        if (current && containerPath.indexOf(current) === -1) {
            containerPath.push(current);
            this.recursePath(containerPath, pathItems);
        }
    }
}