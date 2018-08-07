'use strict';
import * as vscode from 'vscode';
import plist from 'plist';
import RazorDefinitionProvider from './razor-definition-provider';
import AspxDefinitionProvider from './aspx-definition-provider';
import AspxCodelensProvider from './aspx-codelens-provider';
const razor_file: vscode.DocumentFilter = { language: 'razor', scheme: 'file' };
const aspx_file: vscode.DocumentFilter = { language: 'aspx', scheme: 'file' };
// this method is called when your extension is activated

export const log: vscode.OutputChannel = vscode.window.createOutputChannel("ASP.Net View Tools");

export function activate(context: vscode.ExtensionContext) {
    let config = vscode.workspace.getConfiguration("aspnetViews");
    context.subscriptions.push(
        log,
        vscode.languages.registerDefinitionProvider(aspx_file, new AspxDefinitionProvider(log, config)),
        vscode.languages.registerDefinitionProvider(razor_file, new RazorDefinitionProvider(log)),
        vscode.languages.registerCodeLensProvider(aspx_file, new AspxCodelensProvider(log, config))
    );
}



// this method is called when your extension is deactivated
export function deactivate() {
}