export type Section = {
    title: string;
    photos: Array<Photo>;
};

export type Photo = {
    id: string;
    title: string;
    width: number;
    height: number;
    lqip?: string;
    extension: string;
    column: number;
};
