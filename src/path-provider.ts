import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export interface IPathProviderOptions {
    SharedPath: string;
    ViewContainer: string;
}

export default class PathProvider {
    readonly isSharedPath: boolean;
    readonly SharedPath: string;
    readonly ViewContainer: string;
    readonly source: string[];
    readonly ext: string;
    target: string;

    constructor(sourceFile: string, target: string, options?: IPathProviderOptions) {
        this.ViewContainer = 'Views';
        this.SharedPath = 'Shared';
        if (options) {
            this.ViewContainer = options.ViewContainer || this.ViewContainer;
            this.SharedPath = options.SharedPath || this.SharedPath;
        }

        let sourceChunks = path.dirname(sourceFile).split(path.sep);
        this.source = sourceChunks;
        this.ext = path.extname(sourceFile);
        this.isSharedPath = this.source.indexOf(this.SharedPath) > -1;
        this.target = target;
    }

    /**
     * Gets the test path resolved from the given items with the matched extension of the source file
     */
    getTestPath() {
        let temp = path.resolve(this.source.join('/'), `${this.target}${this.ext}`);
        
        if (!this.isSharedPath && !fs.existsSync(temp)) {
            let alternate = this.source.map((item, indx) => {
                if (item === this.ViewContainer) {
                    return `${this.ViewContainer}/${this.SharedPath}`;
                }
                return item;
            });
            temp = path.resolve(alternate.join('/'), `${this.target}${this.ext}`);            
        }
        return fs.existsSync(temp) && temp || '';
    }
}