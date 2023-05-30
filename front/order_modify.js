var order_value_original;
function modify_order_window() {
    if (modwindow != undefined) {
        modwindow.close();
    }
    if (orderwindow != undefined) {
        orderwindow.close();
    }
    if (modwindow == undefined) {
        modwindow = new WinBox("MODIFY ORDER", {
            class: "no-min no-max no-full no-resize",
            onclose: function (force) {
                modwindow = undefined;
                window_x = new_x;
                window_y = new_y;
            },
            onmove: function (x, y) {
                new_x = x;
                new_y = y;
            },
            onfocus: function () { },
        });
        var node = document.getElementById("order-modify-window");
        $(".winbox").css("border", "1px solid orange");
        modwindow.mount(node);
        modwindow.resize("430px", "520px");
        if (window_x == 0 && window_y == 0) {
            modwindow.move("center", "5%");
        } else {
            modwindow.x = window_x;
            modwindow.y = window_y;
            modwindow.move();
        }
        modwindow.setBackground("#414141");
        modwindow.setBackground("linear-gradient(300deg, var(--page-color) 50%, rgb(170, 125, 0) 100%)");
        $(".yield_window_mod").hide();
    }
}
$(document).ready(function () { });
function get_order_status(client_order_id) {
    var orderside = "";
    var order_status_id = "";
    var statusmsg = "";
    $("#order_status_id").val(client_order_id);
    $.getJSON("shared/getorderdata/", { orderid: client_order_id }, function (data) {
        data.order_side == "BUY" ? (orderside = "1") : (orderside = "2");
        order_status_id = create_order_modify_id(data.client_code);
        data.order_status = "status request";
        statusmsg = "8=FIXT.1.19=21635=H34=852=20210830-07:08:20.48956=TEST";
        statusmsg += "11=" + client_order_id + "54=" + orderside + "55=" + data.symbol_code + "50=" + data.trader_ws_id + "790=" + order_status_id + "";
        statusmsg += "10=100" + "";
        publish_order_status_msg(statusmsg);
    });
}
function cancel_order(client_order_id) {
    var getorderdata = $.getJSON("shared/getorderdata/", { orderid: client_order_id }, function (data) {
        switch (data.exchange) {
            case "Priority":
                elemid = "xcg1_mod";
                break;
            case "DSE":
                elemid = "xcg2_mod";
                break;
            case "CSE":
                elemid = "xcg3_mod";
                break;
            default:
                "DSE";
        }
        $("#exchange_mod").empty();
        $("#exchange_mod").append($("<option>", { value: data.exchange, text: data.exchange }));
        switch_exchange_mod(elemid);
        $("#order_client_code_mod").empty();
        $("#order_client_code_mod").append($("<option>", { value: data.client_code, text: data.client_code }));
        $("#order_instrument_mod").empty();
        $("#order_instrument_mod").append($("<option>", { value: data.symbol_code + "." + data.board_type, text: data.symbol_code + "." + data.board_type }));
        $("#limit_order_type_mod").empty();
        $("#limit_order_type_mod").append($("<option>", { value: data.limit_order_type, text: data.limit_order_type }));
        $("#order_qty_mod").val(data.order_qty);
        $("#drip_qty_mod").val(data.drip_qty);
        $("#min_qty_mod").val(data.min_qty);
        $("#stop_loss_mod").val(data.stop_loss);
        $("#take_profit_mod").val(data.take_profit);
        switch (data.order_type) {
            case "Market":
                $("#order_type_mod").val("Market").trigger("change");
                $("#limit-window-mod").hide();
                $("#market-window-mod").show();
                break;
            case "Limit":
                $("#order_type_mod").val("Limit").trigger("change");
                $("#limit-window-mod").show();
                $("#market-window-mod").hide();
                break;
            case "MarketBest":
                $("#order_type_mod").val("MarketBest").trigger("change");
                $("#limit-window-mod").hide();
                $("#market-window-mod").show();
                break;
            default:
                data.order_type;
        }
        $("#order_type_mod").change(function () {
            var order_type_mod = $("#order_type_mod").val();
            if (order_type_mod == "Limit" || order_type_mod == "WON") {
                $("#limit-window-mod").show();
                $("#market-window-mod").hide();
            }
            if (order_type_mod == "Market" || order_type_mod == "MarketBest") {
                $("#limit-window-mod").hide();
                $("#market-window-mod").show();
            }
        });
        switch (data.order_validity) {
            case "DAY":
                $("#order_validity_mod").val("DAY").trigger("change");
                break;
            case "SESSION":
                $("#order_validity_mod").val("SESSION").trigger("change");
                break;
            case "IOC":
                $("#order_validity_mod").val("IOC").trigger("change");
                break;
            case "FOK":
                $("#order_validity_mod").val("FOK").trigger("change");
                break;
            case "GTC":
                $("#order_validity_mod").val("GTC").trigger("change");
                break;
            case "GTD":
                $("#order_validity_mod").val("GTD").trigger("change");
                break;
            default:
                data.order_validity;
        }
        switch (data.order_side) {
            case "BUY":
                $("#order_side_select_mod").prop("checked", true).trigger("change");
                $("#order_side_mod").val("BUY");
                $(".order_mod_submit_btn").removeClass().addClass("order_mod_submit_btn btn activebuy w-100");
                $(".ord-win-border").css("border-color", "#26a051");
                break;
            case "SELL":
                $("#order_side_select_mod").prop("checked", false).trigger("change");
                $("#order_side_mod").val("SELL");
                $(".order_mod_submit_btn").removeClass().addClass("order_mod_submit_btn btn activesell w-100");
                $(".ord-win-border").css("border-color", "#c71919");
                break;
            default:
                data.order_side;
        }
        switch (data.pvt_mkt_order) {
            case "true":
                $("#pvt_mkt_order_mod").val("true");
                break;
            case "false":
                $("#pvt_mkt_order_mod").val("false");
                break;
            default:
                data.pvt_mkt_order;
        }
        switch (data.limit_order_type) {
            case "Buy Limit":
                $("#order_side_mod").val("BUY");
                $(".ord-win-border").css("border-color", "#26a051");
                $("#order_side_select_mod").prop("checked", true).trigger("change");
                $(".order_mod_submit_btn").removeClass().addClass("order_mod_submit_btn btn activebuy w-100");
                break;
            case "Sell Limit":
                $("#order_side_mod").val("SELL");
                $(".ord-win-border").css("border-color", "#c71919");
                $("#order_side_select_mod").prop("checked", false).trigger("change");
                $(".order_mod_submit_btn").removeClass().addClass("order_mod_submit_btn btn activesell w-100");
                break;
            default:
                data.limit_order_type;
        }
        $("#limit_order_date_mod").val(data.limit_order_date);
        $("#limit_order_expiry_date_mod").val(data.limit_order_expiry_date);
        switch (data.pvt_limit_order) {
            case "true":
                $("#pvt_limit_order_mod").val("true");
                break;
            case "false":
                $("#pvt_limit_order_mod").val("false");
                break;
            default:
                data.pvt_limit_order;
        }
        $("#limit_order_rate_mod").val(data.order_price);
        $("#limit_order_yield_mod").val(data.order_yield);
        $("#order_time_mod").val(data.order_time);
        $("#client_order_id_mod").val(data.order_id);
        $("#time_in_force_mod").val(data.time_in_force);
        $("#engine_id_mod").val(data.engine_id);
        $("#partial_qty_mod").val(data.partial_qty);
        $("#emergency_mod").val(data.emergency);
        $("#leaves_qty_mod").val(data.due_qty);
        $("#cum_qty_mod").val(data.cum_qty);
        $("#last_qty_mod").val(data.last_qty);
        $("#last_px_mod").val(data.last_px);
        $("#avg_px_mod").val(data.avg_px);
        $("#order_status_mod").val(data.order_status);
        $("#user_device_mod").val(data.user_device);
        $("#order_branch_mod").val(data.branch);
        document.getElementById("bo_acc_mod").value = data.bo_acc;
        document.getElementById("client_name_mod").value = data.client_name;
        document.getElementById("pvdr_id_mod").value = data.broker_id;
        document.getElementById("cln_id_mod").value = data.user_id;
        document.getElementById("ref_id_mod").value = data.ref_user_id;
        document.getElementById("trader_id_mod").value = data.trader_ws_id;
        $("#sym_isin_mod").val(data.symbol_isin);
        $("#sym_class_mod").val(data.symbol_assetclass);
        $("#sym_category_mod").val(data.symbol_category);
        $("#sym_spot_mod").val(data.compulsory_spot);
        $("#chain_id_mod").val(data.chain_id);
        $("#exec_status_mod").val(data.exec_status);
        $("#reforder_id_mod").val(data.reforder_id);
    });
    $.when(getorderdata).then(function () {
        var form = $("#order-modify-form");
        var fix_msg = compile_fix_cancel_msg(form);
    });
}
function compile_fix_cancel_msg(form) {
    var formvals = {};
    var cancelmsg = "";
    $.each($(form).serializeArray(), function (i, field) {
        formvals[field.name] = field.value;
    });
    var symbol_split = formvals.order_instrument.split(".");
    var order_symbol = symbol_split[0];
    var order_board = symbol_split[1];
    formvals.order_qty == "" ? $("#order_qty_mod").val("0") : (formvals.order_qty = formvals.order_qty);
    formvals.drip_qty == "" ? $("#drip_qty_mod").val("0") : (formvals.drip_qty = formvals.drip_qty);
    formvals.min_qty == "" ? $("#min_qty_mod").val("0") : (formvals.min_qty = formvals.min_qty);
    formvals.stop_loss == "" ? $("#stop_loss_mod").val("0.00") : (formvals.stop_loss = formvals.stop_loss);
    formvals.take_profit == "" ? $("#take_profit_mod").val("0.00") : (formvals.take_profit = formvals.take_profit);
    formvals.limit_order_rate == "" ? $("#limit_order_rate_mod").val("0.00") : (formvals.limit_order_rate = formvals.limit_order_rate);
    formvals.limit_order_yield == "" ? $("#limit_order_yield_mod").val("0.00") : (formvals.limit_order_yield = formvals.limit_order_yield);
    formvals.order_side == "BUY" ? (orderside = "1") : (orderside = "2");
    formvals.order_time = get_order_sending_time();
    if (formvals.exec_status != "Rejected" || formvals.reforder_id == "") {
        formvals.reforder_id = formvals.client_order_id;
        $("#reforder_id_mod").val(formvals.reforder_id);
    }
    if (formvals.order_status == "pending" || formvals.order_status == "parking") {
        formvals.order_status = "Cancelled";
        formvals.exec_status = "Cancelled";
    } else {
        formvals.order_status = "cancel request";
    }
    formvals.client_order_id = create_order_modify_id(formvals.order_client_code);
    $("#client_order_id_mod").val(formvals.client_order_id);
    $("#order_cancel_id").val(formvals.client_order_id);
    cancelmsg = "8=FIXT.1.19=21635=F34=852=20210830-07:08:20.48956=TEST";
    cancelmsg += "11=" + formvals.client_order_id + "41=" + formvals.reforder_id + "54=" + orderside + "38=" + formvals.order_qty + "55=" + order_symbol + "60=" + formvals.order_time + "50=" + formvals.trader_id + "";
    cancelmsg += "10=100" + "";
    formvals.fix_msg = cancelmsg;
    confirm_msg =
        "Cancel " +
        formvals.order_side +
        " Order? <br>" +
        "Order ID: " +
        formvals.reforder_id +
        "<br>" +
        "Ticker: " +
        order_symbol +
        "<br>" +
        "Qty: " +
        formvals.order_qty +
        " | Price: " +
        formvals.limit_order_rate +
        "<br>" +
        "Client Code: " +
        formvals.order_client_code +
        "<br>" +
        "Name: " +
        formvals.client_name;
    $.confirm({
        title: "Cancel Order",
        titleClass: "text-center",
        content: confirm_msg,
        typeAnimated: true,
        theme: "dark",
        escapeKey: "NO",
        buttons: {
            YES: {
                keys: ["enter"],
                btnClass: "btn-success",
                action: function () {
                    publish_order_cache_msg(JSON.stringify(formvals));
                },
            },
            NO: { keys: ["esc"], btnClass: "btn-danger", action: function () { } },
        },
    });
    return;
}
function show_reject_msg(client_order_id) {
    $.getJSON("shared/getorderdata/", { orderid: client_order_id }, function (data) {
        var order_type = data.order_type == undefined ? "" : data.order_type;
        var rate_msg = data.order_type == "Limit" ? " qty @ " + data.order_price : " qty @ Market Price";
        var modal = $("#main-page-modal");
        modal.modal({ show: true });
        modal.find(".modal-title").text("ORDER DETAILS");
        modal
            .find(".modal-body")
            .html(
                '<div class="row mt-3 mb-2 ml-3 mr-3 text-warning">Order ID: ' +
                data.order_id +
                "</div>" +
                '<div class="row mb-2 ml-3 mr-3">Order Date: ' +
                data.order_date +
                "</div>" +
                '<div class="row mb-2 ml-3 mr-3">Type: ' +
                data.order_side +
                " " +
                order_type +
                " Order" +
                "</div>" +
                '<div class="row mb-3 ml-3 mr-3">Order: ' +
                data.symbol_code +
                " (" +
                data.board_type +
                ") " +
                data.order_qty +
                rate_msg +
                "</div>" +
                '<div class="row mb-2 ml-3 mr-3 text-danger">Reject Reason:</div>' +
                '<div class="row mb-3 ml-3 mr-3">' +
                data.order_remarks +
                "</div>"
            );
    });
}
function show_hawla_msg(order_chain_id) {
    var modal = $("#main-page-modal");
    var pageLoader = $("#page-loading-indicator").html();
    var url = "/live_orders/order_hawla/" + order_chain_id;
    modal.modal({ show: true });
    modal.find(".modal-title").text("ORDER DETAILS");
    modal.find(".modal-body").html(pageLoader).load(url);
}
function get_order_data(client_order_id) {
    $.getJSON("shared/getorderdata/", { orderid: client_order_id }, function (data) {
        switch (data.exchange) {
            case "Priority":
                elemid = "xcg1_mod";
                break;
            case "DSE":
                elemid = "xcg2_mod";
                break;
            case "CSE":
                elemid = "xcg3_mod";
                break;
            default:
                "DSE";
        }
        $("#exchange_mod").empty();
        $("#exchange_mod").append($("<option>", { value: data.exchange, text: data.exchange }));
        switch_exchange_mod(elemid);
        $("#order_client_code_mod").empty();
        $("#order_client_code_mod").append($("<option>", { value: data.client_code, text: data.client_code }));
        updatebodata_mod(data.client_code);
        $("#order_instrument_mod").empty();
        $("#order_instrument_mod").append($("<option>", { value: data.symbol_code + "." + data.board_type, text: data.symbol_code + "." + data.board_type }));
        checkModSaleable();
        $("#limit_order_rate_mod").val(data.order_price);
        if (data.board_type == "YIELDDBT" || data.board_type == "BUYDBT") {
            $(".yield_window_mod").show();
            getGsecDataMod(data.symbol_code);
        } else {
            $(".yield_window_mod").hide();
        }
        $("#limit_order_type_mod").empty();
        $("#limit_order_type_mod").append($("<option>", { value: data.limit_order_type, text: data.limit_order_type }));
        $("#original_qty_mod").val(data.order_qty);
        $("#order_qty_mod").val(data.order_qty);
        $("#drip_qty_mod").val(data.drip_qty);
        $("#min_qty_mod").val(data.min_qty);
        $("#stop_loss_mod").val(data.stop_loss);
        $("#take_profit_mod").val(data.take_profit);
        switch (data.order_type) {
            case "Market":
                $("#order_type_mod").val("Market").trigger("change");
                $("#limit-window-mod").hide();
                $("#market-window-mod").show();
                break;
            case "Limit":
                $("#order_type_mod").val("Limit").trigger("change");
                $("#limit-window-mod").show();
                $("#market-window-mod").hide();
                break;
            case "MarketBest":
                $("#order_type_mod").val("MarketBest").trigger("change");
                $("#limit-window-mod").hide();
                $("#market-window-mod").show();
                break;
            default:
                data.order_type;
        }
        $("#order_type_mod").change(function () {
            var order_type_mod = $("#order_type_mod").val();
            if (order_type_mod == "Limit") {
                $("#limit-window-mod").show();
                $("#market-window-mod").hide();
            }
            if (order_type_mod == "Market" || order_type_mod == "MarketBest") {
                $("#limit-window-mod").hide();
                $("#market-window-mod").show();
            }
        });
        switch (data.order_validity) {
            case "DAY":
                $("#order_validity_mod").val("DAY").trigger("change");
                break;
            case "SESSION":
                $("#order_validity_mod").val("SESSION").trigger("change");
                break;
            case "IOC":
                $("#order_validity_mod").val("IOC").trigger("change");
                break;
            case "FOK":
                $("#order_validity_mod").val("FOK").trigger("change");
                break;
            case "GTC":
                $("#order_validity_mod").val("GTC").trigger("change");
                break;
            case "GTD":
                $("#order_validity_mod").val("GTD").trigger("change");
                break;
            default:
                data.order_validity;
        }
        switch (data.order_side) {
            case "BUY":
                $("#order_side_select_mod").prop("checked", true).trigger("change");
                $("#order_side_mod").val("BUY");
                $(".order_mod_submit_btn").removeClass().addClass("order_mod_submit_btn btn activebuy w-100");
                $(".ord-win-border").css("border-color", "#26a051");
                break;
            case "SELL":
                $("#order_side_select_mod").prop("checked", false).trigger("change");
                $("#order_side_mod").val("SELL");
                $(".order_mod_submit_btn").removeClass().addClass("order_mod_submit_btn btn activesell w-100");
                $(".ord-win-border").css("border-color", "#c71919");
                break;
            default:
                data.order_side;
        }
        switch (data.pvt_mkt_order) {
            case "true":
                $("#pvt_mkt_checkbox_mod").prop("checked", true);
                break;
            case "false":
                $("#pvt_mkt_checkbox_mod").prop("checked", false);
                break;
            default:
                data.pvt_mkt_order;
        }
        switch (data.limit_order_type) {
            case "Buy Limit":
                $("#order_side_mod").val("BUY");
                $(".ord-win-border").css("border-color", "#26a051");
                $("#order_side_select_mod").prop("checked", true).trigger("change");
                $(".order_mod_submit_btn").removeClass().addClass("order_mod_submit_btn btn activebuy w-100");
                break;
            case "Sell Limit":
                $("#order_side_mod").val("SELL");
                $(".ord-win-border").css("border-color", "#c71919");
                $("#order_side_select_mod").prop("checked", false).trigger("change");
                $(".order_mod_submit_btn").removeClass().addClass("order_mod_submit_btn btn activesell w-100");
                break;
            default:
                data.limit_order_type;
        }
        $("#limit_order_date_mod").val(data.limit_order_date);
        $("#limit_order_expiry_date_mod").val(data.limit_order_expiry_date);
        switch (data.pvt_limit_order) {
            case "true":
                $("#pvt_limit_checkbox_mod").prop("checked", true);
                break;
            case "false":
                $("#pvt_limit_checkbox_mod").prop("checked", false);
                break;
            default:
                data.pvt_limit_order;
        }
        order_value_original = data.order_price * data.order_qty;
        $("#order_value_diff_mod_text").removeClass().addClass("neutral");
        $("#order_value_diff_mod_text").text("0.00");
        $("#order_value_diff_mod").val(0);
        $("#order_value_mod_text").text(order_value_original);
        $("#order_value_mod").val(order_value_original);
        $("#limit_order_yield_mod").val(data.order_yield);
        $("#order_time_mod").val(data.order_time);
        $("#client_order_id_mod").val(data.order_id);
        $("#time_in_force_mod").val(data.time_in_force);
        $("#engine_id_mod").val(data.engine_id);
        $("#emergency_mod").val(data.emergency);
        $("#leaves_qty_mod").val(data.due_qty);
        $("#cum_qty_mod").val(data.cum_qty);
        $("#last_qty_mod").val(data.last_qty);
        $("#last_px_mod").val(data.last_px);
        $("#avg_px_mod").val(data.avg_px);
        $("#order_status_mod").val(data.order_status);
        $("#user_device_mod").val(data.user_device);
        $("#order_branch_mod").val(data.branch);
        $("#sym_isin_mod").val(data.symbol_isin);
        $("#sym_class_mod").val(data.symbol_assetclass);
        $("#sym_category_mod").val(data.symbol_category);
        $("#sym_spot_mod").val(data.compulsory_spot);
        $("#chain_id_mod").val(data.chain_id);
        $("#exec_status_mod").val(data.exec_status);
        $("#reforder_id_mod").val(data.reforder_id);
    });
}
$("body").on("input change", "#limit_order_rate_mod", function (e) {
    var saleable = parseInt($("#saleable_qty_mod").val()) || 0;
    var original_qty = parseInt($("#original_qty_mod").val());
    var qty = parseInt($("#order_qty_mod").val()) || 0;
    var price = parseFloat($(this).val()) || 0;
    var cashlimit = parseFloat($("#ac_balance_mod").val());
    var value = 0;
    var orderside = $("#order_side_mod").val();
    var order_type = $("#order_type_mod").val();
    if (order_type == "Limit") {
        if (verify_fields_mod() == false) {
            $(".order_mod_submit_btn").prop("disabled", true);
        }
        if (qty != 0 && price != 0) {
            value = qty * price;
            var value_diff = value - order_value_original;
            if (value_diff < 0) $("#order_value_diff_mod_text").removeClass().addClass("down");
            if (value_diff == 0) $("#order_value_diff_mod_text").removeClass().addClass("neutral");
            if (value_diff > 0) $("#order_value_diff_mod_text").removeClass().addClass("up");
            $("#order_value_diff_mod_text").text(Number(value_diff).toLocaleString("en-IN"));
            $("#order_value_diff_mod").val(value_diff);
            $("#order_value_mod_text").text(Number(value).toLocaleString("en-IN"));
            $("#order_value_mod").val(value);
        }
        if ($(".yield_window_mod").is(":visible")) {
            var clean_price = parseFloat($(this).val());
            var period = parseFloat($("#yield_data_mod").data("period"));
            var semi_annual_coupon_payment = parseFloat($("#yield_data_mod").data("couponpayment"));
            var face_value = parseInt($("#yield_data_mod").data("facevalue"));
            var coupon_freq = parseInt($("#yield_data_mod").data("couponfreq"));
            var order_yield = price_to_yield(period, semi_annual_coupon_payment, clean_price, face_value, coupon_freq);
            $("#limit_order_yield_mod").val(order_yield.toFixed(4));
            var accr_int = parseFloat($("#accr_int_mod").text());
            var dirty_price = clean_price + accr_int;
            $("#dirty_price_mod").text(dirty_price.toFixed(4));
        }
        if (orderside == "BUY") {
            if (cashlimit != 0) {
                if (value > cashlimit) {
                    $("#limit_order_rate_mod").css({ color: "red", "font-weight": "bold" });
                    $("#ac_balance_mod").css({ color: "red", "font-weight": "bold" });
                    $(".order_mod_submit_btn").prop("disabled", true);
                }
                if (value <= cashlimit && verify_fields_mod() == true) {
                    $("#limit_order_rate_mod").removeAttr("style");
                    $("#ac_balance_mod").css({ color: "#00DB86", "font-weight": "bold" });
                    $(".order_mod_submit_btn").prop("disabled", false);
                }
            } else {
                $("#limit_order_rate_mod").css({ color: "red", "font-weight": "bold" });
                $(".order_mod_submit_btn").prop("disabled", true);
            }
        }
        if (orderside == "SELL") {
            if (qty > original_qty + saleable) {
                $("#order_qty_mod").css({ color: "red", "font-weight": "bold" });
                $(".order_mod_submit_btn").prop("disabled", true);
            }
            if (qty <= original_qty + saleable && verify_fields_mod() == true) {
                $("#order_qty_mod").removeAttr("style");
                $(".order_mod_submit_btn").prop("disabled", false);
            }
        }
    }
});
$("body").on("input change", "#limit_order_yield_mod", function (e) {
    if ($(".yield_window_mod").is(":visible")) {
        var saleable = parseInt($("#saleable_qty_mod").val()) || 0;
        var original_qty = parseInt($("#original_qty_mod").val());
        var orderside = $("#order_side_mod").val();
        var order_qty = parseInt($("#order_qty_mod").val());
        var cashlimit = parseFloat($("#ac_balance_mod").val());
        var order_rate = parseFloat($("#limit_order_rate_mod").val());
        var order_type = $("#order_type_mod").val();
        if (order_type == "Limit") {
            var yield = $("#limit_order_yield_mod").val();
            var period = $("#yield_data_mod").data("period");
            var semi_annual_coupon_payment = $("#yield_data_mod").data("couponpayment");
            var face_value = $("#yield_data_mod").data("facevalue");
            var order_rate = yield_to_price(yield, period, semi_annual_coupon_payment, face_value);
            $("#limit_order_rate_mod").val(order_rate.toFixed(2));
            var accr_int = parseFloat($("#accr_int_mod").text());
            var dirty_price = order_rate + accr_int;
            $("#dirty_price_mod").text(dirty_price.toFixed(4));
            var order_value = order_qty * parseFloat($("#limit_order_rate_mod").val());
            var value_diff = order_value - order_value_original;
            if (value_diff < 0) $("#order_value_diff_mod_text").removeClass().addClass("down");
            if (value_diff == 0) $("#order_value_diff_mod_text").removeClass().addClass("neutral");
            if (value_diff > 0) $("#order_value_diff_mod_text").removeClass().addClass("up");
            $("#order_value_diff_mod_text").text(Number(value_diff).toLocaleString("en-IN"));
            $("#order_value_diff_mod").val(value_diff);
            $("#order_value_mod_text").text(Number(order_value).toLocaleString("en-IN"));
            $("#order_value_mod").val(order_value);
            if (verify_fields_mod() == true) {
                if (orderside == "SELL") {
                    if (order_qty > original_qty + saleable) {
                        $("#order_qty_mod").css({ color: "red", "font-weight": "bold" });
                        $(".order_mod_submit_btn").prop("disabled", true);
                    }
                    if (order_qty <= original_qty + saleable) {
                        $("#order_qty_mod").removeAttr("style");
                        $(".order_mod_submit_btn").prop("disabled", false);
                    }
                }
                if (cashlimit != 0 && orderside == "BUY") {
                    if (order_value > cashlimit) {
                        $("#limit_order_rate_mod").css({ color: "red", "font-weight": "bold" });
                        $("#ac_balance_mod").css({ color: "red", "font-weight": "bold" });
                        $(".order_mod_submit_btn").prop("disabled", true);
                    }
                    if (order_value <= cashlimit) {
                        $("#limit_order_rate_mod").removeAttr("style");
                        $("#ac_balance_mod").css({ color: "#00DB86", "font-weight": "bold" });
                        $(".order_mod_submit_btn").prop("disabled", false);
                    }
                }
            }
        }
    }
});
$("body").on("input change", "#order_qty_mod", function (e) {
    var saleable = parseInt($("#saleable_qty_mod").val()) || 0;
    var original_qty = parseInt($("#original_qty_mod").val());
    var qty = parseInt($(this).val()) || 0;
    var cashlimit = parseFloat($("#ac_balance_mod").val());
    var price = 0;
    var orderside = $("#order_side_mod").val();
    var order_type = $("#order_type_mod").val();
    var value = 0;
    if (order_type == "Limit") {
        price = parseFloat($("#limit_order_rate_mod").val()) || 0;
        if (verify_fields_mod() == false) {
            $(".order_mod_submit_btn").prop("disabled", true);
        }
        if (qty != 0 && price != 0) {
            value = qty * price;
            var value_diff = value - order_value_original;
            if (value_diff < 0) $("#order_value_diff_mod_text").removeClass().addClass("down");
            if (value_diff == 0) $("#order_value_diff_mod_text").removeClass().addClass("neutral");
            if (value_diff > 0) $("#order_value_diff_mod_text").removeClass().addClass("up");
            $("#order_value_diff_mod_text").text(Number(value_diff).toLocaleString("en-IN"));
            $("#order_value_diff_mod").val(value_diff);
            $("#order_value_mod_text").text(Number(value).toLocaleString("en-IN"));
            $("#order_value_mod").val(value);
        }
        if (orderside == "BUY") {
            if (cashlimit != 0) {
                if (value > cashlimit) {
                    $("#order_qty_mod").css({ color: "red", "font-weight": "bold" });
                    $("#ac_balance_mod").css({ color: "red", "font-weight": "bold" });
                    $(".order_mod_submit_btn").prop("disabled", true);
                }
                if (value <= cashlimit && verify_fields_mod() == true) {
                    $("#order_qty_mod").removeAttr("style");
                    $("#ac_balance_mod").css({ color: "#00DB86", "font-weight": "bold" });
                    $(".order_mod_submit_btn").prop("disabled", false);
                }
            } else {
                $("#order_qty_mod").css({ color: "red", "font-weight": "bold" });
                $(".order_mod_submit_btn").prop("disabled", true);
            }
        }
        if (orderside == "SELL") {
            if (qty > original_qty + saleable) {
                $("#order_qty_mod").css({ color: "red", "font-weight": "bold" });
                $(".order_mod_submit_btn").prop("disabled", true);
            }
            if (qty <= original_qty + saleable && verify_fields_mod() == true) {
                $("#order_qty_mod").removeAttr("style");
                $(".order_mod_submit_btn").prop("disabled", false);
            }
        }
    }
});
function getGsecDataMod(symbol) {
    fetch(`shared/getgsecdata/${symbol}`)
        .then((res) => res.json())
        .then((data) => {
            var clean_price = parseFloat($("#limit_order_rate_mod").val());
            var today = new Date();
            var face_value = parseInt(data[4].data_value);
            var coupon_rate_percent = parseFloat(data[8].data_value) / 100;
            var year_basis = parseInt(data[14].data_value);
            var maturity_date = new Date(data[11].data_value);
            var issue_date = new Date(data[7].data_value);
            var coupon_freq = parseInt(data[10].data_value);
            var tenure = data[6].data_value;
            var market_lot = parseInt(data[5].data_value);
            var maturity_period = Math.round(maturity_date.getTime() - today.getTime());
            var days_to_maturity = maturity_period / (1000 * 3600 * 24);
            var years_to_maturity = parseFloat((days_to_maturity / year_basis).toFixed(4));
            var period = years_to_maturity * coupon_freq;
            var semi_annual_coupon_rate_percent = coupon_rate_percent / 2;
            var semi_annual_coupon_payment = face_value * semi_annual_coupon_rate_percent;
            var coupon_period = 0,
                days_till_next_coupon = 0;
            var first_coupon_date = new Date(data[7].data_value);
            var second_coupon_date = new Date(data[7].data_value);
            first_coupon_date.setDate(first_coupon_date.getDate() + year_basis / 2);
            second_coupon_date.setDate(second_coupon_date.getDate() + year_basis);
            if (days_to_maturity > 0) {
                first_coupon_date.setFullYear(today.getFullYear());
                second_coupon_date.setFullYear(today.getFullYear());
                first_coupon_month_diff = first_coupon_date.getMonth() - today.getMonth();
                second_coupon_month_diff = second_coupon_date.getMonth() - today.getMonth();
                if (first_coupon_month_diff < second_coupon_month_diff) {
                    coupon_period = Math.round(first_coupon_date.getTime() - today.getTime());
                } else {
                    coupon_period = Math.round(second_coupon_date.getTime() - today.getTime());
                }
                days_till_next_coupon = coupon_period / (1000 * 3600 * 24);
            }
            var days_since_last_coupon = year_basis / coupon_freq - days_till_next_coupon;
            var accr_int = parseFloat(((face_value * coupon_rate_percent * days_since_last_coupon) / year_basis).toFixed(4));
            if ($("#yield_data_mod").is(":visible")) {
                $("#yield_data_mod").attr("data-period", period);
                $("#yield_data_mod").attr("data-couponpayment", semi_annual_coupon_payment);
                $("#yield_data_mod").attr("data-facevalue", face_value);
                $("#yield_data_mod").attr("data-couponfreq", coupon_freq);
                $("#dirty_price_mod").text("");
                $("#accr_int_mod").text(accr_int);
                $("#accr_int_mod").val(accr_int);
                var dirty_price = clean_price + accr_int;
                $("#dirty_price_mod").text(dirty_price.toFixed(4));
            }
        })
        .catch((err) => {
            console.log(err);
        });
}
function verify_fields_mod() {
    if ($("#order_type_mod").val() == "Limit") {
        if (
            $("#order_client_code_mod").val() != "" &&
            $("#order_instrument_mod").val() != "" &&
            $("#order_qty_mod").val() != "" &&
            $("#limit_order_rate_mod").val() != "" &&
            $("#order_client_code_mod").val() != null &&
            $("#order_instrument_mod").val() != null &&
            $("#order_qty_mod").val() != null &&
            $("#limit_order_rate_mod").val() != null &&
            $("#order_qty_mod").val() != 0 &&
            $("#limit_order_rate_mod").val() != 0
        ) {
            return true;
        } else {
            return false;
        }
    }
}
function checkModSaleable() {
    $("#saleable_qty_mod").val("");
    if ($("#order_instrument_mod").val() != null && $("#order_instrument_mod").val() != "") {
        var symbol_split = $("#order_instrument_mod").val().split(".");
        var clientcode = $("#order_client_code_mod").val();
        var symbol = symbol_split[0];
        var orderside = $("#order_side_mod").val();
        $.getJSON("shared/checksaleable/", { clientcode: clientcode, symbol: symbol }, function (data) {
            $("#saleable_qty_mod").text(Number(data).toLocaleString("en-IN"));
            $("#saleable_qty_mod").val(data);
        });
    }
}
function getModSymbolInfo() {
    if ($("#order_instrument_mod").val() != null) {
        var symbol_split = $("#order_instrument_mod").val().split(".");
        var symbol = symbol_split[0];
        var board = symbol_split[1];
        $.getJSON("shared/getsymboldata/", { mkt_group: board, mkt_symbol: symbol }, function (data) {
            $("#sym_isin_mod").val(data.isin);
            $("#sym_class_mod").val(data.symbol_instr);
            $("#sym_category_mod").val(data.symbol_category);
            if (data.market_type == "S") {
                $("#sym_spot_mod").val("Y");
            }
            if (data.market_type == "P") {
                $("#sym_spot_mod").val("N");
            }
        });
    }
}
function switch_exchange_mod(elemid) {
    if (elemid == "xcg1_mod") {
        $("#xcg1_mod").addClass("widget-btn-mod-active");
        $("#xcg2_mod").removeClass("widget-btn-mod-active");
        $("#xcg3_mod").removeClass("widget-btn-mod-active");
    }
    if (elemid == "xcg2_mod") {
        $("#xcg2_mod").addClass("widget-btn-mod-active");
        $("#xcg1_mod").removeClass("widget-btn-mod-active");
        $("#xcg3_mod").removeClass("widget-btn-mod-active");
    }
    if (elemid == "xcg3_mod") {
        $("#xcg3_mod").addClass("widget-btn-mod-active");
        $("#xcg1_mod").removeClass("widget-btn-mod-active");
        $("#xcg2_mod").removeClass("widget-btn-mod-active");
    }
}
function updatebodata_mod(client_id) {
    var cln_code = client_id;
    if (cln_code.length && code_list.includes(cln_code)) {
        $.getJSON("shared/getbodata/", { cln_code: cln_code }, function (data) {
            if (Object.keys(data).length > 0) {
                document.getElementById("ac_name_mod").innerHTML = "Name : " + data.cln_name;
                $("#ac_balance_mod").text(Number(data.b_limit).toLocaleString("en-IN"));
                $("#ac_balance_mod").val(data.b_limit);
                document.getElementById("order_branch_mod").value = data.branch;
                document.getElementById("client_ac_type_mod").value = data.acc_type;
                document.getElementById("bo_acc_mod").value = data.cln_bo;
                document.getElementById("client_name_mod").value = data.cln_name;
                document.getElementById("pvdr_id_mod").value = "";
                document.getElementById("cln_id_mod").value = "";
                document.getElementById("ref_id_mod").value = "";
                $("#trader_id_mod").attr("data-dse-trader", data.dealer);
                $("#trader_id_mod").attr("data-cse-trader", data.dealer);
                document.getElementById("trader_id_mod").value = data.dealer;
            }
        });
    }
}
function create_order_modify_id(client_code) {
    var d = new Date();
    var n = 8;
    var randomString = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < n; i++) {
        randomString += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    var client_order_id = randomString;
    return client_order_id;
}
function compile_fix_modify_msg(form) {
    var formvals = {};
    var ordermsg = "";
    var orderside = "";
    var ordervalidity = "";
    $.each($(form).serializeArray(), function (i, field) {
        formvals[field.name] = field.value;
    });
    switch (formvals.order_validity) {
        case "DAY":
            ordervalidity = "0";
            break;
        case "SESSION":
            ordervalidity = "S";
            break;
        case "IOC":
            ordervalidity = "3";
            break;
        case "FOK":
            ordervalidity = "4";
            break;
        case "GTC":
            ordervalidity = "1";
            break;
        case "GTD":
            ordervalidity = "6";
            break;
        default:
            "DAY";
    }
    var symbol_split = formvals.order_instrument.split(".");
    var order_symbol = symbol_split[0];
    var order_board = symbol_split[1];
    if (formvals.exec_status != "Rejected" || formvals.reforder_id == "") {
        formvals.reforder_id = formvals.client_order_id;
        $("#reforder_id_mod").val(formvals.reforder_id);
    } else {
        formvals.exec_status = "none";
    }
    var new_order_id = create_order_modify_id(formvals.order_client_code);
    formvals.client_order_id = new_order_id;
    $("#client_order_id_mod").val(formvals.client_order_id);
    formvals.order_side == "BUY" ? (orderside = "1") : (orderside = "2");
    formvals.order_time = get_order_sending_time();
    ordermsg = "8=FIXT.1.19=21635=G34=852=20210830-07:08:20.48956=TEST";
    ordermsg +=
        "1=" +
        formvals.bo_acc +
        "11=" +
        formvals.client_order_id +
        "453=1448=" +
        formvals.order_client_code +
        "447=C452=5529=N" +
        "762=" +
        order_board +
        "41=" +
        formvals.reforder_id +
        "37=" +
        formvals.engine_id +
        "59=" +
        ordervalidity +
        "55=" +
        order_symbol +
        "54=" +
        orderside +
        "38=" +
        formvals.order_qty +
        "50=" +
        formvals.trader_id +
        "60=" +
        formvals.order_time +
        "";
    if (formvals.exchange == "DSE") {
        if (formvals.order_type == "Market") {
            ordermsg += "40=1" + "";
            if (formvals.board_type != "BLOCK" && formvals.pvt_mkt_order == "true") {
                ordermsg += "18=S" + "";
            }
            if (formvals.board_type == "BLOCK" && formvals.pvt_mkt_order == "false") {
                ordermsg += "18=w" + "";
            }
            if (formvals.board_type == "BLOCK" && formvals.pvt_mkt_order == "true") {
                ordermsg += "18=w S" + "";
            }
        } else if (formvals.order_type == "MarketBest") {
            ordermsg += "40=Z" + "";
            if (formvals.board_type != "BLOCK" && formvals.pvt_mkt_order == "true") {
                ordermsg += "18=S" + "";
            }
            if (formvals.board_type == "BLOCK" && formvals.pvt_mkt_order == "false") {
                ordermsg += "18=w" + "";
            }
            if (formvals.board_type == "BLOCK" && formvals.pvt_mkt_order == "true") {
                ordermsg += "18=w S" + "";
            }
        } else if (formvals.order_type == "Limit") {
            ordermsg += "40=2" + "44=" + formvals.limit_order_rate + "";
            if (formvals.board_type != "BLOCK" && formvals.pvt_limit_order == "true") {
                ordermsg += "18=S" + "";
            }
            if (formvals.board_type == "BLOCK" && formvals.pvt_limit_order == "false") {
                ordermsg += "18=w" + "";
            }
            if (formvals.board_type == "BLOCK" && formvals.pvt_limit_order == "true") {
                ordermsg += "18=w S" + "";
            }
        } else if (formvals.order_type == "Special") {
            console.log("special orders not processed by Fix directly");
        }
        if (formvals.drip_qty > 0) {
            ordermsg += "1138=" + formvals.drip_qty + "";
        }
        if (formvals.min_qty > 0) {
            ordermsg += "110=" + formvals.min_qty + "";
        }
        ordermsg += "10=100" + "";
    }
    return ordermsg;
}
$("#order-modify-form").submit(function (e) {
    e.preventDefault();
});
function processModifyOrder() {
    $(".order_mod_submit_btn").prop("disabled", true);
    if (modwindow != undefined) {
        modwindow.close();
    }
    $.get("/shared/getmktstatus/", function (data) {
        if (system_user_role != "brokeradmin" && system_user_role != "brokertrader" && system_user_role != "client" && system_user_role != "associate") {
            show_flash_messages("Trading Unauthorized", "danger");
            return;
        }
        if (data["itch_status"] != "Session Connected" || data["fix_status"] != "Session Connected") {
            show_flash_messages("Trade Server Offline", "danger");
            return;
        } else if (data["PUBLIC"] != "CONTINUOUS" && data["PUBLIC"] != "POSTCLOSING") {
            show_flash_messages("Trading not allowed at this time", "danger");
            return;
        } else {
            $("#pvt_limit_checkbox_mod").prop("checked") ? $("#pvt_limit_order_mod").val("true") : $("#pvt_limit_order_mod").val("false");
            $("#pvt_mkt_checkbox_mod").prop("checked") ? $("#pvt_mkt_order_mod").val("true") : $("#pvt_mkt_order_mod").val("false");
            var form = $("#order-modify-form");
            var validator = form.validate();
            if (validator.form()) {
                var rms_check = rms_validation(form, "modify");
                if (rms_check == true) {
                    var fix_msg = compile_fix_modify_msg(form);
                    modify_order(form, fix_msg);
                }
            }
        }
    });
}
function place_at_market() {
    var saleable = parseInt($("#saleable_qty_mod").val()) || 0;
    var original_qty = parseInt($("#original_qty_mod").val());
    var qty = parseInt($("#order_qty_mod").val()) || 0;
    var price = 0;
    var cashlimit = parseFloat($("#ac_balance_mod").val());
    var value = 0;
    var orderside = $("#order_side_mod").val();
    var order_type = $("#order_type_mod").val();
    var symbol_split = $("#order_instrument_mod").val().split(".");
    var symbol = symbol_split[0];
    var board = symbol_split[1];
    $.getJSON("shared/getBBO/", { mkt_group: board, mkt_symbol: symbol }, function (data) {
        if (data.bid_price != null && data.ask_price != null) {
            var md_bid = data.bid_price;
            var md_ask = data.ask_price;
            var bid_vol = data.bid_qty;
            var ask_vol = data.ask_qty;
            if (orderside == "BUY") {
                price = md_ask;
                $("#limit_order_rate_mod").val(md_ask);
            }
            if (orderside == "SELL") {
                price = md_bid;
                $("#limit_order_rate_mod").val(md_bid);
            }
            if (order_type == "Limit") {
                if (verify_fields_mod() == false) {
                    show_flash_messages("Invalid Trade Data");
                    return;
                }
                $("#order_value_mod").val(order_value_original);
                if (qty != 0 && price != 0) {
                    value = qty * price;
                    var value_diff = value - order_value_original;
                    if (value_diff < 0) $("#order_value_diff_mod_text").removeClass().addClass("down");
                    if (value_diff == 0) $("#order_value_diff_mod_text").removeClass().addClass("neutral");
                    if (value_diff > 0) $("#order_value_diff_mod_text").removeClass().addClass("up");
                    $("#order_value_diff_mod_text").text(Number(value_diff).toLocaleString("en-IN"));
                    $("#order_value_diff_mod").val(value_diff);
                    $("#order_value_mod_text").text(Number(value).toLocaleString("en-IN"));
                    $("#order_value_mod").val(value);
                }
                if (board == "YIELDDBT") {
                    var clean_price = price;
                    var period = parseFloat($("#yield_data_mod").data("period"));
                    var semi_annual_coupon_payment = parseFloat($("#yield_data_mod").data("couponpayment"));
                    var face_value = parseInt($("#yield_data_mod").data("facevalue"));
                    var coupon_freq = parseInt($("#yield_data_mod").data("couponfreq"));
                    var order_yield = price_to_yield(period, semi_annual_coupon_payment, clean_price, face_value, coupon_freq);
                    $("#limit_order_yield_mod").val(order_yield.toFixed(4));
                    var accr_int = parseFloat($("#accr_int_mod").text());
                    var dirty_price = clean_price + accr_int;
                    $("#dirty_price_mod").text(dirty_price.toFixed(4));
                }
                if (orderside == "BUY") {
                    if (cashlimit != 0) {
                        if (value > cashlimit) {
                            show_flash_messages("Cash Limit Exceeded");
                            return;
                        }
                        if (value <= cashlimit && verify_fields_mod() == true) {
                            execute_at_market();
                        }
                    }
                }
                if (orderside == "SELL") {
                    if (qty > original_qty + saleable) {
                        show_flash_messages("Saleable Limit Exceeded");
                        return;
                    }
                    if (qty <= original_qty + saleable && verify_fields_mod() == true) {
                        execute_at_market();
                    }
                }
            }
        } else {
            show_flash_messages("Best Price Not Available");
            return;
        }
    });
}
function execute_at_market() {
    $.get("/shared/getmktstatus/", function (data) {
        if (system_user_role != "brokertrader" && system_user_role != "client" && system_user_role != "associate") {
            show_flash_messages("Trading Unauthorized", "danger");
            return;
        }
        if (data["itch_status"] != "Session Connected" || data["fix_status"] != "Session Connected") {
            show_flash_messages("Trade Server Offline", "danger");
            return;
        } else if (data["PUBLIC"] != "CONTINUOUS" && data["PUBLIC"] != "POSTCLOSING") {
            show_flash_messages("Trading not allowed at this time", "danger");
            return;
        } else {
            $("#pvt_limit_checkbox_mod").prop("checked") ? $("#pvt_limit_order_mod").val("true") : $("#pvt_limit_order_mod").val("false");
            $("#pvt_mkt_checkbox_mod").prop("checked") ? $("#pvt_mkt_order_mod").val("true") : $("#pvt_mkt_order_mod").val("false");
            var form = $("#order-modify-form");
            var validator = form.validate();
            if (validator.form()) {
                var rms_check = rms_validation(form, "modify");
                if (rms_check == true) {
                    var fix_msg = compile_fix_modify_msg(form);
                    market_execution_order(form, fix_msg);
                }
            }
        }
    });
}
function market_execution_order(form, fix_msg) {
    var formvals = {};
    $.each($(form).serializeArray(), function (i, field) {
        formvals[field.name] = field.value;
    });
    formvals.order_qty == "" ? $("#order_qty_mod").val("0") : (formvals.order_qty = formvals.order_qty);
    formvals.drip_qty == "" ? $("#drip_qty_mod").val("0") : (formvals.drip_qty = formvals.drip_qty);
    formvals.min_qty == "" ? $("#min_qty_mod").val("0") : (formvals.min_qty = formvals.min_qty);
    formvals.stop_loss == "" ? $("#stop_loss_mod").val("0.00") : (formvals.stop_loss = formvals.stop_loss);
    formvals.take_profit == "" ? $("#take_profit_mod").val("0.00") : (formvals.take_profit = formvals.take_profit);
    formvals.limit_order_rate == "" ? $("#limit_order_rate_mod").val("0.00") : (formvals.limit_order_rate = formvals.limit_order_rate);
    formvals.limit_order_yield == "" ? $("#limit_order_yield_mod").val("0.00") : (formvals.limit_order_yield = formvals.limit_order_yield);
    formvals.order_status = "modify request";
    formvals.fix_msg = fix_msg;
    order_symbol = formvals.order_instrument.split(".")[0];
    confirm_msg =
        "Execute " +
        formvals.order_side +
        " Order? <br>" +
        "Order ID: " +
        formvals.reforder_id +
        "<br>" +
        "Ticker: " +
        order_symbol +
        "<br>" +
        "Qty: " +
        formvals.order_qty +
        "<br>" +
        "New Price: " +
        formvals.limit_order_rate +
        "<br>" +
        "Client Code: " +
        formvals.order_client_code +
        "<br>" +
        "Name: " +
        formvals.client_name;
    $.confirm({
        title: "Confirm Execution",
        titleClass: "text-center",
        content: confirm_msg,
        typeAnimated: true,
        theme: "dark",
        escapeKey: "NO",
        buttons: {
            YES: {
                keys: ["enter"],
                btnClass: "btn-success",
                action: function () {
                    publish_order_cache_msg(JSON.stringify(formvals));
                },
            },
            NO: { btnClass: "btn-danger", action: function () { } },
        },
    });
}
function modify_order(form, fix_msg) {
    var formvals = {};
    $.each($(form).serializeArray(), function (i, field) {
        formvals[field.name] = field.value;
    });
    formvals.order_qty == "" ? $("#order_qty_mod").val("0") : (formvals.order_qty = formvals.order_qty);
    formvals.drip_qty == "" ? $("#drip_qty_mod").val("0") : (formvals.drip_qty = formvals.drip_qty);
    formvals.min_qty == "" ? $("#min_qty_mod").val("0") : (formvals.min_qty = formvals.min_qty);
    formvals.stop_loss == "" ? $("#stop_loss_mod").val("0.00") : (formvals.stop_loss = formvals.stop_loss);
    formvals.take_profit == "" ? $("#take_profit_mod").val("0.00") : (formvals.take_profit = formvals.take_profit);
    formvals.limit_order_rate == "" ? $("#limit_order_rate_mod").val("0.00") : (formvals.limit_order_rate = formvals.limit_order_rate);
    formvals.limit_order_yield == "" ? $("#limit_order_yield_mod").val("0.00") : (formvals.limit_order_yield = formvals.limit_order_yield);
    formvals.order_status = "modify request";
    formvals.fix_msg = fix_msg;
    order_symbol = formvals.order_instrument.split(".")[0];
    confirm_msg =
        "Modify " +
        formvals.order_side +
        " Order? <br>" +
        "Order ID: " +
        formvals.reforder_id +
        "<br>" +
        "Ticker: " +
        order_symbol +
        "<br>" +
        "New Qty: " +
        formvals.order_qty +
        "<br>" +
        "New Price: " +
        formvals.limit_order_rate +
        "<br>" +
        "Client Code: " +
        formvals.order_client_code +
        "<br>" +
        "Name: " +
        formvals.client_name;
    $.confirm({
        title: "Modify Order",
        titleClass: "text-center",
        content: confirm_msg,
        typeAnimated: true,
        theme: "dark",
        escapeKey: "NO",
        buttons: {
            YES: {
                keys: ["enter"],
                btnClass: "btn-success",
                action: function () {
                    publish_order_cache_msg(JSON.stringify(formvals));
                },
            },
            NO: { btnClass: "btn-danger", action: function () { } },
        },
    });
}
function make_private(client_order_id) {
    var getorderdata = $.getJSON("shared/getorderdata/", { orderid: client_order_id }, function (data) {
        switch (data.exchange) {
            case "Priority":
                elemid = "xcg1_mod";
                break;
            case "DSE":
                elemid = "xcg2_mod";
                break;
            case "CSE":
                elemid = "xcg3_mod";
                break;
            default:
                "DSE";
        }
        $("#exchange_mod").empty();
        $("#exchange_mod").append($("<option>", { value: data.exchange, text: data.exchange }));
        switch_exchange_mod(elemid);
        $("#order_client_code_mod").empty();
        $("#order_client_code_mod").append($("<option>", { value: data.client_code, text: data.client_code }));
        $("#order_instrument_mod").empty();
        $("#order_instrument_mod").append($("<option>", { value: data.symbol_code + "." + data.board_type, text: data.symbol_code + "." + data.board_type }));
        $("#limit_order_type_mod").empty();
        $("#limit_order_type_mod").append($("<option>", { value: data.limit_order_type, text: data.limit_order_type }));
        $("#order_qty_mod").val(data.order_qty);
        $("#drip_qty_mod").val(data.drip_qty);
        $("#min_qty_mod").val(data.min_qty);
        $("#stop_loss_mod").val(data.stop_loss);
        $("#take_profit_mod").val(data.take_profit);
        switch (data.order_type) {
            case "Market":
                $("#order_type_mod").val("Market").trigger("change");
                $("#limit-window-mod").hide();
                $("#market-window-mod").show();
                break;
            case "Limit":
                $("#order_type_mod").val("Limit").trigger("change");
                $("#limit-window-mod").show();
                $("#market-window-mod").hide();
                break;
            case "MarketBest":
                $("#order_type_mod").val("MarketBest").trigger("change");
                $("#limit-window-mod").hide();
                $("#market-window-mod").show();
                break;
            default:
                data.order_type;
        }
        $("#order_type_mod").change(function () {
            var order_type_mod = $("#order_type_mod").val();
            if (order_type_mod == "Limit" || order_type_mod == "WON") {
                $("#limit-window-mod").show();
                $("#market-window-mod").hide();
            }
            if (order_type_mod == "Market" || order_type_mod == "MarketBest") {
                $("#limit-window-mod").hide();
                $("#market-window-mod").show();
            }
        });
        switch (data.order_validity) {
            case "DAY":
                $("#order_validity_mod").val("DAY").trigger("change");
                break;
            case "SESSION":
                $("#order_validity_mod").val("SESSION").trigger("change");
                break;
            case "IOC":
                $("#order_validity_mod").val("IOC").trigger("change");
                break;
            case "FOK":
                $("#order_validity_mod").val("FOK").trigger("change");
                break;
            case "GTC":
                $("#order_validity_mod").val("GTC").trigger("change");
                break;
            case "GTD":
                $("#order_validity_mod").val("GTD").trigger("change");
                break;
            default:
                data.order_validity;
        }
        switch (data.order_side) {
            case "BUY":
                $("#order_side_select_mod").prop("checked", true).trigger("change");
                $("#order_side_mod").val("BUY");
                $(".order_mod_submit_btn").removeClass().addClass("order_mod_submit_btn btn activebuy w-100");
                $(".ord-win-border").css("border-color", "#26a051");
                break;
            case "SELL":
                $("#order_side_select_mod").prop("checked", false).trigger("change");
                $("#order_side_mod").val("SELL");
                $(".order_mod_submit_btn").removeClass().addClass("order_mod_submit_btn btn activesell w-100");
                $(".ord-win-border").css("border-color", "#c71919");
                break;
            default:
                data.order_side;
        }
        switch (data.pvt_mkt_order) {
            case "true":
                $("#pvt_mkt_order_mod").val("true");
                break;
            case "false":
                $("#pvt_mkt_order_mod").val("false");
                break;
            default:
                data.pvt_mkt_order;
        }
        switch (data.limit_order_type) {
            case "Buy Limit":
                $("#order_side_mod").val("BUY");
                $(".ord-win-border").css("border-color", "#26a051");
                $("#order_side_select_mod").prop("checked", true).trigger("change");
                $(".order_mod_submit_btn").removeClass().addClass("order_mod_submit_btn btn activebuy w-100");
                break;
            case "Sell Limit":
                $("#order_side_mod").val("SELL");
                $(".ord-win-border").css("border-color", "#c71919");
                $("#order_side_select_mod").prop("checked", false).trigger("change");
                $(".order_mod_submit_btn").removeClass().addClass("order_mod_submit_btn btn activesell w-100");
                break;
            default:
                data.limit_order_type;
        }
        $("#limit_order_date_mod").val(data.limit_order_date);
        $("#limit_order_expiry_date_mod").val(data.limit_order_expiry_date);
        switch (data.pvt_limit_order) {
            case "true":
                $("#pvt_limit_order_mod").val("true");
                break;
            case "false":
                $("#pvt_limit_order_mod").val("false");
                break;
            default:
                data.pvt_limit_order;
        }
        $("#limit_order_rate_mod").val(data.order_price);
        $("#limit_order_yield_mod").val(data.order_yield);
        $("#order_time_mod").val(data.order_time);
        $("#client_order_id_mod").val(data.order_id);
        $("#time_in_force_mod").val(data.time_in_force);
        $("#engine_id_mod").val(data.engine_id);
        $("#partial_qty_mod").val(data.partial_qty);
        $("#emergency_mod").val(data.emergency);
        $("#leaves_qty_mod").val(data.due_qty);
        $("#cum_qty_mod").val(data.cum_qty);
        $("#last_qty_mod").val(data.last_qty);
        $("#last_px_mod").val(data.last_px);
        $("#avg_px_mod").val(data.avg_px);
        $("#order_status_mod").val(data.order_status);
        $("#user_device_mod").val(data.user_device);
        $("#order_branch_mod").val(data.branch);
        document.getElementById("bo_acc_mod").value = data.bo_acc;
        document.getElementById("client_name_mod").value = data.client_name;
        document.getElementById("pvdr_id_mod").value = data.broker_id;
        document.getElementById("cln_id_mod").value = data.user_id;
        document.getElementById("ref_id_mod").value = data.ref_user_id;
        document.getElementById("trader_id_mod").value = data.trader_ws_id;
        $("#sym_isin_mod").val(data.symbol_isin);
        $("#sym_class_mod").val(data.symbol_assetclass);
        $("#sym_category_mod").val(data.symbol_category);
        $("#sym_spot_mod").val(data.compulsory_spot);
        $("#chain_id_mod").val(data.chain_id);
        $("#exec_status_mod").val(data.exec_status);
        $("#reforder_id_mod").val(data.reforder_id);
    });
    $.when(getorderdata).then(function () {
        var form = $("#order-modify-form");
        var fix_msg = compile_fix_convert_msg(form);
    });
}
function release_order(client_order_id) {
    var getorderdata = $.getJSON("shared/getorderdata/", { orderid: client_order_id }, function (data) {
        switch (data.exchange) {
            case "Priority":
                elemid = "xcg1_mod";
                break;
            case "DSE":
                elemid = "xcg2_mod";
                break;
            case "CSE":
                elemid = "xcg3_mod";
                break;
            default:
                "DSE";
        }
        $("#exchange_mod").empty();
        $("#exchange_mod").append($("<option>", { value: data.exchange, text: data.exchange }));
        switch_exchange_mod(elemid);
        $("#order_client_code_mod").empty();
        $("#order_client_code_mod").append($("<option>", { value: data.client_code, text: data.client_code }));
        $("#order_instrument_mod").empty();
        $("#order_instrument_mod").append($("<option>", { value: data.symbol_code + "." + data.board_type, text: data.symbol_code + "." + data.board_type }));
        $("#limit_order_type_mod").empty();
        $("#limit_order_type_mod").append($("<option>", { value: data.limit_order_type, text: data.limit_order_type }));
        $("#order_qty_mod").val(data.order_qty);
        $("#drip_qty_mod").val(data.drip_qty);
        $("#min_qty_mod").val(data.min_qty);
        $("#stop_loss_mod").val(data.stop_loss);
        $("#take_profit_mod").val(data.take_profit);
        switch (data.order_type) {
            case "Market":
                $("#order_type_mod").val("Market").trigger("change");
                $("#limit-window-mod").hide();
                $("#market-window-mod").show();
                break;
            case "Limit":
                $("#order_type_mod").val("Limit").trigger("change");
                $("#limit-window-mod").show();
                $("#market-window-mod").hide();
                break;
            case "MarketBest":
                $("#order_type_mod").val("MarketBest").trigger("change");
                $("#limit-window-mod").hide();
                $("#market-window-mod").show();
                break;
            default:
                data.order_type;
        }
        $("#order_type_mod").change(function () {
            var order_type_mod = $("#order_type_mod").val();
            if (order_type_mod == "Limit" || order_type_mod == "WON") {
                $("#limit-window-mod").show();
                $("#market-window-mod").hide();
            }
            if (order_type_mod == "Market" || order_type_mod == "MarketBest") {
                $("#limit-window-mod").hide();
                $("#market-window-mod").show();
            }
        });
        switch (data.order_validity) {
            case "DAY":
                $("#order_validity_mod").val("DAY").trigger("change");
                break;
            case "SESSION":
                $("#order_validity_mod").val("SESSION").trigger("change");
                break;
            case "IOC":
                $("#order_validity_mod").val("IOC").trigger("change");
                break;
            case "FOK":
                $("#order_validity_mod").val("FOK").trigger("change");
                break;
            case "GTC":
                $("#order_validity_mod").val("GTC").trigger("change");
                break;
            case "GTD":
                $("#order_validity_mod").val("GTD").trigger("change");
                break;
            default:
                data.order_validity;
        }
        switch (data.order_side) {
            case "BUY":
                $("#order_side_select_mod").prop("checked", true).trigger("change");
                $("#order_side_mod").val("BUY");
                $(".order_mod_submit_btn").removeClass().addClass("order_mod_submit_btn btn activebuy w-100");
                $(".ord-win-border").css("border-color", "#26a051");
                break;
            case "SELL":
                $("#order_side_select_mod").prop("checked", false).trigger("change");
                $("#order_side_mod").val("SELL");
                $(".order_mod_submit_btn").removeClass().addClass("order_mod_submit_btn btn activesell w-100");
                $(".ord-win-border").css("border-color", "#c71919");
                break;
            default:
                data.order_side;
        }
        switch (data.pvt_mkt_order) {
            case "true":
                $("#pvt_mkt_order_mod").val("true");
                break;
            case "false":
                $("#pvt_mkt_order_mod").val("false");
                break;
            default:
                data.pvt_mkt_order;
        }
        switch (data.limit_order_type) {
            case "Buy Limit":
                $("#order_side_mod").val("BUY");
                $(".ord-win-border").css("border-color", "#26a051");
                $("#order_side_select_mod").prop("checked", true).trigger("change");
                $(".order_mod_submit_btn").removeClass().addClass("order_mod_submit_btn btn activebuy w-100");
                break;
            case "Sell Limit":
                $("#order_side_mod").val("SELL");
                $(".ord-win-border").css("border-color", "#c71919");
                $("#order_side_select_mod").prop("checked", false).trigger("change");
                $(".order_mod_submit_btn").removeClass().addClass("order_mod_submit_btn btn activesell w-100");
                break;
            default:
                data.limit_order_type;
        }
        $("#limit_order_date_mod").val(data.limit_order_date);
        $("#limit_order_expiry_date_mod").val(data.limit_order_expiry_date);
        switch (data.pvt_limit_order) {
            case "true":
                $("#pvt_limit_order_mod").val("true");
                break;
            case "false":
                $("#pvt_limit_order_mod").val("false");
                break;
            default:
                data.pvt_limit_order;
        }
        $("#limit_order_rate_mod").val(data.order_price);
        $("#limit_order_yield_mod").val(data.order_yield);
        $("#order_time_mod").val(data.order_time);
        $("#client_order_id_mod").val(data.order_id);
        $("#time_in_force_mod").val(data.time_in_force);
        $("#engine_id_mod").val(data.engine_id);
        $("#partial_qty_mod").val(data.partial_qty);
        $("#emergency_mod").val(data.emergency);
        $("#leaves_qty_mod").val(data.due_qty);
        $("#cum_qty_mod").val(data.cum_qty);
        $("#last_qty_mod").val(data.last_qty);
        $("#last_px_mod").val(data.last_px);
        $("#avg_px_mod").val(data.avg_px);
        $("#order_status_mod").val(data.order_status);
        $("#user_device_mod").val(data.user_device);
        $("#order_branch_mod").val(data.branch);
        document.getElementById("bo_acc_mod").value = data.bo_acc;
        document.getElementById("client_name_mod").value = data.client_name;
        document.getElementById("pvdr_id_mod").value = data.broker_id;
        document.getElementById("cln_id_mod").value = data.user_id;
        document.getElementById("ref_id_mod").value = data.ref_user_id;
        document.getElementById("trader_id_mod").value = data.trader_ws_id;
        $("#sym_isin_mod").val(data.symbol_isin);
        $("#sym_class_mod").val(data.symbol_assetclass);
        $("#sym_category_mod").val(data.symbol_category);
        $("#sym_spot_mod").val(data.compulsory_spot);
        $("#chain_id_mod").val(data.chain_id);
        $("#exec_status_mod").val(data.exec_status);
        $("#reforder_id_mod").val(data.reforder_id);
    });
    $.when(getorderdata).then(function () {
        var form = $("#order-modify-form");
        var fix_msg = compile_fix_release_msg(form);
    });
}
function compile_fix_release_msg(form) {
    var formvals = {};
    var ordermsg = "";
    var orderside = "";
    var ordervalidity = "";
    $.each($(form).serializeArray(), function (i, field) {
        formvals[field.name] = field.value;
    });
    switch (formvals.order_validity) {
        case "DAY":
            ordervalidity = "0";
            break;
        case "SESSION":
            ordervalidity = "S";
            break;
        case "IOC":
            ordervalidity = "3";
            break;
        case "FOK":
            ordervalidity = "4";
            break;
        case "GTC":
            ordervalidity = "1";
            break;
        case "GTD":
            ordervalidity = "6";
            break;
        default:
            "DAY";
    }
    var symbol_split = formvals.order_instrument.split(".");
    var order_symbol = symbol_split[0];
    var order_board = symbol_split[1];
    if (formvals.exec_status != "Rejected" || formvals.reforder_id == "") {
        formvals.reforder_id = formvals.client_order_id;
        $("#reforder_id_mod").val(formvals.reforder_id);
    }
    formvals.client_order_id = create_order_modify_id(formvals.order_client_code);
    $("#client_order_id_mod").val(formvals.client_order_id);
    $("#order_release_id").val(formvals.client_order_id);
    formvals.order_side == "BUY" ? (orderside = "1") : (orderside = "2");
    formvals.order_time = get_order_sending_time();
    formvals.order_status = "release request";
    ordermsg = "8=FIXT.1.19=21635=G34=852=20210830-07:08:20.48956=TEST";
    ordermsg +=
        "1=" +
        formvals.bo_acc +
        "11=" +
        formvals.client_order_id +
        "453=1448=" +
        formvals.order_client_code +
        "447=C452=5529=N" +
        "762=" +
        order_board +
        "41=" +
        formvals.reforder_id +
        "37=" +
        formvals.engine_id +
        "59=" +
        ordervalidity +
        "55=" +
        order_symbol +
        "54=" +
        orderside +
        "38=" +
        formvals.order_qty +
        "50=" +
        formvals.trader_id +
        "60=" +
        formvals.order_time +
        "";
    if (formvals.exchange == "DSE") {
        if (formvals.order_type == "Market") {
            ordermsg += "40=1" + "";
            if (formvals.board_type != "BLOCK" && formvals.pvt_mkt_order == "true") {
                ordermsg += "18=q" + "";
                formvals.pvt_mkt_order = "false";
            }
            if (formvals.board_type == "BLOCK" && formvals.pvt_mkt_order == "true") {
                ordermsg += "18=w q" + "";
                formvals.pvt_mkt_order = "false";
            }
        } else if (formvals.order_type == "MarketBest") {
            ordermsg += "40=Z" + "";
            if (formvals.board_type != "BLOCK" && formvals.pvt_mkt_order == "true") {
                ordermsg += "18=q" + "";
                formvals.pvt_mkt_order = "false";
            }
            if (formvals.board_type == "BLOCK" && formvals.pvt_mkt_order == "true") {
                ordermsg += "18=w q" + "";
                formvals.pvt_mkt_order = "false";
            }
        } else if (formvals.order_type == "Limit") {
            ordermsg += "40=2" + "44=" + formvals.limit_order_rate + "";
            if (formvals.board_type != "BLOCK" && formvals.pvt_limit_order == "true") {
                ordermsg += "18=q" + "";
                formvals.pvt_limit_order = "false";
            }
            if (formvals.board_type == "BLOCK" && formvals.pvt_limit_order == "true") {
                ordermsg += "18=w q" + "";
                formvals.pvt_limit_order = "false";
            }
        } else if (formvals.order_type == "Special") {
            console.log("special orders not processed by Fix directly");
        }
        if (formvals.drip_qty > 0) {
            ordermsg += "1138=" + formvals.drip_qty + "";
        }
        if (formvals.min_qty > 0) {
            ordermsg += "110=" + formvals.min_qty + "";
        }
        ordermsg += "10=100" + "";
    }
    formvals.fix_msg = ordermsg;
    confirm_msg =
        "Release " +
        formvals.order_side +
        " Private Order? <br>" +
        "Order ID: " +
        formvals.reforder_id +
        "<br>" +
        "Ticker: " +
        order_symbol +
        "<br>" +
        "Qty: " +
        formvals.order_qty +
        " | Price: " +
        formvals.limit_order_rate +
        "<br>" +
        "Client Code: " +
        formvals.order_client_code +
        "<br>" +
        "Name: " +
        formvals.client_name;
    $.confirm({
        title: "Release Order",
        titleClass: "text-center",
        content: confirm_msg,
        typeAnimated: true,
        theme: "dark",
        escapeKey: "NO",
        buttons: {
            YES: {
                keys: ["enter"],
                btnClass: "btn-success",
                action: function () {
                    publish_order_cache_msg(JSON.stringify(formvals));
                },
            },
            NO: { btnClass: "btn-danger", action: function () { } },
        },
    });
    return;
}
function compile_fix_convert_msg(form) {
    var formvals = {};
    var ordermsg = "";
    var orderside = "";
    var ordervalidity = "";
    $.each($(form).serializeArray(), function (i, field) {
        formvals[field.name] = field.value;
    });
    switch (formvals.order_validity) {
        case "DAY":
            ordervalidity = "0";
            break;
        case "SESSION":
            ordervalidity = "S";
            break;
        case "IOC":
            ordervalidity = "3";
            break;
        case "FOK":
            ordervalidity = "4";
            break;
        case "GTC":
            ordervalidity = "1";
            break;
        case "GTD":
            ordervalidity = "6";
            break;
        default:
            "DAY";
    }
    var symbol_split = formvals.order_instrument.split(".");
    var order_symbol = symbol_split[0];
    var order_board = symbol_split[1];
    if (formvals.exec_status != "Rejected" || formvals.reforder_id == "") {
        formvals.reforder_id = formvals.client_order_id;
        $("#reforder_id_mod").val(formvals.reforder_id);
    }
    formvals.client_order_id = create_order_modify_id(formvals.order_client_code);
    $("#client_order_id_mod").val(formvals.client_order_id);
    $("#order_convert_id").val(formvals.client_order_id);
    formvals.order_side == "BUY" ? (orderside = "1") : (orderside = "2");
    formvals.order_time = get_order_sending_time();
    formvals.order_status = "private request";
    ordermsg = "8=FIXT.1.19=21635=G34=852=20210830-07:08:20.48956=TEST";
    ordermsg +=
        "1=" +
        formvals.bo_acc +
        "11=" +
        formvals.client_order_id +
        "453=1448=" +
        formvals.order_client_code +
        "447=C452=5529=N" +
        "762=" +
        order_board +
        "41=" +
        formvals.reforder_id +
        "37=" +
        formvals.engine_id +
        "59=" +
        ordervalidity +
        "55=" +
        order_symbol +
        "54=" +
        orderside +
        "38=" +
        formvals.order_qty +
        "50=" +
        formvals.trader_id +
        "60=" +
        formvals.order_time +
        "";
    if (formvals.exchange == "DSE") {
        if (formvals.order_type == "Market") {
            ordermsg += "40=1" + "";
            if (formvals.board_type != "BLOCK" && formvals.pvt_mkt_order == "false") {
                ordermsg += "18=S" + "";
                formvals.pvt_mkt_order = "true";
            }
            if (formvals.board_type == "BLOCK" && formvals.pvt_mkt_order == "false") {
                ordermsg += "18=w S" + "";
                formvals.pvt_mkt_order = "true";
            }
        } else if (formvals.order_type == "MarketBest") {
            ordermsg += "40=Z" + "";
            if (formvals.board_type != "BLOCK" && formvals.pvt_mkt_order == "false") {
                ordermsg += "18=S" + "";
                formvals.pvt_mkt_order = "true";
            }
            if (formvals.board_type == "BLOCK" && formvals.pvt_mkt_order == "false") {
                ordermsg += "18=w S" + "";
                formvals.pvt_mkt_order = "true";
            }
        } else if (formvals.order_type == "Limit") {
            ordermsg += "40=2" + "44=" + formvals.limit_order_rate + "";
            if (formvals.board_type != "BLOCK" && formvals.pvt_limit_order == "false") {
                ordermsg += "18=S" + "";
                formvals.pvt_limit_order = "true";
            }
            if (formvals.board_type == "BLOCK" && formvals.pvt_limit_order == "false") {
                ordermsg += "18=w S" + "";
                formvals.pvt_limit_order = "true";
            }
        } else if (formvals.order_type == "Special") {
            console.log("special orders not processed by Fix directly");
        }
        if (formvals.drip_qty > 0) {
            ordermsg += "1138=" + formvals.drip_qty + "";
        }
        if (formvals.min_qty > 0) {
            ordermsg += "110=" + formvals.min_qty + "";
        }
        ordermsg += "10=100" + "";
    }
    formvals.fix_msg = ordermsg;
    confirm_msg =
        "Make Private: " +
        formvals.order_side +
        " Order? <br>" +
        "Order ID: " +
        formvals.reforder_id +
        "<br>" +
        "Ticker: " +
        order_symbol +
        "<br>" +
        "Qty: " +
        formvals.order_qty +
        " | Price: " +
        formvals.limit_order_rate +
        "<br>" +
        "Client Code: " +
        formvals.order_client_code +
        "<br>" +
        "Name: " +
        formvals.client_name;
    $.confirm({
        title: "Private Order",
        titleClass: "text-center",
        content: confirm_msg,
        typeAnimated: true,
        theme: "dark",
        escapeKey: "NO",
        buttons: {
            YES: {
                keys: ["enter"],
                btnClass: "btn-success",
                action: function () {
                    publish_order_cache_msg(JSON.stringify(formvals));
                },
            },
            NO: { btnClass: "btn-danger", action: function () { } },
        },
    });
    return;
}
