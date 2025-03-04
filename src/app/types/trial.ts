export interface Trial {
    nctId: string;
    title: string;
    conditions: Array<string>;
    conditionKeywords: Array<string>;
    phase: string;
    locations: Array<any>;
    startDate: string;
    status: string;
    participants: string;
    description: string;
    eligibilityCriteria: string;
    sex: string;
    minimumAge: string;
    maximumAge: string;
    
}