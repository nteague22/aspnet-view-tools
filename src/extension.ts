'use strict';
import * as vscode from 'vscode';
import plist from 'plist';
import RazorDefinitionProvider from './razor-definition-provider';
import AspxDefinitionProvider from './aspx-definition-provider';
import AspxCodelensProvider from './aspx-codelens-provider';
import { Uri } from 'vscode';
const razor_file: vscode.DocumentFilter = { language: 'razor', scheme: 'file' };
const aspx_file: vscode.DocumentFilter = { language: 'aspx', scheme: 'file' };
// this method is called when your extension is activated

export const log: vscode.OutputChannel = vscode.window.createOutputChannel("ASP.Net View Tools");

export function activate(context: vscode.ExtensionContext) {
    let config = vscode.workspace.getConfiguration("aspnetViews");
    let cached: Map<string, Uri> = new Map();
    context.subscriptions.push(
        log,
        vscode.languages.registerDefinitionProvider(razor_file, new RazorDefinitionProvider(log)),
        vscode.languages.registerCodeLensProvider(aspx_file, new AspxCodelensProvider(log, config))
    );
    vscode.workspace && vscode.workspace.findFiles(`**/*.ascx`, `{**/Resources/**/*.*,**/bin/**/*.*,**/obj/**/*.*}`).then(url => {
        if (url && url.length > 0) {
            let root = vscode.workspace.workspaceFolders[0];
            url.forEach(u => {
                cached.set(vscode.workspace.asRelativePath(u, false).toLowerCase().replace(/\\/ig, '/'), u);
            });
        }
    }).then(() => {
        context.subscriptions.push(
            vscode.languages.registerDefinitionProvider(aspx_file, new AspxDefinitionProvider(log, config, cached)),
        );
        log.appendLine("View Cache Loaded");
    });
}



// this method is called when your extension is deactivated
export function deactivate() {
}