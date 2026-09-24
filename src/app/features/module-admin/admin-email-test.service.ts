import { Injectable } from "@angular/core";
import { ApiService } from "../../core/api.service";

@Injectable({ providedIn: "root" })
export class AdminEmailTestService {
  constructor(private api: ApiService) {}
  sender() { return this.api.get<any>("admin/email-test/sender"); }
  prospects() { return this.api.get<any[]>("admin/email-test/prospects"); }
  templates() { return this.api.get<any[]>("admin/email-test/templates"); }
  saveTemplate(input: { id?: string; name: string; description: string; subjectTemplate: string; bodyTemplate: string }) {
    if (input.id) {
      return this.api.put<any>(`admin/email-test/templates/${input.id}`, {
        name: input.name,
        description: input.description,
        subjectTemplate: input.subjectTemplate,
        bodyTemplate: input.bodyTemplate
      });
    }
    return this.api.post<any>("admin/email-test/templates", {
      name: input.name,
      description: input.description,
      subjectTemplate: input.subjectTemplate,
      bodyTemplate: input.bodyTemplate
    });
  }

    if (input.id) {
      return this.api.put<any>(`admin/email-test/templates/${input.id}`, {
        name: input.name, description: input.description,
        subjectTemplate: input.subjectTemplate, bodyTemplate: input.bodyTemplate
      });
    }
    return this.api.post<any>("admin/email-test/templates", input);
  }

  send(input: { prospectId: string; templateId: string; recipientEmail: string }) {
    return this.api.post<any>("admin/email-test/send", input);
  }
}
