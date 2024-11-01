declare type Props = {
    isNative: boolean;
    errorMessage: string | undefined;
    errorType: string | undefined;
    hasError: boolean;
    type: string | undefined;
    isTouched: boolean;
    isDirty: boolean;
    index: number;
    fieldsValues: any;
    name: string;
    collapseAll: boolean;
    refObject: any;
};
declare const PanelTable: ({ refObject, hasError, isDirty, fieldsValues, isNative, errorMessage, errorType, type, isTouched, name, collapseAll, }: Props) => JSX.Element;
export default PanelTable;
