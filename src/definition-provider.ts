import { DefinitionProvider, TextDocument, Position, CancellationToken, Location } from "vscode";
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class RenderDefinitionProvider implements DefinitionProvider {
    provideDefinition(document: TextDocument, position: Position, token: CancellationToken): Location | Location[] | Thenable<Location | Location[]> {
        // Get context range for selected text for lookup
        let pathRange = document.getWordRangeAtPosition(position, /RenderPartial\(\"([A-Za-z\.-_]+)\"\)/);
        
        // set baseline root
        const baseline = path.resolve(__dirname, 'Views');
        
        
        // Eventual target
        let target = document.getText(pathRange);
        
        let chunks = target.split('/').filter((item) => item !== '~' && item !== '..');
        
        // Consume local source point, minus baseline for source directory        
        let container = path.dirname(document.fileName);
        
        let result = this.checkPath(container, chunks.join('/'));

        if (result) {
            return result;
        }
        
        // If the source point is not the Shared directory, also place that for fallback
        let fallback = (container.length && !(/^[Ss]hared$/.test(container[0])) && ['Shared', container]) || [];
        
        return this.checkPath(...fallback);
    }

    checkPath(...items: string[]) {
        if(fs.existsSync(path.resolve(...items))) {
            return new vscode.Location(
                        vscode.Uri.parse(path.resolve(items.join('/'))),
                        new vscode.Position(0, 0));
        }
        return null;
    }

    recursePath(containerPath: string[], pathItems: string[]) {
        let current = pathItems.pop();
        if (current && containerPath.indexOf(current) === -1) {
            containerPath.push(current);
            this.recursePath(containerPath, pathItems);
        }
    }
}