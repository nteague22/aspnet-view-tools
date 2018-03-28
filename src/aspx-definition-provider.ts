import { DefinitionProvider, TextDocument, Position, Location } from "vscode";
import { CancellationToken } from "vscode-jsonrpc";
import { FileFinderService } from "./file-finder-service";

export const partialPattern = /Html\.RenderPartial\(\"([A-Za-z0-9-_\/]+)\"[,\s\S]*\)/;
export class AspxDefinitionProvider implements DefinitionProvider {

    fileService: FileFinderService;

    

    constructor() {
        this.fileService = new FileFinderService();
    }
    provideDefinition(document: TextDocument, position: Position, token: CancellationToken): Location | Location[] | Thenable<Location | Location[]> {

        let renderPartialTest = document.getWordRangeAtPosition(position, partialPattern);
        
        if (renderPartialTest) {
            return this.fileService.getTestPath(document, document.getText(renderPartialTest).replace('Html.RenderPartial(', ''))
                .then((results) => {
                    if (results.length) {
                        return new Location(results[1], new Position(0, 0));
                    }
                    return null;
                },
                    (reason) => {
                        return null;
                    });
        }
        return null;
    }
}