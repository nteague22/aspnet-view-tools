import * as vscode from 'vscode';
import * as path from 'path';
import { OutputChannel, WorkspaceConfiguration, workspace, Position, Uri, DocumentLink, Range, Location } from 'vscode';
import { inspect } from 'util';

export class MetadataDefinitionLink {
    private filePosition: Location;

    name: string;

    constructor(itemPath: Uri, name: string, position?: Position, range?: Range, lineNumber?: number) {
        let source = itemPath;
        this.filePosition = new Location(source, (position || range || new Position(lineNumber, 0)));
        this.name = name;
    }

    /**
     * Gets the location this item is defined at
     */
    getLocation(): Location {
        return this.filePosition;
    }

    getLineNumber(): number {
        return this.filePosition.range.start.line;
    }
}

export default class AspxDefinitionHtmlhelpers implements vscode.DefinitionProvider {
    definitions: MetadataDefinitionLink[];

    output: OutputChannel;

    configuration: WorkspaceConfiguration;

    sources: Uri[];

    methodPattern = /(?:Html\.)([A-Za-z]+)/i;

    provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Definition> {
        let methodTarget = document.getWordRangeAtPosition(position, this.methodPattern);
        if (methodTarget) {
            this.output.appendLine(`The targeted text captured: ${document.getText(methodTarget)}`);
            if (this.methodPattern.test(document.getText(methodTarget))) {
                let extracted = this.methodPattern.exec(document.getText(methodTarget))[1];
                if (/(?!renderpartial)/i.test(extracted)) {
                    this.output.appendLine(`Targeting the extension method ${extracted}`);
                    return this.definitions.filter(d => d.name === extracted).map(d0 => d0.getLocation());
                }
            }
        }
        return null;
    }

    constructor(log: OutputChannel, config: WorkspaceConfiguration, defs: MetadataDefinitionLink[]) {
        this.output = log;
        this.configuration = config;
        this.definitions = defs;
    }
}