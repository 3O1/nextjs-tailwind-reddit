import { createContext, useContext, useReducer } from "react";
import { User } from "../types";

/**
 * Storing authenticated & user
 */
interface State {
  authenticated: boolean;
  user: User | undefined;
}

/**
 * @param payload: any to prevent problems with type-checking
 */
interface Action {
  type: string;
  payload: any;
}

const StateContext = createContext<State>({
  authenticated: false,
  user: null,
});

const DispatchContext = createContext(null);

/**
 * Reducer
 *
 * Tells the context what to do when we dispatch any actions.
 * Takes in a state
 *
 * @param state the state interface
 * @param { type, payload:any } Action (destructured)
 *
 * Switches on the type of action
 *
 */
const reducer = (state: State, { type, payload }: Action) => {
  switch (type) {
    /**
     * mutates the state and spreads it
     *  - good practice & to not mutate the rest of the fields you don't want to modify
     *
     * Authenticated is set to true
     * Sets the user from the payload we're receiving
     */
    case "LOGIN":
      return {
        ...state,
        authenticated: true,
        user: payload,
      };
    /**
     * Reverse of LOGIN - reverting back to the default state
     *
     * Spread the state
     * Set authenticated to false
     * Set the user to null
     */
    case "LOGOUT":
      return {
        ...state,
        authenticated: false,
        user: null,
      };

    /**
     * when an action is dispatched, will see an error
     * @throws Unknown action type
     */
    default:
      throw new Error(`Unkown action type: ${type}`);
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  /**
   * Call the useReducer hook
   */

  const [state, dispatch] = useReducer(reducer, {
    user: null,
    authenticated: false,
  });

  return (
    <DispatchContext.Provider value={dispatch}>
      <StateContext.Provider value={state}>{children}</StateContext.Provider>
    </DispatchContext.Provider>
  );
};

export const useAuthState = () => useContext(StateContext);
export const useAuthDispatch = () => useContext(DispatchContext);
