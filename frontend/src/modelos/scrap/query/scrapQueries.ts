import type {
    IScrap, IPartialScrap
} from "../../../interfaces/Scrap";
import {
    setError,
    clearError,
} from "../../../store/slicer/errorSlicer";
import type {
    AppDispatchRedux
} from "../../../store/store";

const API_URL =
    "http://localhost:3003/inventories/scrap";

const fetchScrapFromDB = async (
    dispatch: AppDispatchRedux
): Promise<IScrap[]> => {
    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
            const errorText = await response.json();
            console.log(errorText)
            if (response.status >= 500) {
                throw new Error(
                    `${errorText}`
                );
            }
            dispatch(
                setError({
                    key: "fetchScrapFromDB",
                    message: errorText
                })
            );
            return [];
        }
        dispatch(
            clearError("fetchScrapFromDB")
        );
        const data: IScrap[] = await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
};


const fetchScrapById = async (
    id: number,
    dispatch: AppDispatchRedux
): Promise<IScrap | null> => {
    try {
        const response = await fetch(`${API_URL}/id/${id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
            const errorText = await response.json();
            console.log(errorText)
            if (response.status >= 500) {
                throw new Error(
                    `${errorText}`
                );
            }
            dispatch(
                setError({
                    key: "fetchScrapById",
                    message: errorText
                })
            );
            return null;
        }
        dispatch(
            clearError("fetchScrapById")
        );
        const data: IScrap = await response.json();
        return data;
    } catch (error: unknown) {
        throw error;
    }
}


const createScrapInDB = async (
    data: IPartialScrap,
    dispatch: AppDispatchRedux
): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorText = await response.json();
            if (response.status >= 500) {
                throw new Error(errorText);
            }
            console.log(errorText);
            dispatch(
                setError({
                    key: "createScrapInDB",
                    message: errorText
                })
            );
            return null;
        }
        dispatch(
            clearError("createScrapInDB")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};


const updateScrapInDB = async (
    id: number,
    data: IPartialScrap,
    dispatch: AppDispatchRedux
): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorText =
                await response.json();
            console.log(errorText);
            if (response.status >= 500) {
                throw new Error(errorText);
            }
            dispatch(
                setError({
                    key: "updateScrapInDB",
                    message: errorText
                })
            );
            return null;
        }
        dispatch(
            clearError("updateScrapInDB")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {
        throw error;
    }
};


const deleteScrapInDB = async (
    id: number,
    dispatch: AppDispatchRedux
): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            const errorText = await response.json();
            dispatch(
                setError({
                    key: "deleteScrapInDB",
                    message: errorText
                })
            );
            if (response.status >= 500) {
                throw new Error(
                    `${errorText}`
                );
            }
            return null;
        }

        dispatch(
            clearError("deleteScrapInDB")
        );
        const result = await response.json();
        return result;
    } catch (error: unknown) {

        throw error;
    }
};

export {
    fetchScrapFromDB,
    createScrapInDB,
    updateScrapInDB,
    deleteScrapInDB,
};
