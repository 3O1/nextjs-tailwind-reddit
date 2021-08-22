import Axios from "axios";
import { createContext, useContext, useEffect, useReducer } from "react";
import { User } from "../types";

/**
 * Storing authenticated & user
 */
interface State {
  authenticated: boolean;
  user: User | undefined;
  loading: boolean;
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
  loading: true,
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

    case "STOP_LOADING":
      return {
        ...state,
        loading: false,
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

  /**
   * If loading -> don't show buttons
   * If false -> done loading & check auth to show which buttons
   */
  const [state, defaultDispatch] = useReducer(reducer, {
    user: null,
    authenticated: false,
    loading: true,
  });

  /**
   * calls the default dispatch
   *  - saves the hassle of passing an object
   *
   */
  const dispatch = (type: string, payload?: any) =>
    defaultDispatch({ type, payload });

  /** Fetch user data on load
   *
   * Declare and call function loadUser()
   */
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await Axios.get("/auth/me");
        dispatch("LOGIN", res.data);
      } catch (err) {
        console.log(err);
      } finally {
        dispatch("STOP_LOADING");
      }
    }
    loadUser();
    /** Pass empty array of dependencies to useEffect
     *  want to use only one in the beginning
     */
  }, []);

  return (
    <DispatchContext.Provider value={dispatch}>
      <StateContext.Provider value={state}>{children}</StateContext.Provider>
    </DispatchContext.Provider>
  );
};

export const useAuthState = () => useContext(StateContext);
export const useAuthDispatch = () => useContext(DispatchContext);
