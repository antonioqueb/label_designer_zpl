/** @odoo-module **/
import { Component, onMounted, useState, useRef } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

export class DesignerApp extends Component {
    static template = "label_designer_zpl.DesignerApp";

    setup() {
        this.orm = useService("orm");
        this.action = useService("action");
        this.state = useState({
            elements: [],
            selectedId: null,
            templateData: {}
        });
        this.stageRef = useRef("konvaHolder");

        onMounted(async () => {
            await this.loadTemplate();
            this.initKonva();
        });
    }

    async loadTemplate() {
        const data = await this.orm.read("label.template", [this.props.templateId], ["name", "width_mm", "height_mm", "elements_json"]);
        this.state.templateData = data[0];
        this.state.elements = JSON.parse(data[0].elements_json || "[]");
    }

    initKonva() {
        const width_px = this.state.templateData.width_mm * 3.78;
        const height_px = this.state.templateData.height_mm * 3.78;

        this.stage = new Konva.Stage({
            container: 'konva-holder',
            width: width_px,
            height: height_px
        });

        this.layer = new Konva.Layer();
        this.stage.add(this.layer);
        
        // Transformador (para redimensionar y rotar)
        this.tr = new Konva.Transformer();
        this.layer.add(this.tr);

        this.renderCanvas();

        // Click en fondo deselecciona
        this.stage.on('click tap', (e) => {
            if (e.target === this.stage) {
                this.state.selectedId = null;
                this.tr.nodes([]);
                return;
            }
        });
    }

    addElement(type) {
        const id = 'el_' + Date.now();
        const newEl = {
            id, type,
            x: 50, y: 50, w: 100, h: 50, rotation: 0,
            props: { text: type === 'text' ? 'Texto Nuevo' : '123456', fontSize: 20 }
        };
        this.state.elements.push(newEl);
        this.renderCanvas();
    }

    renderCanvas() {
        // Limpiar excepto transformador
        this.layer.children.filter(c => c !== this.tr).forEach(c => c.destroy());

        this.state.elements.forEach(el => {
            let shape;
            if (el.type === 'text') {
                shape = new Konva.Text({
                    id: el.id, x: el.x, y: el.y, text: el.props.text,
                    fontSize: el.props.fontSize, draggable: true, rotation: el.rotation
                });
            } else if (el.type === 'barcode' || el.type === 'qrcode' || el.type === 'box') {
                shape = new Konva.Rect({
                    id: el.id, x: el.x, y: el.y, width: el.w, height: el.h,
                    fill: el.type === 'box' ? 'transparent' : '#eee', 
                    stroke: 'black', draggable: true, rotation: el.rotation
                });
            }

            shape.on('dragend transformend', (e) => {
                el.x = e.target.x();
                el.y = e.target.y();
                el.rotation = e.target.rotation();
                if (el.type !== 'text') {
                    el.w = e.target.width() * e.target.scaleX();
                    el.h = e.target.height() * e.target.scaleY();
                }
            });

            shape.on('click', () => {
                this.state.selectedId = el.id;
                this.tr.nodes([shape]);
            });

            this.layer.add(shape);
        });
        this.layer.draw();
    }

    deleteSelected() {
        this.state.elements = this.state.elements.filter(e => e.id !== this.state.selectedId);
        this.state.selectedId = null;
        this.tr.nodes([]);
        this.renderCanvas();
    }

    async save() {
        await this.orm.call("label.template", "save_from_designer", [this.props.templateId, this.state.elements]);
        this.action.doAction({ type: 'ir.actions.client', tag: 'display_notification', params: { title: 'Guardado', message: 'ZPL actualizado', type: 'success' }});
    }

    get selectedEl() {
        return this.state.elements.find(e => e.id === this.state.selectedId);
    }
}
