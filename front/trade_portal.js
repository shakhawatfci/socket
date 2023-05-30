var config = {
    settings: {
        hasHeaders: true,
        constrainDragToContainer: true,
        reorderEnabled: true,
        selectionEnabled: false,
        popoutWholeStack: false,
        blockedPopoutsThrowError: true,
        closePopoutsOnUnload: true,
        showPopoutIcon: false,
        showMaximiseIcon: true,
        showCloseIcon: true,
        minItemHeight: true,
        minItemWidth: true,
    },
    dimensions: { borderWidth: 5, minItemHeight: 50, minItemWidth: 50, headerHeight: 20, dragProxyWidth: 300, dragProxyHeight: 200 },
    content: [{ type: "row", isClosable: false, content: [{ type: "component", componentName: "widget", componentState: { content: "" } }] }],
};
function save_to_localstorage(item_name, data) {
    var existing = localStorage.getItem(item_name);
    existing = existing ? existing.split(",") : [];
    existing.push(data);
    localStorage.setItem(item_name, existing.toString());
}
var tradingwindow;
var scroll_position;
function call_multiwindow(json) {
    if (tradingwindow != null) {
        tradingwindow.destroy();
    }
    tradingwindow = new GoldenLayout(json, $("#tradingContainer"));
    tradingwindow.registerComponent("widget", function (container, state) {
        container.getElement().html(state.content);
        container.on("tab", function (tab) {
            tab.header.controlsContainer.find(".lm_maximise").on("click", function (e) {
                var button_type = e.currentTarget.attributes.title.value;
                if (button_type == "maximise") {
                    $("html, body").animate({ scrollTop: scroll_position + "px" });
                }
                if (button_type == "minimise") {
                    scroll_position = document.documentElement.scrollTop || document.body.scrollTop;
                    $("html, body").animate({ scrollTop: "0" });
                }
            });
            tab.header.controlsContainer
                .find(".lm_close")
                .off("click")
                .on("click", function (e) {
                    $(this)
                        .parents(".lm_header:eq(0)")
                        .siblings(".lm_items")
                        .find(".lm_item_container")
                        .each(function (i, obj) {
                            if ($(this).find(".watchlist_table").length > 0) {
                                var watchlist_table_id = $(this).find(".watchlist_table").attr("id");
                                stack_update(watchlist_table_id, "watchlist_widget");
                            }
                            if ($(this).find(".mktdpt_symbol_name").length > 0) {
                                var element_id = $(this).find(".mktdpt_symbol_name").attr("id");
                                var marketdepth_table_id = element_id.replace("symbol_", "").replace(/\s+/g, "");
                                stack_update(marketdepth_table_id, "marketdepth_widget");
                            }
                            if ($(this).find(".timesale_symbol_name").length > 0) {
                                var element_id = $(this).find(".timesale_symbol_name").attr("id");
                                var timesale_table_id = element_id.replace("symbol_", "").replace(/\s+/g, "");
                                stack_update(timesale_table_id, "timesale_widget");
                            }
                        });
                    tab.contentItem.parent.remove();
                });
            tab.closeElement.off("click").on("click", function (e) {
                tab_update(tab.contentItem);
                tab.contentItem.remove();
            });
        });
    });
    tradingwindow.init();
    if ($("#wl_table_1").length > 0) {
        symbol_input();
        getallwatchlist("all");
    }
    function stack_update(table_id, widget) {
        if (widget == "watchlist_widget") {
            var watchlist_id = table_id;
            var pid = $("#profile option:selected").val();
            var existing_watchlist_selection = localStorage.getItem(system_username + "_layout_" + profile_page + "_" + pid + "_" + watchlist_id + "_selected");
            if (existing_watchlist_selection != null) {
                localStorage.removeItem(system_username + "_layout_" + profile_page + "_" + pid + "_" + watchlist_id + "_selected");
            }
            var existing_watchlist_widget_list = localStorage.getItem(system_username + "_layout_" + profile_page + "_" + pid + "_" + "watchlists");
            if (existing_watchlist_widget_list != null) {
                existing_watchlist_widget_list = existing_watchlist_widget_list.replace(watchlist_id + ",", "").replace(watchlist_id, "");
                if (existing_watchlist_widget_list == "") {
                    localStorage.removeItem(system_username + "_layout_" + profile_page + "_" + pid + "_" + "watchlists");
                } else {
                    localStorage.setItem(system_username + "_layout_" + profile_page + "_" + pid + "_" + "watchlists", existing_watchlist_widget_list);
                }
            }
        }
        if (widget == "marketdepth_widget") {
            var marketdepth_id = table_id;
            var pid = $("#profile option:selected").val();
            var existing_marketdepth_widget_list = localStorage.getItem(system_username + "_layout_" + profile_page + "_" + pid + "_" + "marketdepth");
            if (existing_marketdepth_widget_list != null) {
                existing_marketdepth_widget_list = existing_marketdepth_widget_list.replace(marketdepth_id + ",", "").replace(marketdepth_id, "");
                if (existing_marketdepth_widget_list == "") {
                    localStorage.removeItem(system_username + "_layout_" + profile_page + "_" + pid + "_" + "marketdepth");
                } else {
                    localStorage.setItem(system_username + "_layout_" + profile_page + "_" + pid + "_" + "marketdepth", existing_marketdepth_widget_list);
                }
            }
        }
        if (widget == "timesale_widget") {
            var timesale_id = table_id;
            var pid = $("#profile option:selected").val();
            var existing_timesale_widget_list = localStorage.getItem(system_username + "_layout_" + profile_page + "_" + pid + "_" + "timesale");
            if (existing_timesale_widget_list != null) {
                existing_timesale_widget_list = existing_timesale_widget_list.replace(timesale_id + ",", "").replace(timesale_id, "");
                if (existing_timesale_widget_list == "") {
                    localStorage.removeItem(system_username + "_layout_" + profile_page + "_" + pid + "_" + "timesale");
                } else {
                    localStorage.setItem(system_username + "_layout_" + profile_page + "_" + pid + "_" + "timesale", existing_timesale_widget_list);
                }
            }
        }
    }
    function tab_update(item) {
        if (item.config.type == "component" && item.config.title.includes("Watchlist")) {
            var watchlist_id = item.container._contentElement[0].childNodes[4].childNodes[1].id;
            var pid = $("#profile option:selected").val();
            var existing_watchlist_selection = localStorage.getItem(system_username + "_layout_" + profile_page + "_" + pid + "_" + watchlist_id + "_selected");
            if (existing_watchlist_selection != null) {
                localStorage.removeItem(system_username + "_layout_" + profile_page + "_" + pid + "_" + watchlist_id + "_selected");
            }
            var existing_watchlist_widget_list = localStorage.getItem(system_username + "_layout_" + profile_page + "_" + pid + "_" + "watchlists");
            if (existing_watchlist_widget_list != null) {
                existing_watchlist_widget_list = existing_watchlist_widget_list.replace(watchlist_id + ",", "").replace(watchlist_id, "");
                if (existing_watchlist_widget_list == "") {
                    localStorage.removeItem(system_username + "_layout_" + profile_page + "_" + pid + "_" + "watchlists");
                } else {
                    localStorage.setItem(system_username + "_layout_" + profile_page + "_" + pid + "_" + "watchlists", existing_watchlist_widget_list);
                }
            }
        }
        if (item.config.type == "component" && item.config.title.includes("Market Depth")) {
            var element_id = item.container._contentElement[0].childNodes[4].id;
            var marketdepth_id = element_id.replace("symdata_", "").replace(/\s+/g, "");
            var pid = $("#profile option:selected").val();
            var existing_marketdepth_widget_list = localStorage.getItem(system_username + "_layout_" + profile_page + "_" + pid + "_" + "marketdepth");
            if (existing_marketdepth_widget_list != null) {
                existing_marketdepth_widget_list = existing_marketdepth_widget_list.replace(marketdepth_id + ",", "").replace(marketdepth_id, "");
                if (existing_marketdepth_widget_list == "") {
                    localStorage.removeItem(system_username + "_layout_" + profile_page + "_" + pid + "_" + "marketdepth");
                } else {
                    localStorage.setItem(system_username + "_layout_" + profile_page + "_" + pid + "_" + "marketdepth", existing_marketdepth_widget_list);
                }
            }
        }
        if (item.config.type == "component" && item.config.title.includes("Time & Sale")) {
            var element_id = item.container._contentElement[0].childNodes[4].childNodes[1].id;
            var timesale_id = element_id.replace("ts_", "").replace(/\s+/g, "");
            var pid = $("#profile option:selected").val();
            var existing_timesale_widget_list = localStorage.getItem(system_username + "_layout_" + profile_page + "_" + pid + "_" + "timesale");
            if (existing_timesale_widget_list != null) {
                existing_timesale_widget_list = existing_timesale_widget_list.replace(timesale_id + ",", "").replace(timesale_id, "");
                if (existing_timesale_widget_list == "") {
                    localStorage.removeItem(system_username + "_layout_" + profile_page + "_" + pid + "_" + "timesale");
                } else {
                    localStorage.setItem(system_username + "_layout_" + profile_page + "_" + pid + "_" + "timesale", existing_timesale_widget_list);
                }
            }
        }
    }
    tradingwindow.on("stateChanged", function (item) {
        var pid = $("#profile option:selected").val();
        autosave_Grid(pid, profile_page);
        if ($("#marketstat").length == 0) {
            if (adv_dec_chart_interval != null) clearInterval(adv_dec_chart_interval);
        }
        if ($("#traded_table").length == 0) {
            if (topgainer_interval != null) clearInterval(topgainer_interval);
            if (toploser_interval != null) clearInterval(toploser_interval);
            if (toptrade_interval != null) clearInterval(toptrade_interval);
            if (topvalue_interval != null) clearInterval(topvalue_interval);
            if (topvolume_interval != null) clearInterval(topvolume_interval);
        }
        if ($("#traded_sectors").length == 0) {
            if (investedsector_interval != null) clearInterval(investedsector_interval);
        }
        if ($("#traded_sectors_by_gainer").length == 0) {
            if (sectorgainchart_interval != null) clearInterval(sectorgainchart_interval);
        }
        if ($("#market_movers_table").length == 0) {
            if (index_impact_interval != null) clearInterval(index_impact_interval);
        }
    });
}
var addWidget = function (title, content, width, height) {
    var newItemConfig = { title: title, type: "component", width: width, height: height, componentName: "widget", componentState: { content: content } };
    tradingwindow.root.contentItems[0].addChild(newItemConfig);
};
function saveGrid(pid, profile_page) {
    if (profile_page != null) {
        var state = JSON.stringify(tradingwindow.toConfig());
        localStorage.setItem(system_username + "_layout_" + profile_page + "_" + pid, state);
        show_flash_messages("Profile Saved", "success");
    }
}
function autosave_Grid(pid, profile_page) {
    if (profile_page != null) {
        var state = JSON.stringify(tradingwindow.toConfig());
        localStorage.setItem(system_username + "_layout_" + profile_page + "_" + pid, state);
    }
}
function loadGrid(pid, profile_page) {
    if (profile_page != null) {
        $.get("/shared/loadprofile/", { profile: pid })
            .done(function (data) {
                var tradingLayout = localStorage.getItem(system_username + "_layout_" + profile_page + "_" + pid);
                if (tradingLayout !== null) {
                    call_multiwindow(JSON.parse(tradingLayout));
                } else {
                    $.getJSON("static/default_content/trading_default_content.json", function (json) {
                        call_multiwindow(json);
                    });
                }
            })
            .fail(function (data) {
                show_flash_messages("Failed to Load Profile", "danger");
            });
    }
}
function deleteGrid(pid, profile_page) {
    if (profile_page != null) {
        localStorage.removeItem(system_username + "_layout_" + profile_page + "_" + pid);
    }
}
