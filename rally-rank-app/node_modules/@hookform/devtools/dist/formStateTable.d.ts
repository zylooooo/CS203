declare type Props = {
    formState: any;
    showFormState: boolean;
    setShowFormState: (payload: boolean) => void;
};
declare const FormStateTable: ({ formState, showFormState, setShowFormState, }: Props) => JSX.Element;
export default FormStateTable;
