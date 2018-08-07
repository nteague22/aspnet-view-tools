import * as vscode from 'vscode';
import * as path from 'path';

export const AspxRegex = /\.(as[pc]x|master)$/;

export const RazorRegex = /\.(cshtml|vbhtml)$/;

export class FileFinderService {

    readonly SharedPaths: string[];
    readonly ViewContainer: string;

    readonly Config: vscode.WorkspaceConfiguration;

    constructor() {
        this.Config = vscode.workspace.getConfiguration('aspnet-view-tools');
        
        this.ViewContainer = this.Config.has('ViewContainer') ? this.Config.get<string>('ViewContainer') : 'Views';
        this.SharedPaths = this.Config.has('SharedPaths') ? this.Config.get<string[]>('SharedPaths') : ['Shared'];
    }

    /**
     * Gets the test path resolved from the given items with the matched extension of the source file
     */
    getTestPath(sourceFile: vscode.TextDocument, targetPath: string): Thenable<vscode.Uri[]> {
        let extTarget = path.extname(sourceFile.fileName);
        
        if (!AspxRegex.test(extTarget) && !RazorRegex.test(extTarget)) {
            // Unknown extension
            return null;
        }

        if (AspxRegex.test(extTarget)) {
            extTarget = '.ascx';
        }

        // So the extension is either now an ascx, or whichever razor prefix it started as

        let testTarget = `${targetPath}.${extTarget}`;

        let paths: string[] = [];
        let sourcePath = `${vscode.workspace.asRelativePath(path.dirname(sourceFile.fileName), false)}`;
        let sourceToken = new vscode.CancellationTokenSource();

        paths.push(sourcePath);
        for (let x of this.SharedPaths) {
            paths.push(`${this.ViewContainer}/${x}`);
        }
        
        return vscode.workspace.findFiles({
                base: `${this.ViewContainer}/*`,
                pattern: `{${sourcePath}|${this.SharedPaths.join("|")}}/${testTarget}`
             }, null, 1, sourceToken.token);
    }
}