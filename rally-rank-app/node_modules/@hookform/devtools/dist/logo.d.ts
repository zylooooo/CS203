declare const Logo: ({ style, actions, }: {
    style?: Record<string, any> | undefined;
    actions: {
        setVisible: (arg: boolean) => void;
    };
}) => JSX.Element;
export default Logo;
