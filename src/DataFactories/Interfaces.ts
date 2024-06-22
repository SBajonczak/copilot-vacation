export interface Skill{
    Name:string 
}

export interface TenderData
{
    RequiredSkills:Skill[],
    OptionalSkills:Skill[]
    JobTitle:string,
    Duration:number,
    Location: string
}


export interface SapSkill {
    name: string,
    proficiency: string;
    yearsOfExperience: number;
}

export interface PersonalInformation {
    Firstname: string,
    EMail:string,
    FullName: string
    Availbility:number,
    LastUpdate:Date,
    LastName: string,
    ImageLocation:string
    Cv: string,
    SkillsMatches: SapSkill[]
}

export interface HourlyRate {
    ProjectName:string,
    HourlyRate: number
}
