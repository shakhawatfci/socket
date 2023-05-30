$(document).ready(function () {
    code_input();
    $("#account_limit_code").val("");
});
function clear_account_limits_table() {
    $("#account_limit_code").val("");
    $("#account_limit_summary tbody").empty();
    $("#account_cash_summary tbody").empty();
}
function get_account_limit() {
    client_code = $("#account_limit_code").val();
    if (client_code != "" || client_code != undefined || client_code != null) {
        $.get("shared/get_account_limit/", { client_code: client_code }, function (data) {
            buy_value = data.buy_value != undefined ? data.buy_value : 0;
            sell_value = data.sell_value != undefined ? data.sell_value : 0;
            total_value = data.total_value != undefined ? data.total_value : 0;
            net_value = data.net_value != undefined ? data.net_value : 0;
            initial_cash = data.initial_cash != undefined ? data.initial_cash : 0;
            cash = data.Cash != undefined ? data.Cash : 0;
            main_buy_initial_limit = data.main_buy_initial_limit != undefined ? data.main_buy_initial_limit : 0;
            main_sell_initial_limit = data.main_sell_initial_limit != undefined ? data.main_sell_initial_limit : 0;
            main_totaltrans_initial_limit = data.main_totaltrans_initial_limit != undefined ? data.main_totaltrans_initial_limit : 0;
            main_nettrans_initial_limit = data.main_nettrans_initial_limit != undefined ? data.main_nettrans_initial_limit : 0;
            if (main_buy_initial_limit == 0) {
                main_buy_initial_limit = "unlimited";
                buy_remaining = "N/A";
            } else {
                main_buy_initial_limit = Number(main_buy_initial_limit).toLocaleString("en-IN");
                buy_remaining = Number(main_buy_initial_limit - buy_value).toLocaleString("en-IN");
            }
            if (main_sell_initial_limit == 0) {
                main_sell_initial_limit = "unlimited";
                sell_remaining = "N/A";
            } else {
                main_sell_initial_limit = Number(main_sell_initial_limit).toLocaleString("en-IN");
                sell_remaining = Number(main_sell_initial_limit - sell_value).toLocaleString("en-IN");
            }
            if (main_totaltrans_initial_limit == 0) {
                main_totaltrans_initial_limit = "unlimited";
                total_remaining = "N/A";
            } else {
                main_totaltrans_initial_limit = Number(main_totaltrans_initial_limit).toLocaleString("en-IN");
                total_remaining = Number(main_totaltrans_initial_limit - total_value).toLocaleString("en-IN");
            }
            if (main_nettrans_initial_limit == 0) {
                main_nettrans_initial_limit = "unlimited";
                net_remaining = "N/A";
            } else {
                main_nettrans_initial_limit = Number(main_nettrans_initial_limit).toLocaleString("en-IN");
                net_remaining = Number(main_nettrans_initial_limit - net_value).toLocaleString("en-IN");
            }
            $("#account_cash_summary tbody").empty();
            $("#account_limit_summary tbody").empty();
            $("#account_cash_summary tbody").append(
                '<tr class="tab-border-top tab-border-bottom">' +
                '<td class="bold">Cash</td>' +
                '<td class="tab-border-left">' +
                Number(buy_value).toLocaleString("en-IN") +
                "</td>" +
                '<td class="tab-border-left">' +
                Number(initial_cash).toLocaleString("en-IN") +
                "</td>" +
                '<td class="tab-border-left">' +
                Number(cash).toLocaleString("en-IN") +
                "</td>" +
                "</tr>"
            );
            $("#account_limit_summary tbody").append(
                '<tr class="tab-border-top tab-border-bottom">' +
                '<td class="bold">Max Capital Buy</td>' +
                '<td class="tab-border-left">' +
                main_buy_initial_limit +
                "</td>" +
                '<td class="tab-border-left">' +
                Number(buy_value).toLocaleString("en-IN") +
                "</td>" +
                '<td class="tab-border-left">' +
                buy_remaining +
                "</td>" +
                "</tr>" +
                '<tr class="tab-border-bottom">' +
                '<td class="bold">Max Capital Sell</td>' +
                '<td class="tab-border-left">' +
                main_sell_initial_limit +
                "</td>" +
                '<td class="tab-border-left">' +
                Number(sell_value).toLocaleString("en-IN") +
                "</td>" +
                '<td class="tab-border-left">' +
                sell_remaining +
                "</td>" +
                "</tr>" +
                '<tr class="tab-border-bottom">' +
                '<td class="bold">Total Transaction</td>' +
                '<td class="tab-border-left">' +
                main_totaltrans_initial_limit +
                "</td>" +
                '<td class="tab-border-left">' +
                Number(total_value).toLocaleString("en-IN") +
                "</td>" +
                '<td class="tab-border-left">' +
                total_remaining +
                "</td>" +
                "</tr>" +
                '<tr class="tab-border-bottom">' +
                '<td class="bold">Net Transaction</td>' +
                '<td class="tab-border-left">' +
                main_nettrans_initial_limit +
                "</td>" +
                '<td class="tab-border-left">' +
                Number(net_value).toLocaleString("en-IN") +
                "</td>" +
                '<td class="tab-border-left">' +
                net_remaining +
                "</td>" +
                "</tr>"
            );
        });
    }
}
