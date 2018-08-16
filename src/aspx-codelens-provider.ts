// import * as vscode from 'vscode';
// import { CodeLensProvider, WorkspaceConfiguration, TextDocument, CancellationToken, ProviderResult, CodeLens, Event, Range, Position, OutputChannel } from 'vscode';

// export default class AspxCodelensProvider implements CodeLensProvider {
    
//     constructor(log: OutputChannel, conf: WorkspaceConfiguration) {
//         this.configuration = conf;
//         this.outputLog = log;
//     }

//     configuration: WorkspaceConfiguration;
//     onDidChangeCodeLenses?: Event<void>;
//     outputLog: vscode.OutputChannel;
//     provideCodeLenses(document: TextDocument, token: CancellationToken): ProviderResult<CodeLens[]> {
//         return this.captureViewReferences(document).map(r => new CodeLens(r));
//     }

//     resolveCodeLens?(codeLens: CodeLens, token: CancellationToken): ProviderResult<CodeLens> {
//         throw new Error("Method not implemented.");
//     }

//     captureViewReferences(document: TextDocument): Range[] {
//         const partialTest = /RenderPartial\("([A-Za-z\/]+)"/ig;
//         let references: Range[] = [];
//         for (let l of [0, document.lineCount - 1]) {
//             if (!document.lineAt(l).isEmptyOrWhitespace) {
//                 let results = partialTest.exec(document.lineAt(l).text);
//                 for (let match of results) {
//                     let startpos = new Position(l, results.index);
//                     let endpos = new Position(l, match.length-1);
//                     references.push(document.lineAt(l).range.with(startpos, endpos));
//                 }
//             }
//         }
//         return references;
//     }
// }