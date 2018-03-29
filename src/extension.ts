'use strict';
import * as vscode from 'vscode';
import RazorDefinitionProvider from './razor-definition-provider';
import AspxDefinitionProvider from './aspx-definition-provider';
const razor_file: vscode.DocumentFilter = { language: 'razor', scheme: 'file' };
const aspx_file: vscode.DocumentFilter = { language: 'aspx', scheme: 'file' };
// this method is called when your extension is activated

export function activate(context: vscode.ExtensionContext) {
    const log = vscode.window.createOutputChannel("ASP.Net View Tools");
    context.subscriptions.push(
        log,
        vscode.languages.registerDefinitionProvider(razor_file, new RazorDefinitionProvider(log)),
        vscode.languages.registerDefinitionProvider(aspx_file, new AspxDefinitionProvider(log))
    );
}

// this method is called when your extension is deactivated
export function deactivate() {
}