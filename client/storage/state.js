// Action Type
const SET_STRING = "SET_STRING"

// Action Creator
export const setString = (string) => ({
	type: SET_STRING,
	payload: string,
})

// Initial State
const initialState = {
	string: "",
}

// Reducer
export const stringReducer = (state = initialState, action) => {
	switch (action.type) {
		case SET_STRING:
			return { ...state, string: action.payload }
		default:
			return state
	}
}
