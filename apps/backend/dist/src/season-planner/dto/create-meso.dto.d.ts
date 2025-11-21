export declare class CreateMesoDto {
    macroId: string;
    startWeek: number;
    endWeek: number;
    goal: string;
    intensityJson: {
        physical: number;
        technical: number;
        tactical: number;
    };
}
