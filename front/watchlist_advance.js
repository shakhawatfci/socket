function init_watchlist_widget(watchlist_widget_id) {
    symbol_input();
    getallwatchlist(watchlist_widget_id);
}
function create_watchlist(element_id) {
    var table_id = element_id.replace("create_", "").replace(/\s+/g, "");
    var modal = $("#main-page-modal");
    var pageLoader = $("#page-loading-indicator").html();
    var url = "portfolio/add_watchlist/" + table_id;
    modal.modal({ show: true });
    modal.find(".modal-title").text("");
    modal.find(".modal-body").html(pageLoader).load(url);
}
function delete_watchlist(element_id) {
    var select_id = element_id.replace("remove_", "").replace(/\s+/g, "");
    var name = $("#select_" + select_id).val();
    var url = "/shared/removewatchlist/";
    $.get(url, { name: name })
        .done(function (data) {
            show_flash_messages(data, "success");
            getallwatchlist("all");
        })
        .fail(function (data) {
            show_flash_messages(data.responseText, "danger");
        });
}
function getallwatchlist(watchlist_widget_id) {
    if (watchlist_widget_id == "all") {
        select_element = ".user_watchlists";
        $(select_element).each(function (i, obj) {
            $.get("/shared/getallwatchlist/", function (data) {
                if (obj.childNodes.length != 0) {
                    table_id = obj.id.replace("select_", "").replace("add_", "").replace(/\s+/g, "");
                    var pid = $("#profile option:selected").val();
                    selected_value = localStorage.getItem(system_username + "_layout_" + profile_page + "_" + pid + "_" + table_id + "_selected");
                    exists = data.includes(selected_value);
                    obj.innerHTML = "";
                }
                watchlist = document.createElement("option");
                watchlist.text = "List";
                watchlist.value = "default";
                watchlist.disabled = true;
                obj.add(watchlist);
                for (i = 0; i < data.length; i++) {
                    watchlist = document.createElement("option");
                    watchlist.text = data[i];
                    watchlist.value = data[i];
                    obj.add(watchlist);
                }
                if (exists) {
                    obj.value = selected_value;
                    $(obj).val(obj.value).trigger("change");
                } else {
                    $(obj)
                        .val(data[data.length - 1])
                        .trigger("change");
                }
            });
        });
    } else {
        select_element = "#select_" + watchlist_widget_id;
        $.get("/shared/getallwatchlist/", function (data) {
            $(select_element).empty();
            watchlist = document.createElement("option");
            watchlist.text = "List";
            watchlist.value = "default";
            watchlist.disabled = true;
            document.querySelector(select_element).add(watchlist);
            for (i = 0; i < data.length; i++) {
                watchlist = document.createElement("option");
                watchlist.text = data[i];
                watchlist.value = data[i];
                document.querySelector(select_element).add(watchlist);
            }
            $(select_element)
                .val(data[data.length - 1])
                .trigger("change");
        });
    }
}
function watchlist_view(view_type) { }
function load_watchlist(wlname, element_id) {
    var table_id = element_id.replace("select_", "").replace("add_", "").replace(/\s+/g, "");
    showHideTable(table_id);
    var pid = $("#profile option:selected").val();
    localStorage.setItem(system_username + "_layout_" + profile_page + "_" + pid + "_" + table_id + "_selected", wlname);
    var name = wlname;
    var url = "/shared/viewwatchlist/";
    var table = document.getElementById(table_id).getElementsByTagName("tbody")[0];
    $("#" + table_id + " tbody tr").remove();
    $.getJSON(url, { name: name }, function (data) {
        for (i = 0; i < data.result.length; i++) {
            symbol = data.result[i].split(".")[0];
            board = data.result[i].split(".")[1];
            symbol_board = symbol.replace(/[^a-zA-Z ]/g, "") + board;
            change = data.chg_list[i] == 0 ? "0.00" : data.chg_list[i];
            changeper = data.chgper_list[i] == 0 ? "0.00" : data.chgper_list[i];
            high = data.high_list[i] == 0 ? "-" : data.high_list[i];
            low = data.low_list[i] == 0 ? "-" : data.low_list[i];
            vol = data.vol_list[i] == 0 ? "-" : Number(data.vol_list[i]).toLocaleString("en-IN");
            trade = data.trade_list[i] == 0 ? "-" : data.trade_list[i];
            value = data.value_list[i] == 0 ? "-" : Number(data.value_list[i]).toLocaleString("en-IN");
            ltp = data.ltp_list[i] == 0 ? "-" : data.ltp_list[i];
            cp = data.cp_list[i] == 0 ? "-" : data.cp_list[i];
            ycp = data.ycp_list[i] == 0 ? "-" : data.ycp_list[i];
            yvol = data.yvol_list[i] == 0 ? "-" : Number(data.yvol_list[i]).toLocaleString("en-IN");
            bidq = data.bidqty_list[i] == 0 ? "-" : data.bidqty_list[i];
            askq = data.askqty_list[i] == 0 ? "-" : data.askqty_list[i];
            bidp = data.bidprice_list[i] == 0 ? "-" : data.bidprice_list[i];
            askp = data.askprice_list[i] == 0 ? "-" : data.askprice_list[i];
            symname = data.result[i].replace(".", "");
            pos_neg = "";
            color_class = "";
            bg_class = "";
            if (data.chg_list[i] > 0) {
                color_class = "up";
                pos_neg = "+";
                bg_class = "positive";
            }
            if (data.chg_list[i] < 0) {
                color_class = "down";
                pos_neg = "";
                bg_class = "negative";
            }
            if (data.chg_list[i] == 0) {
                color_class = "neutral";
                pos_neg = "";
                bg_class = "nochange";
            }
            row = table.insertRow();
            row.classList.add("watchlist_ticker");
            row.setAttribute("onclick", "watchlist_link(this)");
            row.style.textAlign = "center";
            var cell0 = row.insertCell(0);
            var cell1 = row.insertCell(1);
            var cell2 = row.insertCell(2);
            var cell3 = row.insertCell(3);
            var cell4 = row.insertCell(4);
            var cell5 = row.insertCell(5);
            var cell6 = row.insertCell(6);
            var cell7 = row.insertCell(7);
            var cell8 = row.insertCell(8);
            var cell9 = row.insertCell(9);
            var cell10 = row.insertCell(10);
            cell0.classList.add(document.getElementById(table_id).getElementsByTagName("th")[0].className);
            cell1.classList.add(document.getElementById(table_id).getElementsByTagName("th")[1].className);
            cell2.classList.add(document.getElementById(table_id).getElementsByTagName("th")[2].className);
            cell3.classList.add(document.getElementById(table_id).getElementsByTagName("th")[3].className);
            cell4.classList.add(document.getElementById(table_id).getElementsByTagName("th")[4].className);
            cell5.classList.add(document.getElementById(table_id).getElementsByTagName("th")[5].className);
            cell6.classList.add(document.getElementById(table_id).getElementsByTagName("th")[6].className);
            cell7.classList.add(document.getElementById(table_id).getElementsByTagName("th")[7].className);
            cell8.classList.add(document.getElementById(table_id).getElementsByTagName("th")[8].className);
            cell9.classList.add(document.getElementById(table_id).getElementsByTagName("th")[9].className);
            cell10.classList.add(document.getElementById(table_id).getElementsByTagName("th")[10].className);
            cell0.innerHTML =
                `<div data-symbol="` +
                data.result[i] +
                `" class="tab-border-left td-btn"><button onclick="remove_from_watchlist('` +
                data.result[i] +
                `', '` +
                table_id +
                `')" class="wlremove has-tooltip" title="Remove Stock"><i class="fa fa-times"></i></button></div>`;
            cell1.innerHTML = '<div align="left"><button data-symbol="' + data.result[i] + '" class="ticker_name">' + symbol + "</button></div>";
            cell2.innerHTML = '<div class="' + symbol_board + "_ltp " + color_class + ' tab-border-left">' + ltp + "</div>";
            cell3.innerHTML = '<div class="' + symbol_board + '_close tab-border-left">' + cp + "</div>";
            cell4.innerHTML = '<div class="' + symbol_board + '_bidq tab-border-left">' + bidq + "</div>";
            cell5.innerHTML = '<div class="' + symbol_board + '_bid tab-border-left up">' + bidp + "</div>";
            cell6.innerHTML = '<div class="' + symbol_board + '_ask tab-border-left down">' + askp + "</div>";
            cell7.innerHTML = '<div class="' + symbol_board + '_askq tab-border-left">' + askq + "</div>";
            cell8.innerHTML = '<div class="' + symbol_board + '_vol tab-border-left">' + vol + "</div>";
            cell9.innerHTML = '<div class="' + symbol_board + '_ycp tab-border-left">' + ycp + "</div>";
            cell10.innerHTML = '<div class="' + symbol_board + '_yvol tab-border-left">' + yvol + "</div>";
        }
        hideShowTableColFromLocal(table_id);
    });
}
function watchlist_link(elem) {
    var symbol = $(elem).find(".ticker_name").text().trim();
    var symbol_board = $(elem).find(".ticker_name").data("symbol");
    var board = symbol_board.split(".")[1];
    chart_board = board;
    if ($("#quote_box").length > 0) {
        get_quote_data(symbol_board);
    }
    if ($("#tv_chart_container").length > 0) {
        reinit_chart(symbol_board);
    }
    if ($(".mktdpt_symbol_name").length > 0) {
        $(".mktdpt_symbol_name").eq(0).val(symbol_board);
        getmktdepth(symbol_board, $(".mktdpt_symbol_name").eq(0).attr("id"));
    }
    if ($(".timesale_symbol_name").length > 0) {
        $(".timesale_symbol_name").eq(0).val(symbol_board);
        gettimesale(symbol_board, $(".timesale_symbol_name").eq(0).attr("id"));
    }
    if ($("#symbol-news-content").length > 0) {
        if ($("#symbol-news-content").is(":visible")) {
            sym_news(symbol);
        }
    }
    if ($("#stock_analysis").length > 0) {
        getAndSetFinancialData(symbol);
        getAndSetHoldingsData(symbol);
        getAndSetProfileData(symbol);
        getAndSetCorpActionsData(symbol);
        getAndSetNewsData(symbol);
    }
    if (board == "YIELDDBT") {
        getGsecData(symbol);
    }
}
function add_to_watchlist(instrument, element_id) {
    var table_id = element_id.replace("add_", "");
    if (instrument != null) {
        var name = $("#select_" + table_id).val();
        if (name != null && name != "") {
            var url = "/shared/addwatchlistitem/";
            $.get(url, { symbol: instrument, name: name })
                .done(function (data) {
                    show_flash_messages(data, "success");
                    load_watchlist(name, table_id);
                })
                .fail(function (data) {
                    show_flash_messages(data.responseText, "danger");
                });
        } else {
            show_flash_messages("Please select a watchlist", "danger");
        }
    }
}
function remove_from_watchlist(instrument, table_id) {
    if (instrument != null) {
        var name = $("#select_" + table_id).val();
        var url = "/shared/removewatchlistitem/";
        $.get(url, { symbol: instrument, name: name })
            .done(function (data) {
                show_flash_messages(data, "success");
                load_watchlist(name, table_id);
            })
            .fail(function (data) {
                show_flash_messages(data.responseText, "danger");
            });
    }
}
function hideShowTableColFromLocal(table_id) {
    var storedColumnNames = JSON.parse(localStorage.getItem(system_username + "_" + table_id)) || [];
    var wl_class = "." + table_id + "-col-checkbox";
    var colCheckboxes = document.querySelectorAll(wl_class);
    colCheckboxes.forEach((element) => {
        var colName = element.getAttribute("data-col");
        if (storedColumnNames.includes(element.value)) {
            var isChecked = (element.checked = false);
            hideShowTableCol(colName, isChecked);
        }
    });
}
function hideShowTableCol(colName, checked) {
    var cells = document.querySelectorAll(`.${colName}`);
    cells.forEach((cell) => {
        cell.style.display = checked ? "table-cell" : "none";
    });
}
function showHideTable(table_id) {
    var table = document.getElementById(table_id);
    var thElements = table.getElementsByTagName("th");
    for (let i = 0; i < thElements.length; i++) {
        var className = `${table_id}-col-${i + 1}`;
        thElements[i].className = className;
    }
    var wl_class = "." + table_id + "-col-checkbox";
    var colCheckboxes = document.querySelectorAll(wl_class);
    colCheckboxes.forEach((element) => {
        element.addEventListener("change", (event) => {
            var columnNames = JSON.parse(localStorage.getItem(system_username + "_" + table_id)) || [];
            var colName = element.getAttribute("data-col");
            var checked = event.target.checked;
            if (checked) {
                columnNames = columnNames.filter((columnName) => columnName !== element.value);
            } else {
                columnNames.push(element.value);
            }
            hideShowTableCol(colName, checked);
            localStorage.setItem(system_username + "_" + table_id, JSON.stringify(columnNames));
        });
    });
    hideShowTableColFromLocal(table_id);
}
