import { PersonalInformation, Skill } from "./Interfaces";
import axios from 'axios';
import moment, { Moment } from "moment";
// Accessing SQL Server
import sql from 'mssql'
import { InputParameters } from "../app/PromptApp";
import config from '../config';


"EmployeeName":"Sascha Bajonczak",
"projectname":"Gebr. Heinemann",
"ProjectManager":"Christian Strebel",

export interface TaskUser {
    HourlyRate: number;
    userId: number;
    projectid: number,
    Taskname:string,
    userLogin: string;
    DisplayName: string;
    TaskId: number;
    Title: string;
    Start: Date;               
    End: Date;  
    duration: number,
    /**
     * Contains the team size, will be calculated manually
     */               
    Employees:number;
}

export default class AbsenceService {
    private poolConnection: any;
    private config: any;

    constructor() {

        this.config = {
            user: config.database.user, // better stored in an app setting such as process.env.DB_USER
            password: config.database.password, // better stored in an app setting such as process.env.DB_PASSWORD
            server: config.database.server, // better stored in an app setting such as process.env.DB_SERVER
            port: 1433, // optional, defaults to 1433, better stored in an app setting such as process.env.DB_PORT
            database: config.database.database, // better stored in an app setting such as process.env.DB_NAME
            authentication: {
                type: 'default'
            },
            options: {
                encrypt: true
            }
        }
    }


   
    public async GetAbsencesByDate(inputData: InputParameters): Promise<TaskUser[]> {
        let start: Date = inputData.Start;
        let end: Date = inputData.End;

        let result: TaskUser[] = [];
        try {
            //select  (select count(id) from dbo.vwProjectData where taskid=d.taskid) ,d.*  from  dbo.vwProjectData d


            this.poolConnection = await sql.connect(this.config);
            let m: Moment = moment(start);
            let me: Moment = moment(end);
            let startDate: string = m.format("YYYY-MM-DD")
            let endDate: string = m.format("YYYY-MM-DD")
            
            let query: string = `select  (select count(id) from dbo.vwProjectData where taskid=d.taskid) , d.*  from  dbo.vwProjectData d where d.start between '${startDate}' and '${endDate}' and d.[End] between '${startDate}' and '${endDate}'`;
            console.log(query);
            var resultSet = await this.poolConnection.request().query(query);


            // Map to object
            resultSet.recordset.forEach(row => {

                
                let duration: number = moment(row.End).diff(moment(row.Begin), 'd');
                result.push({
                    duration:duration,
                    HourlyRate: row.HourlyRate,
                    userId: row.userId,
                    projectid: row.projectid,
                    Taskname:row.Taskname,
                    userLogin: row.userLogin,
                    DisplayName: row.DisplayName,
                    TaskId: row.TaskId,
                    Title: row.Title,
                    Start: moment(row.Start).toDate(),              
                    End: moment(row.End).toDate(),
                    Employees:row.Employees
                });
                console.log("%s\t%s\t%s", row.DisplayName, row.Begin, row.End);
            });

            this.poolConnection.close();
        } catch (err) {
            console.error(err.message);
        }
        return result;
    }

}