interface IProcess {
    id: number,
    name: string,
    created_at: string,
    updated_at: string,
}

type IPartialProcess = Partial<IProcess>;

const defaultValueProcess: IProcess = {
    id: 0,
    name: '',
    created_at: '',
    updated_at: '',
};

const defaultValuePartialProcess: IPartialProcess = {
    name: '',
};

export type {
    IProcess,
    IPartialProcess,
};

export {
    defaultValueProcess,
    defaultValuePartialProcess,
};
