(function($, DX, undefined) {
    DX.framework.html.EmptyLayoutController = DX.framework.html.DefaultLayoutController.inherit({ctor: function(options) {
            options = options || {};
            options.name = options.name || "empty";
            this.callBase(options)
        }});
    var layoutSets = DX.framework.html.layoutSets;
    layoutSets["empty"] = layoutSets["empty"] || [];
    layoutSets["empty"].push({controller: new DX.framework.html.EmptyLayoutController})
})(jQuery, DevExpress);