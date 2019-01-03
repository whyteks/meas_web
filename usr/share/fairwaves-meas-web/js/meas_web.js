
function includeBTS(value) {
    DATA_INCLUDE_BTS=value;
}

function includeChanType(value) {
    DATA_INCLUDE_CHAN=value;
}

function paramMaxItems(new_value) {
    DATA_MAX_IMSI = parseInt(new_value);
}

function paramDTO(new_value) {
    MEAS_PURGE_TIMEOUT = parseInt(new_value);
}

function paramSortBy(new_value) {
  d3.select('#' + SORT_ITEMS_BY)
    .classed('sortby-active', false)
    .classed('sortby-inactive', true);

  d3.select('#' + new_value)
    .classed('sortby-active', true)
    .classed('sortby-inactive', false);

  SORT_ITEMS_BY = new_value; //'age' or 'imsi'
  sort_data();
}

function setSelected(imsi) {
  d3.select('#imsi-' + selected_imsi)
    .classed('row-selected', false);
  selected_imsi = imsi;
  d3.select('#imsi-' + selected_imsi)
    .classed('row-selected', true);
}

function format_chan_id(d) {
  var chan_id = "<span style='color:red;font-weight:bold'>"+bts_name[d.chan_info['bts_nr']]+
                "</span> BTS("+d.chan_info['bts_nr']+
                ")TRX(<span style='color:darkgreen'>" +d.chan_info['trx_nr']
                +")</span>"+
                "TS("+d.chan_info['ts_nr']+")";

  // There is only one sub-slot in TCH/F
  if (d.chan_info['pchan_type'].indexOf("TCH/F") == -1)
    chan_id += " SS("+d.chan_info['ss_nr']+")";

  return chan_id
}

function show_last_time(t) {
    var date = new Date(t)
    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();
    var seconds = "0" + date.getSeconds();
    var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    $('#last_time').html(formattedTime);
}

function update_data(new_row) {
  
  var default_values = {
    "RXQ-SUB" : 0,
    "RXQ-FULL" : 0,
    "RXL-SUB" : MINPWR,
    "RXL-FULL" : MINPWR
  };

  show_last_time(new_row.time * 1000)
  
  if (new_row && new_row.meas_rep &&
         (new_row.meas_rep.DL_MEAS || new_row.meas_rep.UL_MEAS)) {
    var report=new_row.meas_rep;
    var info=new_row.chan_info;
    if (report.NUM_NEIGH > max_neigh ) { max_neigh = report.NUM_NEIGH; }
    rp = info
    if (DATA_INCLUDE_BTS != '_' && DATA_INCLUDE_BTS != info.bts_nr ) {
      return;
    }
    if (DATA_INCLUDE_CHAN != '_' && info.pchan_type.indexOf(DATA_INCLUDE_CHAN) === -1 ) {
      return;
    }
    if (new_row['imsi'] == '') {
        _ci = new_row['chan_info']
        new_row['imsi'] = "UnKnown-" + _ci['bts_nr'] + "-" + _ci['trx_nr'] + "-" +  _ci['ts_nr'] + "-" + _ci['ss_nr']
    }

    var cur_idx = null;
    data.forEach(function(d, i) {
      if (new_row['imsi'] === d['imsi']) {
        cur_idx = i;
      }
    });

    ['DL_MEAS', 'UL_MEAS'].forEach(function(link_type) {
      if (!report[link_type]) { report[link_type] = default_values; }
    });

    new_row['age'] = 0;
    new_row.active = true;
    new_row.purge = false;
    if (cur_idx === null) {
      new_row['first_report'] = new_row['time'];
      new_row['duration'] = 0;
      data.push(new_row);
    } else {
      NR_old = data[cur_idx]['meas_rep']['NR'];
      NR_new = new_row['meas_rep']['NR'];
      // HACK: Guess old channel vs new chanel by NR.
      //       NR rolls at 255, plus some reports may be lost,
      //       so we can't detect new channels reliably.
      //       A proper way of doing this would be to pass some
      //       kind of channel ID in the meas_report structure.
      NR_rolled = NR_new < 2 && NR_old > 253;
      if (NR_old > NR_new && !NR_rolled) {
        new_row['first_report'] = new_row['time'];
      } else {
        new_row['first_report'] = data[cur_idx]['first_report'];
      }
      new_row['duration'] = new_row['time']-new_row['first_report'];
      data[cur_idx] = new_row;
    }
  };
}

