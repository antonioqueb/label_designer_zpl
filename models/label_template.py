from odoo import models, fields, api
import json

class LabelTemplate(models.Model):
    _name = 'label.template'
    _description = 'Plantilla ZPL'

    name = fields.Char("Nombre", required=True)
    dpi = fields.Selection([('203', '203 DPI'), ('300', '300 DPI')], string="DPI", default='203')
    width_mm = fields.Float("Ancho (mm)", default=100)
    height_mm = fields.Float("Alto (mm)", default=50)
    elements_json = fields.Text("Configuración JSON", default="[]")
    zpl_code = fields.Text("Código ZPL Generado")

    def action_open_designer(self):
        return {
            'type': 'ir.actions.client',
            'tag': 'label_designer_zpl.designer',
            'params': {'template_id': self.id}
        }

    @api.model
    def save_from_designer(self, template_id, elements):
        template = self.browse(template_id)
        zpl = self._generate_zpl(elements, int(template.dpi))
        template.write({
            'elements_json': json.dumps(elements),
            'zpl_code': zpl
        })
        return True

    def _generate_zpl(self, elements, dpi):
        dpmm = dpi / 25.4
        zpl = ["^XA"]
        
        for el in elements:
            # Convertir de px (diseñador) a dots (ZPL)
            # Asumimos que en el diseñador 1mm = 3.78px (aprox)
            # Para simplificar el ejemplo, usamos un factor directo
            scale = dpmm / 3.78 
            x = int(el['x'] * scale)
            y = int(el['y'] * scale)
            w = int(el.get('w', 0) * scale)
            h = int(el.get('h', 0) * scale)

            if el['type'] == 'text':
                txt = el['props'].get('text', '')
                size = int(el['props'].get('fontSize', 20) * scale)
                zpl.append(f"^FO{x},{y}^A0N,{size},{size}^FD{txt}^FS")
            
            elif el['type'] == 'barcode':
                txt = el['props'].get('text', '12345')
                zpl.append(f"^FO{x},{y}^BY2^BCN,{h},Y,N,N^FD{txt}^FS")
                
            elif el['type'] == 'qrcode':
                txt = el['props'].get('text', 'QR')
                zpl.append(f"^FO{x},{y}^BQN,2,10^FDQA,{txt}^FS")

            elif el['type'] == 'box':
                zpl.append(f"^FO{x},{y}^GB{w},{h},2^FS")

        zpl.append("^XZ")
        return "\n".join(zpl)
