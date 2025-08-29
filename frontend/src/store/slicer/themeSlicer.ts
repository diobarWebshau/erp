import { createSlice }
    from "@reduxjs/toolkit";

interface Theme {
    theme: "dark" | "light"
}

const DefaultTheme: Theme = {
    theme: "light"
}

const themeSlice = createSlice({
    name: "theme",
    initialState: DefaultTheme,
    reducers: {
        toggleTheme: (state) => {
            (state.theme !== "dark")
                ? state.theme = "dark"
                : state.theme = "light"
        }
    }
});

export const {toggleTheme} = themeSlice.actions; 

export default themeSlice