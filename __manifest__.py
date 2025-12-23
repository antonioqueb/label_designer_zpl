{
    "name": "Professional ZPL Label Designer",
    "version": "1.0.1",
    "category": "Inventory",
    "summary": "Diseñador visual de etiquetas ZPL con Drag & Drop (OWL/Konva)",
    "depends": ["web", "base"],
    "data": [
        "security/ir.model.access.csv",
        "views/label_template_views.xml",
        "views/menu.xml",
    ],
    "assets": {
        "web.assets_backend": [
            "https://unpkg.com/konva@9.3.6/konva.min.js",
            "label_designer_zpl/static/src/css/designer.css",
            "label_designer_zpl/static/src/actions/label_designer_action.js",
            "label_designer_zpl/static/src/components/*.js",
            "label_designer_zpl/static/src/components/*.xml",
        ],
    },
    "application": True,
}
