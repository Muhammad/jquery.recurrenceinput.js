/**
 * http://garbas.github.com/jquery.recurrenceinput.js
 *
 * Author: Rok Garbas <rok@garbas.si>
 * Since: Sep 2010
 * Date: XX-XX-XXXX
 */
(function($) {

    /**
     * TODO:
     *  - start date, end date and number of recurrences for each rule
     *  - reuse start date from other fields
     *
     */
    var default_conf = {
        classname: 'recurrenceinput_',
        classname_activate: 'activate',
        classname_form: 'form',
        classname_freq: 'freq',

        classname_freq_options: 'freq_options',
        classname_freq_daily: 'freq_daily',
        classname_freq_weekly: 'freq_weekly',
        classname_freq_monthly: 'freq_monthly',
        classname_freq_yearly: 'freq_yearly',

        classname_daily_type: 'daily_type',
        classname_daily_interval: 'daily_interval',
        classname_daily_weekdays: 'daily_weekdays',

        classname_weekly_interval: 'weekly_interval',
        classname_weekly_weekdays: 'weekly_weekdays',

        classname_monthly_type: 'monthly_type:',
        classname_monthly_dayofmonth_day: 'monthly_dayofmonth_day',
        classname_monthly_dayofmonth_interval: 'monthly_dayofmonth_interval',
        classname_monthly_weekdayofmonth_index: 'monthly_weekdayofmonth_index',
        classname_monthly_weekdayofmonth: 'monthly_weekdayofmonth',
        classname_monthly_weekdayofmonth_interval: 'monthly_weekdayofmonth_interval',

        classname_yearly_type: 'yearly_type:',
        classname_yearly_dayofmonth_month: 'yearly_dayofmonth_month:',
        classname_yearly_dayofmonth_day: 'yearly_dayofmonth_day:',
        classname_yearly_weekdayofweek_index: 'yearly_weekdayofweek_index',
        classname_yearly_weekdayofweek_day: 'yearly_weekdayofweek_day',
        classname_yearly_weekdayofweek_months: 'yearly_weekdayofweek_months',

        classname_range: 'range',
        classname_range_start: 'range_start',
        classname_range_end: 'range_end',
        classname_range_end_type: 'range_end_type',
        classname_range_end_by_ocurrences: 'range_end_by_ocurrences',
        classname_range_end_by_end_date: 'range_end_by_end_date',

        classname_z3cform_dateinput: 'z3cform_dateinput',

        template: {
            widget: '#jquery-recurrenceinput-widget-tmpl',
            form: '#jquery-recurrenceinput-form-tmpl',
            rule: '#jquery-recurrenceinput-rule-tmpl',
            date: '#collective-z3cform-dateinput-tmpl' },

        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

        weekdays: [
            {id: 'MO', title: 'Monday'},
            {id: 'TU', title: 'Tuesday'},
            {id: 'WE', title: 'Wednesday'},
            {id: 'TH', title: 'Thursday'},
            {id: 'FR', title: 'Friday'},
            {id: 'SA', title: 'Saturday'},
            {id: 'SU', title: 'Sunday'}]
    };

    // private

    function Recurrenceinput (textarea, conf) {
        /*
         * Initial steps to activate widget:
         *  - hide textarea
         *  - add checkbox repeat button (with action)
         */
        var self = this;
        var today = new Date()
        conf.dateDay = today.getDay();
        conf.dateMonth = today.getMonth();
        conf.dateYear = today.getFullYear();

        var classname_activate = conf.classname+conf.classname_activate;
        var classname_form = conf.classname+conf.classname_form;

        // hide textarea 
        textarea.hide();
        
        // widget form
        var form = $(conf.template.form).tmpl(conf);
        form.hide().appendTo('body');

        // add checkbox repeat button (with action)
        var overlay = null
        var widget = $(conf.template.widget).tmpl(conf);
        widget.find('.'+classname_form).hide();
        widget.find('input[name='+classname_activate+']')
                .change(function(e) {
                    var widget_label = widget.find('.'+classname_activate+' > label');
                    var widget_form = widget.find('.'+classname_form);

                    if ($(this).is(':checked')) {
                        widget_label.hide();
                        if (widget_form) {
                            widget_form.show();
                        } else {
                            widget_form = widget.find('.'+classname_form);
                        }

                        if (form.data().overlay) {
                            form.overlay().load();
                        } else {
                            form.overlay({
                                mask: {
                                    color: '#ebecff',
                                    loadSpeed: 'fast',
                                    closeSpeed: 'fast',
                                    opacity: 0.5,
                                    onClose: function (e) {
                                        widget_label.show();
                                        widget_form.hide();
                                        widget.find('input[name='+classname_activate+']')
                                                .attr('checked', false);
                                    }
                                },
                                speed: 'fast',
                                closeOnClick: false,
                                load: true
                            });
                        }

                    } else {
                        widget_label.show();
                        widget_form.hide();
                    }
                });
        

        //
        // add actions to widget buttons
        /*
        widget.find('p.button > a')
            .unbind('click')
            .click(function (e) {
                e.preventDefault();

                var class_name = $(this).attr('class');
                if (class_name == 'button-add-rrule') { add_rule('rrule') }
                else if (class_name == 'button-add-exrule') { add_rule('exrule') }
                else if (class_name == 'button-add-rdate') { add_date('rdate') }
                else if (class_name == 'button-add-exdate') { add_date('exdate') }
            });


        // 
        function init_data(class, templateId, dateDay, dateMonth, dateYear) {

            var rule = $(conf[tmpl_id]).tmpl({
                months: conf.months, dateDay: dateDay, 
                dateMonth: dateMonth, dateYear: dateYear });
            rule.addClass(class);

            // remove rule action
            $('a.remove', rule).unbind("click").click(function () {
                $(this).closest("li.rule").slideUp("fast", function() { $(this).remove() });
            });

            // activate dateinput calendar
            rule.find('input[class=recurrence_calendar]')
                    .dateinput({
                        value: new Date(dateYear, dateMonth, dateDay),
                        change: function() {
                            var value = this.getValue("yyyy-m-d").split("-");
                            this.getInput().parent().find('input=[name$=_year]').val(value[0]);
                            this.getInput().parent().find('select=[name$=_month]').val(value[1]);
                            this.getInput().parent().find('input=[name$=_day]').val(value[2]); },
                        selectors: true,
                        trigger: true,
                        yearRange: [-10, 10] })
                    .unbind('change')
                    .bind('onShow', function (event) {
                        var trigger_offset = $(this).next().offset();
                        $(this).data('dateinput').getCalendar().offset(
                            {top: trigger_offset.top+33, left: trigger_offset.left}
                        );
                    });

            // append rule to ruleset
            rule.hide();
            $('.recurrenceinput-' + class + " ul.ruleset", widget).append(rule);
            rule.slideDown("fast");

            return rule;
        }

        function add_date(date_class, initial_data) {
    
            if (initial_data) {
                dateYear = initial_data.substring(0,4);
                dateMonth = initial_data.substring(4,6);
                dateDay = initial_data.substring(6,8);
            }

            init_data(date_class, 'date-tmpl');
        }


        function add_rule(rule_class, initial_data) {

            var rule = init_data(rule_class, 'rule-tmpl');

            // hide options for frequencies
            $('.freq-options > div', rule).hide();

            // make label of freq option active for selection
            rule.find('.freq label').unbind("click").click(function () {
                var input = $(this).parent().find('input[name=freq]');
                input.click(); 
                input.change();
            });

            // select 
            rule.find('.freq input[name=freq]').removeClass("active");
            rule.find('.freq input[name=freq]').unbind("change").change(function() {
                var el = $(this);
                
                rule.find('.freq input[name=freq]').removeClass("active");
                rule.find('.freq-options > div').hide();

                el.addClass('active');

                parent_list = el.closest("ul");
                font_size = parent_list.css('font-size').replace('px', '').replace('em','');

                rule.find('.freq-options div.' + el.val().toLowerCase())
                        .css('margin-left', + (parent_list.width() + 2*font_size))
                        .show();
            });

            // parse the initial data if it exists
            if (initial_data) {
                widget_load_from_rfc2445(rule, initial_data);
            }
        }

        function widget_load_from_rfc2445(el, initial_data) {
            // At this point, el is a fully constructed rule div 
            // what's the frequency?
            matches = initial_data.match("^FREQ=(DAILY|WEEKLY|MONTHLY|YEARLY)");
            frequency = matches[1];

            interval = null;
            matches = initial_data.match("INTERVAL=([0-9]+);?");
            if (matches) {
                interval = matches[1];
            }

            byday = null;
            matches = initial_data.match("BYDAY=([^;]+);?");
            if (matches) {
                byday = matches[1].split(",");
            }

            bymonthday = null;
            matches = initial_data.match("BYMONTHDAY=([^;]+);?");
            if (matches) {
                bymonthday = matches[1].split(",");
            }

            bymonth = null;
            matches = initial_data.match("BYMONTH=([^;]+);?");
            if (matches) {
                bymonth = matches[1].split(",");
            }

            bysetpos = null;
            matches = initial_data.match("BYSETPOS=([^;]+);?");
            if (matches) {
                bysetpos = matches[1].split(",");
            }

            switch (frequency) {
            case "DAILY":
            case "WEEKLY":
            case "MONTHLY":
            case "YEARLY":
                $("ul.freq input", el).val([frequency]);
                $("ul.freq input[value="+frequency+"]", el).change();
                break;
            }

            switch (frequency) {
            case "DAILY":
                if (interval) {
                    $("input[name=recurrence_daily_interval]", el).val(interval);
                }
                else {
                    alert("Cannot parse! " + initial_data);
                }
                break;
            case "WEEKLY":
                if (interval) {
                    $("input[name=recurrence_weekly_interval_number]", el).val(interval);
                }
                if (byday) { 
                    // TODO: if this is weekdays and interval=null, select DAILY#weekdays?
                    $('input[name^=recurrence_weekly_days_]', el).val(byday);
                }
                if (!interval) {
                    $("input[name=recurrence_weekly_interval_number]", el).val("1");
                }
                if (!byday) {
                    alert("Cannot parse! " + initial_data);
                }
                break;
            case "MONTHLY":
                break;
            case "YEARLY":
                $("ul.freq input", el).val([frequency]);
                $("ul.freq input[value="+frequency+"]", el).change();
                break;
            }
        }
        */



        /*
         * Parsing RFC2554 from widget
         */

        // method for parsing rules (rrule and exrule)
        function parse_rule(el) {
            var str_ = '';
            frequency = el.find('input.freq.active').val();
            var result = "NO RULE FOUND"
            switch (frequency) {
            case "DAILY":
                result = parse_daily(el);
                break;
            case "WEEKLY":
                result = parse_weekly(el);
                break;
            case "MONTHLY":
                result = parse_monthly(el);
                break;
            case "YEARLY":
                result = parse_yearly(el);
                break;
            }
            
            return result
        }

        function parse_daily(el) {
            result = 'FREQ=DAILY'

            daily_type = $('input[name=recurrence_daily_type]:checked', el).val();

            switch (daily_type) {
            case "DAILY":
                interval = $('input[name=recurrence_daily_interval]', el).val();
                result += ";INTERVAL=" + interval;
                break;
            case "WEEKDAYS":
                result = "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR"
                break;
            }

            return result
        }

        function parse_weekly(el) {
            result = "FREQ=WEEKLY"

            interval = $('input[name=recurrence_weekly_interval_number]', el).val();
            result += ";INTERVAL=" + interval

            days = []
            $('input[name^=recurrence_weekly_days_]:checked', el).each(function() {
                    days[days.length] = $(this).val();
                });

            if (days.length) {
                result += ";BYDAY=" + days
            }

            return result;
        }

        function parse_monthly(el) {
            result = "FREQ=MONTHLY";

            monthly_type = $('input[name=recurrence_monthly_type]:checked', el).val();

            switch (monthly_type) {
            case "dayofmonth":
                day = $("select[name=recurrence_monthly_dayofmonth_day]", el).val();
                interval = $("input[name=recurrence_monthly_dayofmonth_interval]", el).val();

                result += ";BYMONTHDAY=" + day;
                result += ";INTERVAL=" + interval;
                break;
            case "dayofweek":
                var index = $("select[name=recurrence_monthly_dayofweek_index]", el).val();
                var day = $("select[name=recurrence_monthly_dayofweek_day]", el).val();
                var interval = $("input[name=recurrence_monthly_dayofweek_interval]", el).val();

                if ($.inArray(day, ['MO','TU','WE','TH','FR','SA','SU']) > -1) {
                    result += ";BYDAY=" + index + day;
                }
                else if (day == "DAY") {
                    result += ";BYDAY=" + index;
                }
                else if (day == "WEEKDAY") {
                    result += ";BYDAY=MO,TU,WE,TH,FR;BYSETPOS=" + index;
                }
                else if (day == "WEEKEND_DAY") {
                    result += ";BYDAY=SA,SU;BYSETPOS=" + index;
                }

                result += ";INTERVAL=" + interval;
                break;
            }

            return result;
        }

        function parse_yearly(el) {
            result = "FREQ=YEARLY"

            yearly_type = $("input[name=recurrence_yearly_type]:checked", el).val();
            
            switch (yearly_type) {
            case "dayofmonth":
                var month = $("select[name=recurrence_yearly_dayofmonth_month]", el).val();
                var day = $("select[name=recurrence_yearly_dayofmonth_day]", el).val();

                result += ";BYMONTH=" + month;
                result += ";BYMONTHDAY=" + day;
                break;
            case "dayofweek":
                var index = $("select[name=recurrence_yearly_dayofweek_index]", el).val();
                var day = $("select[name=recurrence_yearly_dayofweek_day]", el).val();
                var month = $("select[name=recurrence_yearly_dayofweek_month]", el).val();

                result += ";BYMONTH=" + month;

                if ($.inArray(day, ['MO','TU','WE','TH','FR','SA','SU']) > -1) {
                    result += ";BYDAY=" + index + day;
                }
                else if (day == "DAY") {
                    result += ";BYDAY=" + index;
                }
                else if (day == "WEEKDAY") {
                    result += ";BYDAY=MO,TU,WE,TH,FR;BYSETPOS=" + index;
                }
                else if (day == "WEEKEND_DAY") {
                    result += ";BYDAY=SA,SU;BYSETPOS=" + index;
                }
                break;
            }

            return result;
        }


        // function for parsing dates (rdate and exdate)
        function parse_date(el) {
            var day = $("input[name=recurrence_date_day]", el).val();
            var month = $("select[name=recurrence_date_month]", el).val();
            var year = $("input[name=recurrence_date_year]", el).val();

            f_day = parseInt(day) < 10 ? "0" + day : day;
            f_month = parseInt(month) < 10 ? "0" + month : month;

            var formatted = year + f_month + f_day;

            return formatted;
        }



        /*
         * Public API of Recurrenceinput
         */

        $.extend(self, {
            widget: widget,/*
            parse_rrule: function (el) { return 'RRULE:'+parse_rule(el) },
            parse_exrule: function (el) { return 'EXRULE:'+parse_rule(el) },
            parse_rdate: function (el) { return 'RDATE:'+parse_date(el) },
            parse_exdate: function (el) { return 'EXDATE:'+parse_date(el) },
            add_rule: function(rule_class, rule) { return add_rule(rule_class, rule) },
            add_date: function(date_class, rule) { return add_date(date_class, rule) },*/
        });

    }



    /*
     * jQuery plugin implementation
     */

    $.fn.recurrenceinput = function(conf) {

        // already installed
        if (this.data("recurrenceinput")) { return this; } 

        // apply this for every textarea we can match
        this.each(function() {
            if (this.tagName == 'TEXTAREA') {

                var textarea = $(this);
                var form = $(textarea.closest("form")[0]);
                var recurrenceinput = new Recurrenceinput(
                        textarea, $.extend(true, {}, default_conf, conf));

                // Populate data from existing relations
                if (textarea.val() != '') {
                    rules = textarea.val().split('\n');
                    for (i = 0; i < rules.length; i++) {
                        rule = rules[i];
                        if (rule.search("^RRULE") >= 0) {
                            recurrenceinput.add_rule('rrule', rule.substring(6));
                        }
                        else if (rule.search("^RDATE") >= 0) {
                            recurrenceinput.add_date('rdate', rule.substring(6));
                        }
                        else if (rule.search("^EXRULE") >= 0) {
                            recurrenceinput.add_rule('exrule', rule.substring(7));
                        }
                        else if (rule.search("^EXDATE") >= 0) {
                            recurrenceinput.add_date('exdate', rule.substring(7));
                        }
                    }
                }

                // on form submit we write to textarea
                form.submit(function(e) {
                    e.preventDefault();

                    // create string for rule widget
                    var ruleset_str = '';
                    var f = function(pf, el) {
                        ruleset_str += pf($(el)) + "\n";
                    }
                    var widgets = recurrenceinput.widget;
                    $('div.recurrenceinput-rrule li.rule', widgets).each( function() { 
                            f(recurrenceinput.parse_rrule, this) 
                        });
                    $('div.recurrenceinput-exrule li.rule', widgets).each(function() { 
                            f(recurrenceinput.parse_exrule, this) 
                        });
                    $('div.recurrenceinput-rdate li.rule', widgets).each( function() { 
                            f(recurrenceinput.parse_rdate, this)
                        });
                    $('div.recurrenceinput-exdate li.rule', widgets).each(function() {
                            f(recurrenceinput.parse_exdate, this)
                        })

                    // insert string generated form above to textarea
                    textarea.val(ruleset_str);

                    // remove widget
                    recurrenceinput.widget.remove();
                });

                // insert recurrance widget right after textarea 
                textarea.after(recurrenceinput.widget)
            };
        });
    };

})(jQuery);