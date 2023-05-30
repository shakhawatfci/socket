$(document).ready(function () {
    code_input();
    get_order_summary();
});
function get_order_summary() {
    if (system_user_role == "brokertrader") {
        $(".brokertrader").show();
        $("#order_summary_dealerid").text(system_username);
        $("#order_summary_code").text(system_username);
        $("#order_summary_code").val("");
        $("#trade-summary").show();
        $("#code-summary").hide();
        $.get("live_orders/trade_summary", function (data) {
            $("#code-summary").html("");
            $("#trade-summary").html(data);
        });
    }
    if (system_user_role == "associate") {
        $(".brokertrader").hide();
        $("#order_summary_dealerid").text("");
        $("#order_summary_code").text(system_username);
        $("#order_summary_code").val("");
        $("#trade-summary").show();
        $("#code-summary").hide();
        $.get("live_orders/trade_summary", function (data) {
            $("#code-summary").html("");
            $("#trade-summary").html(data);
        });
    }
    if (system_user_role == "client") {
        $(".brokertrader").hide();
        $("#trade-summary").hide();
        $("#code-summary").show();
        $.get("live_orders/code_summary", { client_code: system_username }, function (data) {
            $("#trade-summary").html("");
            $("#code-summary").html(data);
        });
    }
}
function get_code_summary(client_code) {
    $("#trade-summary").hide();
    $("#code-summary").show();
    $.get("live_orders/code_summary", { client_code: client_code }, function (data) {
        $("#trade-summary").html("");
        $("#code-summary").html(data);
    });
}
