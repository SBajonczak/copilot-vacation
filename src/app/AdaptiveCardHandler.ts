import { ChannelAccount, TurnContext } from "botbuilder";
import AbsenceService, { AbsenceItem } from "../DataFactories/AbsenceService";


export interface InvokeParams {
    from: ChannelAccount,
    id: number
}
export default class AdaptiveCardHandler {
    private parameters: InvokeParams;
    private absenceService: AbsenceService;
    constructor() {
        this.absenceService = new AbsenceService();
    }
    public isAction(context: TurnContext): boolean {
        let result: boolean = context.activity.type === 'invoke' && context.activity.value.action != null && context.activity.value.action.data != null;
        return result
    }



    public async Handle(context: TurnContext) {
        // Check if the action is from our button
        // let parameters: InvokeParams = this.parseParam(context);
        this.parameters = this.parseParam(context);

        switch (context.activity.value.action.id) {
            case "decline":
                this.HandleDeclined(context);
                break;
            case "approve":
                this.HandleApprove(context);
                break;
            case "cancel":
                this.HandleCancel(context);
                break;
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