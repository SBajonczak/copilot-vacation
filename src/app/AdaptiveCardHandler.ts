import { ChannelAccount, TurnContext } from "botbuilder";
import AbsenceService from "../DataFactories/AbsenceService";


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
                this.HandleDeclined();
                break;
            case "approve":
                this.HandleApprove();
                break;
            case "cancel":
                this.HandleCancel();
                break;
        }
    }

    private parseParam(context: TurnContext): InvokeParams {
        //@ts-ignore
        return { from: context.activity.from, id: context.activity.value.action.data };
    }

    private async HandleDeclined() {
        this.absenceService.SetAbsenceState(this.parameters.id, 'Declined', this.parameters.from.aadObjectId)
    }

    private async HandleApprove() {
        this.absenceService.SetAbsenceState(this.parameters.id, 'Approved', this.parameters.from.aadObjectId)
    }

    private async HandleCancel() {
        this.absenceService.DeleteAbsence(this.parameters.id, 'Declined', this.parameters.from.aadObjectId)
        // Updating 
    }

}