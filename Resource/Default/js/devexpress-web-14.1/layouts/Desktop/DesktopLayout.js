(function($, DX, undefined) {
    var layoutSets = DX.framework.html.layoutSets;
    layoutSets["desktop"] = layoutSets["desktop"] || [];
    layoutSets["desktop"].push({
        platform: "generic",
        controller: new DX.framework.html.DefaultLayoutController({
            name: "desktop",
            disableViewLoadingState: true
        })
    })
})(jQuery, DevExpress);