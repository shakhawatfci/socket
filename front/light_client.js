importScripts("/static/js/lightstreamer-core.min.js");
var lightstreamer_host = "https://ws.quantbd.com:7809";
var lightstreamer_adapter = "QTRADER_ADAPTER";
var client = new LightstreamerClient(lightstreamer_host, lightstreamer_adapter);
client.connect();
client.connectionOptions.setRequestedMaxBandwidth("unlimited");
client.addListener({
    onStatusChange: function (resp) {
        if (resp == "CONNECTED:WS-STREAMING") {
            if (lightstreamer_adapter == "QTRADER_ADAPTER") {
                console.log("WS PROD Connected");
            }
            if (lightstreamer_adapter == "QTRADER_DEMO") {
                console.log("WS UAT Connected");
            }
        }
    },
});
var last_channel = "";
dse_md_symbol_ch = "dse_md_symbol";
dse_md_symbol_fields = ["orderbook_id", "symbol_isin", "symbol", "group", "sector", "name", "market_type", "symbol_category", "symbol_instr"];
dse_md_bbo_ch = "dse_md_bbo";
dse_md_bbo_fields = ["symbol", "group", "isin", "sector", "price_decimals", "bid_price", "bid_qty", "ask_price", "ask_qty"];
dse_md_suspended_ch = "dse_md_suspended";
dse_md_suspended_fields = ["isin", "symbol", "group"];
dse_md_mktdepth_ch = "dse_md_mktdepth";
dse_md_mktdepth_fields = ["symbol", "group", "isin", "sector", "price_decimals", "bid_levels", "ask_levels"];
dse_md_cp_ch = "dse_md_cp";
dse_md_cp_fields = ["symbol", "group", "isin", "sector", "price_decimals", "price", "chart_time", "qty", "high", "low", "close", "change", "change_per"];
dse_md_ltp_ch = "dse_md_ltp";
dse_md_ltp_fields = [
    "symbol",
    "group",
    "isin",
    "sector",
    "unix_time",
    "time",
    "order_number",
    "match_number",
    "side",
    "price_decimals",
    "price",
    "executed_quantity",
    "open",
    "high",
    "low",
    "close",
    "buy_qty",
    "buy_value",
    "buy_trades",
    "sell_qty",
    "sell_value",
    "sell_trades",
    "total_qty",
    "total_value",
    "total_trades",
    "circuit_up",
    "circuit_down",
    "change",
    "change_per",
    "market_turnover",
    "trading_state",
    "buy_turnover",
    "sell_turnover",
    "buyers",
    "sellers",
    "market_volume",
    "market_trade",
    "market_buy_volume",
    "market_sell_volume",
    "market_buy_trade",
    "market_sell_trade",
];
dse_md_news_ch = "dse_md_news";
dse_md_news_fields = ["news_date", "news_ref", "news_title", "news_text", "news_type"];
dse_md_index_ch = "dse_md_index";
dse_md_index_fields = ["index_name", "value_decimal", "value", "y_value", "unix_time", "time", "open", "high", "low", "close", "change", "change_per"];
dse_md_mktevent_ch = "dse_md_mktevent";
dse_md_mktevent_fields = ["symbol", "group", "event", "event_time", "status"];
dse_md_tv_status_ch = "dse_md_tv_status";
dse_md_tv_status_fields = ["engine_name", "status"];
dse_md_news_status_ch = "dse_md_news_status";
dse_md_news_status_fields = ["engine_name", "status"];
dse_md_index_status_ch = "dse_md_index_status";
dse_md_index_status_fields = ["engine_name", "status"];
uftcl_inbound_limit_ch = "uftcl_inbound_limit";
uftcl_inbound_limit_fields = ["ap_pos_id", "ap_clearing_date", "ap_msg_source", "ap_broker_id", "ap_type", "ap_trade_limit"];
uftcl_inbound_reject_ch = "uftcl_inbound_reject";
uftcl_inbound_reject_fields = ["InReject"];
uftcl_fix_status_ch = "uftcl_fix_status";
uftcl_fix_status_fields = ["engine_name", "status"];
uftcl_inbound_trades_ch = "uftcl_inbound_trades";
uftcl_inbound_trades_fields = [
    "order_symbol",
    "board_type",
    "order_status",
    "order_qty",
    "order_rate",
    "exec_type",
    "order_side",
    "time_in_force",
    "error_msg",
    "orderid",
    "client_bo",
    "engineid",
    "reforderid",
    "leaves_qty",
    "cum_qty",
    "last_qty",
    "last_px",
    "avg_px",
    "min_qty",
    "drip_qty",
    "order_type",
    "broker_workstation_id",
    "exch_time",
    "broker_time",
    "latency",
    "trade_match_id",
    "trade_date",
    "settle_date",
    "gross_trade_amt",
    "agressor_indicator",
];
uftcl_outbound_order_cache_ch = "uftcl_outbound_order_cache";
uftcl_outbound_order_cache_fields = [
    "exchange",
    "order_client_code",
    "order_instrument",
    "order_qty",
    "drip_qty",
    "limit_order_rate",
    "order_type",
    "limit_order_type",
    "order_validity",
    "min_qty",
    "stop_loss",
    "take_profit",
    "limit_order_date",
    "limit_order_expiry_date",
    "special_order_type",
    "index_name",
    "index_value",
    "longterm_order_type",
    "index_order_type",
    "index_order_logic",
    "index_order_date",
    "index_order_expiry_date",
    "corr_order_side_1",
    "corr_order_qty_1",
    "corr_drip_qty_1",
    "corr_order_rate_1",
    "corr_order_qty_2",
    "corr_drip_qty_2",
    "corr_order_rate_2",
    "order_date_range",
    "start_order_rate",
    "end_order_rate",
    "longterm_order_qty",
    "longterm_drip_qty",
    "market_order_rate",
    "client_ac_type",
    "order_side",
    "sym_isin",
    "sym_class",
    "sym_category",
    "sym_spot",
    "order_action",
    "pvt_limit_order",
    "pvt_mkt_order",
    "order_date",
    "order_time",
    "client_order_id",
    "exec_status",
    "time_in_force",
    "engine_id",
    "pvdr_id",
    "bo_acc",
    "client_name",
    "order_status",
    "cln_id",
    "ref_id",
    "emergency",
    "leaves_qty",
    "cum_qty",
    "last_qty",
    "last_px",
    "avg_px",
    "reforder_id",
    "chain_id",
    "fix_ws_id",
    "gross_trade_amt",
    "settle_date",
    "trade_match_id",
    "trade_date",
    "agressor_indicator",
    "user_id",
    "user_role",
    "user_device",
    "order_branch",
    "trader_id",
    "ws_group_id",
    "order_value",
    "fix_msg",
    "limit_order_yield",
];
uftcl_dealer_trades_ch = "uftcl_dealer_trades";
uftcl_dealer_trades_fields = ["dealer_id", "trade_value", "buy_value", "sell_value", "net_value", "total_value", "buy_trades", "sell_trades", "total_trades", "buy_orders", "sell_orders", "total_orders"];
uftcl_client_trades_ch = "uftcl_client_trades";
uftcl_client_trades_fields = ["dealer_id", "client_id", "user_id", "trade_value", "buy_value", "sell_value", "net_value", "total_value", "buy_trades", "sell_trades", "total_trades", "buy_orders", "sell_orders", "total_orders"];
uftcl_ticker_trades_ch = "uftcl_ticker_trades";
uftcl_ticker_trades_fields = [
    "symbol",
    "board",
    "dealer_id",
    "client_id",
    "trade_value",
    "trade_qty",
    "buy_qty",
    "sell_qty",
    "total_qty",
    "buy_value",
    "sell_value",
    "net_value",
    "total_value",
    "buy_trades",
    "sell_trades",
    "total_trades",
    "buy_orders",
    "sell_orders",
    "total_orders",
];
uftcl_branch_trades_ch = "uftcl_branch_trades";
uftcl_branch_trades_fields = ["branch", "trade_value", "buy_value", "sell_value", "net_value", "total_value", "buy_trades", "sell_trades", "total_trades", "buy_orders", "sell_orders", "total_orders"];
uftcl_broker_trades_ch = "uftcl_broker_trades";
uftcl_broker_trades_fields = ["trade_value", "buy_value", "sell_value", "net_value", "total_value", "buy_trades", "sell_trades", "total_trades", "buy_orders", "sell_orders", "total_orders"];
uftcl_rms_ch = "rms_update";
uftcl_rms_fields = ["update_type", "msg"];
var subscriptions = {};
var fields = {};
data_subscription(dse_md_bbo_ch, dse_md_bbo_fields);
data_subscription(dse_md_suspended_ch, dse_md_suspended_fields);
data_subscription(dse_md_mktdepth_ch, dse_md_mktdepth_fields);
data_subscription(dse_md_cp_ch, dse_md_cp_fields);
data_subscription(dse_md_ltp_ch, dse_md_ltp_fields);
data_subscription(dse_md_news_ch, dse_md_news_fields);
data_subscription(dse_md_index_ch, dse_md_index_fields);
data_subscription(dse_md_mktevent_ch, dse_md_mktevent_fields);
data_subscription(dse_md_tv_status_ch, dse_md_tv_status_fields);
data_subscription(dse_md_news_status_ch, dse_md_news_status_fields);
data_subscription(dse_md_index_status_ch, dse_md_index_status_fields);
data_subscription(uftcl_outbound_order_cache_ch, uftcl_outbound_order_cache_fields);
data_subscription(uftcl_inbound_limit_ch, uftcl_inbound_limit_fields);
data_subscription(uftcl_inbound_reject_ch, uftcl_inbound_reject_fields);
data_subscription(uftcl_fix_status_ch, uftcl_fix_status_fields);
data_subscription(uftcl_inbound_trades_ch, uftcl_inbound_trades_fields);
data_subscription(uftcl_dealer_trades_ch, uftcl_dealer_trades_fields);
data_subscription(uftcl_client_trades_ch, uftcl_client_trades_fields);
data_subscription(uftcl_ticker_trades_ch, uftcl_ticker_trades_fields);
data_subscription(uftcl_branch_trades_ch, uftcl_branch_trades_fields);
data_subscription(uftcl_broker_trades_ch, uftcl_broker_trades_fields);
data_subscription(uftcl_rms_ch, uftcl_rms_fields);
function data_subscription(channel, fieldlist) {
    fields[channel] = fieldlist;
    subscriptions[channel] = new Subscription("RAW", channel, fieldlist);
    subscriptions[channel].setRequestedMaxFrequency("unlimited");
    subscriptions[channel].addListener({
        onListenStart: function (resp) { },
        onSubscriptionError: function (resp, err) {
            console.log(resp, err);
        },
        onUnsubscription: function (resp) {
            console.log(resp);
        },
        onItemUpdate: function (obj) {
            obj_channel = obj.getItemName();
            obj_len = fields[obj_channel].length;
            obj_list = fields[obj_channel];
            data_pipe = {};
            for (var i = 0; i < obj_len; i++) {
                data_pipe[obj_list[i]] = obj.getValue(obj_list[i]);
            }
            msg_obj = { channel: obj_channel, value: data_pipe };
            self[obj_channel](msg_obj);
        },
    });
    client.subscribe(subscriptions[channel]);
}
function data_unsubscribe(channel) {
    client.unsubscribe(subscriptions[channel]);
}
onmessage = (msg) => {
    var msg_type = msg.data[0];
    if (msg_type == "terminate") {
        data_unsubscribe(dse_md_bbo_ch);
        data_unsubscribe(dse_md_suspended_ch);
        data_unsubscribe(dse_md_mktdepth_ch);
        data_unsubscribe(dse_md_cp_ch);
        data_unsubscribe(dse_md_ltp_ch);
        data_unsubscribe(dse_md_news_ch);
        data_unsubscribe(dse_md_index_ch);
        data_unsubscribe(dse_md_mktevent_ch);
        data_unsubscribe(dse_md_tv_status_ch);
        data_unsubscribe(dse_md_news_status_ch);
        data_unsubscribe(dse_md_index_status_ch);
        data_unsubscribe(uftcl_inbound_limit_ch);
        data_unsubscribe(uftcl_inbound_reject_ch);
        data_unsubscribe(uftcl_fix_status_ch);
        data_unsubscribe(uftcl_inbound_trades_ch);
        data_unsubscribe(uftcl_dealer_trades_ch);
        data_unsubscribe(uftcl_client_trades_ch);
        data_unsubscribe(uftcl_ticker_trades_ch);
        data_unsubscribe(uftcl_branch_trades_ch);
        data_unsubscribe(uftcl_broker_trades_ch);
        data_unsubscribe(uftcl_rms_ch);
        client.disconnect();
        self.close();
    }
    if (msg_type == "send_ws") {
        var msg_object = { msg_type: msg.data[1], msg: msg.data[2] };
        client.sendMessage(JSON.stringify(msg_object));
    }
};
function feed_throttle(msg, throttle_ms) {
    if (last_channel == msg.channel && throttle_ms > 0) {
        postMessage(JSON.stringify(msg));
    } else {
        postMessage(JSON.stringify(msg));
    }
    last_channel = msg.channel;
}
function dse_md_tv_status(msg) {
    json_data = { channel: "dse_md_tv_status", msg: msg };
    feed_throttle(json_data, 0);
}
function dse_md_mktevent(msg) {
    json_data = { channel: "dse_md_mktevent", msg: msg };
    feed_throttle(json_data, 0);
}
function dse_md_cp(msg) {
    json_data = { channel: "dse_md_cp", msg: msg };
    feed_throttle(json_data, 0);
}
function dse_md_ltp(msg) {
    json_data = { channel: "dse_md_ltp", msg: msg };
    feed_throttle(json_data, 0);
}
function dse_md_index(msg) {
    json_data = { channel: "dse_md_index", msg: msg };
    feed_throttle(json_data, 0);
}
function dse_md_bbo(msg) {
    json_data = { channel: "dse_md_bbo", msg: msg };
    feed_throttle(json_data, 0);
}
function dse_md_mktdepth(msg) {
    json_data = { channel: "dse_md_mktdepth", msg: msg };
    feed_throttle(json_data, 0);
}
function dse_md_news(msg) {
    json_data = { channel: "dse_md_news", msg: msg };
    feed_throttle(json_data, 0);
}
function uftcl_fix_status(msg) {
    json_data = { channel: "uftcl_fix_status", msg: msg };
    feed_throttle(json_data, 0);
}
function uftcl_dealer_trades(msg) {
    json_data = { channel: "uftcl_dealer_trades", msg: msg };
    feed_throttle(json_data, 0);
}
function uftcl_client_trades(msg) {
    json_data = { channel: "uftcl_client_trades", msg: msg };
    feed_throttle(json_data, 0);
}
function uftcl_outbound_order_cache(msg) {
    json_data = { channel: "uftcl_outbound_order_cache", msg: msg };
    feed_throttle(json_data, 0);
}
function uftcl_inbound_trades(msg) {
    json_data = { channel: "uftcl_inbound_trades", msg: msg };
    feed_throttle(json_data, 0);
}
function uftcl_inbound_reject(msg) {
    json_data = { channel: "uftcl_inbound_reject", msg: msg };
    feed_throttle(json_data, 0);
}
function rms_update(msg) {
    json_data = { channel: "rms_update", msg: msg };
    feed_throttle(json_data, 0);
}