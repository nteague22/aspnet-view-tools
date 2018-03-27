import * as path from 'path';
import * as fs from 'fs';

export class PathComparison {
    readonly isSharedPath: boolean;
    readonly baseline: string;
    readonly source: string;
    readonly ext: string;
    target: string;

    constructor(sourceFile: string, ...chunks) {
        this.baseline = path.resolve(__dirname, 'Views');
        this.source = path.dirname(sourceFile);
        this.ext = path.extname(sourceFile);
        this.isSharedPath = /[Ss]hared/.test(this.source.replace(this.baseline, '').split(path.sep)[0]);
        this.target = chunks.join('/');
    }

    /**
     * Gets the test path resolved from the given items with the matched extension of the source file
     */
    getTestPath() {
        let temp = path.resolve(this.source, this.target, this.ext);
        if (this.isSharedPath) {            
            return fs.existsSync(temp) && temp || '';
        }

        if (!fs.existsSync(temp)) {
            temp = temp.replace(this.baseline, path.resolve(this.baseline, 'Shared'));
            return fs.existsSync(temp) && temp || '';
        }
    }
}