import { Injectable } from "@angular/core";
import { ApiService } from "../../core/api.service";

@Injectable({ providedIn: "root" })
export class AdminEmailTestService {
  constructor(private api: ApiService) {}
  sender() { return this.api.get<any>("admin/email-test/sender"); }
  prospects() { return this.api.get<any[]>("admin/email-test/prospects"); }
  templates() { return this.api.get<any[]>("admin/email-test/templates"); }
  send(input: { prospectId: string; templateId: string; recipientEmail: string }) {
    return this.api.post<any>("admin/email-test/send", input);
  }
}
