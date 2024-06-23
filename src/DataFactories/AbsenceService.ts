import { PersonalInformation, Skill } from "./Interfaces";
import axios from 'axios';
import moment, { Moment } from "moment";
// Accessing SQL Server
import sql from 'mssql'
import { InputParameters } from "../app/PromptApp";
import config from '../config';

export interface AbsenceItem {
    id: number,
    UserOid: string,
    name: string,
    Start: Date,
    End: Date,
    Duration: number,
    State: string
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


    public async SetAbsenceState(id: number, newState: string, currentUser: string) {

        try {

            this.poolConnection = await sql.connect(this.config);
            let query: string = `update Absences set [State]='${newState}',lastchangedate=getdate(),lastchangeuser='${currentUser}'  where id='${id}'  `;
            console.log(query);
            // var resultSet = await this.poolConnection.request().query(query);
            // console.log(resultSet);
            this.poolConnection.close();

        }catch{

        }
    }
    public async DeleteAbsence(id: number, newState: string, currentUser: string) {

        try {

            this.poolConnection = await sql.connect(this.config);
            let query: string = `update Absences set [IsArchived]='${newState}',lastchangedate=getdate(),lastchangeuser='${currentUser}'   where id='${id}'  `;
            console.log(query);
            // var resultSet = await this.poolConnection.request().query(query);
            // console.log(resultSet);
            this.poolConnection.close();

        }catch{
            
        }
    }
    public async GetAbsencesByDate(inputData: InputParameters): Promise<AbsenceItem[]> {
        let start: Date = inputData.Start;
        let end: Date = inputData.End;

        let result: AbsenceItem[] = [];
        try {

            this.poolConnection = await sql.connect(this.config);
            let m: Moment = moment(start);
            let startDate: string = m.format("YYYY-MM-DD")
            let query: string = `SELECT id,[Begin],[End],UserDisplayName,Title, isHalfDay,[State],UserOid from AbsendeByDateView where '${startDate}'[DateValue] and Tenantid='${inputData.tenantId}' group by [Begin],[End],[UserDisplayName],Title, isHalfDay,[State],id,UserOid`;
            if (end != null) {

                let mEnd: Moment = moment(end);
                let endDate: string = mEnd.format("YYYY-MM-DD")
                query = `select id,[Begin],[End],UserDisplayName,Title, isHalfDay,[State],UserOid from [dbo].[AbsendeByDateView] where [DateValue] between '${startDate}' and '${endDate}' and Tenantid='${inputData.tenantId}' group by [Begin],[End],[UserDisplayName],Title, isHalfDay,[State],id,UserOid`;
            }
            console.log(query);
            var resultSet = await this.poolConnection.request().query(query);


            // Map to object
            resultSet.recordset.forEach(row => {

                let duration: number = moment(row.End).diff(moment(row.Begin), 'd');
                if (duration == 0) {
                    // required whn they use only one day.
                    duration = 1;
                    if (row.isHalfDay) {
                        duration = 0.5;
                    }
                }

                result.push({
                    UserOid: row.UserOid,
                    id: row.id,
                    name: row.UserDisplayName,
                    Start: moment(row.Begin).toDate(),
                    End: moment(row.End).toDate(),
                    Duration: duration,
                    State: row.State
                });
                console.log("%s\t%s\t%s", row.UserDisplayName, row.Begin, row.End);
            });

            this.poolConnection.close();
        } catch (err) {
            console.error(err.message);
        }
        return result;
    }

}