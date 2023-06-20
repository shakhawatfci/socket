let ws_worker;

// Function to start the web worker
function startWorker() {
  ws_worker = new Worker('/static/js/feeds/ws_worker.js');
  // ... Additional configuration or event listeners for the worker
}

// Function to stop the web worker
function stopWorker() {
  if (myWorker) {
    ws_worker.terminate();
    ws_worker = undefined;
  }
}

// Event handler for page visibility change
document.addEventListener('visibilitychange', function() {
  if (document.visibilityState === 'visible') {
    startWorker();
  } else {
    stopWorker();
  }
});

// Event handler for page load
window.addEventListener('load', function() {
  if (!document.hidden) {
    startWorker();
  }
});

var itch_market_status = "";
var dse_md_cp_msg = {};
var dse_md_ltp_msg = {};
var dse_md_index_msg = {};
var dse_md_bbo_msg = {};
var dse_md_news_msg = {};
var ltp_msg_count = 0;
var last_ltp_msg_count = 0;
var ticker_msg_count = 0;
var last_ticker_msg_count = 0;
var news_msg_count = 0;
var last_news_msg_count = 0;
var ui_refresh_interval = 50;
$.get("/shared/getmktstatus/", function (data) {
    if (data["PUBLIC"] == "CONTINUOUS" || data["PUBLIC"] == "POSTCLOSING") {
        itch_market_status = "OPEN";
    } else {
        itch_market_status = "CLOSED";
    }
});
ws_worker.onmessage = (resp) => {
    var data = JSON.parse(resp.data);
    switch (data.channel) {
        case "dse_md_tv_status":
            requestAnimationFrame(() => {
                dse_md_tv_status(data.msg);
            });
            break;
        case "dse_md_mktevent":
            requestAnimationFrame(() => {
                dse_md_mktevent(data.msg);
            });
            break;
        case "dse_md_cp":
            dse_md_cp_msg = data.msg;
            break;
        case "dse_md_ltp":
            dse_md_ltp_msg = data.msg;
            ltp_msg_count += 1;
            ticker_msg_count += 1;
            break;
        case "dse_md_index":
            dse_md_index_msg = data.msg;
            break;
        case "dse_md_bbo":
            dse_md_bbo_msg = data.msg;
            break;
        case "dse_md_mktdepth":
            requestAnimationFrame(() => {
                dse_md_mktdepth(data.msg);
            });
            break;
        case "dse_md_news":
            dse_md_news_msg = data.msg;
            news_msg_count += 1;
            break;
        case "uftcl_fix_status":
            requestAnimationFrame(() => {
                uftcl_fix_status(data.msg);
            });
            break;
        case "uftcl_dealer_trades":
            requestAnimationFrame(() => {
                uftcl_dealer_trades(data.msg);
            });
            break;
        case "uftcl_client_trades":
            requestAnimationFrame(() => {
                uftcl_client_trades(data.msg);
            });
            break;
        case "uftcl_outbound_order_cache":
            requestAnimationFrame(() => {
                uftcl_outbound_order_cache(data.msg);
            });
            break;
        case "uftcl_inbound_trades":
            requestAnimationFrame(() => {
                uftcl_inbound_trades(data.msg);
            });
            break;
        case "uftcl_inbound_reject":
            requestAnimationFrame(() => {
                uftcl_inbound_reject(data.msg);
            });
            break;
        case "rms_update":
            requestAnimationFrame(() => {
                rms_update(data.msg);
            });
            break;
    }
};
setInterval(() => {
    requestAnimationFrame(() => {
        if (_.isEmpty(dse_md_cp_msg) == false) dse_md_cp(dse_md_cp_msg);
    });
}, ui_refresh_interval);
setInterval(() => {
    requestAnimationFrame(() => {
        if (_.isEmpty(dse_md_ltp_msg) == false) dse_md_ltp(dse_md_ltp_msg);
    });
}, ui_refresh_interval);
setInterval(() => {
    requestAnimationFrame(() => {
        if (_.isEmpty(dse_md_ltp_msg) == false) update_ticker(dse_md_ltp_msg);
    });
}, 700);
setInterval(() => {
    requestAnimationFrame(() => {
        if (_.isEmpty(dse_md_index_msg) == false) dse_md_index(dse_md_index_msg);
    });
}, ui_refresh_interval);
setInterval(() => {
    requestAnimationFrame(() => {
        if (_.isEmpty(dse_md_bbo_msg) == false) dse_md_bbo(dse_md_bbo_msg);
    });
}, ui_refresh_interval);
setInterval(() => {
    requestAnimationFrame(() => {
        if (_.isEmpty(dse_md_news_msg) == false) dse_md_news(dse_md_news_msg);
    });
}, ui_refresh_interval);