function sort_data() {
  data.sort(function(a,b) {

    if (a.active && !b.active) {
      return -1;
    }
    if (!a.active && b.active) {
      return 1;
    }

    return d3.ascending(a.imsi,b.imsi);

    if (a.active && b.active) {
      if (a.first_report === b.first_report) {
        return d3.ascending(a.imsi, b.imsi);
      } else {
        return d3.descending(a.first_report, b.first_report);
      }
    }
    if (!a.active && !b.active) {
      if (SORT_ITEMS_BY === 'age') {
        if (a.time === b.time) {
          return d3.ascending(a.imsi, b.imsi);
        } else {
          return d3.descending(a.time, b.time);
        }
      } else {
        return d3.ascending(a.imsi, b.imsi);
      }
    }
  });
}

function trim_data() {
  data = data.slice(0, DATA_MAX_IMSI);
  data = data.filter(function(i) {return !i.purge} );
}

function update_reports() {
  var imsis = d3.select(".meas")
    .selectAll(".data-row")
    .data(data)

  imsis.enter()
    .call(format_data_row);

  imsis.each(update_data_row);

  imsis.exit().remove();
}

function update_data_row(el, i) {  
  var cur_el = d3.select(this)
    .classed("data-row-active", function(d) { return d.active; })
    .classed("data-row-inactive", function(d) { return !d.active; })
    .classed("row-selected", function(d) { return selected_imsi === d.imsi; })
    .attr("id", function(d) { return 'imsi-' + d.imsi; })
    .on("click", function(d,i) { setSelected(d.imsi); });

  ['name', 'imsi', 'duration', 'age'].forEach(function(id) {
    cur_el.select('#meas-' + id)
      .text(function(d) { return el[id]; })
  });

  cur_el.select("#meas-chan-id")
    .html(function(d) { return d['chan_info']?format_chan_id(d):""; });

  cur_el.select("#meas-chan-type")
    .text(function(d) { return d['chan_info']?d.chan_info["lchan_type"]:""; });

  ['UL', 'DL'].forEach(function(k) {
    L = el.meas_rep[k+'_MEAS']['RXL-FULL'];
    cur_el.select('#meas-L-'+k)
      .interrupt()
      .transition()
      .duration(el.age === 0? 250 : 0)
      .style("width", function(d) {return Math.abs(Math.round(xScale(L))) + 'px'})
      .text(function(d) { return L; });
  });

  for (i=0; i<10; i++) {
    L = '--';
    A = '';
    if (el.meas_rep['NEIGH'][i] != undefined) {
      L = el.meas_rep['NEIGH'][i]['POWER'];
      A = el.meas_rep['NEIGH'][i]['ARFCN'];
    }
    cur_el.select('#neighbour'+i)
      .html(function(d) { 
        return "<span class='arfcn'>ARFCN "+A+"</span>"+" <span class='level'>"+L+"</span>"; 
      })
      .style("display", L != '--' ? "block" : "none")
      .style("margin-bottom", i == max_neigh-1 ? "12px" : "0px")
      .interrupt()
      .transition()
      .style("width", function(d) {return Math.abs(Math.round(xScale(L))) + 'px'});
  }

  cur_el.select('#meas-q')
    .html(function(d) { return d.meas_rep['UL_MEAS']['RXQ-FULL'] +
                               "<br/>" +
                               d.meas_rep['DL_MEAS']['RXQ-FULL']});

  ['L1_MS_PWR', 'L1_TA', 'NR'].forEach(function(id) {
    cur_el.select('#meas-' + id.toLowerCase())
      .text(function(d) { return el.meas_rep[id]; })
  });

  cur_el.select('#meas-neigh')
      .text(function(d) { return d.meas_rep['NUM_NEIGH']; });
}

function format_data_row(data_row) {

  var tr = data_row.append("div")
    .attr("class", "data-row");

  ['name', 'imsi', 'chan-type', 'chan-id', 'duration', 'age', 'NR', 'direction',
   'Q', 'level', 'L1_MS_PWR', 'L1_TA', 'NEIGH',].forEach(function(k) {
    tr.append("div")
      .attr("class", "cell")
      .attr("id", "meas-" + k.toLowerCase());
  });

  tr.select('#meas-direction').html("UL<br/>DL");

  var bar_tr = tr.select('#meas-level')
    .attr("style", 'width: ' + (MAXW + 20) + 'px')
    .classed("chart", true);

  ['UL', 'DL'].forEach(function(k) {
    bar_tr.append("div")
      .attr("class", k === 'UL'? "uplink bar" : "downlink bar")
      .attr("id", "meas-L-"+k);
  });

  for (i=0; i<10; i++) {
    bar_tr.append("div")
      .attr("class", "neighbour bar")
      .attr("id", "neighbour"+i)
      .style("display", "none")
  }

  return true;
}

function refresh_data() {
  data.forEach(function(v, i) {
    data[i]['age'] += 1;
    if (data[i]['age'] > MEAS_TIMEOUT) {
      data[i]['active'] = false;
    }
    if (data[i]['age'] > MEAS_PURGE_TIMEOUT) {
      data[i]['purge'] = true;
    }
  });

  return true;
}

      

