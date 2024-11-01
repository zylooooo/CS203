import { StateMachineOptions, GlobalState, AnyCallback, AnyActions, ActionsOutput } from './types';
export declare function createStore(defaultState: GlobalState, options?: StateMachineOptions): void;
export declare function useStateMachine<TCallback extends AnyCallback, TActions extends AnyActions<TCallback>>(actions?: TActions): {
    actions: ActionsOutput<TCallback, TActions>;
    state: GlobalState;
    getState: () => GlobalState;
};
