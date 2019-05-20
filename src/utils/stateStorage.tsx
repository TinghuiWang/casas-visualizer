/**
 * loadState
 * 
 * Load app state for redux store from localStorage.
 * If app state is not found in the localStorage, `undefined` has to be
 * returned so that the initial value in will be used in the reducers.
 */
export const loadState = () => {
  try {
      const serializedState = localStorage.getItem('state');
      if(serializedState === null) {
          return undefined;
      }
      return JSON.parse(serializedState);
  } catch (err) {
      console.log('App state is not found in local storage.');
      return undefined;
  }
}

export const saveState = (state: object) => {
  try {
      const serializedState = JSON.stringify(state);
      localStorage.setItem('state', serializedState);
  } catch (err) {
      console.log('Exception caught while saving app state to local storage');
      console.log(err);
  }
}
