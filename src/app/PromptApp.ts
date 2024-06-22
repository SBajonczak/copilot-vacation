import * as querystring from "querystring";

import {
  TeamsActivityHandler,
  CardFactory,
  TurnContext,
  MessagingExtensionQuery,
  MessagingExtensionResponse,
  Attachment,
  MessagingExtensionParameter,
} from "botbuilder";
import * as ACData from "adaptivecards-templating";


import personaCard from "../adaptiveCards/persona.json"
import { Input } from "adaptivecards";
import { HourlyRate, PersonalInformation, Skill } from "../DataFactories/Interfaces";
import AbsenceService, { AbsenceItem } from "../DataFactories/AbsenceService";
import moment from "moment";


interface InputParameters {
  Start: Date,
  End: Date
}


export class PromptApp extends TeamsActivityHandler {
  private userId: string;
  private absenceService: AbsenceService;
  constructor() {
    super();
    this.absenceService = new AbsenceService();
    this.userId = "";
  }

  public SetCurrentUser(userid: string) {
    console.log(userid);
    this.userId = userid;
  }

  /**
   * 
   * @param inputParameters Parsing parameters
   * @returns 
   */
  private async parseParameters(inputParameters: MessagingExtensionParameter[]): Promise<InputParameters> {
    let output: InputParameters = { Start: new Date(), End: new Date() };
    inputParameters.forEach((parameter: MessagingExtensionParameter) => {
      switch (parameter.name) {
        case "startDate":
          output.Start = moment(parameter.value,'MM/DD/YYYY').toDate();
          break;
        case "endDate":
          output.End = moment(parameter.value,'MM/DD/YYYY').toDate();
          break
      }

    });
    return output;
  }

  public GetAbsenceHerocard(item: AbsenceItem): any {
    let template: ACData.Template = new ACData.Template(personaCard);
    let preview = CardFactory.heroCard(`${item.name} (Duration ${item.Duration} Day(s))`);

    const card = template.expand({
      $root: {

        Name: item.name,
        Start: moment(item.Start).format("DD.MM.YYYY"),
        End: moment(item.End).format("DD.MM.YYYY"),
        Duration: item.Duration,
        State:item.State
      },
    });
    // Adapt to the attachemnt
    const attachment = { ...CardFactory.adaptiveCard(card), preview };
    return attachment;
  }





  public async handleAbsenceRequest(
    context: TurnContext,
    query: MessagingExtensionQuery,
    inputParameters: InputParameters
  ): Promise<MessagingExtensionResponse> {

    let rates: AbsenceItem[] = await this.absenceService.GetAbsencesByDate(inputParameters.Start, inputParameters.End);
    let attachments: Attachment[] = [];
    rates.forEach((item: AbsenceItem) => {

      // Load the result Hero card template
      attachments.push(this.GetAbsenceHerocard(item));

    });

    // Return the result
    return {
      composeExtension: {
        type: "result",
        attachmentLayout: "list",
        attachments: attachments,
      },
    };
    return null;
  }

  // Search.
  public async handleTeamsMessagingExtensionQuery(
    context: TurnContext,
    query: MessagingExtensionQuery
  ): Promise<MessagingExtensionResponse> {
    // Parsing the input parameters
    console.log(JSON.stringify(query));
    let inputParameters = await this.parseParameters(query.parameters);

    switch (query.commandId) {
      case "absence":
        return await this.handleAbsenceRequest(context, query, inputParameters);
        break;
    }

  }

}
