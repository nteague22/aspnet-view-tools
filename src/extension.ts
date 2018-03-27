'use strict';
import * as vscode from 'vscode';
import { DefinitionRequest, Definition } from "vscode-languageclient";
import { RenderDefinitionProvider } from './definition-provider';
const razor_file: vscode.DocumentFilter = { language: 'razor', scheme: 'file' };
// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
    
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "razor-lsp" is now active!');

    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider(razor_file, new RenderDefinitionProvider()));
}

// this method is called when your extension is deactivated
export function deactivate() {
}