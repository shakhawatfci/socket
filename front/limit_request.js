$(document).ready(function () { });
$(".view_limit_request").on("click", function () {
    limitwindow.resize("450px", "500px");
    viewLimitRequest();
    $(".view_limit_request").hide();
    $(".hide_limit_request").show();
    $("#limit_request_list").show();
});
$(".hide_limit_request").on("click", function () {
    limitwindow.resize("450px", "230px");
    $(".view_limit_request").show();
    $(".hide_limit_request").hide();
    $("#limit_request_list").hide();
});
$("#request_client_code").on("change", function () {
    limit_request_updatebodata();
});
function limit_request_updatebodata() {
    var cln_code = $("#request_client_code").val();
    if (cln_code.length) {
        $.getJSON("shared/getbodata/", { cln_code: cln_code }, function (data) {
            if (Object.keys(data).length > 0) {
                document.getElementById("limit_ac_name").innerHTML = "Name : " + DOMPurify.sanitize(data.cln_name);
                $("#owner_dealer_id").val(data.dealer);
                if (data.b_limit >= 0) {
                    document.getElementById("limit_ac_balance").innerHTML = "Balance : " + '<span style="color: #00DB86;"><b>' + DOMPurify.sanitize(Number(data.b_limit).toLocaleString("en-IN")) + "</b></span>";
                } else {
                    document.getElementById("limit_ac_balance").innerHTML = "Balance : " + '<span style="color: ##E04036;"><b>' + DOMPurify.sanitize(Number(data.b_limit).toLocaleString("en-IN")) + "</b></span>";
                }
            }
        });
    }
}
function viewLimitRequest() {
    var url = "shared/viewlimitrequests/";
    var table_name = "limit_request_table";
    var table = document.getElementById(table_name).getElementsByTagName("tbody")[0];
    $.getJSON(url, function (data) {
        if (data.length > 0) {
            $("#" + table_name + " tbody tr").remove();
            for (i = 0; i < data.length; i++) {
                row = table.insertRow();
                row.classList.add("wlsym");
                row.style.textAlign = "center";
                row.insertCell(0).innerHTML = '<div class="tab-border-left">' + DOMPurify.sanitize(data[i].client_code) + "</div>";
                row.insertCell(1).innerHTML = '<div class="tab-border-left">' + DOMPurify.sanitize(Number(data[i].amount).toLocaleString("en-IN")) + "</div>";
                row.insertCell(2).innerHTML = '<div class="tab-border-left">' + DOMPurify.sanitize(data[i].last_update) + "</div>";
                if (data[i].status == "pending") {
                    row.insertCell(3).innerHTML = '<div class="tab-border-left bold text-warning">' + DOMPurify.sanitize(data[i].status) + "</div>";
                    row.insertCell(4).innerHTML =
                        '<div class="tab-border-left td-btn"><button onclick="cancel_limit_request(' + DOMPurify.sanitize(data[i].id) + ')" class="wlremove has-tooltip" title="Cancel Request"><i class="fa fa-times"></i></button></div>';
                }
                if (data[i].status == "Approved") {
                    row.insertCell(3).innerHTML = '<div class="tab-border-left bold text-success">' + DOMPurify.sanitize(data[i].status) + "</div>";
                    row.insertCell(4).innerHTML = '<div class="tab-border-left td-btn"><i class="text-muted fa fa-lock"></i></div>';
                }
                if (data[i].status == "Rejected") {
                    row.insertCell(3).innerHTML = '<div class="tab-border-left bold text-danger">' + DOMPurify.sanitize(data[i].status) + "</div>";
                    row.insertCell(4).innerHTML = '<div class="tab-border-left td-btn"><i class="text-muted fa fa-lock"></i></div>';
                }
                if (data[i].status == "Cancelled") {
                    row.insertCell(3).innerHTML = '<div class="tab-border-left bold text-muted">' + DOMPurify.sanitize(data[i].status) + "</div>";
                    row.insertCell(4).innerHTML = '<div class="tab-border-left td-btn"><i class="text-muted fa fa-lock"></i></div>';
                }
            }
        }
    });
}
function processLimitRequest() {
    var cln_code = $("#request_client_code").val();
    var amount = $("#limit_request_amount").val();
    var dealer = $("#owner_dealer_id").val();
    if (cln_code.length && code_list.includes(cln_code) && amount != "") {
        var url = "/shared/sendlimitrequest/";
        $.get(url, { cln_code: cln_code, amount: amount, dealer: dealer })
            .done(function (data) {
                show_flash_messages("Request Sent Successfully", "success");
                if (limitwindow != undefined) {
                    limitwindow.close();
                }
            })
            .fail(function (data) {
                show_flash_messages("Failed to Send Request", "danger");
                if (limitwindow != undefined) {
                    limitwindow.close();
                }
            });
    } else {
        show_flash_messages("Please fill all fields correctly", "danger");
    }
}
function cancel_limit_request(request_id) {
    var url = "/shared/cancellimitrequest/";
    $.get(url, { request_id: request_id })
        .done(function (data) {
            show_flash_messages("Request Cancelled", "success");
            viewLimitRequest();
        })
        .fail(function (data) {
            show_flash_messages("Failed to Cancel Request", "danger");
            viewLimitRequest();
        });
}
function reset_limit_window() {
    limitwindow.resize("450px", "230px");
    $(".view_limit_request").show();
    $(".hide_limit_request").hide();
    $("#limit_request_list").hide();
}
