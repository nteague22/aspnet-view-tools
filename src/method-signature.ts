import { ItemSignature, ItemType } from "./item-signature";

export class MethodSignature implements ItemSignature {
    readonly type: ItemType = ItemType.Method;
    name: string;
    namespace: string;

    directoryNamespace: string;

    parameters: ItemSignature[];

    constructor(name: string, params?: string[], namespaceMap?: string) {
        let matcher = /([A-Za-z\.]*)\.?([A-Za-z]+)$/i.exec(name);
        if (matcher && matcher.length === 2) {
            this.namespace = matcher[1];
            this.name = matcher[2];
        }

        if (matcher && matcher.length === 1) {
            this.name = matcher[1];
        }

        this.directoryNamespace = namespaceMap || this.namespace;

        if(params) {
            this.parameters = params.map(p => new ParameterSignature(p));
        }
    }

    buildPattern(): RegExp {
        let basePattern = `(?:Public\sFunction\s)${this.namespace.replace('.', '\.')}\.${this.name}\(${this.parameters.map(p => p.buildPattern()).join(" ")}\)`;
        return new RegExp(basePattern, 'i');
    }
}

export class ParameterSignature implements ItemSignature {
    readonly type: ItemType = ItemType.Type;
    name: string;
    namespace: string;

    instanceName: string;

    constructor(paramText: string) {
        let matcher = /([A-Za-z\.]*)\.?([A-Za-z]+)$/i.exec(paramText);
    }

    buildPattern(): RegExp {
        let pattern = this.instanceName && `(ByVal|ByRef) ${this.instanceName}` || `\w+`;
        let output = `${pattern} As ${this.namespace.replace(".", "\.")}\.${this.name},?`;
        return new RegExp(output);
    }
}