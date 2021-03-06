export interface LogInterface {
    evacuationId: string;
    creationDate: string;
    barCode: string;
    logging: string;
    indicator: string;
    id: string;
    gasoline: string;
    dgb: number;
    dpb: number;
    diameter: number;
    volume: number;
    lengthVal: number;
    quality: string;
    status: string;
    statusPattern: string;
    comment?: string;
}

export interface LogDetailsInterface {
    gasName: string;
    gasCode: string;
    evacuationId: string;
    creationDate: string;
    barCode: string;
    logging: string;
    lengthVal: number;
    indicator: number;
    id: string;
    dgb: number;
    dpb: number;
    diameter: number;
    volume: number;
    quality: string;
    status: string;
    statusPattern: string;
    comment: string;
}
