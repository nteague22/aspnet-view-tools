'use strict';
import * as vscode from 'vscode';
import * as path from 'path';
import RazorDefinitionProvider from './razor-definition-provider';
import AspxDefinitionProvider from './aspx-definition-provider';
import { Uri, Position, TextLine } from 'vscode';
import AspxDefinitionHtmlhelpers, { MetadataDefinitionLink } from './aspx-definition-htmlhelpers';
import { inspect } from 'util';
const razor_file: vscode.DocumentFilter = { language: 'razor', scheme: 'file' };
const aspx_file: vscode.DocumentFilter = { language: 'aspx', scheme: 'file' };

const methodParameterFilter: RegExp = /([A-Za-z\.]+,?)/i;

export const log: vscode.OutputChannel = vscode.window.createOutputChannel("ASP.Net View Tools");

export function activate(context: vscode.ExtensionContext) {
    let config = vscode.workspace.getConfiguration("aspnetViews");
    let cached: Map<string, Uri> = new Map();
    let definitions: MetadataDefinitionLink[] = [];
    context.subscriptions.push(
        log,
        vscode.languages.registerDefinitionProvider(razor_file, new RazorDefinitionProvider(log))
    );
    let metaPattern = /(?:name=\"M:[\S]+\.)([A-Za-z]+)(?:\(System\.Web\.Mvc\.HtmlHelper)/i;
    Promise.all([
    vscode.workspace.findFiles(`**/*.ascx`, `{**/Resources/**/*.*,**/bin/**/*.*,**/obj/**/*.*}`).then(url => {
        if (url && url.length > 0) {
            url.forEach(u => {
                cached.set(vscode.workspace.asRelativePath(u, false).toLowerCase().replace(/\\/ig, '/'), u);
            });
        }
        log.appendLine("View Cache Loaded");
    }),
    vscode.workspace.findFiles('**/bin/**/SRE.Web.Mvc.xml').then(
            paths => {
                log.appendLine(paths.map(p => p.fsPath).join("\n"));
                paths.forEach(p => {
                    vscode.workspace.openTextDocument(p).then(doc => {
                        for (let x = 0; x < doc.lineCount; x++) {
                            let linePos = doc.lineAt(x);
                            if (!linePos.isEmptyOrWhitespace) {
                                let metaMatch = metaPattern.exec(linePos.text);
                                if (metaMatch && metaMatch.length > 0) {
                                    let itemName = metaMatch[1];
                                    let newPos = new Position(linePos.lineNumber, metaMatch.index);
                                    definitions.push(new MetadataDefinitionLink(doc.uri, itemName, newPos, doc.getWordRangeAtPosition(newPos)));
                                }
                            }
                        }
                    });
                });
                log.appendLine("Metadata Links Consumed");
            })
        ]).then(() => {
        context.subscriptions.push(
            vscode.languages.registerDefinitionProvider(aspx_file, new AspxDefinitionProvider(log, config, cached)),
            vscode.languages.registerDefinitionProvider(aspx_file, new AspxDefinitionHtmlhelpers(log, config, definitions))
        );
    });
}

export function extractSignature(line: TextLine): string[] {
    let results: string[] = [];
    if(!line.isEmptyOrWhitespace) {
        return extractParameters(line.text, results);
    }
    return results;
}

export function extractParameters(line: string, results: string[]): string[] {
    if (line) {
        let currentMatch = methodParameterFilter.exec(line);
        if(currentMatch && currentMatch.length > 0) {
            results.push(currentMatch[0]);
            let newIndx = currentMatch.index + currentMatch[0].length;
            let newSample = line.substr(newIndx);
            if (newSample) {
                return extractParameters(newSample, results);
            }
        }
    }
    return results;
}

// this method is called when your extension is deactivated
export function deactivate() {
}