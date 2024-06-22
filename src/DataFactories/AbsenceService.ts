import { PersonalInformation, Skill } from "./Interfaces";
import axios from 'axios';
import moment, { Moment } from "moment";
// Accessing SQL Server
import sql from 'mssql'

export interface AbsenceItem {
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
            user: 'RCSAdmin', // better stored in an app setting such as process.env.DB_USER
            password: '?Hallo11!', // better stored in an app setting such as process.env.DB_PASSWORD
            server: 'p64c88dldk.database.windows.net', // better stored in an app setting such as process.env.DB_SERVER
            port: 1433, // optional, defaults to 1433, better stored in an app setting such as process.env.DB_PORT
            database: 'DB-HBS-V2-PROD', // better stored in an app setting such as process.env.DB_NAME
            authentication: {
                type: 'default'
            },
            options: {
                encrypt: true
            }
        }
    }


    public async GetAbsencesByDate(start: Date, end: Date): Promise<AbsenceItem[]> {
        let result: AbsenceItem[] = [];
        try {
            
            this.poolConnection = await sql.connect(this.config);
            let m: Moment = moment(start);
            let startDate: string = m.format("YYYY-MM-DD")
            let query: string = `SELECT * from AbsendeByDateView where '${startDate}'[DateValue]`;
            if (end != null) {

                let mEnd: Moment = moment(end);
                let endDate: string = mEnd.format("YYYY-MM-DD")
                query = `select * from [dbo].[AbsendeByDateView] where [DateValue] between '${startDate}' and '${endDate}'`;
            }
            console.log(query);
            var resultSet = await this.poolConnection.request().query(query);


            // Map to object
            resultSet.recordset.forEach(row => {
                result.push({
                    name: row.UserDisplayName,
                    Start: moment(row.Begin).toDate(),
                    End: moment(row.End).toDate(),
                    Duration: moment(row.End).diff(moment(row.Begin), 'd'), 
                    State:row.State
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