/** @odoo-module **/
import { registry } from "@web/core/registry";
import { DesignerApp } from "../components/designer_app";
import { Component, xml } from "@odoo/owl";

class LabelDesignerAction extends Component {
    static template = xml`<DesignerApp templateId="props.action.params.template_id"/>`;
    static components = { DesignerApp };
}

registry.category("actions").add("label_designer_zpl.designer", LabelDesignerAction);
