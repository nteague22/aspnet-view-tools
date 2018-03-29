'use strict';
import * as vscode from 'vscode';
import { DefinitionRequest, Definition } from "vscode-languageclient";
import { RenderDefinitionProvider } from './definition-provider';
import AspxDefinitionProvider from './aspx-definition-provider';
const razor_file: vscode.DocumentFilter = { language: 'razor', scheme: 'file' };
const aspx_file: vscode.DocumentFilter = { language: 'aspx', scheme: 'file' };
// this method is called when your extension is activated

export function activate(context: vscode.ExtensionContext) {
    const log = vscode.window.createOutputChannel("ASP.Net Lookups");

    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider(razor_file, new RenderDefinitionProvider(log)),
        vscode.languages.registerDefinitionProvider(aspx_file, new AspxDefinitionProvider(log))
    );
    

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "razor-lang" is now active!');
}

// this method is called when your extension is deactivated
export function deactivate() {
}