function dse_md_tv_status(msg) {
    if (parseInt(msg.value.status) == 4) {
        $("#statuslight").prop("title", "Connected");
        $("#statuslight").removeClass().addClass("fa fa-circle text-success");
    } else {
        $("#statuslight").prop("title", "Disconnected");
        $("#statuslight").removeClass().addClass("fa fa-circle text-danger");
    }
}
function dse_md_mktevent(msg) {
    if (msg.value.group == "PUBLIC" && msg.value.event == "Q") {
        itch_market_status = "OPEN";
        document.getElementById("statuslight").title = "Market Open";
        $("#statustext").removeClass().addClass("bold text-success").text("OPEN");
        $("#statuslight").removeClass().addClass("fa fa-circle text-success");
        $("#clockdisplay").removeClass().addClass("text-success");
    } else if (msg.value.group == "PUBLIC" && msg.value.event == "V") {
        itch_market_status = "OPEN";
        document.getElementById("statuslight").title = "POSTCLOSE";
        $("#statustext").removeClass().addClass("bold text-warning").text("POSTCLOSE");
        $("#statuslight").removeClass().addClass("fa fa-circle text-warning");
        $("#clockdisplay").removeClass().addClass("text-warning");
    } else if (msg.value.group == "PUBLIC" && (msg.value.event == "M" || msg.value.event == "E")) {
        itch_market_status = "CLOSED";
        document.getElementById("statuslight").title = "Market Closed";
        $("#statustext").removeClass().addClass("bold text-danger").text("CLOSED");
        $("#statuslight").removeClass().addClass("fa fa-circle text-danger");
        $("#clockdisplay").removeClass().addClass("text-danger");
    }
}
function dse_md_cp(msg) {
    var symbol = msg.value.symbol;
    var group = msg.value.group;
    var high = parseFloat(msg.value.high);
    var low = parseFloat(msg.value.low);
    var close = parseFloat(msg.value.close);
    var change = parseFloat(msg.value.change);
    var change_per = parseFloat(msg.value.change_per);
    var unix_time = parseFloat(msg.value.unix_time);
    var high_elem = symbol.replace(/[^a-zA-Z ]/g, "") + group + "_high";
    var low_elem = symbol.replace(/[^a-zA-Z ]/g, "") + group + "_low";
    var close_elem = symbol.replace(/[^a-zA-Z ]/g, "") + group + "_close";
    var chg_elem = symbol.replace(/[^a-zA-Z ]/g, "") + group + "_chg";
    var chgper_elem = symbol.replace(/[^a-zA-Z ]/g, "") + group + "_chgper";
    if ($("." + high_elem).length > 0 && $("." + high_elem).is(":visible")) {
        $("." + high_elem).text(high);
    }
    if ($("." + low_elem).length > 0 && $("." + low_elem).is(":visible")) {
        $("." + low_elem).text(low);
    }
    if ($("." + close_elem).length > 0 && $("." + close_elem).is(":visible")) {
        $("." + close_elem).text(close);
    }
    if (change > 0) {
        color_class = "up";
        pos_neg = "+";
    } else if (change < 0) {
        color_class = "down";
        pos_neg = "";
    } else {
        color_class = "neutral";
        pos_neg = "";
    }
    $("." + chg_elem).text(pos_neg + change);
    $("." + chg_elem)
        .removeClass("up down neutral")
        .addClass(color_class);
    $("." + chgper_elem).text(pos_neg + change_per + "%");
    $("." + chgper_elem)
        .removeClass("up down neutral")
        .addClass(color_class);
}
function update_ticker(msg) {
    var ltp = parseFloat(msg.value.price);
    var symbol = msg.value.symbol;
    var qty = parseInt(msg.value.executed_quantity);
    var change = parseFloat(msg.value.change);
    var change_per = parseFloat(msg.value.change_per);
    if (last_ticker_msg_count != ticker_msg_count && $(".tickerscroller").is(":visible")) {
        if (change > 0) {
            ticker_entry =
                "<span><b>" +
                symbol +
                '</b>&nbsp;<span style="font-size: 0.8rem;" class="up font-weight-bold">' +
                ltp +
                "</span>" +
                '<span style="font-size: 0.7rem;" class="up font-weight-bold">&nbsp;<span style="color: var(--font-color);">' +
                qty +
                "</span>&nbsp;" +
                change +
                "&nbsp;(" +
                change_per +
                '%)&nbsp;<i class="fa fa-arrow-up"></i></span></span>';
        }
        if (change == 0) {
            ticker_entry =
                "<span><b>" +
                symbol +
                '</b>&nbsp;<span style="font-size: 0.8rem;" class="font-weight-bold">' +
                ltp +
                "</span>" +
                '<span style="font-size: 0.7rem;" class="font-weight-bold">&nbsp;<span style="color: var(--font-color);">' +
                qty +
                "</span>&nbsp;" +
                change +
                "&nbsp;(" +
                change_per +
                '%)&nbsp;<i class="fa fa-sort"></i></span></span>';
        }
        if (change < 0) {
            ticker_entry =
                "<span><b>" +
                symbol +
                '</b>&nbsp;<span style="font-size: 0.8rem;" class="down font-weight-bold">' +
                ltp +
                "</span>" +
                '<span style="font-size: 0.7rem;" class="down font-weight-bold">&nbsp;<span style="color: var(--font-color);">' +
                qty +
                "</span>&nbsp;" +
                change +
                "&nbsp;(" +
                change_per +
                '%)&nbsp;<i class="fa fa-arrow-down"></i></span></span>';
        }
        if (ticker_number < 20) {
            $("#tickerContent .ticker" + ticker_number).html(ticker_entry);
        }
        if (ticker_number == 20) {
            ticker_number = 1;
            $("#tickerContent .ticker" + ticker_number).html(ticker_entry);
            ticker_number = 0;
        }
        last_ticker_msg_count = ticker_msg_count;
        ticker_number += 1;
    }
}
function dse_md_ltp(msg) {
    var ltp = parseFloat(msg.value.price);
    var symbol = msg.value.symbol;
    var group = msg.value.group;
    var qty = parseInt(msg.value.executed_quantity);
    var last_yield = parseFloat(msg.value.last_yield);
    var side = msg.value.side;
    var open = parseFloat(msg.value.open);
    var high = parseFloat(msg.value.high);
    var low = parseFloat(msg.value.low);
    var buy_qty = parseInt(msg.value.buy_qty);
    var buy_value = parseFloat(msg.value.buy_value);
    var buy_trades = parseInt(msg.value.buy_trades);
    var sell_qty = parseInt(msg.value.sell_qty);
    var sell_value = parseFloat(msg.value.sell_value);
    var sell_trades = parseInt(msg.value.sell_trades);
    var total_qty = parseInt(msg.value.total_qty);
    var total_value = parseFloat(msg.value.total_value);
    var total_trades = parseInt(msg.value.total_trades);
    var change = parseFloat(msg.value.change);
    var change_per = parseFloat(msg.value.change_per);
    var trading_state = msg.value.trading_state;
    var market_turnover = parseFloat(msg.value.market_turnover);
    var market_buy_turnover = parseFloat(msg.value.buy_turnover);
    var market_sell_turnover = parseFloat(msg.value.sell_turnover);
    var market_buy_percent = parseFloat(msg.value.buyers);
    var market_sell_percent = parseFloat(msg.value.sellers);
    var market_trade = parseInt(msg.value.market_trade);
    var market_buy_trade = parseInt(msg.value.market_buy_trade);
    var market_sell_trade = parseInt(msg.value.market_sell_trade);
    var market_volume = parseInt(msg.value.market_volume);
    var market_buy_volume = parseInt(msg.value.market_buy_volume);
    var market_sell_volume = parseInt(msg.value.market_sell_volume);
    var unix_time = parseFloat(msg.value.unix_time);
    var ltp_elem = symbol.replace(/[^a-zA-Z ]/g, "") + group + "_ltp";
    var vol_elem = symbol.replace(/[^a-zA-Z ]/g, "") + group + "_vol";
    var last_qty_elem = symbol.replace(/[^a-zA-Z ]/g, "") + group + "_lastqty";
    var chg_elem = symbol.replace(/[^a-zA-Z ]/g, "") + group + "_chg";
    var chgper_elem = symbol.replace(/[^a-zA-Z ]/g, "") + group + "_chgper";
    var open_elem = symbol.replace(/[^a-zA-Z ]/g, "") + group + "_open";
    var high_elem = symbol.replace(/[^a-zA-Z ]/g, "") + group + "_high";
    var low_elem = symbol.replace(/[^a-zA-Z ]/g, "") + group + "_low";
    var trade_elem = symbol.replace(/[^a-zA-Z ]/g, "") + group + "_trade";
    var turnover_elem = symbol.replace(/[^a-zA-Z ]/g, "") + group + "_turnover";
    var buyqty_elem = symbol.replace(/[^a-zA-Z ]/g, "") + group + "_buyqty";
    var buyvalue_elem = symbol.replace(/[^a-zA-Z ]/g, "") + group + "_buyvalue";
    var buytrades_elem = symbol.replace(/[^a-zA-Z ]/g, "") + group + "_buytrades";
    var sellqty_elem = symbol.replace(/[^a-zA-Z ]/g, "") + group + "_sellqty";
    var sellvalue_elem = symbol.replace(/[^a-zA-Z ]/g, "") + group + "_sellvalue";
    var selltrades_elem = symbol.replace(/[^a-zA-Z ]/g, "") + group + "_selltrades";
    var buy_percent = (buy_value / total_value) * 100;
    var sell_percent = (sell_value / total_value) * 100;
    if ($("#market_turnover").length > 0) {
        if (market_turnover > 10000000) {
            market_turnover = market_turnover / 10000000;
            $("#market_turnover").text(Number(market_turnover).toLocaleString("en-IN") + " cr");
        } else {
            $("#market_turnover").text(Number(market_turnover).toLocaleString("en-IN"));
        }
    }
    if (market_volume > 10000000) {
        market_volume = market_volume / 10000000;
        $("#market_volume").text(Number(market_volume).toLocaleString("en-IN") + " cr");
    } else {
        $("#market_volume").text(Number(market_volume).toLocaleString("en-IN"));
    }
    $("#market_trade").text(Number(market_trade).toLocaleString("en-IN"));
    if ($("." + ltp_elem).length > 0 && $("." + ltp_elem).is(":visible")) {
        if (change > 0) {
            color_class = "up";
            pos_neg = "+";
        } else if (change < 0) {
            color_class = "down";
            pos_neg = "";
        } else {
            color_class = "neutral";
            pos_neg = "";
        }
        $("." + chg_elem).text(pos_neg + change);
        $("." + chg_elem)
            .removeClass("up down neutral")
            .addClass(color_class);
        $("." + chgper_elem).text(pos_neg + change_per + "%");
        $("." + chgper_elem)
            .removeClass("up down neutral")
            .addClass(color_class);
        $("." + ltp_elem)
            .removeClass("up down neutral")
            .addClass(color_class);
        if (
            change > 0 &&
            ltp !=
            parseFloat(
                $("." + ltp_elem)
                    .eq(0)
                    .text()
            )
        ) {
            flashup($("." + ltp_elem));
        }
        if (
            change < 0 &&
            ltp !=
            parseFloat(
                $("." + ltp_elem)
                    .eq(0)
                    .text()
            )
        ) {
            flashdown($("." + ltp_elem));
        }
        $("." + ltp_elem).text(ltp);
    }
    if ($("." + last_qty_elem).length > 0 && $("." + last_qty_elem).is(":visible")) {
        $("." + last_qty_elem).text(Number(qty).toLocaleString("en-IN"));
    }
    if ($("." + open_elem).length > 0 && $("." + open_elem).is(":visible")) {
        $("." + open_elem).text(open);
    }
    if ($("." + high_elem).length > 0 && $("." + high_elem).is(":visible")) {
        $("." + high_elem).text(high);
    }
    if ($("." + low_elem).length > 0 && $("." + low_elem).is(":visible")) {
        $("." + low_elem).text(low);
    }
    if ($("." + vol_elem).length > 0 && $("." + vol_elem).is(":visible")) {
        $("." + vol_elem).text(Number(total_qty).toLocaleString("en-IN"));
    }
    if ($("." + trade_elem).length > 0 && $("." + trade_elem).is(":visible")) {
        $("." + trade_elem).text(Number(total_trades).toLocaleString("en-IN"));
    }
    if ($("." + turnover_elem).length > 0 && $("." + turnover_elem).is(":visible")) {
        if (total_value > 10000000) {
            total_value = total_value / 10000000;
            $("." + turnover_elem).text(Number(total_value).toLocaleString("en-IN") + " cr");
        } else {
            $("." + turnover_elem).text(Number(total_value).toLocaleString("en-IN"));
        }
    }
    if (last_ltp_msg_count != ltp_msg_count) {
        if ($("#market_sentiment").length > 0) {
            fgi = Math.round(market_sell_percent);
            if (fgi >= 0 && fgi <= 20) {
                fgistate = "Extreme Bear";
            }
            if (fgi > 20 && fgi <= 40) {
                fgistate = "Bear";
            }
            if (fgi > 40 && fgi <= 60) {
                fgistate = "Neutral";
            }
            if (fgi > 60 && fgi <= 80) {
                fgistate = "Bull";
            }
            if (fgi > 80 && fgi <= 100) {
                fgistate = "Extreme Bull";
            }
            google.setOnLoadCallback(drawSentimentChart);
        }
        update_cash_map_bar(market_buy_percent, market_sell_percent);
        if ($("#tv_chart_container_advanced").length > 0 || $("#tv_chart_container").length > 0) {
            bar = { open: ltp, high: ltp, low: ltp, close: ltp, volume: qty, time: unix_time };
            liveBar(symbol, group, bar);
        }
        last_ltp_msg_count = ltp_msg_count;
    }
}
function dse_md_index(msg) {
    var name = msg.value.index_name;
    var value = parseFloat(msg.value.value);
    var change = parseFloat(msg.value.change);
    var change_per = parseFloat(msg.value.change_per);
    var idx_div = "idx_" + name;
    var idx_val = "val_" + name;
    var idx_chg = "chg_" + name;
    var idx_chgper = "chgper_" + name;
    var bg_color = "transparent";
    var color_class = "";
    var pos_neg = "";
    var border_class = "";
    if (change > 0) {
        color_class = "up";
        arrow_class = "fa fa-arrow-up";
        border_class = "upborder uptab";
        bg_color = "#148556";
        pos_neg = "+";
    }
    if (change == 0) {
        color_class = "";
        arrow_class = "";
        border_class = "ncborder nctab";
        pos_neg = "";
    }
    if (change < 0) {
        color_class = "down";
        arrow_class = "fa fa-arrow-down";
        border_class = "downborder downtab";
        bg_color = "#8d0f0f";
        pos_neg = "";
    }
    if ($("." + idx_div).length > 0) {
        $("." + idx_val).text(value.toFixed(2));
        $("." + idx_val)
            .removeClass()
            .addClass(idx_val + " " + color_class);
        $("." + idx_val).data("now", value);
        $("." + idx_chg).text(pos_neg + change.toFixed(2));
        $("." + idx_chg)
            .removeClass()
            .addClass(idx_chg + " " + color_class);
        $("." + idx_chgper).text("(" + pos_neg + change_per.toFixed(2) + "%)");
        $("." + idx_chgper)
            .removeClass()
            .addClass(idx_chgper + " " + color_class);
    }
    if ($(".globalval_" + name).length > 0) {
        $(".globalval_" + name).data("now", value);
        $(".globalval_" + name).text(value.toFixed(2));
        $(".globalval_" + name).css("background-color", bg_color);
        $(".globalval_" + name).css("border-radius", "5px");
        $(".idx_arrow")
            .removeClass()
            .addClass("idx_arrow " + color_class + " fa fa-caret-" + color_class);
        $(".chg_" + name).text(pos_neg + change.toFixed(2));
        $(".chg_" + name)
            .removeClass()
            .addClass("chg_" + name + " " + color_class);
        $(".chgper_" + name).text("(" + pos_neg + change_per.toFixed(2) + "%)");
        $(".chgper_" + name)
            .removeClass()
            .addClass("chgper_" + name + " " + color_class);
    }
    if ($("#index_charts").length > 0) {
        if ($("#" + name + "_tab").hasClass("active_index"))
            $("#" + name + "_tab")
                .removeClass()
                .addClass("indextab active_index" + " " + border_class);
        else
            $("#" + name + "_tab")
                .removeClass()
                .addClass("indextab");
        $("#" + name + "_tab").data("indexname", name);
        $("#" + name + "_tab").data("borderclass", border_class);
        $("." + name + "_value").text(value.toFixed(2));
        $("." + name + "_chg")
            .removeClass()
            .addClass(name + "_chg" + " " + color_class)
            .text(pos_neg + change.toFixed(2));
        $("." + name + "_chgper")
            .removeClass()
            .addClass(name + "_chgper" + " " + color_class)
            .text("(" + pos_neg + change_per.toFixed(2) + "%)");
        $("." + name + "_arrow")
            .removeClass()
            .addClass(name + "_arrow" + " " + color_class + " " + arrow_class);
    }
}
function dse_md_bbo(msg) {
    var bid = parseFloat(msg.value.bid_price);
    var bidqty = parseInt(msg.value.bid_qty);
    var ask = parseFloat(msg.value.ask_price);
    var askqty = parseInt(msg.value.ask_qty);
    var symbol = msg.value.symbol;
    var group = msg.value.group;
    var bidq_elem = symbol.replace(/[^a-zA-Z ]/g, "") + group + "_bidq";
    var bid_elem = symbol.replace(/[^a-zA-Z ]/g, "") + group + "_bid";
    var askq_elem = symbol.replace(/[^a-zA-Z ]/g, "") + group + "_askq";
    var ask_elem = symbol.replace(/[^a-zA-Z ]/g, "") + group + "_ask";
    if ($("." + bidq_elem).length > 0 && $("." + bidq_elem).is(":visible")) {
        if (!isNaN(bidqty) && bidqty != null && bidqty != 0) {
            $("." + bidq_elem).val(bidqty);
            $("." + bidq_elem).text(Number(bidqty).toLocaleString("en-IN"));
        } else {
            $("." + bidq_elem).val("-");
            $("." + bidq_elem).text("-");
        }
        if (!isNaN(askqty) && askqty != null && askqty != 0) {
            $("." + askq_elem).val(askqty);
            $("." + askq_elem).text(Number(askqty).toLocaleString("en-IN"));
        } else {
            $("." + askq_elem).val("-");
            $("." + askq_elem).text("-");
        }
        if (!isNaN(bid) && bid != null && bid != 0) {
            if (bid != parseFloat($("." + bid_elem).val())) flashup($("." + bid_elem));
            $("." + bid_elem).val(bid);
            $("." + bid_elem).text(bid);
        } else {
            $("." + bid_elem).val("-");
            $("." + bid_elem).text("-");
        }
        if (!isNaN(ask) && ask != null && ask != 0) {
            if (ask != parseFloat($("." + ask_elem).val())) flashdown($("." + ask_elem));
            $("." + ask_elem).val(ask);
            $("." + ask_elem).text(ask);
        } else {
            $("." + ask_elem).val("-");
            $("." + ask_elem).text("-");
        }
    }
    var order_window_symbol = $("#order_instrument").val();
    if (order_window_symbol != null && order_window_symbol.includes(".")) {
        var symbol_split = order_window_symbol.split(".");
        var order_symbol = symbol_split[0];
        var order_board = symbol_split[1];
        if (orderwindow != undefined) {
            if (order_symbol == symbol && order_board == group) {
                if (!isNaN(bid) && bid != null && bid != 0) {
                    if (bid != parseFloat($(".order_bidp").text())) flashup($(".order_bidp"));
                    $(".order_bidp").text(bid);
                    $(".order_bidp").addClass("font-weight-bold up");
                    if ($("#order_side").val() == "SELL") {
                        $("#market_order_rate").val(bid);
                    }
                } else {
                    $(".order_bidp").text("-");
                    $(".order_bidp").removeClass().addClass("order_bidp");
                }
                if (!isNaN(ask) && ask != null && ask != 0) {
                    if (ask != parseFloat($(".order_askp").text())) flashdown($(".order_askp"));
                    $(".order_askp").text(ask);
                    $(".order_askp").addClass("font-weight-bold down");
                    if ($("#order_side").val() == "BUY") {
                        $("#market_order_rate").val(ask);
                    }
                } else {
                    $(".order_askp").text("-");
                    $(".order_askp").removeClass().addClass("order_askp");
                }
                if (!isNaN(bidqty) && bidqty != null && bidqty != 0) {
                    $(".order_bidq").text(bidqty);
                    $(".order_bidq").addClass("font-weight-bold up");
                } else {
                    $(".order_bidq").text("-");
                    $(".order_bidq").removeClass().addClass("order_bidq");
                }
                if (!isNaN(askqty) && askqty != null && askqty != 0) {
                    $(".order_askq").text(askqty);
                    $(".order_askq").addClass("font-weight-bold down");
                } else {
                    $(".order_askq").text("-");
                    $(".order_askq").removeClass().addClass("order_askq");
                }
            }
        }
    }
}
function dse_md_mktdepth(msg) {
    var md_bid = JSON.parse(msg.value.bid_levels);
    var md_ask = JSON.parse(msg.value.ask_levels);
    var price_decimal = msg.value.price_decimals;
    var md_point = parseInt(price_decimal);
    var md_multiple = Math.pow(10, md_point);
    var md_symbol = msg.value.symbol;
    var md_group = msg.value.group;
    var symbol_board = md_symbol.replace(/[^a-zA-Z ]/g, "") + md_group;
    var row_count = 0;
    if (md_bid != undefined) row_count = md_bid.length * 2;
    if (md_ask != undefined) row_count = md_ask.length * 2;
    if (md_bid != undefined && md_ask != undefined && md_bid.length > md_ask.length) row_count = md_bid.length * 2;
    else if (md_bid != undefined && md_ask != undefined && md_ask.length > md_bid.length) row_count = md_ask.length * 2;
    if (row_count > 0) {
        for (i = row_count; i <= 20; i++) {
            $(`.${symbol_board}_db${i}`).parent().parent().hide();
            $(`.${symbol_board}_ds${i}`).parent().parent().hide();
        }
    }
    var buy_qty = 0;
    var sell_qty = 0;
    var total_qty = 0;
    var buy_percent = 0;
    var sell_percent = 0;
    if ($(".mktdpt_symbol_name").length > 0) {
        if ($(`.${symbol_board}_db1`).length > 0) {
            for (let d = 1; d <= 20; d++) {
                $(`.${symbol_board}_db${d}`).text("");
                $(`.${symbol_board}_ds${d}`).text("");
            }
            x = 1;
            y = 1;
            $(`.${symbol_board}_biddepth tbody`).html("");
            var row_color = "pure-green";
            md_bid.forEach(function (item, index, arr) {
                var bid_price = (parseInt(item[0]) / md_multiple).toFixed(md_point);
                var bid_qty = parseInt(item[1]);
                var bid_breakdown = item[2] != undefined ? item[2] : [];
                buy_qty = buy_qty + bid_qty;
                total_qty = total_qty + bid_qty;
                $(`.${symbol_board}_db${x}`).text(bid_price);
                $(`.${symbol_board}_db${x}`).parent().parent().show();
                x++;
                $(`.${symbol_board}_db${x}`).text(bid_qty);
                $(`.${symbol_board}_db${x}`).parent().parent().show();
                x++;
                bid_breakdown.forEach(function (item, index, arr) {
                    $(`.${symbol_board}_biddepth tbody`).append(`
                        <tr class="market-depth-bidAndask-row"> 
                            <td class="mkbid market-depth-set-row-color-green ${row_color} market-depth-bidQ-column-value"><span class="bidqty">${item}</span></td>
                            <td class="mkbid market-depth-set-row-color-green ${row_color} market-depth-bid-column-value"><span class="bid"></span>${bid_price}</td>
                        </tr>
                    `);
                    row_color == "pure-green" ? (row_color = "dark-green") : "pure-green";
                });
            });
            $(`.${symbol_board}_askdepth tbody`).html("");
            var row_color = "pure-red";
            md_ask.forEach(function (item, index, arr) {
                var ask_price = (parseInt(item[0]) / md_multiple).toFixed(md_point);
                var ask_qty = parseInt(item[1]);
                var ask_breakdown = item[2] != undefined ? item[2] : [];
                sell_qty = sell_qty + ask_qty;
                total_qty = total_qty + ask_qty;
                $(`.${symbol_board}_ds${y}`).text(ask_price);
                $(`.${symbol_board}_ds${y}`).parent().parent().show();
                y++;
                $(`.${symbol_board}_ds${y}`).text(ask_qty);
                $(`.${symbol_board}_ds${y}`).parent().parent().show();
                y++;
                ask_breakdown.forEach(function (item, index, arr) {
                    $(`.${symbol_board}_askdepth tbody`).append(`
                        <tr class="market-depth-bidAndask-row">
                            <td class="mkask market-depth-set-row-color-red ${row_color} market-depth-ask-column-value"><span class="ask">${ask_price}</span></td>
                            <td class="mkask market-depth-set-row-color-red ${row_color} market-depth-askQ-column-value"><span class="askqty">${item}</span></td> 
                        </tr>
                    `);
                    row_color == "pure-red" ? (row_color = "dark-red") : "pure-red";
                });
            });
            if (total_qty != 0) {
                buy_percent = (buy_qty / total_qty) * 100;
                sell_percent = (sell_qty / total_qty) * 100;
                update_orderflowbar(symbol_board, buy_percent, sell_percent);
            }
        }
    }
}
function dse_md_news(msg) {
    if (last_news_msg_count != news_msg_count) {
        if ($("#symbol-news-content").length > 0 && $("#symbol-news-content").is(":visible")) {
            sym_news();
        }
        if ($("#all-news-content").length > 0 && $("#all-news-content").is(":visible")) {
            fetch_news();
        }
        last_news_msg_count = news_msg_count;
    }
}
function uftcl_fix_status(msg) {
    if (msg.value.status == 0) {
        $("#netstatuslight").prop("title", "Server Connected");
        $("#netstatuslight").removeClass().addClass("fa fa-wifi text-success");
    } else {
        $("#netstatuslight").prop("title", "Server Disconnected");
        $("#netstatuslight").removeClass().addClass("fa fa-wifi text-danger");
    }
}
function update_orderflowbar(symbol_board, buy_percent, sell_percent) {
    if ($("." + symbol_board + "_orderflowbar").length > 0) {
        var marketDepthBarDiv = document.querySelector("." + symbol_board + "_orderflowbar");
        echarts.init(marketDepthBarDiv).setOption({
            series: [
                { name: "buyers", data: [buy_percent] },
                { name: "sellers", data: [sell_percent] },
            ],
        });
        $("." + symbol_board + "_buypercent").text(buy_percent.toFixed(2) + "%");
        $("." + symbol_board + "_sellpercent").text(sell_percent.toFixed(2) + "%");
    }
}
function uftcl_dealer_trades(msg) {
    if (system_user_role == "brokertrader") {
        if (msg.value.dealer_id == system_username) {
            $("#dealer_turnover_today").text(Number(msg.value.total_value).toLocaleString("en-IN"));
            flashup($("#dealer_turnover_today"));
            total_turnover = parseFloat($("#dealer_turnover_total").val()) + parseFloat(msg.value.trade_value);
            $("#dealer_turnover_total").val(total_turnover);
            $("#dealer_turnover_total").text(Number(total_turnover).toLocaleString("en-IN"));
            if ($("#client_trades_summary").length > 0) {
                $("." + msg.value.dealer_id + "_buy_orders").text(Number(msg.value.buy_orders).toLocaleString("en-IN"));
                $("." + msg.value.dealer_id + "_sell_orders").text(Number(msg.value.sell_orders).toLocaleString("en-IN"));
                $("." + msg.value.dealer_id + "_total_orders").text(Number(msg.value.total_orders).toLocaleString("en-IN"));
                $("." + msg.value.dealer_id + "_buy_trades").text(Number(msg.value.buy_trades).toLocaleString("en-IN"));
                $("." + msg.value.dealer_id + "_sell_trades").text(Number(msg.value.sell_trades).toLocaleString("en-IN"));
                $("." + msg.value.dealer_id + "_total_trades").text(Number(msg.value.total_trades).toLocaleString("en-IN"));
                $("." + msg.value.dealer_id + "_buy_value").text(Number(msg.value.buy_value).toLocaleString("en-IN"));
                $("." + msg.value.dealer_id + "_sell_value").text(Number(msg.value.sell_value).toLocaleString("en-IN"));
                $("." + msg.value.dealer_id + "_total_value").text(Number(msg.value.total_value).toLocaleString("en-IN"));
                $("." + msg.value.dealer_id + "_net_value").text(Number(msg.value.net_value).toLocaleString("en-IN"));
            }
        }
    }
}
function uftcl_client_trades(msg) {
    if (system_user_role == "associate") {
        if (msg.value.user_id == system_username) {
            today_turnover = parseFloat($("#associate_turnover_today").val()) + parseFloat(msg.value.trade_value);
            flashup($("#associate_turnover_today"));
            $("#associate_turnover_today").val(today_turnover);
            $("#associate_turnover_today").text(Number(today_turnover).toLocaleString("en-IN"));
            total_turnover = parseFloat($("#associate_turnover_total").val()) + parseFloat(msg.value.trade_value);
            $("#associate_turnover_total").val(total_turnover);
            $("#associate_turnover_total").text(Number(total_turnover).toLocaleString("en-IN"));
        }
    }
    if ($("#client_trades_summary").length > 0) {
        $("." + msg.value.client_id + "_buy_orders").text(Number(msg.value.buy_orders).toLocaleString("en-IN"));
        $("." + msg.value.client_id + "_sell_orders").text(Number(msg.value.sell_orders).toLocaleString("en-IN"));
        $("." + msg.value.client_id + "_total_orders").text(Number(msg.value.total_orders).toLocaleString("en-IN"));
        $("." + msg.value.client_id + "_buy_trades").text(Number(msg.value.buy_trades).toLocaleString("en-IN"));
        $("." + msg.value.client_id + "_sell_trades").text(Number(msg.value.sell_trades).toLocaleString("en-IN"));
        $("." + msg.value.client_id + "_total_trades").text(Number(msg.value.total_trades).toLocaleString("en-IN"));
        $("." + msg.value.client_id + "_buy_value").text(Number(msg.value.buy_value).toLocaleString("en-IN"));
        $("." + msg.value.client_id + "_sell_value").text(Number(msg.value.sell_value).toLocaleString("en-IN"));
        $("." + msg.value.client_id + "_total_value").text(Number(msg.value.total_value).toLocaleString("en-IN"));
        $("." + msg.value.client_id + "_net_value").text(Number(msg.value.net_value).toLocaleString("en-IN"));
    }
}
function uftcl_outbound_order_cache(msg) {
    var includes_client_code = code_list.includes(msg.value.order_client_code);
    if (msg.value.order_status == "pending" || msg.value.order_status == "parking") {
        if (system_user_role == "brokeradmin" || system_user_role == "administrator") {
            if (includes_client_code == true) {
                add_new_order_terminal(msg);
            }
        }
        if (system_user_role == "brokertrader") {
            if (msg.value.user_id == system_username || includes_client_code == true) {
                add_new_order_terminal(msg);
            }
        }
        if (system_user_role == "associate") {
            if (msg.value.user_id == system_username || includes_client_code == true) {
                add_new_order_terminal(msg);
            }
        }
        if (system_user_role == "client") {
            if (msg.value.user_id == system_username || msg.value.order_client_code == system_username) {
                add_new_order_terminal(msg);
            }
        }
    }
    if (msg.value.order_status == "Cancelled") {
        if (system_user_role == "brokeradmin" || system_user_role == "administrator") {
            if (includes_client_code == true) {
                update_cancel_order_terminal(msg);
            }
        }
        if (system_user_role == "brokertrader") {
            if (msg.value.user_id == system_username || includes_client_code == true) {
                update_cancel_order_terminal(msg);
            }
        }
        if (system_user_role == "associate") {
            if (msg.value.user_id == system_username || includes_client_code == true) {
                update_cancel_order_terminal(msg);
            }
        }
        if (system_user_role == "client") {
            if (msg.value.user_id == system_username || msg.value.order_client_code == system_username) {
                update_cancel_order_terminal(msg);
            }
        }
    }
}
function uftcl_inbound_trades(msg) {
    if ($("#client_order_id").val() == msg.value.orderid || $("#client_order_id_mod").val() == msg.value.orderid) {
        if (msg.value.error_msg != "") {
            error_msg = msg.value.error_msg.split("):").pop().trim();
            show_flash_messages("Error: " + error_msg, "danger");
        } else {
            flash_updates(msg);
        }
    }
    update_order_terminal(msg);
}
function uftcl_inbound_reject(msg) {
    if ($("#client_order_id").val() == msg.value.orderid || $("#client_order_id_mod").val() == msg.value.orderid) {
        if (msg.value.error_msg != "") {
            error_msg = msg.value.error_msg.split(":").pop().trim();
            show_flash_messages("Error: " + error_msg, "danger");
        } else {
            flash_updates(msg);
        }
    }
    update_order_terminal(msg);
}
function add_new_order_terminal(msg) {
    if ($("#trade-orders").length > 0) {
        var count = 2;
        $("#market_table tbody")
            .find("tr")
            .each(function () {
                var serial_num = $(this).find(".td-sno");
                serial_num.text(count);
                count++;
            });
        var symbol_split = msg.value.order_instrument.split(".");
        var order_symbol = symbol_split[0];
        var order_board = symbol_split[1];
        var table_name = "market_table";
        var table = document.getElementById(table_name).getElementsByTagName("tbody")[0];
        row = table.insertRow(0);
        row.id = msg.value.client_order_id;
        row.setAttribute("data-code", msg.value.order_client_code);
        row.setAttribute("data-symbol", msg.value.order_instrument);
        row.setAttribute("onclick", "orderterminal_link(this)");
        row.classList.add("tab-border-bottom", "order-element", "orderlink");
        row.style.textAlign = "center";
        var cells = [];
        for (var i = 0; i <= 17; i++) {
            cells.push(row.insertCell(i));
        }
        cells[0].className = "td-sno";
        cells[0].innerHTML = "1";
        cells[1].className = "tab-border-left";
        cells[1].innerHTML = msg.value.exchange;
        cells[2].className = "text-left tab-border-left";
        cells[2].innerHTML = msg.value.client_order_id;
        cells[3].className = "text-center tab-border-left";
        cells[3].innerHTML = msg.value.order_time;
        cells[4].className = "tab-border-left";
        cells[4].innerHTML = msg.value.order_client_code;
        cells[5].className = "text-left tab-border-left";
        cells[5].innerHTML = order_symbol;
        cells[6].className = "text-left tab-border-left";
        cells[6].innerHTML = order_board;
        if (msg.value.order_side == "BUY") {
            cells[7].className = "text-success tab-border-left font-weight-bold";
            cells[7].innerHTML = msg.value.order_side;
        } else {
            cells[7].className = "text-danger tab-border-left font-weight-bold";
            cells[7].innerHTML = msg.value.order_side;
        }
        cells[8].className = "tab-border-left";
        cells[8].innerHTML = msg.value.order_type;
        cells[9].className = "tab-border-left";
        cells[9].innerHTML = parseFloat(msg.value.limit_order_rate).toFixed(1);
        cells[10].className = "tab-border-left";
        cells[10].innerHTML = "";
        cells[11].className = "tab-border-left";
        cells[11].innerHTML = msg.value.order_qty;
        cells[12].className = "tab-border-left";
        cells[12].innerHTML = msg.value.drip_qty;
        cells[13].className = "tab-border-left";
        cells[13].innerHTML = "";
        cells[14].className = "tab-border-left";
        cells[14].innerHTML = '<div style="display: none;" data-orderstat="' + msg.value.order_status + '" value="" class="client-order-status"></div>';
        cells[15].className = "tab-border-left font-weight-bold";
        cells[15].innerHTML = msg.value.order_status;
        cells[16].className = "td-btn tab-border-left";
        cells[16].innerHTML =
            '<div style="display: none;" data-orderid="' +
            msg.value.client_order_id +
            '" value="" class="client-order-id"></div>' +
            '<div style="display: none;" data-orderchainid="' +
            msg.value.chain_id +
            '" value="" class="order-chain-id"></div>';
        flashnum($("#" + msg.value.client_order_id).find("td:eq(16)"));
    }
}
function update_cancel_order_terminal(msg) {
    var client_orderid;
    var order_status_text = "Cancelled";
    var status_class = "";
    var row_class = "";
    var orderid_div = "";
    var order_icon = "";
    if (msg.value.order_status == "Cancelled") {
        status_class = "text-muted tab-border-left font-weight-bold";
        row_class = "tab-border-bottom locked-order-element";
    }
    if (msg.value.reforder_id == "") {
        client_orderid = msg.value.client_order_id;
    } else {
        client_orderid = msg.value.reforder_id;
    }
    if ($("#trade-orders").length > 0 && $("#" + client_orderid).length > 0) {
        row = $("#" + client_orderid).find("td");
        $("#" + client_orderid).removeClass();
        $("#" + client_orderid).addClass(row_class);
        row = $("#" + client_orderid).find("td");
        if (msg.value.order_type != "") {
            row.eq(8).text(msg.value.order_type);
        }
        row.eq(2).text(msg.value.client_order_id);
        row.eq(9).text(msg.value.limit_order_rate != null ? parseFloat(msg.value.limit_order_rate).toFixed(1) : msg.value.market_order_rate);
        row.eq(10).text("");
        row.eq(11).text(msg.value.order_qty);
        row.eq(12).text(msg.value.drip_qty == "0" ? "" : msg.value.drip_qty);
        row.eq(13).text("");
        if (msg.value.cum_qty == 0) exec_qty = "";
        else exec_qty = msg.value.cum_qty;
        var status_div = exec_qty + '<div style="display: none;" data-orderstat="' + order_status_text + '" value="" class="client-order-status"></div>';
        row.eq(14).html(status_div);
        row.eq(15).removeClass();
        row.eq(15).addClass(status_class);
        row.eq(15).text(order_status_text);
        orderid_div =
            '<div style="display: none;" data-orderid="' +
            msg.value.client_order_id +
            '" value="" class="client-order-id"></div>' +
            '<div style="display: none;" data-orderchainid="' +
            msg.value.chain_id +
            '" value="" class="order-chain-id"></div>';
        order_icon = '<i class="fa fa-lock text-muted"></i>';
        row.eq(16).html(order_icon + orderid_div);
        $("#" + client_orderid).attr("id", msg.value.client_order_id);
        flashnum($("#" + client_orderid).find("td:eq(16)"));
    }
}
function update_order_terminal(msg) {
    var client_orderid;
    var order_status_text = "";
    var status_class = "";
    var row_class = "";
    var order_type_text = "";
    var orderid_div = "";
    var order_icon = "";
    switch (msg.value.order_type) {
        case "1":
            order_type_text = "Market";
            break;
        case "2":
            order_type_text = "Limit";
            break;
        default:
            "0";
    }
    switch (msg.value.order_status) {
        case "0":
            order_status_text = "Accepted";
            status_class = "text-info tab-border-left font-weight-bold";
            row_class = "tab-border-bottom convert-order-element";
            break;
        case "1":
            order_status_text = "Partially Filled";
            status_class = "text-warning tab-border-left font-weight-bold";
            row_class = "tab-border-bottom par-filled-order-element";
            break;
        case "2":
            order_status_text = "Filled";
            status_class = "text-success tab-border-left font-weight-bold";
            row_class = "tab-border-bottom filled-order-element";
            break;
        case "4":
            order_status_text = "Cancelled";
            status_class = "text-muted tab-border-left font-weight-bold";
            row_class = "tab-border-bottom locked-order-element";
            break;
        case "5":
            order_status_text = "Replaced";
            status_class = "text-info tab-border-left font-weight-bold";
            row_class = "tab-border-bottom convert-order-element";
            break;
        case "8":
            order_status_text = "Rejected";
            status_class = "text-danger tab-border-left font-weight-bold";
            row_class = "tab-border-bottom rejected-order-element";
            break;
        case "C":
            order_status_text = "Expired";
            status_class = "text-danger tab-border-left font-weight-bold";
            row_class = "tab-border-bottom locked-order-element";
            break;
        case "Z":
            order_status_text = "Private Order";
            status_class = "text-primary tab-border-left font-weight-bold";
            row_class = "tab-border-bottom private-order-element";
            break;
        case "U":
            order_status_text = "Unplaced";
            status_class = "text-info tab-border-left font-weight-bold";
            row_class = "tab-border-bottom convert-order-element";
            break;
        default:
            "0";
    }
    switch (msg.value.exec_status) {
        case "":
            order_status_text = "Rejected";
            status_class = "text-danger tab-border-left font-weight-bold";
            row_class = "tab-border-bottom rejected-order-element";
            break;
        case "8":
            order_status_text = "Rejected";
            status_class = "text-danger tab-border-left font-weight-bold";
            row_class = "tab-border-bottom rejected-order-element";
            break;
        default:
            "";
    }
    if (msg.value.reforderid == "") {
        client_orderid = msg.value.orderid;
    } else {
        client_orderid = msg.value.reforderid;
    }
    if ($("#trade-orders").length > 0 && $("#" + client_orderid).length > 0) {
        row = $("#" + client_orderid).find("td");
        var order_chain_id = row.eq(16).find(".order-chain-id").data("orderchainid");
        if (msg.value.error_msg != "") {
            $("#" + client_orderid).removeClass();
            $("#" + client_orderid).addClass(row_class);
            row = $("#" + client_orderid).find("td");
            orderid_div =
                '<div style="display: none;" data-orderid="' + client_orderid + '" value="" class="client-order-id"></div>' + '<div style="display: none;" data-orderchainid="' + order_chain_id + '" value="" class="order-chain-id"></div>';
            order_icon = '<i class="fa fa-lock text-muted"></i>';
            row.eq(15).removeClass();
            row.eq(15).addClass(status_class);
            row.eq(15).text(order_status_text);
            if (order_status_text == "Rejected" || order_status_text == "Expired") {
                row.eq(16).html(order_icon + orderid_div);
            } else {
                row.eq(16).html(orderid_div);
            }
            if (msg.value.reforderid != "") {
                $("#" + client_orderid).attr("id", msg.value.reforderid);
            }
        } else {
            $("#" + client_orderid).removeClass();
            $("#" + client_orderid).addClass(row_class);
            row = $("#" + client_orderid).find("td");
            if (msg.value.order_type != "") {
                row.eq(8).text(order_type_text);
            }
            row.eq(2).text(msg.value.orderid);
            row.eq(9).text(msg.value.order_rate);
            row.eq(10).text(msg.value.avg_px);
            row.eq(11).text(msg.value.order_qty);
            row.eq(12).text(msg.value.drip_qty);
            row.eq(13).text(msg.value.leaves_qty);
            if (msg.value.cum_qty == 0) exec_qty = "";
            else exec_qty = msg.value.cum_qty;
            var status_div = exec_qty + '<div style="display: none;" data-orderstat="' + order_status_text + '" value="" class="client-order-status"></div>';
            row.eq(14).html(status_div);
            row.eq(15).removeClass();
            row.eq(15).addClass(status_class);
            row.eq(15).text(order_status_text);
            orderid_div =
                '<div style="display: none;" data-orderid="' +
                msg.value.orderid +
                '" value="" class="client-order-id"></div>' +
                '<div style="display: none;" data-orderchainid="' +
                order_chain_id +
                '" value="" class="order-chain-id"></div>';
            order_icon = '<i class="fa fa-lock text-muted"></i>';
            if (order_status_text == "Filled" || order_status_text == "Cancelled" || order_status_text == "Rejected" || order_status_text == "Expired") {
                row.eq(16).html(order_icon + orderid_div);
            } else {
                row.eq(16).html(orderid_div);
            }
            if ($("#portfolio_code_input").length > 0) {
                var portfolio_code = row.eq(4).text().trim();
                if (portfolio_code == $("#portfolio_code_input").val()) {
                    handle = setTimeout(function () {
                        update_portfolio(handle);
                    }, 1000);
                }
            }
            if ($("#account_limit_code").length > 0 && $("#account_limit_code").val() == portfolio_code) {
                get_account_limit();
            }
            if ($("#order_summary_code").length > 0 && $("#order_summary_code").val() == portfolio_code) {
                get_code_summary(portfolio_code);
            }
            $("#" + client_orderid).attr("id", msg.value.orderid);
        }
        flashnum($("#" + client_orderid).find("td:eq(16)"));
    }
}
function update_portfolio(handle) {
    clearTimeout(handle);
    var clientcode = $("#portfolio_code_input").val();
    $.getJSON("shared/getbodata/", { cln_code: clientcode }, function (data) {
        if (Object.keys(data).length > 0) {
            document.getElementById("portfolio_label").innerHTML = clientcode + " - " + data.cln_name + "  |  Cash Limit: " + '<span class="up">' + Number(data.b_limit).toLocaleString("en-IN") + "</span>";
        }
    });
    $.getJSON("shared/getsaleable/", { clientcode: clientcode }, function (data) {
        $("#saleable_table tbody").empty();
        if (data[0].length > 0) {
            data[0].forEach(function (item, idx, array) {
                if (idx < array.length && item.totalqty != 0) {
                    $("#saleable_table")
                        .find("tbody")
                        .append(
                            $(
                                '<tr style="text-align: right;" class="tab-border-bottom"><td data-board="' +
                                item.board +
                                '" data-qty="' +
                                item.qty +
                                '" class="tab-border-left text-left portsym">' +
                                item.symbol +
                                "</td>" +
                                '<td class="tab-border-left">' +
                                item.totalqty +
                                "</td>" +
                                '<td class="tab-border-left">' +
                                item.qty +
                                "</td>" +
                                '<td class="tab-border-left">' +
                                item.avgcost +
                                "</td>" +
                                '<td class="tab-border-left">' +
                                Number(item.totalcost).toLocaleString("en-IN") +
                                "</td>" +
                                '<td class="tab-border-left" id="mktrate_' +
                                item.symbol +
                                '">' +
                                item.ltp +
                                "</td>" +
                                '<td class="tab-border-left" id="mkt_val_' +
                                idx +
                                '">' +
                                Number(item.value).toLocaleString("en-IN") +
                                "</td>" +
                                '<td class="tab-border-left" id="unreal_gain_' +
                                idx +
                                '">' +
                                Number(item.gain).toLocaleString("en-IN") +
                                "</td>" +
                                '<td class="tab-border-left" id="gain_per_' +
                                idx +
                                '">' +
                                item.gain_per +
                                "</td>" +
                                '<td class="tab-border-left" id="invest_per_' +
                                idx +
                                '">' +
                                item.invest_per +
                                "</td>" +
                                "</tr>"
                            )
                        );
                    if (item.gain > 0) {
                        $("#mktrate_" + item.symbol)
                            .removeClass()
                            .addClass("up tab-border-left");
                        $("#mkt_val_" + idx)
                            .removeClass()
                            .addClass("up tab-border-left");
                        $("#unreal_gain_" + idx)
                            .removeClass()
                            .addClass("up tab-border-left");
                        $("#gain_per_" + idx)
                            .removeClass()
                            .addClass("up tab-border-left");
                    }
                    if (item.gain < 0) {
                        $("#mktrate_" + item.symbol)
                            .removeClass()
                            .addClass("down tab-border-left");
                        $("#mkt_val_" + idx)
                            .removeClass()
                            .addClass("down tab-border-left");
                        $("#unreal_gain_" + idx)
                            .removeClass()
                            .addClass("down tab-border-left");
                        $("#gain_per_" + idx)
                            .removeClass()
                            .addClass("down tab-border-left");
                    }
                }
            });
            if (Object.keys(data[1]).length > 0) {
                $("#saleable_table")
                    .find("tbody")
                    .append(
                        $(
                            "<tr style='text-align: right;border-top:1px solid;'><td></td><td></td><td></td><td></td><td class='bold'>" +
                            Number(data[1].sum_totalcost).toLocaleString("en-IN") +
                            "</td><td></td>" +
                            '<td id="total_val"' +
                            " class='bold'>" +
                            Number(data[1].sum_totalvalue).toLocaleString("en-IN") +
                            '</td><td id="tot_unreal">' +
                            Number(data[1].sum_totalgain).toLocaleString("en-IN") +
                            '</td><td id="tot_per">' +
                            data[1].sum_gain_per +
                            '</td><td id="tot_invest">' +
                            data[1].sum_invest_per +
                            "</td></tr>"
                        )
                    );
                if (data[1].sum_totalgain < 0) {
                    $("#total_val").removeClass().addClass("down");
                    $("#tot_unreal").removeClass().addClass("down");
                    $("#tot_per").removeClass().addClass("down");
                }
                if (data[1].sum_totalgain > 0) {
                    $("#total_val").removeClass().addClass("up");
                    $("#tot_unreal").removeClass().addClass("up");
                    $("#tot_per").removeClass().addClass("up");
                }
            }
        }
    });
    document.getElementById("msgdiv").textContent = "";
}
function flash_updates(msg) {
    if (msg.value.error_msg != "") {
        error_msg = msg.value.error_msg.split("):").pop().trim();
        show_flash_messages("Error: " + error_msg, "danger");
    }
    if (msg.value.error_msg == "") {
        var order_status = msg.value.order_status;
        var exec_type = msg.value.exec_type;
        var time_in_force = msg.value.time_in_force;
        var order_type = msg.value.order_type;
        var order_status_text;
        var exec_type_text;
        var time_in_force_text;
        switch (exec_type) {
            case "":
                exec_type_text = "Rejected";
                break;
            case "0":
                exec_type_text = "Accepted";
                break;
            case "3":
                exec_type_text = "Done for day";
                break;
            case "4":
                exec_type_text = "Cancelled";
                break;
            case "5":
                exec_type_text = "Replaced";
                break;
            case "6":
                exec_type_text = "Pending Cancel";
                break;
            case "7":
                exec_type_text = "Stopped";
                break;
            case "8":
                exec_type_text = "Rejected";
                break;
            case "C":
                exec_type_text = "Expired";
                break;
            case "F":
                exec_type_text = "Trade (partial fill or fill)";
                break;
            case "H":
                exec_type_text = "Trade Cancel";
                break;
            case "I":
                exec_type_text = "Order Status";
                break;
            default:
                "0";
        }
        switch (order_status) {
            case "0":
                order_status_text = "Accepted";
                break;
            case "1":
                order_status_text = "Partially filled";
                break;
            case "2":
                order_status_text = "Filled";
                break;
            case "4":
                order_status_text = "Cancelled";
                break;
            case "5":
                order_status_text = "Replaced";
                break;
            case "8":
                order_status_text = "Rejected";
                break;
            case "C":
                order_status_text = "Expired";
                break;
            case "Z":
                order_status_text = "Private Order";
                break;
            case "U":
                order_status_text = "Unplaced";
                break;
            default:
                "0";
        }
        switch (time_in_force) {
            case "0":
                time_in_force_text = "DAY";
                break;
            case "3":
                time_in_force_text = "IOC";
                break;
            case "4":
                time_in_force_text = "FOK";
                break;
            case "S":
                time_in_force_text = "Session";
                break;
            case "1":
                time_in_force_text = "GTC";
                break;
            case "6":
                time_in_force_text = "GTD";
                break;
            default:
                "0";
        }
        if (msg.value.engineid != "NONE") {
            popup_message(order_status, exec_type, order_type);
        }
    }
}
function popup_message(order_status, exec_type, order_type) {
    if (order_status == "2" && exec_type == "F") {
        show_flash_messages("Order Fully Executed", "success");
    }
    if (order_status == "1" && exec_type == "F") {
        show_flash_messages("Order Partially Executed", "success");
    }
    if (order_status == "4" && exec_type == "4") {
        show_flash_messages("Order Cancelled Successfuly", "success");
    }
    if (order_status == "0" && exec_type == "5") {
        show_flash_messages("Order Modified", "success");
    }
    if (order_status == "1" && exec_type == "5") {
        show_flash_messages("Order Modified & Partially Executed", "success");
    }
    if (order_status == "2" && exec_type == "5") {
        show_flash_messages("Order Modified & Fully Executed", "success");
    }
    if (order_status == "C" && exec_type == "C") {
        show_flash_messages("Order Expired", "danger");
    }
    if (order_status == "U" && exec_type == "5") {
        show_flash_messages("Order Unplaced - Price out of Circuit", "danger");
    }
    if (order_status == "0" && exec_type == "0") {
        if (order_type == "1") {
            show_flash_messages("Market Order Accepted", "success");
        }
        if (order_type == "2") {
            show_flash_messages("Limit Order Accepted", "success");
        }
        if (order_type == "Z") {
            show_flash_messages("Market at Best Order Accepted", "success");
        }
    }
    if (order_status == "Z" && exec_type == "0") {
        if (order_type == "1") {
            show_flash_messages("Private Market Order Accepted", "success");
        }
        if (order_type == "2") {
            show_flash_messages("Private Limit Order Accepted", "success");
        }
        if (order_type == "Z") {
            show_flash_messages("Private Market at Best Order Accepted", "success");
        }
    }
    return;
}
function rms_update(msg) {
    if (msg.value.update_type == "limit") {
        var client_code = msg.value.msg;
        if (code_list.includes(client_code)) {
            if ($("#order_client_code").val() == client_code) checkCashLimit();
            if ($("#accsnap_table").length > 0) refresh_snapshot();
            if ($("#account_cash_summary").length > 0 && $("#account_limit_code").val() == client_code) {
                get_account_limit();
            }
            if ($("#portfolio_code_input").length > 0 && $("#portfolio_code_input").val() == client_code) {
                showClientInfo();
            }
            show_flash_messages("Limit Updated for Client Code: " + client_code, "success");
        }
    }
    if (system_user_role == "brokertrader") {
        if (msg.value.update_type == "add_team") {
            var data = JSON.parse(msg.value.msg);
            var dealer_id = data.dealer_id;
            var url = "shared/get_team_dealers/";
            $.getJSON(url, { branchid: data.branch_id, team_name: data.team_name }, function (data) {
                if (data.length > 0) {
                    for (i = 0; i < data.length; i++) {
                        if (data[i].dealer_id == system_username) {
                            code_input();
                            system_dealer_team_id = data.team_name;
                            if ($("#trade-orders").length > 0) get_order_history();
                            show_flash_messages("Admin added you to new team", "success");
                        }
                    }
                }
            });
        }
        if (msg.value.update_type == "remove_team") {
            var data = JSON.parse(msg.value.msg);
            code_input();
            if ($("#trade-orders").length > 0) get_order_history();
        }
    }
}
function publish_order_cache_msg(order_cache_msg) {
    ws_worker.postMessage(["send_ws", "set_order", order_cache_msg]);
    return;
}
function publish_order_status_msg(order_status_msg) {
    ws_worker.postMessage(["send_ws", "order_status", order_status_msg]);
    return;
}
function publish_rms_update(rms_msg) {
    ws_worker.postMessage(["send_ws", "rms_update", rms_msg]);
    return;
}
function terminate_worker() {
    ws_worker.postMessage(["terminate"]);
    return;
}
