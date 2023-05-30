function rms_validation(form, order_submit_type = "new") {
    var formvals = {};
    var rms_check = {};
    var validation = false;
    $.each($(form).serializeArray(), function (i, field) {
        formvals[field.name] = field.value;
    });
    var symbol_split = formvals.order_instrument.split(".");
    rms_check.order_symbol = symbol_split[0];
    rms_check.order_board = symbol_split[1];
    rms_check.symbol_class = formvals.sym_class;
    rms_check.symbol_category = formvals.sym_category;
    rms_check.symbol_spot = formvals.sym_spot;
    rms_check.order_qty = parseInt(formvals.order_qty);
    rms_check.order_side = formvals.order_side;
    rms_check.order_type = formvals.order_type;
    if (order_submit_type == "modify") {
        rms_check.saleable = parseInt($("#saleable_qty_mod").val());
        rms_check.cashlimit = parseFloat($("#ac_balance_mod").val());
        if (rms_check.order_type == "Market" || rms_check.order_type == "MarketBest") {
            rms_check.order_price = parseFloat(formvals.market_order_rate);
            rms_check.order_value = parseFloat(formvals.order_value_diff_mod);
        }
        if (rms_check.order_type == "Limit") {
            rms_check.order_price = parseFloat(formvals.limit_order_rate);
            rms_check.order_value = parseFloat(formvals.order_value_diff_mod);
        }
    } else {
        rms_check.saleable = parseInt($("#saleable_qty").val());
        rms_check.cashlimit = parseFloat($("#ac_balance").val());
        if (rms_check.order_type == "Market" || rms_check.order_type == "MarketBest") {
            rms_check.order_price = parseFloat(formvals.market_order_rate);
            rms_check.order_value = parseInt(formvals.order_qty) * parseFloat(formvals.market_order_rate);
        }
        if (rms_check.order_type == "Limit") {
            rms_check.order_price = parseFloat(formvals.limit_order_rate);
            rms_check.order_value = parseInt(formvals.order_qty) * parseFloat(formvals.limit_order_rate);
        }
    }
    rms_check.order_code = formvals.order_client_code;
    rms_check.client_ac_type = formvals.client_ac_type;
    rms_check.owner_dealer = formvals.trader_id;
    rms_check.branch = system_branch;
    rms_check.username = system_username;
    rms_check.user_role = system_user_role;
    flags = {};
    flags.invalid_trader = 0;
    flags.suspend_buy = 0;
    flags.suspend_sell = 0;
    flags.invalid_market = 0;
    flags.invalid_order_type = 0;
    flags.exceeded_broker_limit = 0;
    flags.exceeded_branch_credit_limit = 0;
    flags.exceeded_branch_cash_limit = 0;
    flags.exceeded_dealer_amount_limit = 0;
    flags.exceeded_dealer_quantity_limit = 0;
    flags.exceeded_user_amount_limit = 0;
    flags.exceeded_user_quantity_limit = 0;
    flags.exceeded_client_cash_limit = 0;
    flags.exceeded_client_saleable_limit = 0;
    flags.exceeded_dealer_credit_limit = 0;
    flags.exceeded_user_credit_limit = 0;
    flags.exceeded_client_credit_limit = 0;
    flags.exceeded_ticker_credit_limit = 0;
    flags.netting_violation = 0;
    $.ajax({
        type: "POST",
        url: "/shared/rms_validation/",
        data: JSON.stringify(rms_check),
        contentType: "application/json",
        async: false,
        success: function (data) {
            if (rms_check.user_role == "brokertrader" && rms_check.username != rms_check.owner_dealer && data.team_data.dealer_right != "onbehalf") {
                flags.invalid_trader = 1;
                show_flash_messages("Unauthorized Trader", "danger");
                validation = false;
            }
            if (data.ac_status_data == "inactive") {
                flags.invalid_trader = 1;
                show_flash_messages("Account Trading Suspended", "danger");
                validation = false;
            }
            if (
                rms_check.order_side == "BUY" &&
                (data.broker_limits.suspend_buy == true || data.branch_limits.suspend_buy == true || data.dealer_limits.suspend_buy == true || data.user_limits.suspend_buy == true || data.client_limits.suspend_buy == true)
            ) {
                flags.suspend_buy = 1;
                show_flash_messages("BUY Suspended", "danger");
                validation = false;
            }
            if (
                rms_check.order_side == "SELL" &&
                (data.broker_limits.suspend_sell == true || data.branch_limits.suspend_sell == true || data.dealer_limits.suspend_sell == true || data.user_limits.suspend_sell == true || data.client_limits.suspend_sell == true)
            ) {
                flags.suspend_sell = 1;
                show_flash_messages("SELL Suspended", "danger");
                validation = false;
            }
            if (rms_check.order_side == "BUY" && data.ticker_limits.suspend_buy == true) {
                if (data.ticker_limits.buy_suspend_mode == "selected") {
                    if (data.ticker_limits.buy_suspend_list.indexOf(rms_check.order_code) > -1) {
                        flags.suspend_buy = 1;
                        show_flash_messages("Ticker BUY Suspended", "danger");
                        validation = false;
                    }
                    if (data.ticker_limits.buy_suspend_list.indexOf(rms_check.username) > -1) {
                        flags.suspend_buy = 1;
                        show_flash_messages("Ticker BUY Suspended", "danger");
                        validation = false;
                    }
                }
                if (data.ticker_limits.buy_suspend_mode == "excluded") {
                    if (data.ticker_limits.buy_suspend_list.indexOf(rms_check.order_code) == -1 && data.ticker_limits.buy_suspend_list.indexOf(rms_check.username) == -1) {
                        flags.suspend_buy = 1;
                        show_flash_messages("Ticker BUY Suspended", "danger");
                        validation = false;
                    }
                }
            }
            if (rms_check.order_side == "SELL" && data.ticker_limits.suspend_sell == true) {
                if (data.ticker_limits.sell_suspend_mode == "selected") {
                    if (data.ticker_limits.sell_suspend_list.indexOf(rms_check.order_code) > -1) {
                        flags.suspend_sell = 1;
                        show_flash_messages("Ticker SELL Suspended", "danger");
                        validation = false;
                    }
                    if (data.ticker_limits.sell_suspend_list.indexOf(rms_check.username) > -1) {
                        flags.suspend_sell = 1;
                        show_flash_messages("Ticker SELL Suspended", "danger");
                        validation = false;
                    }
                }
                if (data.ticker_limits.sell_suspend_mode == "excluded") {
                    if (data.ticker_limits.sell_suspend_list.indexOf(rms_check.order_code) == -1 && data.ticker_limits.sell_suspend_list.indexOf(rms_check.username) == -1) {
                        flags.suspend_sell = 1;
                        show_flash_messages("Ticker SELL Suspended", "danger");
                        validation = false;
                    }
                }
            }
            if (
                rms_check.order_board == "PUBLIC" &&
                rms_check.symbol_spot == "N" &&
                (data.dealer_limits.authorized_market_main_public == false || data.user_limits.authorized_market_main_public == false || data.client_limits.authorized_market_main_public == false)
            ) {
                flags.invalid_market = 1;
                show_flash_messages("Unauthorized Market Type", "danger");
                validation = false;
            } else if (
                rms_check.order_board == "PUBLIC" &&
                rms_check.symbol_spot == "Y" &&
                (data.dealer_limits.authorized_market_main_spot == false || data.user_limits.authorized_market_main_spot == false || data.client_limits.authorized_market_main_spot == false)
            ) {
                flags.invalid_market = 1;
                show_flash_messages("Unauthorized Market Type", "danger");
                validation = false;
            } else if (rms_check.order_board == "BLOCK" && (data.dealer_limits.authorized_market_main_block == false || data.user_limits.authorized_market_main_block == false || data.client_limits.authorized_market_main_block == false)) {
                flags.invalid_market = 1;
                show_flash_messages("Unauthorized Market Type", "danger");
                validation = false;
            } else if (rms_check.order_board == "BUYIN" && (data.dealer_limits.authorized_market_main_buyin == false || data.user_limits.authorized_market_main_buyin == false || data.client_limits.authorized_market_main_buyin == false)) {
                flags.invalid_market = 1;
                show_flash_messages("Unauthorized Market Type", "danger");
                validation = false;
            } else if (rms_check.order_board == "DEBT" && (data.dealer_limits.authorized_market_main_debt == false || data.user_limits.authorized_market_main_debt == false || data.client_limits.authorized_market_main_debt == false)) {
                flags.invalid_market = 1;
                show_flash_messages("Unauthorized Market Type", "danger");
                validation = false;
            } else if (
                rms_check.order_board == "SPUBLIC" &&
                rms_check.symbol_spot == "N" &&
                (data.dealer_limits.authorized_market_scp_public == false || data.user_limits.authorized_market_scp_public == false || data.client_limits.authorized_market_scp_public == false)
            ) {
                flags.invalid_market = 1;
                show_flash_messages("Unauthorized Market Type", "danger");
                validation = false;
            } else if (
                rms_check.order_board == "SPUBLIC" &&
                rms_check.symbol_spot == "Y" &&
                (data.dealer_limits.authorized_market_scp_spot == false || data.user_limits.authorized_market_scp_spot == false || data.client_limits.authorized_market_scp_spot == false)
            ) {
                flags.invalid_market = 1;
                show_flash_messages("Unauthorized Market Type", "danger");
                validation = false;
            } else if (rms_check.order_board == "SBLOCK" && (data.dealer_limits.authorized_market_scp_block == false || data.user_limits.authorized_market_scp_block == false || data.client_limits.authorized_market_scp_block == false)) {
                flags.invalid_market = 1;
                show_flash_messages("Unauthorized Market Type", "danger");
                validation = false;
            } else if (rms_check.order_board == "SBUYIN" && (data.dealer_limits.authorized_market_scp_buyin == false || data.user_limits.authorized_market_scp_buyin == false || data.client_limits.authorized_market_scp_buyin == false)) {
                flags.invalid_market = 1;
                show_flash_messages("Unauthorized Market Type", "danger");
                validation = false;
            } else if (rms_check.order_board == "SDEBT" && (data.dealer_limits.authorized_market_scp_debt == false || data.user_limits.authorized_market_scp_debt == false || data.client_limits.authorized_market_scp_debt == false)) {
                flags.invalid_market = 1;
                show_flash_messages("Unauthorized Market Type", "danger");
                validation = false;
            } else if (
                rms_check.order_board == "ATBPUB" &&
                rms_check.symbol_spot == "N" &&
                (data.dealer_limits.authorized_market_atb_public == false || data.user_limits.authorized_market_atb_public == false || data.client_limits.authorized_market_atb_public == false)
            ) {
                flags.invalid_market = 1;
                show_flash_messages("Unauthorized Market Type", "danger");
                validation = false;
            } else if (
                rms_check.order_board == "ATBPUB" &&
                rms_check.symbol_spot == "Y" &&
                (data.dealer_limits.authorized_market_atb_spot == false || data.user_limits.authorized_market_atb_spot == false || data.client_limits.authorized_market_atb_spot == false)
            ) {
                flags.invalid_market = 1;
                show_flash_messages("Unauthorized Market Type", "danger");
                validation = false;
            } else if (rms_check.order_board == "ATBBUYIN" && (data.dealer_limits.authorized_market_atb_buyin == false || data.user_limits.authorized_market_atb_buyin == false || data.client_limits.authorized_market_atb_buyin == false)) {
                flags.invalid_market = 1;
                show_flash_messages("Unauthorized Market Type", "danger");
                validation = false;
            } else if (rms_check.order_board == "ATBDEBT" && (data.dealer_limits.authorized_market_atb_debt == false || data.user_limits.authorized_market_atb_debt == false || data.client_limits.authorized_market_atb_debt == false)) {
                flags.invalid_market = 1;
                show_flash_messages("Unauthorized Market Type", "danger");
                validation = false;
            }
            if (
                rms_check.order_board == "PUBLIC" &&
                (rms_check.order_type == "Market" || rms_check.order_type == "MarketBest") &&
                (data.dealer_limits.authorized_orders_main_market == false || data.user_limits.authorized_orders_main_market == false || data.client_limits.authorized_orders_main_market == false)
            ) {
                flags.invalid_order_type = 1;
                show_flash_messages("Unauthorized Order Type", "danger");
                validation = false;
            } else if (
                rms_check.order_board == "PUBLIC" &&
                rms_check.order_type == "Limit" &&
                (data.dealer_limits.authorized_orders_main_limit == false || data.user_limits.authorized_orders_main_limit == false || data.client_limits.authorized_orders_main_limit == false)
            ) {
                flags.invalid_order_type = 1;
                show_flash_messages("Unauthorized Order Type", "danger");
                validation = false;
            } else if (
                rms_check.order_board == "PUBLIC" &&
                rms_check.order_type == "Special" &&
                (data.dealer_limits.authorized_orders_main_special == false || data.user_limits.authorized_orders_main_special == false || data.client_limits.authorized_orders_main_special == false)
            ) {
                flags.invalid_order_type = 1;
                show_flash_messages("Unauthorized Order Type", "danger");
                validation = false;
            } else if (
                rms_check.order_board == "PUBLIC" &&
                rms_check.order_type == "Basket" &&
                (data.dealer_limits.authorized_orders_main_basket == false || data.user_limits.authorized_orders_main_basket == false || data.client_limits.authorized_orders_main_basket == false)
            ) {
                flags.invalid_order_type = 1;
                show_flash_messages("Unauthorized Order Type", "danger");
                validation = false;
            } else if (
                rms_check.order_board.includes("ATB") &&
                (rms_check.order_type == "Market" || rms_check.order_type == "MarketBest") &&
                (data.dealer_limits.authorized_orders_atb_market == false || data.user_limits.authorized_orders_atb_market == false || data.client_limits.authorized_orders_atb_market == false)
            ) {
                flags.invalid_order_type = 1;
                show_flash_messages("Unauthorized Order Type", "danger");
                validation = false;
            } else if (
                rms_check.order_board.includes("ATB") &&
                rms_check.order_type == "Limit" &&
                (data.dealer_limits.authorized_orders_atb_limit == false || data.user_limits.authorized_orders_atb_limit == false || data.client_limits.authorized_orders_atb_limit == false)
            ) {
                flags.invalid_order_type = 1;
                show_flash_messages("Unauthorized Order Type", "danger");
                validation = false;
            } else if (
                rms_check.order_board.includes("ATB") &&
                rms_check.order_type == "Special" &&
                (data.dealer_limits.authorized_orders_atb_special == false || data.user_limits.authorized_orders_atb_special == false || data.client_limits.authorized_orders_atb_special == false)
            ) {
                flags.invalid_order_type = 1;
                show_flash_messages("Unauthorized Order Type", "danger");
                validation = false;
            } else if (
                rms_check.order_board.includes("ATB") &&
                rms_check.order_type == "Basket" &&
                (data.dealer_limits.authorized_orders_atb_basket == false || data.user_limits.authorized_orders_atb_basket == false || data.client_limits.authorized_orders_atb_basket == false)
            ) {
                flags.invalid_order_type = 1;
                show_flash_messages("Unauthorized Order Type", "danger");
                validation = false;
            } else if (
                rms_check.order_board.includes("S") &&
                (rms_check.order_type == "Market" || rms_check.order_type == "MarketBest") &&
                (data.dealer_limits.authorized_orders_scp_market == false || data.user_limits.authorized_orders_scp_market == false || data.client_limits.authorized_orders_scp_market == false)
            ) {
                flags.invalid_order_type = 1;
                show_flash_messages("Unauthorized Order Type", "danger");
                validation = false;
            } else if (
                rms_check.order_board.includes("S") &&
                rms_check.order_type == "Limit" &&
                (data.dealer_limits.authorized_orders_scp_limit == false || data.user_limits.authorized_orders_scp_limit == false || data.client_limits.authorized_orders_scp_limit == false)
            ) {
                flags.invalid_order_type = 1;
                show_flash_messages("Unauthorized Order Type", "danger");
                validation = false;
            } else if (
                rms_check.order_board.includes("S") &&
                rms_check.order_type == "Special" &&
                (data.dealer_limits.authorized_orders_scp_special == false || data.user_limits.authorized_orders_scp_special == false || data.client_limits.authorized_orders_scp_special == false)
            ) {
                flags.invalid_order_type = 1;
                show_flash_messages("Unauthorized Order Type", "danger");
                validation = false;
            } else if (
                rms_check.order_board.includes("S") &&
                rms_check.order_type == "Basket" &&
                (data.dealer_limits.authorized_orders_scp_basket == false || data.user_limits.authorized_orders_scp_basket == false || data.client_limits.authorized_orders_scp_basket == false)
            ) {
                flags.invalid_order_type = 1;
                show_flash_messages("Unauthorized Order Type", "danger");
                validation = false;
            }
            if (Object.keys(data.fix_limit).length != 0) {
                if (rms_check.order_side == "BUY" && data.broker_limits.main_buy_percent == 0 && rms_check.order_value > data.fix_limit.remaining_limit) {
                    flags.exceeded_broker_limit = 1;
                    show_flash_messages("Broker BUY Limit Exceeded", "danger");
                    validation = false;
                } else if (rms_check.order_side == "BUY" && data.broker_limits.main_buy_percent != 0) {
                    var safe_limit = (data.fix_limit.trade_limit * data.broker_limits.main_buy_percent) / 100;
                    var remain_limit = data.fix_limit.remaining_limit - rms_check.order_value;
                    if (remain_limit < safe_limit) {
                        flags.exceeded_broker_limit = 1;
                        show_flash_messages("Broker Safe BUY Limit Exceeded", "danger");
                        validation = false;
                    }
                }
            }
            if (Object.keys(data.dealer_limits).length != 0) {
                if (rms_check.order_side == "BUY" && data.dealer_limits.limit_amount_buy_en == true && data.dealer_limits.limit_amount_buy != 0) {
                    if (data.dealer_limits.limit_amount_buy < rms_check.order_value) {
                        flags.exceeded_dealer_amount_limit = 1;
                        show_flash_messages("Dealer Buy Limit Exceeded", "danger");
                        validation = false;
                    }
                }
                if (rms_check.order_side == "SELL" && data.dealer_limits.limit_amount_sell_en == true && data.dealer_limits.limit_amount_sell != 0) {
                    if (data.dealer_limits.limit_amount_sell < rms_check.order_value) {
                        flags.exceeded_dealer_amount_limit = 1;
                        show_flash_messages("Dealer Sell Limit Exceeded", "danger");
                        validation = false;
                    }
                }
                if (rms_check.order_side == "BUY" && data.dealer_limits.limit_quantity_buy_en == true && data.dealer_limits.limit_quantity_buy != 0) {
                    if (data.dealer_limits.limit_quantity_buy < rms_check.order_qty) {
                        flags.exceeded_dealer_quantity_limit = 1;
                        show_flash_messages("Dealer Buy Qty Limit Exceeded", "danger");
                        validation = false;
                    }
                }
                if (rms_check.order_side == "SELL" && data.dealer_limits.limit_quantity_sell_en == true && data.dealer_limits.limit_quantity_sell != 0) {
                    if (data.dealer_limits.limit_quantity_sell < rms_check.order_qty) {
                        flags.exceeded_dealer_quantity_limit = 1;
                        show_flash_messages("Dealer Sell Qty Limit Exceeded", "danger");
                        validation = false;
                    }
                }
            }
            if (Object.keys(data.user_limits).length != 0) {
                if (rms_check.order_side == "BUY" && data.user_limits.limit_amount_buy_en == true && data.user_limits.limit_amount_buy != 0) {
                    if (data.user_limits.limit_amount_buy < rms_check.order_value) {
                        flags.exceeded_user_amount_limit = 1;
                        show_flash_messages("User Buy Limit Exceeded", "danger");
                        validation = false;
                    }
                }
                if (rms_check.order_side == "SELL" && data.user_limits.limit_amount_sell_en == true && data.user_limits.limit_amount_sell != 0) {
                    if (data.user_limits.limit_amount_sell < rms_check.order_value) {
                        flags.exceeded_user_amount_limit = 1;
                        show_flash_messages("User Sell Limit Exceeded", "danger");
                        validation = false;
                    }
                }
                if (rms_check.order_side == "BUY" && data.user_limits.limit_quantity_buy_en == true && data.user_limits.limit_quantity_buy != 0) {
                    if (data.user_limits.limit_quantity_buy < rms_check.order_qty) {
                        flags.exceeded_user_quantity_limit = 1;
                        show_flash_messages("User Buy Qty Limit Exceeded", "danger");
                        validation = false;
                    }
                }
                if (rms_check.order_side == "SELL" && data.user_limits.limit_quantity_sell_en == true && data.user_limits.limit_quantity_sell != 0) {
                    if (data.user_limits.limit_quantity_sell < rms_check.order_qty) {
                        flags.exceeded_user_quantity_limit = 1;
                        show_flash_messages("User Sell Qty Limit Exceeded", "danger");
                        validation = false;
                    }
                }
            }
            if (Object.keys(data.client_limits).length != 0) {
                if (rms_check.order_side == "BUY" && data.client_limits.main_cash_en == true && data.client_limits.main_cash_percent != 0) {
                    var safe_limit = (rms_check.cashlimit * data.client_limits.main_cash_percent) / 100;
                    var remain_limit = rms_check.cashlimit - rms_check.order_value;
                    if (remain_limit < safe_limit) {
                        flags.exceeded_client_cash_limit = 1;
                        show_flash_messages("Client Safety Cash Limit Exceeded", "danger");
                        validation = false;
                    }
                }
            }
            if (rms_check.order_side == "BUY" && rms_check.cashlimit < rms_check.order_value) {
                flags.exceeded_client_cash_limit = 1;
                show_flash_messages("Client Cash Limit Exceeded", "danger");
                validation = false;
            }
            if (rms_check.order_side == "SELL" && rms_check.order_qty > rms_check.saleable) {
                flags.exceeded_client_saleable_limit = 1;
                show_flash_messages("Client Order Qty Exceeded", "danger");
                validation = false;
            }
            if (Object.keys(data.broker_limits).length != 0) {
                if (rms_check.order_side == "SELL" && data.broker_limits.main_sell_en == true && data.broker_limits.main_sell_initial_limit != 0 && data.broker_limits.main_sell_percent == 0) {
                    var sell_value = data.broker_trades.sell_value != undefined ? data.broker_trades.sell_value : 0;
                    var remain_limit = data.broker_limits.main_sell_initial_limit - sell_value;
                    if (remain_limit < rms_check.order_value) {
                        flags.exceeded_broker_limit = 1;
                        show_flash_messages("Broker SELL Limit Exceeded", "danger");
                        validation = false;
                    }
                } else if (rms_check.order_side == "SELL" && data.broker_limits.main_sell_en == true && data.broker_limits.main_sell_initial_limit != 0 && data.broker_limits.main_sell_percent != 0) {
                    var sell_value = data.broker_trades.sell_value != undefined ? data.broker_trades.sell_value : 0;
                    var remain_limit = data.broker_limits.main_sell_initial_limit - sell_value;
                    var safe_limit = (data.broker_limits.main_sell_initial_limit * data.broker_limits.main_sell_percent) / 100;
                    remain_limit = remain_limit - rms_check.order_value;
                    if (remain_limit < safe_limit) {
                        flags.exceeded_broker_limit = 1;
                        show_flash_messages("Broker Safe SELL Limit Exceeded", "danger");
                        validation = false;
                    }
                }
                if (data.broker_limits.main_totaltrans_en == true && data.broker_limits.main_totaltrans_initial_limit != 0 && data.broker_limits.main_totaltrans_percent == 0) {
                    var total_value = data.broker_trades.total_value != undefined ? data.broker_trades.total_value : 0;
                    var remain_limit = data.broker_limits.main_totaltrans_initial_limit - total_value;
                    if (remain_limit < rms_check.order_value) {
                        flags.exceeded_broker_limit = 1;
                        show_flash_messages("Broker Total Transaction Limit Exceeded", "danger");
                        validation = false;
                    }
                } else if (data.broker_limits.main_totaltrans_en == true && data.broker_limits.main_totaltrans_initial_limit != 0 && data.broker_limits.main_totaltrans_percent != 0) {
                    var total_value = data.broker_trades.total_value != undefined ? data.broker_trades.total_value : 0;
                    var remain_limit = data.broker_limits.main_totaltrans_initial_limit - total_value;
                    var safe_limit = (data.broker_limits.main_totaltrans_initial_limit * data.broker_limits.main_totaltrans_percent) / 100;
                    remain_limit = remain_limit - rms_check.order_value;
                    if (remain_limit < safe_limit) {
                        flags.exceeded_broker_limit = 1;
                        show_flash_messages("Broker Safe Total Transaction Limit Exceeded", "danger");
                        validation = false;
                    }
                }
                if (data.broker_limits.main_nettrans_en == true && data.broker_limits.main_nettrans_initial_limit != 0 && data.broker_limits.main_nettrans_percent == 0) {
                    var net_value = data.broker_trades.net_value != undefined ? data.broker_trades.net_value : 0;
                    var remain_limit = data.broker_limits.main_nettrans_initial_limit - net_value;
                    if (remain_limit < rms_check.order_value) {
                        flags.exceeded_broker_limit = 1;
                        show_flash_messages("Broker Net Transaction Limit Exceeded", "danger");
                        validation = false;
                    }
                } else if (data.broker_limits.main_nettrans_en == true && data.broker_limits.main_nettrans_initial_limit != 0 && data.broker_limits.main_nettrans_percent != 0) {
                    var net_value = data.broker_trades.net_value != undefined ? data.broker_trades.net_value : 0;
                    var remain_limit = data.broker_limits.main_nettrans_initial_limit - net_value;
                    var safe_limit = (data.broker_limits.main_nettrans_initial_limit * data.broker_limits.main_nettrans_percent) / 100;
                    remain_limit = remain_limit - rms_check.order_value;
                    if (remain_limit < safe_limit) {
                        flags.exceeded_broker_limit = 1;
                        show_flash_messages("Broker Safe Net Transaction Limit Exceeded", "danger");
                        validation = false;
                    }
                }
            }
            if (Object.keys(data.branch_limits).length != 0) {
                if (rms_check.order_side == "BUY" && data.branch_limits.main_buy_en == true && data.branch_limits.main_buy_initial_limit != 0 && data.branch_limits.main_buy_percent == 0) {
                    var buy_value = data.branch_trades.buy_value != undefined ? data.branch_trades.buy_value : 0;
                    var remain_limit = data.branch_limits.main_buy_initial_limit - buy_value;
                    if (remain_limit < rms_check.order_value) {
                        flags.exceeded_branch_credit_limit = 1;
                        show_flash_messages("Branch BUY Limit Exceeded", "danger");
                        validation = false;
                    }
                } else if (rms_check.order_side == "BUY" && data.branch_limits.main_buy_en == true && data.branch_limits.main_buy_initial_limit != 0 && data.branch_limits.main_buy_percent != 0) {
                    var buy_value = data.branch_trades.buy_value != undefined ? data.branch_trades.buy_value : 0;
                    var remain_limit = data.branch_limits.main_buy_initial_limit - buy_value;
                    var safe_limit = (data.branch_limits.main_buy_initial_limit * data.branch_limits.main_buy_percent) / 100;
                    remain_limit = remain_limit - rms_check.order_value;
                    if (remain_limit < safe_limit) {
                        flags.exceeded_branch_credit_limit = 1;
                        show_flash_messages("Branch Safe BUY Limit Exceeded", "danger");
                        validation = false;
                    }
                }
                if (rms_check.order_side == "SELL" && data.branch_limits.main_sell_en == true && data.branch_limits.main_sell_initial_limit != 0 && data.branch_limits.main_sell_percent == 0) {
                    var sell_value = data.branch_trades.sell_value != undefined ? data.branch_trades.sell_value : 0;
                    var remain_limit = data.branch_limits.main_sell_initial_limit - sell_value;
                    if (remain_limit < rms_check.order_value) {
                        flags.exceeded_branch_credit_limit = 1;
                        show_flash_messages("Branch SELL Limit Exceeded", "danger");
                        validation = false;
                    }
                } else if (rms_check.order_side == "SELL" && data.branch_limits.main_sell_en == true && data.branch_limits.main_sell_initial_limit != 0 && data.branch_limits.main_sell_percent != 0) {
                    var sell_value = data.branch_trades.sell_value != undefined ? data.branch_trades.sell_value : 0;
                    var remain_limit = data.branch_limits.main_sell_initial_limit - sell_value;
                    var safe_limit = (data.branch_limits.main_sell_initial_limit * data.branch_limits.main_sell_percent) / 100;
                    remain_limit = remain_limit - rms_check.order_value;
                    if (remain_limit < safe_limit) {
                        flags.exceeded_branch_credit_limit = 1;
                        show_flash_messages("Branch Safe SELL Limit Exceeded", "danger");
                        validation = false;
                    }
                }
                if (data.branch_limits.cash_limit_en == true && data.branch_limits.main_cash_limit != 0 && data.branch_limits.main_cash_percent == 0) {
                    var buy_value = data.branch_trades.buy_value != undefined ? data.branch_trades.buy_value : 0;
                    var remain_limit = data.branch_limits.main_cash_limit - buy_value;
                    if (remain_limit < rms_check.order_value) {
                        flags.exceeded_branch_cash_limit = 1;
                        show_flash_messages("Branch Cash Limit Exceeded", "danger");
                        validation = false;
                    }
                } else if (data.branch_limits.cash_limit_en == true && data.branch_limits.main_cash_limit != 0 && data.branch_limits.main_cash_percent != 0) {
                    var buy_value = data.branch_trades.buy_value != undefined ? data.branch_trades.buy_value : 0;
                    var remain_limit = data.branch_limits.main_cash_limit - buy_value;
                    var safe_limit = (data.branch_limits.main_cash_limit * data.branch_limits.main_cash_percent) / 100;
                    remain_limit = remain_limit - rms_check.order_value;
                    if (remain_limit < safe_limit) {
                        flags.exceeded_branch_cash_limit = 1;
                        show_flash_messages("Branch Safe Cash Limit Exceeded", "danger");
                        validation = false;
                    }
                }
            }
            if (Object.keys(data.dealer_limits).length != 0) {
                if (rms_check.order_side == "BUY" && data.dealer_limits.main_buy_en == true && data.dealer_limits.main_buy_initial_limit != 0 && data.dealer_limits.main_buy_percent == 0) {
                    var buy_value = data.dealer_trades.buy_value != undefined ? data.dealer_trades.buy_value : 0;
                    var remain_limit = data.dealer_limits.main_buy_initial_limit - buy_value;
                    if (remain_limit < rms_check.order_value) {
                        flags.exceeded_dealer_credit_limit = 1;
                        show_flash_messages("Dealer BUY Limit Exceeded", "danger");
                        validation = false;
                    }
                } else if (rms_check.order_side == "BUY" && data.dealer_limits.main_buy_en == true && data.dealer_limits.main_buy_initial_limit != 0 && data.dealer_limits.main_buy_percent != 0) {
                    var buy_value = data.dealer_trades.buy_value != undefined ? data.dealer_trades.buy_value : 0;
                    var remain_limit = data.dealer_limits.main_buy_initial_limit - buy_value;
                    var safe_limit = (data.dealer_limits.main_buy_initial_limit * data.dealer_limits.main_buy_percent) / 100;
                    remain_limit = remain_limit - rms_check.order_value;
                    if (remain_limit < safe_limit) {
                        flags.exceeded_dealer_credit_limit = 1;
                        show_flash_messages("Dealer Safe BUY Limit Exceeded", "danger");
                        validation = false;
                    }
                }
                if (rms_check.order_side == "SELL" && data.dealer_limits.main_sell_en == true && data.dealer_limits.main_sell_initial_limit != 0 && data.dealer_limits.main_sell_percent == 0) {
                    var sell_value = data.dealer_trades.sell_value != undefined ? data.dealer_trades.sell_value : 0;
                    var remain_limit = data.dealer_limits.main_sell_initial_limit - sell_value;
                    if (remain_limit < rms_check.order_value) {
                        flags.exceeded_dealer_credit_limit = 1;
                        show_flash_messages("Dealer SELL Limit Exceeded", "danger");
                        validation = false;
                    }
                } else if (rms_check.order_side == "SELL" && data.dealer_limits.main_sell_en == true && data.dealer_limits.main_sell_initial_limit != 0 && data.dealer_limits.main_sell_percent != 0) {
                    var sell_value = data.dealer_trades.sell_value != undefined ? data.dealer_trades.sell_value : 0;
                    var remain_limit = data.dealer_limits.main_sell_initial_limit - sell_value;
                    var safe_limit = (data.dealer_limits.main_sell_initial_limit * data.dealer_limits.main_sell_percent) / 100;
                    remain_limit = remain_limit - rms_check.order_value;
                    if (remain_limit < safe_limit) {
                        flags.exceeded_dealer_credit_limit = 1;
                        show_flash_messages("Dealer Safe SELL Limit Exceeded", "danger");
                        validation = false;
                    }
                }
                if (data.dealer_limits.main_totaltrans_en == true && data.dealer_limits.main_totaltrans_initial_limit != 0 && data.dealer_limits.main_totaltrans_percent == 0) {
                    var total_value = data.dealer_trades.total_value != undefined ? data.dealer_trades.total_value : 0;
                    var remain_limit = data.dealer_limits.main_totaltrans_initial_limit - total_value;
                    if (remain_limit < rms_check.order_value) {
                        flags.exceeded_dealer_credit_limit = 1;
                        show_flash_messages("Dealer Total Transaction Limit Exceeded", "danger");
                        validation = false;
                    }
                } else if (data.dealer_limits.main_totaltrans_en == true && data.dealer_limits.main_totaltrans_initial_limit != 0 && data.dealer_limits.main_totaltrans_percent != 0) {
                    var total_value = data.dealer_trades.total_value != undefined ? data.dealer_trades.total_value : 0;
                    var remain_limit = data.dealer_limits.main_totaltrans_initial_limit - total_value;
                    var safe_limit = (data.dealer_limits.main_totaltrans_initial_limit * data.dealer_limits.main_totaltrans_percent) / 100;
                    remain_limit = remain_limit - rms_check.order_value;
                    if (remain_limit < safe_limit) {
                        flags.exceeded_dealer_credit_limit = 1;
                        show_flash_messages("Dealer Safe Total Transaction Limit Exceeded", "danger");
                        validation = false;
                    }
                }
                if (data.dealer_limits.main_nettrans_en == true && data.dealer_limits.main_nettrans_initial_limit != 0 && data.dealer_limits.main_nettrans_percent == 0) {
                    var net_value = data.dealer_trades.net_value != undefined ? data.dealer_trades.net_value : 0;
                    var remain_limit = data.dealer_limits.main_nettrans_initial_limit - net_value;
                    if (remain_limit < rms_check.order_value) {
                        flags.exceeded_dealer_credit_limit = 1;
                        show_flash_messages("Dealer Net Transaction Limit Exceeded", "danger");
                        validation = false;
                    }
                } else if (data.dealer_limits.main_nettrans_en == true && data.dealer_limits.main_nettrans_initial_limit != 0 && data.dealer_limits.main_nettrans_percent != 0) {
                    var net_value = data.dealer_trades.net_value != undefined ? data.dealer_trades.net_value : 0;
                    var remain_limit = data.dealer_limits.main_nettrans_initial_limit - net_value;
                    var safe_limit = (data.dealer_limits.main_nettrans_initial_limit * data.dealer_limits.main_nettrans_percent) / 100;
                    remain_limit = remain_limit - rms_check.order_value;
                    if (remain_limit < safe_limit) {
                        flags.exceeded_dealer_credit_limit = 1;
                        show_flash_messages("Dealer Safe Net Transaction Limit Exceeded", "danger");
                        validation = false;
                    }
                }
            }
            if (Object.keys(data.user_limits).length != 0) {
                if (rms_check.order_side == "BUY" && data.user_limits.main_buy_en == true && data.user_limits.main_buy_initial_limit != 0 && data.user_limits.main_buy_percent == 0) {
                    var buy_value = data.user_trades.buy_value != undefined ? data.user_trades.buy_value : 0;
                    var remain_limit = data.user_limits.main_buy_initial_limit - buy_value;
                    if (remain_limit < rms_check.order_value) {
                        flags.exceeded_user_credit_limit = 1;
                        show_flash_messages("User BUY Limit Exceeded", "danger");
                        validation = false;
                    }
                } else if (rms_check.order_side == "BUY" && data.user_limits.main_buy_en == true && data.user_limits.main_buy_initial_limit != 0 && data.user_limits.main_buy_percent != 0) {
                    var buy_value = data.user_trades.buy_value != undefined ? data.user_trades.buy_value : 0;
                    var remain_limit = data.user_limits.main_buy_initial_limit - buy_value;
                    var safe_limit = (data.user_limits.main_buy_initial_limit * data.user_limits.main_buy_percent) / 100;
                    remain_limit = remain_limit - rms_check.order_value;
                    if (remain_limit < safe_limit) {
                        flags.exceeded_user_credit_limit = 1;
                        show_flash_messages("User Safe BUY Limit Exceeded", "danger");
                        validation = false;
                    }
                }
                if (rms_check.order_side == "SELL" && data.user_limits.main_sell_en == true && data.user_limits.main_sell_initial_limit != 0 && data.user_limits.main_sell_percent == 0) {
                    var sell_value = data.user_trades.sell_value != undefined ? data.user_trades.sell_value : 0;
                    var remain_limit = data.user_limits.main_sell_initial_limit - sell_value;
                    if (remain_limit < rms_check.order_value) {
                        flags.exceeded_user_credit_limit = 1;
                        show_flash_messages("User SELL Limit Exceeded", "danger");
                        validation = false;
                    }
                } else if (rms_check.order_side == "SELL" && data.user_limits.main_sell_en == true && data.user_limits.main_sell_initial_limit != 0 && data.user_limits.main_sell_percent != 0) {
                    var sell_value = data.user_trades.sell_value != undefined ? data.user_trades.sell_value : 0;
                    var remain_limit = data.user_limits.main_sell_initial_limit - sell_value;
                    var safe_limit = (data.user_limits.main_sell_initial_limit * data.user_limits.main_sell_percent) / 100;
                    remain_limit = remain_limit - rms_check.order_value;
                    if (remain_limit < safe_limit) {
                        flags.exceeded_user_credit_limit = 1;
                        show_flash_messages("User Safe SELL Limit Exceeded", "danger");
                        validation = false;
                    }
                }
                if (data.user_limits.main_totaltrans_en == true && data.user_limits.main_totaltrans_initial_limit != 0 && data.user_limits.main_totaltrans_percent == 0) {
                    var total_value = data.user_trades.total_value != undefined ? data.user_trades.total_value : 0;
                    var remain_limit = data.user_limits.main_totaltrans_initial_limit - total_value;
                    if (remain_limit < rms_check.order_value) {
                        flags.exceeded_user_credit_limit = 1;
                        show_flash_messages("User Total Transaction Limit Exceeded", "danger");
                        validation = false;
                    }
                } else if (data.user_limits.main_totaltrans_en == true && data.user_limits.main_totaltrans_initial_limit != 0 && data.user_limits.main_totaltrans_percent != 0) {
                    var total_value = data.user_trades.total_value != undefined ? data.user_trades.total_value : 0;
                    var remain_limit = data.user_limits.main_totaltrans_initial_limit - total_value;
                    var safe_limit = (data.user_limits.main_totaltrans_initial_limit * data.user_limits.main_totaltrans_percent) / 100;
                    remain_limit = remain_limit - rms_check.order_value;
                    if (remain_limit < safe_limit) {
                        flags.exceeded_user_credit_limit = 1;
                        show_flash_messages("User Safe Total Transaction Limit Exceeded", "danger");
                        validation = false;
                    }
                }
                if (data.user_limits.main_nettrans_en == true && data.user_limits.main_nettrans_initial_limit != 0 && data.user_limits.main_nettrans_percent == 0) {
                    var net_value = data.user_trades.net_value != undefined ? data.user_trades.net_value : 0;
                    var remain_limit = data.user_limits.main_nettrans_initial_limit - net_value;
                    if (remain_limit < rms_check.order_value) {
                        flags.exceeded_user_credit_limit = 1;
                        show_flash_messages("User Net Transaction Limit Exceeded", "danger");
                        validation = false;
                    }
                } else if (data.user_limits.main_nettrans_en == true && data.user_limits.main_nettrans_initial_limit != 0 && data.user_limits.main_nettrans_percent != 0) {
                    var net_value = data.user_trades.net_value != undefined ? data.user_trades.net_value : 0;
                    var remain_limit = data.user_limits.main_nettrans_initial_limit - net_value;
                    var safe_limit = (data.user_limits.main_nettrans_initial_limit * data.user_limits.main_nettrans_percent) / 100;
                    remain_limit = remain_limit - rms_check.order_value;
                    if (remain_limit < safe_limit) {
                        flags.exceeded_user_credit_limit = 1;
                        show_flash_messages("User Safe Net Transaction Limit Exceeded", "danger");
                        validation = false;
                    }
                }
            }
            if (Object.keys(data.client_limits).length != 0) {
                if (rms_check.order_side == "BUY" && data.client_limits.main_buy_en == true && data.client_limits.main_buy_initial_limit != 0 && data.client_limits.main_buy_percent == 0) {
                    var buy_value = data.client_trades.buy_value != undefined ? data.client_trades.buy_value : 0;
                    var remain_limit = data.client_limits.main_buy_initial_limit - buy_value;
                    if (remain_limit < rms_check.order_value) {
                        flags.exceeded_client_credit_limit = 1;
                        show_flash_messages("Client BUY Limit Exceeded", "danger");
                        validation = false;
                    }
                } else if (rms_check.order_side == "BUY" && data.client_limits.main_buy_en == true && data.client_limits.main_buy_initial_limit != 0 && data.client_limits.main_buy_percent != 0) {
                    var buy_value = data.client_trades.buy_value != undefined ? data.client_trades.buy_value : 0;
                    var remain_limit = data.client_limits.main_buy_initial_limit - buy_value;
                    var safe_limit = (data.client_limits.main_buy_initial_limit * data.client_limits.main_buy_percent) / 100;
                    remain_limit = remain_limit - rms_check.order_value;
                    if (remain_limit < safe_limit) {
                        flags.exceeded_client_credit_limit = 1;
                        show_flash_messages("Client Safe BUY Limit Exceeded", "danger");
                        validation = false;
                    }
                }
                if (rms_check.order_side == "SELL" && data.client_limits.main_sell_en == true && data.client_limits.main_sell_initial_limit != 0 && data.client_limits.main_sell_percent == 0) {
                    var sell_value = data.client_trades.sell_value != undefined ? data.client_trades.sell_value : 0;
                    var remain_limit = data.client_limits.main_sell_initial_limit - sell_value;
                    if (remain_limit < rms_check.order_value) {
                        flags.exceeded_client_credit_limit = 1;
                        show_flash_messages("Client SELL Limit Exceeded", "danger");
                        validation = false;
                    }
                } else if (rms_check.order_side == "SELL" && data.client_limits.main_sell_en == true && data.client_limits.main_sell_initial_limit != 0 && data.client_limits.main_sell_percent != 0) {
                    var sell_value = data.client_trades.sell_value != undefined ? data.client_trades.sell_value : 0;
                    var remain_limit = data.client_limits.main_sell_initial_limit - sell_value;
                    var safe_limit = (data.client_limits.main_sell_initial_limit * data.client_limits.main_sell_percent) / 100;
                    remain_limit = remain_limit - rms_check.order_value;
                    if (remain_limit < safe_limit) {
                        flags.exceeded_client_credit_limit = 1;
                        show_flash_messages("Client Safe SELL Limit Exceeded", "danger");
                        validation = false;
                    }
                }
                if (data.client_limits.main_totaltrans_en == true && data.client_limits.main_totaltrans_initial_limit != 0 && data.client_limits.main_totaltrans_percent == 0) {
                    var total_value = data.client_trades.total_value != undefined ? data.client_trades.total_value : 0;
                    var remain_limit = data.client_limits.main_totaltrans_initial_limit - total_value;
                    if (remain_limit < rms_check.order_value) {
                        flags.exceeded_client_credit_limit = 1;
                        show_flash_messages("Client Total Transaction Limit Exceeded", "danger");
                        validation = false;
                    }
                } else if (data.client_limits.main_totaltrans_en == true && data.client_limits.main_totaltrans_initial_limit != 0 && data.client_limits.main_totaltrans_percent != 0) {
                    var total_value = data.client_trades.total_value != undefined ? data.client_trades.total_value : 0;
                    var remain_limit = data.client_limits.main_totaltrans_initial_limit - total_value;
                    var safe_limit = (data.client_limits.main_totaltrans_initial_limit * data.client_limits.main_totaltrans_percent) / 100;
                    remain_limit = remain_limit - rms_check.order_value;
                    if (remain_limit < safe_limit) {
                        flags.exceeded_client_credit_limit = 1;
                        show_flash_messages("Client Safe Total Transaction Limit Exceeded", "danger");
                        validation = false;
                    }
                }
                if (data.client_limits.main_nettrans_en == true && data.client_limits.main_nettrans_initial_limit != 0 && data.client_limits.main_nettrans_percent == 0) {
                    var net_value = data.client_trades.net_value != undefined ? data.client_trades.net_value : 0;
                    var remain_limit = data.client_limits.main_nettrans_initial_limit - net_value;
                    if (remain_limit < rms_check.order_value) {
                        flags.exceeded_client_credit_limit = 1;
                        show_flash_messages("Client Net Transaction Limit Exceeded", "danger");
                        validation = false;
                    }
                } else if (data.client_limits.main_nettrans_en == true && data.client_limits.main_nettrans_initial_limit != 0 && data.client_limits.main_nettrans_percent != 0) {
                    var net_value = data.client_trades.net_value != undefined ? data.client_trades.net_value : 0;
                    var remain_limit = data.client_limits.main_nettrans_initial_limit - net_value;
                    var safe_limit = (data.client_limits.main_nettrans_initial_limit * data.client_limits.main_nettrans_percent) / 100;
                    remain_limit = remain_limit - rms_check.order_value;
                    if (remain_limit < safe_limit) {
                        flags.exceeded_client_credit_limit = 1;
                        show_flash_messages("Client Safe Net Transaction Limit Exceeded", "danger");
                        validation = false;
                    }
                }
            }
            if (Object.keys(data.ticker_limits).length != 0) {
                if (rms_check.order_side == "BUY" && data.ticker_limits.buy_en == true && data.ticker_limits.buy_initial_limit != 0 && data.ticker_limits.buy_percent == 0) {
                    var buy_value = data.symbol_trades.buy_value != undefined ? data.symbol_trades.buy_value : 0;
                    var remain_limit = data.ticker_limits.buy_initial_limit - buy_value;
                    if (remain_limit < rms_check.order_value) {
                        flags.exceeded_ticker_credit_limit = 1;
                        show_flash_messages("Ticker BUY Limit Exceeded", "danger");
                        validation = false;
                    }
                } else if (rms_check.order_side == "BUY" && data.ticker_limits.buy_en == true && data.ticker_limits.buy_initial_limit != 0 && data.ticker_limits.buy_percent != 0) {
                    var buy_value = data.symbol_trades.buy_value != undefined ? data.symbol_trades.buy_value : 0;
                    var remain_limit = data.ticker_limits.buy_initial_limit - buy_value;
                    var safe_limit = (data.ticker_limits.buy_initial_limit * data.ticker_limits.buy_percent) / 100;
                    remain_limit = remain_limit - rms_check.order_value;
                    if (remain_limit < safe_limit) {
                        flags.exceeded_ticker_credit_limit = 1;
                        show_flash_messages("Ticker Safe BUY Limit Exceeded", "danger");
                        validation = false;
                    }
                }
                if (data.ticker_limits.nettrans_en == true && data.ticker_limits.nettrans_initial_limit != 0 && data.ticker_limits.nettrans_percent == 0) {
                    var net_value = data.symbol_trades.net_value != undefined ? data.symbol_trades.net_value : 0;
                    var remain_limit = data.ticker_limits.nettrans_initial_limit - net_value;
                    if (remain_limit < rms_check.order_value) {
                        flags.exceeded_ticker_credit_limit = 1;
                        show_flash_messages("Ticker Net Transaction Limit Exceeded", "danger");
                        validation = false;
                    }
                } else if (data.ticker_limits.nettrans_en == true && data.ticker_limits.nettrans_initial_limit != 0 && data.ticker_limits.nettrans_percent != 0) {
                    var net_value = data.symbol_trades.net_value != undefined ? data.symbol_trades.net_value : 0;
                    var remain_limit = data.ticker_limits.nettrans_initial_limit - net_value;
                    var safe_limit = (data.ticker_limits.nettrans_initial_limit * data.ticker_limits.nettrans_percent) / 100;
                    remain_limit = remain_limit - rms_check.order_value;
                    if (remain_limit < safe_limit) {
                        flags.exceeded_ticker_credit_limit = 1;
                        show_flash_messages("Ticker Safe Net Transaction Limit Exceeded", "danger");
                        validation = false;
                    }
                }
            }
            if (data.netting_data.conflict == true) {
                flags.netting_violation = 1;
                if (data.netting_data.netting_side == "SELL") {
                    show_flash_messages("Trade Rejected: BUY Netting Violation. Price must be less than " + data.netting_data.order_price, "danger");
                }
                if (data.netting_data.netting_side == "BUY") {
                    show_flash_messages("Trade Rejected: SELL Netting Violation. Price must be greater than " + data.netting_data.order_price, "danger");
                }
                validation = false;
            }
            if (Object.values(flags).every((value) => value === 0)) {
                validation = true;
            }
        },
    });
    return validation;
}
