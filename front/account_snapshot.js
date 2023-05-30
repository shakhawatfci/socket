$(document).ready(function () {
    code_input();
    get_account_snapshot();
});
function get_account_snapshot() {
    $.getJSON("/shared/getaccsnap/", function (data) {
        $("#accsnap_table tbody tr").remove();
        var table = document.getElementById("accsnap_table").getElementsByTagName("tbody")[0];
        if (data.code.length > 0) {
            for (i = 0; i < data.code.length; i++) {
                row = table.insertRow();
                row.classList.add("gridtab");
                row.style.textAlign = "right";
                data.gain_val[i] >= 0 ? (colorclass = "up") : (colorclass = "down");
                if (data.gain_val[i] == 0) colorclass = "neutral";
                row.insertCell(0).innerHTML = '<div align="center"><button class="codebtn" onclick="codeclick($(this).text())">' + data.code[i] + "</button></div>";
                row.insertCell(1).innerHTML = '<div class="tab-border-left">' + Number(data.limit[i]).toLocaleString("en-IN") + "</div>";
                row.insertCell(2).innerHTML = '<div class="tab-border-left">' + Number(parseFloat(data.cost[i])).toLocaleString("en-IN") + "</div>";
                row.insertCell(3).innerHTML = '<div class="tab-border-left ' + colorclass + '">' + Number(parseFloat(data.mkt_val[i])).toLocaleString("en-IN") + "</div>";
                row.insertCell(4).innerHTML = '<div class="tab-border-left ' + colorclass + '">' + Number(parseFloat(data.gain_val[i])).toLocaleString("en-IN") + "</div>";
                row.insertCell(5).innerHTML = '<div class="tab-border-left ' + colorclass + '">' + Number(parseFloat(data.gain_per[i])).toLocaleString("en-IN") + "%</div>";
            }
            row = table.insertRow();
            row.classList.add("totaltab");
            row.style.textAlign = "right";
            data.grandtotal_gain >= 0 ? (colorclass = "up") : (colorclass = "down");
            row.insertCell(0).innerHTML = '<div align="right">Total</div>';
            row.insertCell(1).innerHTML = "<div>" + Number(data.grandtotal_cash).toLocaleString("en-IN") + "</div>";
            row.insertCell(2).innerHTML = "<div>" + Number(data.grandtotal_cost).toLocaleString("en-IN") + "</div>";
            row.insertCell(3).innerHTML = '<div class="' + colorclass + '">' + Number(data.grandtotal_mkt_val).toLocaleString("en-IN") + "</div>";
            row.insertCell(4).innerHTML = '<div class="' + colorclass + '">' + Number(data.grandtotal_gain).toLocaleString("en-IN") + "</div>";
            row.insertCell(5).innerHTML = '<div class="' + colorclass + '">' + Number(data.grandtotal_gainper).toLocaleString("en-IN") + "%</div>";
        }
        Sortable.initTable(document.querySelector("#accsnap_table"));
    });
}
function codeclick(code) {
    if ($("#portfolio_code_input").length > 0) {
        $("#portfolio_code_input").val(code);
        $.get("shared/portfolio_code", function (data) {
            $("#account-portfolio").html(data);
        });
    }
}
function clear_acc_filter() {
    $("#accsnap_table tbody tr").filter(function () {
        $(this).toggle(true);
    });
    $("#acc_snap_code").val("");
}
function refresh_snapshot() {
    get_account_snapshot();
}
