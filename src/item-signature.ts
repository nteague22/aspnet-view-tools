/**
 * An interface to an item signature from metadata
 */
export interface ItemSignature {
    /**
     * The type of the metadata item
     */
    readonly type: ItemType;

    /**
     * The name of the item
     */
    name: string;

    /**
     * The namespace of the item
     */
    namespace: string;

    /**
     * Builds a regex that can be used to pattern test in code files
     */
    buildPattern(): RegExp;
}

export enum ItemType {
    /**
     * For metadata items beginning with a T:
     */
    Type = "T",
    /**
     * For metadata items beginning with an M:
     */
    Method = "M"
}