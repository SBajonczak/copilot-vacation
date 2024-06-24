import { ChannelAccount, TurnContext } from "botbuilder";
import absenceRequest from "../adaptiveCards/absenceRequest.json"
import AbsenceService, { AbsenceItem } from "../DataFactories/AbsenceService";


export interface InvokeParams {
    from: ChannelAccount,
    id: number
}
export default class MessageHandler {
    private parameters: InvokeParams;
    private absenceService: AbsenceService;
    constructor() {
        this.absenceService = new AbsenceService();
    }
    public isAction(context: TurnContext): boolean {
        let result: boolean = context.activity.type === 'message';
        return result
    }



    public async Handle(context: TurnContext) {
        // Check if the action is from our button
        // let parameters: InvokeParams = this.parseParam(context);
        //this.parameters = this.parseParam(context);

        if (context.activity.text.indexOf('/+') >= -1) {

        } else {
            context.sendActivity("Bitte geben Sie /+ ein um den Anfrageprozess zu starten");
        }
    }

    private parseParam(context: TurnContext): InvokeParams {
        //@ts-ignore
        return { from: context.activity.from, id: context.activity.value.action.data };
    }

    private async HandleDeclined(context: TurnContext) {
        await this.absenceService.SetAbsenceState(this.parameters.id, 'Declined', this.parameters.from.aadObjectId);
        // let absence: AbsenceItem=  await this.absenceService.GetAbsencesById(this.parameters.id);
    }

    private async HandleApprove(context: TurnContext) {
        this.absenceService.SetAbsenceState(this.parameters.id, 'Approved', this.parameters.from.aadObjectId)
    }

    private async HandleCancel(context: TurnContext) {
        this.absenceService.DeleteAbsence(this.parameters.id, 'Declined', this.parameters.from.aadObjectId)
        // Updating 
    }

}