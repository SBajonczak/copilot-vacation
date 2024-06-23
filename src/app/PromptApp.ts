import * as querystring from "querystring";

import {
  TeamsActivityHandler,
  CardFactory,
  TurnContext,
  MessagingExtensionQuery,
  MessagingExtensionResponse,
  Attachment,
  MessagingExtensionParameter,
  ChannelAccount,
  isChannelAccount,
} from "botbuilder";
import * as ACData from "adaptivecards-templating";


import personaCard from "../adaptiveCards/persona.json"
import approvableAbsence from "../adaptiveCards/approvableAbsence.json"
import absenceWithCancelation from "../adaptiveCards/approvedAbsenceWithCancel.json"
import { Input } from "adaptivecards";
import { HourlyRate, PersonalInformation, Skill } from "../DataFactories/Interfaces";
import AbsenceService, { AbsenceItem } from "../DataFactories/AbsenceService";
import moment from "moment";


export interface InputParameters {
  from: ChannelAccount
  scope: string,
  user:string,
  tenantId: string,
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
  private async parseParameters(inputParameters: MessagingExtensionParameter[], context: TurnContext): Promise<InputParameters> {
    let output: InputParameters = {user:'', from: { id: '', name: '' }, tenantId: '', Start: new Date(), End: new Date(), scope: '' };
    console.log(inputParameters);
    output.from = context.activity.from
    output.tenantId = context.activity.channelData.tenant.id
    inputParameters.forEach((parameter: MessagingExtensionParameter) => {
      switch (parameter.name) {
        case "user":
          output.user = parameter.value;
          break;
        case "scope":
          // mine', 'team', 'all' and 'none
          output.scope = parameter.value;
          if (output.scope == '') {
            output.scope = 'none';
          }
          break;
        case "startDate":
          output.Start = moment(parameter.value, 'MM/DD/YYYY').toDate();
          break;
        case "endDate":
          output.End = moment(parameter.value, 'MM/DD/YYYY').toDate();
          break
      }

    });
    return output;
  }

  public GetAbsenceHerocard(item: AbsenceItem, inputParameters: InputParameters): any {

    let template: ACData.Template;
    if (item.State.toLocaleLowerCase() == 'pending') {
      template = new ACData.Template(approvableAbsence)
    }
    else {
      template = new ACData.Template(personaCard);
      if (item.UserOid.toLocaleLowerCase() === inputParameters.from.aadObjectId.toLocaleLowerCase()) {
        // allowing cancelation
        template = new ACData.Template(absenceWithCancelation);
      }
    }
    let preview = CardFactory.heroCard(`${item.name} (Duration ${item.Duration} Day(s))`);

    const card = template.expand({
      $root: {
        id: item.id,
        Name: item.name,
        Start: moment(item.Start).format("DD.MM.YYYY"),
        End: moment(item.End).format("DD.MM.YYYY"),
        Duration: item.Duration,
        State: item.State
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

    let rates: AbsenceItem[] = await this.absenceService.GetAbsencesByDate(inputParameters);
    let attachments: Attachment[] = [];
    rates.forEach((item: AbsenceItem) => {
      // Load the result Hero card template
      attachments.push(this.GetAbsenceHerocard(item, inputParameters));
    });
    // Return the result
    return {
      composeExtension: {
        type: "result",
        attachmentLayout: "list",
        attachments: attachments,
      },
    };
  }

  // Search.
  public async handleTeamsMessagingExtensionQuery(
    context: TurnContext,
    query: MessagingExtensionQuery
  ): Promise<MessagingExtensionResponse> {
    let inputParameters = await this.parseParameters(query.parameters, context);
    switch (query.commandId) {
      case "absence":
        return await this.handleAbsenceRequest(context, query, inputParameters);
        break;
    }

  }

}
